import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json(campaign)

  } catch (error) {
    console.error('Fetch campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify campaign belongs to user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, organizer_id')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'event_date',
      'promotion_end_date',
      'event_end_date',
      'creative_image_url',
      'destination_url',
      'external_event_id',
      'commission_type',
      'commission_value',
      'credit_unlock_type',
      'credit_unlock_days',
      'status'
    ]

    const updates: Record<string, any> = {}
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)

      // Check for unique constraint violation on external_event_id
      if (updateError.code === '23505' && updateError.message.includes('external_event')) {
        return NextResponse.json(
          {
            error: 'Duplicate external event ID',
            details: `You already have another campaign mapped to this event ID. Each event ID can only be used once. Please use a different ID.`
          },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json(updatedCampaign)

  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify campaign belongs to user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, organizer_id')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Delete campaign (cascade will handle related data if set up in DB)
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('organizer_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted permanently' })

  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
