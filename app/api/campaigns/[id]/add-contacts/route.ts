import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify campaign belongs to user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const body = await request.json()
    const { contacts } = body

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid contacts array' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://platform-egbl.vercel.app'

    // Create contacts with unique links
    const contactsToInsert = contacts.map(contact => {
      const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      const shortLink = `${appUrl}/r/${uniqueCode}`

      return {
        campaign_id: campaignId,
        name: contact.name || null,
        email: contact.email,
        phone: contact.phone || null,
        unique_code: uniqueCode,
        short_link: shortLink,
        source: 'manual'
      }
    })

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactsToInsert)
      .select()

    if (error) {
      console.error('Contact creation error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      message: `Successfully added ${data.length} contacts`
    })

  } catch (error) {
    console.error('Add contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to add contacts' },
      { status: 500 }
    )
  }
}
