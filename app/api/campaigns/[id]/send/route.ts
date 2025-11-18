import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend/client'
import { generateUniqueCode, buildShortLink } from '@/lib/utils/link-generator'
import { renderEmailTemplate, buildEmailHtml } from '@/lib/utils/email-template'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId } = await params
    const { contacts } = await request.json()

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Process each contact
    const results = []

    for (const contact of contacts) {
      try {
        // Generate unique code
        const uniqueCode = await generateUniqueCode()
        const shortLink = buildShortLink(uniqueCode)

        // Insert contact into database
        const { data: dbContact, error: contactError } = await supabaseAdmin
          .from('contacts')
          .insert({
            campaign_id: campaignId,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            unique_code: uniqueCode,
            short_link: shortLink
          })
          .select()
          .single()

        if (contactError) throw contactError

        // Render email template
        const emailBody = renderEmailTemplate(campaign.email_template, {
          name: contact.name,
          link: shortLink,
          event: campaign.name
        })

        // Build share page URL
        const sharePageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${uniqueCode}`

        const emailHtml = buildEmailHtml(
          emailBody,
          sharePageUrl,
          campaign.name
        )

        // Debug logging
        console.log('📧 Sending email to:', contact.email)
        console.log('📧 Subject:', campaign.email_subject)
        console.log('📧 Share URL:', sharePageUrl)
        console.log('📧 Email HTML length:', emailHtml.length)

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Referral Platform <onboarding@resend.dev>',
          to: contact.email,
          subject: campaign.email_subject,
          html: emailHtml
        })

        console.log('📧 Resend response:', { data: emailData, error: emailError })

        if (emailError) throw emailError

        // Update contact with sent timestamp
        await supabaseAdmin
          .from('contacts')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', dbContact.id)

        // Log email event
        await supabaseAdmin.from('email_events').insert({
          contact_id: dbContact.id,
          campaign_id: campaignId,
          event_type: 'sent',
          metadata: { email_id: emailData?.id }
        })

        results.push({
          email: contact.email,
          status: 'sent',
          link: shortLink
        })

      } catch (error) {
        console.error(`Failed to process ${contact.email}:`, error)
        results.push({
          email: contact.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update campaign status to active
    await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      results,
      total: contacts.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length
    })

  } catch (error) {
    console.error('Send emails error:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
