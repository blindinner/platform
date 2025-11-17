import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteCampaignButton from '@/components/campaigns/delete-campaign-button'
import ArchiveCampaignButton from '@/components/campaigns/archive-campaign-button'

export default async function CampaignsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all campaigns for the user (excluding archived)
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organizer_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  // Get stats for each campaign
  const campaignsWithStats = await Promise.all((campaigns || []).map(async (campaign) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Campaigns</h1>
          <Link
            href="/campaigns/archived"
            className="text-sm text-gray-600 hover:text-gray-900 mt-1 inline-block"
          >
            View Archived Campaigns →
          </Link>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      {campaignsWithStats.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No campaigns yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first campaign to start tracking referrals
          </p>
          <Link
            href="/campaigns/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaignsWithStats.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(campaign.event_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.stats.contacts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.stats.clicks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.stats.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${campaign.stats.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <ArchiveCampaignButton
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                      />
                      <DeleteCampaignButton
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Cards */}
      {campaignsWithStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Campaigns</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {campaignsWithStats.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {campaignsWithStats.reduce((sum, c) => sum + c.stats.clicks, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Conversions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {campaignsWithStats.reduce((sum, c) => sum + c.stats.conversions, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ${campaignsWithStats.reduce((sum, c) => sum + c.stats.revenue, 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
