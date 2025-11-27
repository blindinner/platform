import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WebhookSettings from '@/components/dashboard/webhook-settings'
import CustomCommissionCreator from '@/components/dashboard/custom-commission-creator'
import CampaignsList from '@/components/dashboard/campaigns-list'

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

  return (
    <div className="space-y-8">
      {/* Webhook Settings - Primary Interface */}
      <WebhookSettings />

      {/* Custom Commission Creator - Separate Section */}
      <CustomCommissionCreator />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Conversions</p>
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Contacts</p>
          <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
        </div>
      </div>

      {/* Campaigns List with Inline Editing */}
      <CampaignsList campaigns={campaignsWithStats} />
    </div>
  )
}
