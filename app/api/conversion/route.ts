import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend/client'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ref_code, order_id, amount, buyer_email } = body

    if (!ref_code) {
      return NextResponse.json(
        { error: 'Missing ref_code' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Look up contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, campaign_id, name, email')
      .eq('unique_code', ref_code)
      .single()

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Invalid ref code' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check for duplicate conversion (same order_id)
    if (order_id) {
      const { data: existing } = await supabaseAdmin
        .from('conversions')
        .select('id')
        .eq('order_id', order_id)
        .single()

      if (existing) {
        return NextResponse.json(
          {
            status: 'duplicate',
            message: 'Conversion already tracked'
          },
          { headers: corsHeaders }
        )
      }
    }

    // Check if buyer is new to this campaign (only if we have a valid email)
    if (buyer_email && buyer_email !== 'Not Available') {
      const { data: previousPurchase } = await supabaseAdmin
        .from('conversions')
        .select('id')
        .eq('campaign_id', contact.campaign_id)
        .eq('buyer_email', buyer_email)
        .single()

      if (previousPurchase) {
        return NextResponse.json(
          {
            status: 'not_new',
            message: 'Buyer already purchased for this campaign'
          },
          { headers: corsHeaders }
        )
      }
    }

    // Record conversion
    const { data: conversion, error: conversionError } = await supabaseAdmin
      .from('conversions')
      .insert({
        contact_id: contact.id,
        campaign_id: contact.campaign_id,
        buyer_email: buyer_email || 'Not Available',
        order_id: order_id || 'Not Available',
        amount: amount ? parseFloat(amount) : null,
        converted_at: new Date().toISOString(),
        notification_sent: false
      })
      .select()
      .single()

    if (conversionError) throw conversionError

    // Send notification email to referrer (async, don't await)
    sendConversionNotification(contact, conversion).catch(console.error)

    return NextResponse.json(
      {
        status: 'success',
        conversion_id: conversion.id
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Conversion tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500, headers: corsHeaders }
    )
  }
}

async function sendConversionNotification(
  contact: any,
  conversion: any
) {
  try {
    // Get campaign details
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('name')
      .eq('id', contact.campaign_id)
      .single()

    // Get referrer stats
    const { data: stats } = await supabaseAdmin
      .from('conversions')
      .select('id', { count: 'exact' })
      .eq('contact_id', contact.id)

    const totalConversions = stats?.length || 0

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">🎉 New Referral!</h1>
  </div>
  <div style="padding: 30px 20px;">
    <p>Hi${contact.name ? ` ${contact.name}` : ''},</p>
    <p>Great news! Someone just purchased a ticket to <strong>${campaign?.name}</strong> through your referral link.</p>
    <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0;">Your Stats</h3>
      <p style="margin: 5px 0;"><strong>Total Conversions:</strong> ${totalConversions}</p>
    </div>
    <p>Keep sharing to invite more friends!</p>
    <p style="margin-top: 30px;">See you at the event!</p>
  </div>
</body>
</html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Referral Platform <onboarding@resend.dev>',
      to: contact.email,
      subject: '🎉 Someone bought a ticket through your link!',
      html: emailHtml
    })

    // Mark notification as sent
    await supabaseAdmin
      .from('conversions')
      .update({ notification_sent: true })
      .eq('id', conversion.id)

  } catch (error) {
    console.error('Failed to send conversion notification:', error)
  }
}
