import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      event_date,
      promotion_end_date,
      creative_image_url,
      destination_url,
      email_subject,
      email_template,
      status = 'draft'
    } = body

    // Generate secure webhook token (48 random bytes = 96 hex chars)
    // Format: camp_<random_hex> for easy identification
    const webhookToken = `camp_${crypto.randomBytes(24).toString('hex')}`

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        organizer_id: user.id,
        name,
        event_date,
        promotion_end_date,
        creative_image_url: creative_image_url || null,
        destination_url,
        email_subject: email_subject || null,
        email_template: email_template || null,
        status,
        webhook_token: webhookToken,
        integration_type: 'webhook_campaign'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Campaign creation error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Fetch campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
