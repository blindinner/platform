import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ShareInterface from '@/components/share/share-interface'

export default async function SharePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  // Look up contact and campaign
  const { data: contact, error: contactError } = await supabaseAdmin
    .from('contacts')
    .select(`
      id,
      name,
      unique_code,
      short_link,
      campaign_id,
      campaigns (
        id,
        name,
        creative_image_url,
        destination_url,
        status,
        promotion_end_date
      )
    `)
    .eq('unique_code', code)
    .single()

  if (contactError || !contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600">
            This share link is invalid or has expired.
          </p>
        </div>
      </div>
    )
  }

  const campaign = contact.campaigns as any

  // Check if campaign is still active
  if (campaign.status !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Ended</h1>
          <p className="text-gray-600">
            This promotion has ended. Thank you for your interest!
          </p>
        </div>
      </div>
    )
  }

  // Check if promotion period has ended
  if (new Date() > new Date(campaign.promotion_end_date)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Promotion Ended</h1>
          <p className="text-gray-600">
            This promotion period has ended. Thank you for your interest!
          </p>
        </div>
      </div>
    )
  }

  return (
    <ShareInterface
      contactId={contact.id}
      contactName={contact.name}
      uniqueCode={contact.unique_code}
      referralLink={contact.short_link}
      campaignName={campaign.name}
      creativeUrl={campaign.creative_image_url}
      destinationUrl={campaign.destination_url}
    />
  )
}
