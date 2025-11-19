import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
    const { ref_code, page_url } = await request.json()

    if (!ref_code) {
      return NextResponse.json(
        { error: 'ref_code is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Look up contact by unique code
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, campaign_id')
      .eq('unique_code', ref_code)
      .single()

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Invalid ref code' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Log the click (page view)
    await supabaseAdmin.from('clicks').insert({
      contact_id: contact.id,
      campaign_id: contact.campaign_id,
      clicked_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Not Available',
      user_agent: request.headers.get('user-agent') || 'Not Available',
      referrer_url: page_url || request.headers.get('referer') || 'Not Available'
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })

  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500, headers: corsHeaders }
    )
  }
}
