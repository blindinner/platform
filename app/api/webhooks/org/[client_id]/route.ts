import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend/client'
import crypto from 'crypto'

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
  try {
    const { client_id } = await params
    const body = await request.json()

    // Validate required fields
    const {
      campaign_id,
      customer_email,
      customer_name,
      order_id,
      external_event_id,
    } = body

    if (!customer_email) {
      return NextResponse.json(
        { error: 'customer_email is required' },
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

    // Determine which campaign to use
    let campaign

    // Option 1: campaign_id provided directly in payload (recommended)
    if (campaign_id) {
      const { data, error: campaignError } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('id', campaign_id)
        .eq('organizer_id', organizerId)
        .single()

      if (campaignError || !data) {
        return NextResponse.json(
          {
            error: 'Campaign not found',
            details: `No campaign found with id=${campaign_id} for this client`
          },
          { status: 404, headers: corsHeaders }
        )
      }

      campaign = data
    }
    // Option 2: Look up campaign by external_event_id
    else if (external_event_id) {
      const { data, error: campaignError } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('organizer_id', organizerId)
        .eq('external_event_id', external_event_id)
        .single()

      if (campaignError || !data) {
        return NextResponse.json(
          {
            error: 'Campaign not found for external event',
            details: `No campaign mapped to external_event_id=${external_event_id}. Please create a campaign and map this event ID.`
          },
          { status: 404, headers: corsHeaders }
        )
      }

      campaign = data
    }
    // Neither option provided
    else {
      return NextResponse.json(
        {
          error: 'Missing campaign identifier',
          details: 'Please provide either "campaign_id" (your internal campaign ID) or "external_event_id" (your event/product ID) in the payload'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if contact already exists for this campaign
    const { data: existingContact } = await supabaseAdmin
      .from('contacts')
      .select('unique_code, short_link')
      .eq('campaign_id', campaign.id)
      .eq('email', customer_email)
      .single()

    // If contact exists, return existing link
    if (existingContact) {
      return NextResponse.json(
        {
          success: true,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          referral_link: existingContact.short_link,
          tracking_code: existingContact.unique_code,
          message: 'Contact already exists, returned existing link'
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
        name: customer_name || 'Customer',
        email: customer_email,
        unique_code: uniqueCode,
        short_link: shortLink,
        order_id: order_id || null,
        source: 'webhook_organization'
      })
      .select()
      .single()

    if (contactError) {
      console.error('Contact creation error:', contactError)
      throw contactError
    }

    // Send automated follow-up email with referral link
    await sendReferralEmail({
      recipientEmail: customer_email,
      recipientName: customer_name,
      campaignName: campaign.name,
      eventDate: campaign.event_date,
      referralLink: shortLink,
      creativeImageUrl: campaign.creative_image_url,
    })

    return NextResponse.json(
      {
        success: true,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        referral_link: shortLink,
        tracking_code: uniqueCode,
        message: 'Referral link generated and email sent'
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Organization webhook error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Send automated referral email to ticket buyer
async function sendReferralEmail({
  recipientEmail,
  recipientName,
  campaignName,
  eventDate,
  referralLink,
  creativeImageUrl,
}: {
  recipientEmail: string
  recipientName?: string
  campaignName: string
  eventDate: string
  referralLink: string
  creativeImageUrl?: string
}) {
  try {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    ${creativeImageUrl ? `
    <!-- Event Image -->
    <div style="width: 100%; overflow: hidden;">
      <img src="${creativeImageUrl}" alt="${campaignName}" style="width: 100%; height: auto; display: block;">
    </div>
    ` : ''}

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #000000;">
        Thanks for your purchase${recipientName ? `, ${recipientName}` : ''}!
      </h1>

      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
        You're all set for <strong>${campaignName}</strong> on ${formattedDate}.
      </p>

      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
        Want to share this event with friends? Use your personal referral link below:
      </p>

      <!-- Referral Link Box -->
      <div style="background-color: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Your Personal Referral Link
        </p>
        <a href="${referralLink}" style="display: inline-block; font-size: 16px; color: #000000; text-decoration: none; word-break: break-all; font-weight: 500;">
          ${referralLink}
        </a>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${referralLink}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: background-color 0.3s;">
          Share This Event →
        </a>
      </div>

      <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
        Share this link with your friends and help spread the word about this amazing event!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 12px; color: #999999;">
        This email was sent because you purchased a ticket for ${campaignName}
      </p>
    </div>

  </div>
</body>
</html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Referral Platform <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `Share ${campaignName} with your friends!`,
      html: emailHtml
    })

    console.log(`Referral email sent to ${recipientEmail}`)
  } catch (error) {
    console.error('Failed to send referral email:', error)
    // Don't throw error - webhook should still succeed even if email fails
  }
}
