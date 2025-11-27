import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CopyToClipboardButton from '@/components/copy-to-clipboard-button'
import DuplicateCampaignButton from '@/components/campaigns/duplicate-campaign-button'
import ManualContactUpload from '@/components/campaigns/manual-contact-upload'
import { generateTrackingPixel, generateConversionPixel, generateConversionExamples } from '@/lib/utils/pixel-generator'

interface CampaignStats {
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  conversionRate: number
  uniqueClickers: number
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: campaignId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('organizer_id', user.id)
    .single()

  if (campaignError || !campaign) {
    redirect('/campaigns')
  }

  // Get campaign stats and full contact list
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  const { data: clicks } = await supabase
    .from('clicks')
    .select('*')
    .eq('campaign_id', campaignId)

  const { data: conversions } = await supabase
    .from('conversions')
    .select('*')
    .eq('campaign_id', campaignId)

  const totalContacts = contacts?.length || 0
  const totalClicks = clicks?.length || 0
  const totalConversions = conversions?.length || 0
  const totalRevenue = conversions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

  // Get top referrers (contacts with most conversions)
  const { data: topReferrers } = await supabase
    .from('contacts')
    .select(`
      id,
      name,
      email,
      conversions (
        id,
        amount,
        converted_at
      )
    `)
    .eq('campaign_id', campaignId)

  const referrersWithStats = topReferrers?.map(contact => ({
    ...contact,
    conversionCount: contact.conversions?.length || 0,
    totalRevenue: contact.conversions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0
  }))
    .filter(r => r.conversionCount > 0)
    .sort((a, b) => b.conversionCount - a.conversionCount)
    .slice(0, 10) || []

  // Get recent activity (clicks and conversions)
  const { data: recentClicks } = await supabase
    .from('clicks')
    .select(`
      id,
      clicked_at,
      contacts (
        name,
        email
      )
    `)
    .eq('campaign_id', campaignId)
    .order('clicked_at', { ascending: false })
    .limit(10)

  const { data: recentConversions } = await supabase
    .from('conversions')
    .select(`
      id,
      converted_at,
      amount,
      contacts (
        name,
        email
      )
    `)
    .eq('campaign_id', campaignId)
    .order('converted_at', { ascending: false })
    .limit(10)

  // Merge and sort recent activity
  const recentActivity = [
    ...(recentClicks?.map(c => ({ type: 'click' as const, ...c })) || []),
    ...(recentConversions?.map(c => ({ type: 'conversion' as const, ...c })) || [])
  ].sort((a, b) => {
    const dateA = new Date((a as any).clicked_at || (a as any).converted_at)
    const dateB = new Date((b as any).clicked_at || (b as any).converted_at)
    return dateB.getTime() - dateA.getTime()
  }).slice(0, 10)

  // Generate pixel codes
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const trackingPixel = generateTrackingPixel(appUrl)
  const conversionPixel = generateConversionPixel(appUrl)
  const examples = generateConversionExamples()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/campaigns" className="text-sm text-gray-500 hover:text-gray-900 mb-2 inline-block">
            ← Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-500 mt-1">
            Status: <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
              campaign.status === 'active'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            }`}>
              {campaign.status}
            </span>
          </p>
        </div>
        <DuplicateCampaignButton campaign={campaign} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Contacts</p>
          <p className="text-3xl font-bold text-gray-900">{totalContacts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Clicks</p>
          <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Conversions</p>
          <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Conversion Rate</p>
          <p className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Webhook URLs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Integration</h2>

        {/* Simple Mode - Campaign-Specific Webhook */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Simple Mode (Recommended)</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">One URL per campaign</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Copy this URL and paste it into your ticketing platform's webhook configuration.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
            <code className="text-sm text-gray-900 break-all">
              {appUrl}/api/webhooks/{campaign.webhook_token}
            </code>
          </div>
          <CopyToClipboardButton
            text={`${appUrl}/api/webhooks/${campaign.webhook_token}`}
            label="Copy Simple Webhook URL"
          />
        </div>

        {/* Advanced Mode - Organization Webhook */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Advanced Mode (Multi-Event)</h3>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">One URL for all campaigns</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Use this organization-level webhook for all your campaigns. Include your event/product ID in the payload.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
            <code className="text-sm text-gray-900 break-all">
              {appUrl}/api/webhooks/org/[YOUR_CLIENT_ID]
            </code>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            💡 Your organization webhook URL is available in Settings or during campaign creation.
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-700 font-medium mb-2">Show payload example</summary>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
              <pre className="text-xs text-gray-800 overflow-x-auto">
{`{
  "external_event_id": "your_event_product_id",
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "order_id": "ORDER_12345"
}`}
              </pre>
            </div>
          </details>
        </div>
      </div>

      {/* Manual Contact Upload */}
      <ManualContactUpload campaignId={campaignId} />

      {/* Contacts List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Contacts & Referral Links</h2>
          <p className="text-sm text-gray-500 mt-1">All contacts with their personalized referral links</p>
        </div>
        {contacts && contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Referral Link
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name || 'No name'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={contact.short_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
                        >
                          {contact.short_link}
                        </a>
                        <CopyToClipboardButton
                          text={contact.short_link}
                          label="Copy"
                          compact
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-4">No contacts yet</p>
            <p className="text-sm">Send emails to contacts to start tracking referrals</p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers Leaderboard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers 🏆</h2>
          {referrersWithStats.length > 0 ? (
            <div className="space-y-3">
              {referrersWithStats.map((referrer, index) => (
                <div key={referrer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{referrer.name || 'No name'}</p>
                      <p className="text-sm text-gray-600">{referrer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{referrer.conversionCount}</p>
                    <p className="text-sm text-gray-600">${referrer.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No conversions yet</p>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'conversion' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'conversion' ? '💰' : '👆'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.contacts?.name || 'Someone'} {activity.type === 'conversion' ? 'made a purchase' : 'clicked their link'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.clicked_at || activity.converted_at).toLocaleString()}
                    </p>
                    {activity.amount && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        ${activity.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity yet</p>
          )}
        </div>
      </div>

      {/* Tracking Pixels */}
      <div className="space-y-6">
        {/* Tracking Pixel (Page Views) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">📊 Tracking Pixel (Page Views)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add this code to any page (landing pages, product pages, etc.) to track when visitors arrive via referral links.
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>{trackingPixel}</code>
            </pre>
          </div>
          <CopyToClipboardButton text={trackingPixel} />
        </div>

        {/* Conversion Pixel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">💰 Conversion Pixel (Purchases)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add this code to your order confirmation page. It automatically tracks conversions using multiple methods.
          </p>

          {/* The Pixel Code */}
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <pre className="text-sm">
              <code>{conversionPixel}</code>
            </pre>
          </div>
          <CopyToClipboardButton text={conversionPixel} label="Copy Conversion Pixel" />

          {/* Implementation Methods */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">📖 How to Implement (Choose One Method)</h3>

            <div className="space-y-4">
              {/* Basic Tracking */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">✅ Basic: Just Paste (Conversion Count Only)</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Simply paste the pixel on your confirmation page. Tracks how many conversions happened, but not revenue.
                </p>
                <p className="text-xs text-blue-700">
                  <strong>No setup needed!</strong> The pixel reads the ref code from the URL or cookie automatically.
                </p>
              </div>

              {/* Full Tracking Methods */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">🎯 Full Tracking (Includes Revenue)</h4>
                <p className="text-sm text-green-800 mb-3">
                  To track revenue and order details, provide the data using any of these methods:
                </p>

                {/* Method Tabs */}
                <div className="space-y-3 text-sm">
                  {/* Method 1: URL */}
                  <details className="bg-white rounded border border-green-300 p-3">
                    <summary className="font-medium text-green-900 cursor-pointer">
                      Method 1: URL Parameters (Simplest)
                    </summary>
                    <div className="mt-3 text-gray-700">
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">{examples.urlParams}</pre>
                    </div>
                  </details>

                  {/* Method 2: Function Call */}
                  <details className="bg-white rounded border border-green-300 p-3">
                    <summary className="font-medium text-green-900 cursor-pointer">
                      Method 2: Function Call (Recommended)
                    </summary>
                    <div className="mt-3 text-gray-700">
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">{examples.functionCall}</pre>
                    </div>
                  </details>

                  {/* Method 3: Data Layer */}
                  <details className="bg-white rounded border border-green-300 p-3">
                    <summary className="font-medium text-green-900 cursor-pointer">
                      Method 3: Data Layer (For Google Tag Manager Users)
                    </summary>
                    <div className="mt-3 text-gray-700">
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">{examples.dataLayer}</pre>
                    </div>
                  </details>

                  {/* Method 4: Data Attributes */}
                  <details className="bg-white rounded border border-green-300 p-3">
                    <summary className="font-medium text-green-900 cursor-pointer">
                      Method 4: Data Attributes
                    </summary>
                    <div className="mt-3 text-gray-700">
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">{examples.dataAttributes}</pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
