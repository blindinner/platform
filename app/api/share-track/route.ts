import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { contact_id, action, unique_code } = await request.json()

    if (!contact_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get campaign_id from contact
    const { data: contact } = await supabaseAdmin
      .from('contacts')
      .select('campaign_id')
      .eq('id', contact_id)
      .single()

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Log the share action
    await supabaseAdmin.from('share_actions').insert({
      contact_id,
      campaign_id: contact.campaign_id,
      action_type: action,
      created_at: new Date().toISOString(),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Share tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track share action' },
      { status: 500 }
    )
  }
}
