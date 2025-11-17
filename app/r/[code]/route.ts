import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Look up contact and campaign
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select(`
        id,
        campaign_id,
        campaigns (
          id,
          destination_url,
          promotion_end_date,
          status
        )
      `)
      .eq('unique_code', code)
      .single()

    if (contactError || !contact) {
      return new NextResponse('Link not found', { status: 404 })
    }

    const campaign = contact.campaigns as any

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return new NextResponse('This promotion has ended', { status: 410 })
    }

    // Check if promotion period has ended
    if (new Date() > new Date(campaign.promotion_end_date)) {
      return new NextResponse('This promotion has ended', { status: 410 })
    }

    // Log the click
    await supabaseAdmin.from('clicks').insert({
      contact_id: contact.id,
      campaign_id: contact.campaign_id,
      clicked_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      referrer_url: request.headers.get('referer')
    })

    // Build redirect URL with tracking parameter
    const destinationUrl = new URL(campaign.destination_url)
    destinationUrl.searchParams.set('ref', code)

    // Create response with redirect
    const response = NextResponse.redirect(destinationUrl.toString(), 302)

    // Set tracking cookie (30 days)
    response.cookies.set('referral_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}
