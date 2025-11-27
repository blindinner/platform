import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import crypto from 'crypto'
import {
  checkRateLimit,
  logWebhookRequest,
  detectSuspiciousActivity,
  getClientIp,
  getRelevantHeaders
} from '@/lib/webhook-security'

// CORS headers for webhook calls from external systems
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ client_id: string }> }
) {
  const startTime = Date.now()
  const clientIp = getClientIp(request)
  const requestHeaders = getRelevantHeaders(request)

  let campaignId: string | null = null
  let responseStatus = 500
  let responseMessage = 'Unknown error'
  let errorMessage: string | undefined

  try {
    const { client_id } = await params
    const body = await request.json()

    // Validate required fields
    const {
      customer_email,
      customer_name,
      customer_first_name,
      customer_last_name,
      customer_phone,
      order_id,
      external_event_id,
      ticket_url,
      amount,
      referral_code, // Optional - if provided, this purchase came from a referral
    } = body

    if (!customer_email) {
      return NextResponse.json(
        { error: 'customer_email is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!external_event_id) {
      return NextResponse.json(
        { error: 'external_event_id is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!ticket_url) {
      return NextResponse.json(
        { error: 'ticket_url is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get user by client_id
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('client_id', client_id)
      .single()

    if (profileError || !userProfile) {
      console.error('Client lookup failed:', { client_id, error: profileError })
      return NextResponse.json(
        { error: 'Invalid client ID' },
        { status: 404, headers: corsHeaders }
      )
    }

    const organizerId = userProfile.user_id

    // Look up campaign by external_event_id
    let { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('organizer_id', organizerId)
      .eq('external_event_id', external_event_id)
      .single()

    // Auto-create campaign if it doesn't exist
    if (campaignError || !campaign) {
      console.log(`Auto-creating campaign for event_id: ${external_event_id}`)

      // Get organization default settings
      const { data: orgProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('webhook_default_commission_type, webhook_default_commission_value, default_credit_unlock_type, default_credit_unlock_days')
        .eq('user_id', organizerId)
        .single()

      const defaultCommissionType = orgProfile?.webhook_default_commission_type || 'fixed'
      const defaultCommissionValue = orgProfile?.webhook_default_commission_value || 3.00
      const defaultCreditUnlockType = orgProfile?.default_credit_unlock_type || 'event_based'
      const defaultCreditUnlockDays = orgProfile?.default_credit_unlock_days || 0

      // Create campaign with defaults
      const { data: newCampaign, error: createError } = await supabaseAdmin
        .from('campaigns')
        .insert({
          organizer_id: organizerId,
          name: external_event_id, // Use event_id as name by default
          external_event_id: external_event_id,
          destination_url: ticket_url, // Use ticket_url from payload
          commission_type: defaultCommissionType,
          commission_value: defaultCommissionValue,
          credit_unlock_type: defaultCreditUnlockType,
          credit_unlock_days: defaultCreditUnlockDays,
          status: 'active', // Auto-created campaigns are active immediately
          integration_type: 'webhook_organization'
        })
        .select()
        .single()

      if (createError) {
        console.error('Auto-create campaign error:', createError)
        return NextResponse.json(
          {
            error: 'Failed to auto-create campaign',
            details: createError.message
          },
          { status: 500, headers: corsHeaders }
        )
      }

      campaign = newCampaign
      console.log(`Created campaign ${campaign.id} for event ${external_event_id}`)
    }

    campaignId = campaign.id

    // Check if campaign is active
    if (campaign.status !== 'active') {
      responseStatus = 403
      responseMessage = 'Campaign not active'
      errorMessage = 'This campaign is not yet active. Please complete setup first.'

      await logWebhookRequest({
        campaign_id: campaign.id,
        webhook_type: 'organization',
        request_ip: clientIp,
        request_headers: requestHeaders,
        request_payload: body,
        response_status: responseStatus,
        response_message: responseMessage,
        processing_time_ms: Date.now() - startTime,
        error_message: errorMessage
      })

      return NextResponse.json(
        { error: responseMessage, details: errorMessage },
        { status: responseStatus, headers: corsHeaders }
      )
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(campaign.id)

    if (!rateLimit.allowed) {
      responseStatus = 429
      responseMessage = 'Rate limit exceeded'
      errorMessage = `Rate limit of ${rateLimit.limit} requests per hour exceeded`

      // Log rate-limited request
      await logWebhookRequest({
        campaign_id: campaign.id,
        webhook_type: 'organization',
        request_ip: clientIp,
        request_headers: requestHeaders,
        request_payload: body,
        response_status: responseStatus,
        response_message: responseMessage,
        processing_time_ms: Date.now() - startTime,
        error_message: errorMessage
      })

      return NextResponse.json(
        {
          error: responseMessage,
          limit: rateLimit.limit,
          current: rateLimit.current,
          reset_at: rateLimit.resetAt.toISOString()
        },
        {
          status: responseStatus,
          headers: {
            ...corsHeaders,
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, rateLimit.limit - rateLimit.current).toString(),
            'X-RateLimit-Reset': Math.floor(rateLimit.resetAt.getTime() / 1000).toString()
          }
        }
      )
    }

    // Check for suspicious activity
    const suspiciousCheck = await detectSuspiciousActivity(campaign.id)
    if (suspiciousCheck.suspicious) {
      console.warn(`Suspicious activity detected for campaign ${campaign.id}: ${suspiciousCheck.reason}`)
      // Continue processing but log the warning
    }

    // Check if contact already exists for this campaign
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('id, unique_code, short_link')
      .eq('campaign_id', campaign.id)
      .eq('email', customer_email)
      .single()

    // If contact exists, return existing link
    if (existingContact) {
      responseStatus = 200
      responseMessage = 'Contact already exists, returned existing link'

      // Log successful request
      await logWebhookRequest({
        campaign_id: campaign.id,
        webhook_type: 'organization',
        request_ip: clientIp,
        request_headers: requestHeaders,
        request_payload: body,
        response_status: responseStatus,
        response_message: responseMessage,
        processing_time_ms: Date.now() - startTime
      })

      return NextResponse.json(
        {
          success: true,
          referral_link: existingContact.short_link,
          contact_id: existingContact.id,
          tracking_code: existingContact.unique_code,
          message: responseMessage
        },
        { headers: corsHeaders }
      )
    }

    // Generate unique code for referral link
    const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://platform-egbl.vercel.app'
    const shortLink = `${appUrl}/r/${uniqueCode}`

    // Create new contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .insert({
        campaign_id: campaign.id,
        name: customer_name || 'Customer', // Backward compatibility
        first_name: customer_first_name || null,
        last_name: customer_last_name || null,
        email: customer_email,
        phone: customer_phone || null,
        unique_code: uniqueCode,
        short_link: shortLink,
        order_id: order_id || null,
        destination_url: ticket_url, // Store ticket URL from payload
        source: 'webhook_organization'
      })
      .select()
      .single()

    if (contactError) {
      console.error('Contact creation error:', contactError)
      throw contactError
    }

    // Handle referral if referral_code was provided
    if (referral_code) {
      console.log(`Processing referral for code: ${referral_code}`)

      // Look up the referrer by their unique code
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from('contacts')
        .select('id, campaign_id, email')
        .eq('unique_code', referral_code)
        .eq('campaign_id', campaign.id)
        .single()

      if (referrer && !referrerError) {
        // Calculate commission amount
        let commissionAmount = 0
        if (campaign.commission_type === 'fixed') {
          commissionAmount = campaign.commission_value
        } else if (campaign.commission_type === 'percentage' && amount) {
          commissionAmount = (amount * campaign.commission_value) / 100
        }

        // Create conversion record
        const { data: conversion, error: conversionError } = await supabaseAdmin
          .from('conversions')
          .insert({
            campaign_id: campaign.id,
            referrer_contact_id: referrer.id,
            referral_code: referral_code,
            referred_customer_email: customer_email,
            referred_customer_first_name: customer_first_name || null,
            referred_customer_last_name: customer_last_name || null,
            referred_customer_phone: customer_phone || null,
            order_id: order_id || null,
            amount: amount || null,
            commission_type: campaign.commission_type,
            commission_value: campaign.commission_value,
            commission_amount: commissionAmount
          })
          .select()
          .single()

        if (conversion && !conversionError) {
          // Determine credit status based on unlock type
          let creditStatus = 'pending'
          let unlockedAt = null

          if (campaign.credit_unlock_type === 'immediate') {
            creditStatus = 'available'
            unlockedAt = new Date().toISOString()
          }

          // Create credit for the referrer
          const { error: creditError } = await supabaseAdmin
            .from('credits')
            .insert({
              contact_id: referrer.id,
              campaign_id: campaign.id,
              conversion_id: conversion.id,
              amount: commissionAmount,
              status: creditStatus,
              unlocked_at: unlockedAt
            })

          if (creditError) {
            console.error('Credit creation error:', creditError)
          } else {
            const statusMsg = creditStatus === 'available' ? 'unlocked' : 'pending unlock'
            console.log(`Credit of $${commissionAmount.toFixed(2)} awarded to referrer ${referrer.email} (${statusMsg})`)
          }
        } else {
          console.error('Conversion creation error:', conversionError)
        }
      } else {
        console.warn(`Referral code ${referral_code} not found for campaign ${campaign.id}`)
      }
    }

    responseStatus = 201
    responseMessage = 'Referral link generated successfully'

    // Log successful request
    await logWebhookRequest({
      campaign_id: campaign.id,
      webhook_type: 'organization',
      request_ip: clientIp,
      request_headers: requestHeaders,
      request_payload: body,
      response_status: responseStatus,
      response_message: responseMessage,
      processing_time_ms: Date.now() - startTime
    })

    return NextResponse.json(
      {
        success: true,
        referral_link: shortLink,
        contact_id: contact.id,
        tracking_code: uniqueCode,
        message: responseMessage
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Organization webhook error:', error)
    responseStatus = 500
    responseMessage = 'Failed to process webhook'
    errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log failed request
    if (campaignId) {
      await logWebhookRequest({
        campaign_id: campaignId,
        webhook_type: 'organization',
        request_ip: clientIp,
        request_headers: requestHeaders,
        request_payload: {},
        response_status: responseStatus,
        response_message: responseMessage,
        processing_time_ms: Date.now() - startTime,
        error_message: errorMessage
      }).catch((logError) => {
        console.error('Failed to log webhook error:', logError)
      })
    }

    return NextResponse.json(
      {
        error: responseMessage,
        details: errorMessage
      },
      { status: responseStatus, headers: corsHeaders }
    )
  }
}
