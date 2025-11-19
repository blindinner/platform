import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
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

  // Calculate totals
  const totalCampaigns = campaignsWithStats.length
  const totalClicks = campaignsWithStats.reduce((sum, c) => sum + c.stats.clicks, 0)
  const totalContacts = campaignsWithStats.reduce((sum, c) => sum + c.stats.contacts, 0)
  const totalConversions = campaignsWithStats.reduce((sum, c) => sum + c.stats.conversions, 0)
  const totalRevenue = campaignsWithStats.reduce((sum, c) => sum + c.stats.revenue, 0)

  // Get recent campaigns (top 5)
  const recentCampaigns = campaignsWithStats.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Campaigns
            </h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCampaigns}</p>
          <p className="text-sm text-gray-600 mt-2">Active campaigns</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Clicks
            </h3>
            <span className="text-3xl">🔗</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
          <p className="text-sm text-gray-600 mt-2">Referral link clicks</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Contacts
            </h3>
            <span className="text-3xl">✉️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalContacts}</p>
          <p className="text-sm text-gray-600 mt-2">Email contacts</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversions
            </h3>
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-sm text-gray-600 mt-2">${totalRevenue.toFixed(2)} revenue</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Campaigns
        </h2>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">No campaigns yet</p>
            <Link
              href="/campaigns/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Event: {new Date(campaign.event_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Contacts</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.stats.contacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.stats.clicks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversions</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.stats.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">${campaign.stats.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
