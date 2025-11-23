import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no profile exists yet, return default values with user email
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        fullName: '',
        email: user.email,
        companyName: '',
        logoUrl: '',
        brandColor: '#000000',
        industry: '',
        businessEmail: '',
        website: '',
        phone: '',
        address: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        defaultFooter: '',
        timezone: 'America/New_York',
        privacyPolicyUrl: '',
        termsUrl: '',
      })
    }

    if (error) throw error

    return NextResponse.json({
      ...profile,
      email: user.email, // Always return current email
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Remove email from body as it can't be changed via profile
    delete body.email

    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: body.fullName,
          company_name: body.companyName,
          logo_url: body.logoUrl,
          brand_color: body.brandColor,
          industry: body.industry,
          business_email: body.businessEmail,
          website: body.website,
          phone: body.phone,
          address: body.address,
          facebook_url: body.facebookUrl,
          instagram_url: body.instagramUrl,
          twitter_url: body.twitterUrl,
          linkedin_url: body.linkedinUrl,
          default_footer: body.defaultFooter,
          timezone: body.timezone,
          privacy_policy_url: body.privacyPolicyUrl,
          terms_url: body.termsUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: body.fullName,
          company_name: body.companyName,
          logo_url: body.logoUrl,
          brand_color: body.brandColor,
          industry: body.industry,
          business_email: body.businessEmail,
          website: body.website,
          phone: body.phone,
          address: body.address,
          facebook_url: body.facebookUrl,
          instagram_url: body.instagramUrl,
          twitter_url: body.twitterUrl,
          linkedin_url: body.linkedinUrl,
          default_footer: body.defaultFooter,
          timezone: body.timezone,
          privacy_policy_url: body.privacyPolicyUrl,
          terms_url: body.termsUrl,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error('Profile save error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
