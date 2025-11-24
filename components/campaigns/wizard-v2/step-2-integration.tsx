'use client'

import { useState, useEffect } from 'react'

interface Step2IntegrationProps {
  campaign_id?: string
}

export default function Step2Integration({ campaign_id }: Step2IntegrationProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [webhookToken, setWebhookToken] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [webhookMode, setWebhookMode] = useState<'simple' | 'advanced'>('simple')

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://platform-egbl.vercel.app'

  // Fetch campaign webhook token and user client_id
  useEffect(() => {
    async function fetchWebhookData() {
      if (!campaign_id) {
        setLoading(false)
        return
      }

      try {
        // Fetch campaign details for webhook_token
        const campaignResponse = await fetch(`/api/campaigns/${campaign_id}`)
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json()
          setWebhookToken(campaignData.webhook_token)
        }

        // Fetch user profile for client_id
        const profileResponse = await fetch('/api/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setClientId(profileData.client_id)
        }
      } catch (error) {
        console.error('Failed to fetch webhook data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWebhookData()
  }, [campaign_id])

  const simpleWebhookUrl = webhookToken
    ? `${appUrl}/api/webhooks/${webhookToken}`
    : `${appUrl}/api/webhooks/loading...`

  const advancedWebhookUrl = clientId
    ? `${appUrl}/api/webhooks/org/${clientId}`
    : `${appUrl}/api/webhooks/org/loading...`

  const trackingPixelCode = `<!-- Referral Tracking Pixel -->
<script>
(function() {
  // Get ref code from URL or cookie
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref') || getCookie('referral_code');

  if (refCode && typeof YOUR_ORDER_DATA !== 'undefined') {
    fetch('${appUrl}/api/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref_code: refCode,
        order_id: YOUR_ORDER_DATA.id,
        amount: YOUR_ORDER_DATA.total,
        buyer_email: YOUR_ORDER_DATA.email
      })
    });
  }

  function getCookie(name) {
    const value = \`; \${document.cookie}\`;
    const parts = value.split(\`; \${name}=\`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
})();
</script>`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Integration Setup</h2>
        <p className="text-gray-600">
          Connect your ticketing system to automatically generate referral links
        </p>
      </div>

      {/* Webhook URL */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">1</span>
          Webhook URL
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure your ticketing system to send a POST request whenever someone buys a ticket:
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setWebhookMode('simple')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              webhookMode === 'simple'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Simple (Recommended)
          </button>
          <button
            onClick={() => setWebhookMode('advanced')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              webhookMode === 'advanced'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Advanced (Multi-Event)
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">Loading webhook URL...</div>
          </div>
        ) : (
          <>
            {/* Simple Mode - Campaign-Specific Webhook */}
            {webhookMode === 'simple' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">✨ Simple Setup - One URL per Campaign</p>
                  <p className="text-xs text-blue-800">
                    Perfect for single events or platforms that support multiple webhooks. Just copy and paste this URL - no additional configuration needed!
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <code className="text-sm text-gray-900 break-all">{simpleWebhookUrl}</code>
                </div>

                <button
                  onClick={() => copyToClipboard(simpleWebhookUrl, 'simple')}
                  disabled={!webhookToken}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {copied === 'simple' ? '✓ Copied!' : 'Copy Webhook URL'}
                </button>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Payload:</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
{`{
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "order_id": "ORDER_12345"
}`}
                  </pre>
                </div>
              </>
            )}

            {/* Advanced Mode - Organization Webhook */}
            {webhookMode === 'advanced' && (
              <>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-purple-900 mb-2">🚀 Advanced Setup - One URL for All Campaigns</p>
                  <p className="text-xs text-purple-800">
                    Perfect for managing multiple events with a single webhook. Use this when your platform only allows one webhook URL or you want centralized management.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <code className="text-sm text-gray-900 break-all">{advancedWebhookUrl}</code>
                </div>

                <button
                  onClick={() => copyToClipboard(advancedWebhookUrl, 'advanced')}
                  disabled={!clientId}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  {copied === 'advanced' ? '✓ Copied!' : 'Copy Organization Webhook URL'}
                </button>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Payload (Option 1 - Campaign ID):</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto mb-4">
{`{
  "campaign_id": "${campaign_id || 'YOUR_CAMPAIGN_ID'}",
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "order_id": "ORDER_12345"
}`}
                  </pre>

                  <p className="text-sm font-medium text-gray-700 mb-2">Required Payload (Option 2 - External Event ID):</p>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
{`{
  "external_event_id": "your_shopify_product_123",
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "order_id": "ORDER_12345"
}`}
                  </pre>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Map your external event IDs to campaigns in campaign settings to use Option 2.
                  </p>
                </div>
              </>
            )}

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">🔒 Security:</p>
              <p className="text-xs text-green-800">
                {webhookMode === 'simple'
                  ? 'This URL contains a unique, secure token. Keep it confidential.'
                  : 'Your Client ID is unique to your organization. Keep this URL confidential.'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tracking Pixel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">2</span>
          Conversion Tracking Pixel
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add this code to your ticket purchase confirmation page to track conversions:
        </p>

        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto">
          <pre className="text-xs">
            <code>{trackingPixelCode}</code>
          </pre>
        </div>

        <button
          onClick={() => copyToClipboard(trackingPixelCode, 'pixel')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          {copied === 'pixel' ? '✓ Copied!' : 'Copy Tracking Code'}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Replace <code className="bg-gray-100 px-1 rounded">YOUR_ORDER_DATA</code> with your actual order object
        </p>
      </div>

      {/* Integration Guides */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform-Specific Guides</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Shopify</p>
              <p className="text-sm text-gray-600">Add webhook in Store Settings</p>
            </div>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Eventbrite</p>
              <p className="text-sm text-gray-600">Configure in Webhook Settings</p>
            </div>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">WooCommerce</p>
              <p className="text-sm text-gray-600">Use webhook plugin</p>
            </div>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Manual Contact Import */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Need to add contacts manually?</strong> You can still import a CSV file from your campaign dashboard after creation.
        </p>
      </div>
    </div>
  )
}
