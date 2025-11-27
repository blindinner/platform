import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      event_end_date,
      creative_image_url,
      destination_url,
      external_event_id,
      commission_type = 'fixed',
      commission_value = 3.00,
      credit_unlock_type = 'event_based',
      credit_unlock_days = 0,
      status = 'draft'
    } = body

    // Determine integration type based on whether external_event_id is provided
    const integrationType = external_event_id ? 'webhook_organization' : 'manual'

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        organizer_id: user.id,
        name,
        event_date,
        promotion_end_date,
        event_end_date: event_end_date || null,
        creative_image_url: creative_image_url || null,
        destination_url,
        external_event_id: external_event_id || null,
        commission_type,
        commission_value,
        credit_unlock_type,
        credit_unlock_days,
        status,
        integration_type: integrationType
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)

      // Check for unique constraint violation on external_event_id
      if (error.code === '23505' && error.message.includes('external_event')) {
        return NextResponse.json(
          {
            error: 'Duplicate external event ID',
            details: `You already have a campaign mapped to event ID "${external_event_id}". Each event ID can only be used once. Please use a different ID or update your existing campaign.`
          },
          { status: 409 }
        )
      }

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
