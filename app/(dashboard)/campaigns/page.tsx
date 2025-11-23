import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CampaignRow from '@/components/campaigns/campaign-row'

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // Get active campaigns (not archived and event date is today or in the future)
  const { data: activeCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organizer_id', user.id)
    .neq('status', 'archived')
    .gte('event_date', today)
    .order('created_at', { ascending: false })

  // Get expired campaigns (not archived and event date is in the past)
  const { data: expiredCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organizer_id', user.id)
    .neq('status', 'archived')
    .lt('event_date', today)
    .order('event_date', { ascending: false })

  // Helper function to get stats for campaigns
  const getCampaignStats = async (campaigns: any[]) => {
    return Promise.all((campaigns || []).map(async (campaign) => {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id')
        .eq('campaign_id', campaign.id)

      const { data: clicks } = await supabase
        .from('clicks')
        .select('id')
        .eq('campaign_id', campaign.id)

      const { data: conversions } = await supabase
        .from('conversions')
        .select('amount')
        .eq('campaign_id', campaign.id)

      return {
        ...campaign,
        stats: {
          contacts: contacts?.length || 0,
          clicks: clicks?.length || 0,
          conversions: conversions?.length || 0,
          revenue: conversions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0
        }
      }
    }))
  }

  // Get stats for active and expired campaigns
  const activeCampaignsWithStats = await getCampaignStats(activeCampaigns || [])
  const expiredCampaignsWithStats = await getCampaignStats(expiredCampaigns || [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <Link
            href="/campaigns/archived"
            className="text-sm text-gray-500 hover:text-gray-900 mt-1 inline-block"
          >
            View Archived Campaigns →
          </Link>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      {/* Active Campaigns Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h2>
        {activeCampaignsWithStats.length === 0 ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No active campaigns
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first campaign to start tracking referrals
            </p>
            <Link
              href="/campaigns/new"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCampaignsWithStats.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expired Campaigns Section */}
      {expiredCampaignsWithStats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expired Campaigns</h2>
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiredCampaignsWithStats.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
