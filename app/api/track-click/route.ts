import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { ref_code, page_url } = await request.json()

    if (!ref_code) {
      return NextResponse.json({ error: 'ref_code is required' }, { status: 400 })
    }

    // Look up contact by unique code
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, campaign_id')
      .eq('unique_code', ref_code)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Invalid ref code' }, { status: 404 })
    }

    // Log the click (page view)
    await supabaseAdmin.from('clicks').insert({
      contact_id: contact.id,
      campaign_id: contact.campaign_id,
      clicked_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      referrer_url: page_url || request.headers.get('referer')
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}
