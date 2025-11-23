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

  // Check if campaign is expired
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-normal text-gray-600 mb-3">
            Revenue
          </h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">${totalRevenue.toFixed(2)}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Trending up this month</span>
            </div>
            <p className="text-sm text-gray-500">Total revenue from conversions</p>
          </div>
        </div>

        {/* Active Campaigns Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-normal text-gray-600 mb-3">
            Active Campaigns
          </h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">{totalCampaigns.toLocaleString()}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Growing campaign portfolio</span>
            </div>
            <p className="text-sm text-gray-500">Currently running campaigns</p>
          </div>
        </div>

        {/* Conversions Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-normal text-gray-600 mb-3">
            Conversions
          </h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">{totalConversions.toLocaleString()}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Strong conversion rate</span>
            </div>
            <p className="text-sm text-gray-500">Total successful conversions</p>
          </div>
        </div>

        {/* Views/Clicks Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
          <h3 className="text-sm font-normal text-gray-600 mb-3">
            Views
          </h3>
          <p className="text-4xl font-bold text-gray-900 mb-4">{totalClicks.toLocaleString()}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>High engagement rate</span>
            </div>
            <p className="text-sm text-gray-500">Total referral link clicks</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Campaigns
        </h2>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base mb-4">No campaigns yet</p>
            <Link
              href="/campaigns/new"
              className="text-gray-900 hover:text-gray-700 font-medium"
            >
              Create your first campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => {
              const isExpired = campaign.event_date < today
              const displayStatus = isExpired ? 'expired' : campaign.status

              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="block p-5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Event: {new Date(campaign.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      displayStatus === 'active'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : displayStatus === 'expired'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : displayStatus === 'draft'
                        ? 'bg-gray-50 text-gray-700 border border-gray-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contacts</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.stats.contacts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Clicks</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.stats.clicks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Conversions</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.stats.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-gray-900">${campaign.stats.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
