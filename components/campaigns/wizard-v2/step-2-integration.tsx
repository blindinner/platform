'use client'

import { useState } from 'react'

interface Step2IntegrationProps {
  campaign_id?: string
}

export default function Step2Integration({ campaign_id }: Step2IntegrationProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://platform-egbl.vercel.app'

  const webhookUrl = campaign_id
    ? `${appUrl}/api/webhooks/${campaign_id}`
    : `${appUrl}/api/webhooks/YOUR_CAMPAIGN_ID`

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
          Configure your ticketing system to send a POST request to this URL whenever someone buys a ticket:
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <code className="text-sm text-gray-900 break-all">{webhookUrl}</code>
        </div>

        <button
          onClick={() => copyToClipboard(webhookUrl, 'webhook')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          {copied === 'webhook' ? '✓ Copied!' : 'Copy Webhook URL'}
        </button>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Required Payload:</p>
          <pre className="text-xs text-blue-800 overflow-x-auto">
{`{
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "order_id": "ORDER_12345"
}`}
          </pre>
        </div>
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
