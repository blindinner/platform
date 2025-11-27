'use client'

import { useState, useEffect } from 'react'

interface Step2IntegrationProps {
  externalEventId?: string
}

export default function Step2Integration({ externalEventId }: Step2IntegrationProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://platform-egbl.vercel.app'

  // Fetch user client_id for organization webhook
  useEffect(() => {
    async function fetchClientId() {
      try {
        const profileResponse = await fetch('/api/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setClientId(profileData.client_id)
        }
      } catch (error) {
        console.error('Failed to fetch client ID:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientId()
  }, [])

  const webhookUrl = clientId
    ? `${appUrl}/api/webhooks/org/${clientId}`
    : `${appUrl}/api/webhooks/org/loading...`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied('webhook')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Webhook Integration</h2>
        <p className="text-gray-600">
          Connect your ticketing platform to automatically generate personalized referral links
        </p>
      </div>

      {/* Organization Webhook URL */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Organization Webhook URL</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure your ticketing system to send a POST request to this URL when someone purchases a ticket:
        </p>

        {loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">Loading webhook URL...</div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <code className="text-sm text-gray-900 break-all font-mono">{webhookUrl}</code>
            </div>

            <button
              onClick={() => copyToClipboard(webhookUrl)}
              disabled={!clientId}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {copied === 'webhook' ? '✓ Copied!' : 'Copy Webhook URL'}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Automatic Campaign Creation</p>
              <p className="text-xs text-blue-800">
                This single webhook URL works for ALL your events. When a purchase comes in with a new{' '}
                <code className="bg-blue-100 px-1 rounded">external_event_id</code>, we automatically create a campaign with your default commission settings. No manual setup needed!
              </p>
              <p className="text-xs text-blue-800 mt-2">
                <strong>Want custom commission for specific events?</strong> Pre-create a campaign with the event_id and custom settings before the first webhook arrives.
              </p>
            </div>

            {/* Webhook Payload */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Webhook Payload Format:</p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
{`POST ${webhookUrl}
Content-Type: application/json

{
  "external_event_id": "${externalEventId || 'your_event_product_id'}",
  "ticket_url": "https://yourplatform.com/events/summer-fest",
  "customer_email": "buyer@example.com",
  "customer_first_name": "Jane",
  "customer_last_name": "Smith",
  "customer_phone": "+1234567890",
  "order_id": "ORDER_12345",
  "amount": 50.00,
  "referral_code": "ABC12345"
}`}
                  </pre>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="mb-1"><strong>Required fields:</strong></p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li><code className="bg-gray-100 px-1 rounded">external_event_id</code> - Your event/product identifier</li>
                    <li><code className="bg-gray-100 px-1 rounded">ticket_url</code> - Where referral links redirect to</li>
                    <li><code className="bg-gray-100 px-1 rounded">customer_email</code> - Buyer's email address</li>
                  </ul>
                  <p className="mt-1"><strong>Optional but recommended:</strong> customer_first_name, customer_last_name, customer_phone, customer_name (fallback), order_id, amount (needed for % commission), referral_code (if purchase was from a referral)</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Webhook Response (200 OK):</p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
                  <pre className="text-xs overflow-x-auto">
{`{
  "success": true,
  "referral_link": "https://yourplatform.com/event?ref=ABC123",
  "contact_id": "contact_uuid",
  "message": "Referral link generated successfully"
}`}
                  </pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  The webhook returns the personalized referral link that you can share with the customer via email, SMS, or display on a confirmation page.
                </p>
              </div>
            </div>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">🔒 Security</p>
              <p className="text-xs text-green-800">
                Your Client ID is unique to your organization. Keep this URL confidential and only share it with your platform's webhook configuration.
              </p>
            </div>
          </>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How the Flow Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Customer purchases a ticket</p>
              <p className="text-xs text-gray-600">Your platform sends a webhook notification to our system</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
            <div>
              <p className="text-sm font-medium text-gray-900">We generate a unique referral link</p>
              <p className="text-xs text-gray-600">The link is personalized for that customer and tracked to this campaign</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Share the link with the customer</p>
              <p className="text-xs text-gray-600">Use the webhook response, daily CSV export, API, or email to deliver the link</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Customer shares & earns credits</p>
              <p className="text-xs text-gray-600">Each sale through their link earns them credit for future purchases</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Credits unlock after event ends</p>
              <p className="text-xs text-gray-600">Customers receive a unique coupon code to redeem on your platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Distribution Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Distribute Links</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you prefer not to use the webhook response, we offer these alternatives:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm">📊 Daily CSV Export</p>
            <p className="text-xs text-gray-600 mt-1">Download a CSV with all new referral links each day</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm">🔌 REST API</p>
            <p className="text-xs text-gray-600 mt-1">Poll our API to fetch new links programmatically</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm">📧 Email Distribution</p>
            <p className="text-xs text-gray-600 mt-1">We can send links directly to customers via email</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 text-sm">💻 Manual Download</p>
            <p className="text-xs text-gray-600 mt-1">Export links manually from your campaign dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
