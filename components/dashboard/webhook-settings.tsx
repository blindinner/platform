'use client'

import { useState, useEffect } from 'react'

export default function WebhookSettings() {
  const [clientId, setClientId] = useState<string>('')
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>('fixed')
  const [commissionValue, setCommissionValue] = useState<number>(3.00)
  const [creditUnlockType, setCreditUnlockType] = useState<'event_based' | 'immediate' | 'delayed'>('event_based')
  const [creditUnlockDays, setCreditUnlockDays] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const webhookUrl = clientId ? `${appUrl}/api/webhooks/org/${clientId}` : 'Loading...'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setClientId(data.clientId || '')
        setCommissionType(data.webhookDefaultCommissionType || 'fixed')
        setCommissionValue(data.webhookDefaultCommissionValue || 3.00)
        setCreditUnlockType(data.defaultCreditUnlockType || 'event_based')
        setCreditUnlockDays(data.defaultCreditUnlockDays || 0)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookDefaultCommissionType: commissionType,
          webhookDefaultCommissionValue: commissionValue,
          defaultCreditUnlockType: creditUnlockType,
          defaultCreditUnlockDays: creditUnlockDays,
        })
      })

      if (!res.ok) throw new Error('Failed to save settings')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Your Webhook Integration</h2>

      {/* Webhook URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Webhook URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm"
          />
          <button
            onClick={copyWebhook}
            disabled={!clientId}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Configure your platform to send purchase webhooks to this URL. We'll auto-create campaigns for new events.
        </p>
      </div>

      {/* Default Commission */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-sm font-semibold text-white mb-3">Default Commission Settings</h3>
        <p className="text-xs text-gray-400 mb-4">
          New events will automatically use these commission settings unless you customize them below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission Type
            </label>
            <select
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value as 'fixed' | 'percentage')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="fixed">Fixed Amount ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {commissionType === 'fixed' ? '$' : '%'}
              </span>
              <input
                type="number"
                step={commissionType === 'fixed' ? '0.01' : '1'}
                min="0"
                max={commissionType === 'percentage' ? '100' : undefined}
                value={commissionValue}
                onChange={(e) => setCommissionValue(parseFloat(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {commissionType === 'fixed'
                ? `Referrers earn $${commissionValue.toFixed(2)} per sale`
                : `Referrers earn ${commissionValue}% of ticket price`
              }
            </p>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Defaults'}
        </button>
      </div>

      {/* Credit Unlock Settings */}
      <div className="border-t border-gray-700 pt-6 mt-6">
        <h3 className="text-sm font-semibold text-white mb-3">Credit Unlock Settings</h3>
        <p className="text-xs text-gray-400 mb-4">
          Control when referrers can use their earned credits
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              When to Unlock Credits
            </label>
            <select
              value={creditUnlockType}
              onChange={(e) => setCreditUnlockType(e.target.value as 'event_based' | 'immediate' | 'delayed')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="event_based">After Event Ends (for events)</option>
              <option value="immediate">Immediately (for always-available products)</option>
              <option value="delayed">After X Days (custom delay)</option>
            </select>
          </div>

          {creditUnlockType === 'delayed' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unlock After (Days)
              </label>
              <input
                type="number"
                min="1"
                value={creditUnlockDays}
                onChange={(e) => setCreditUnlockDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="e.g., 30"
              />
              <p className="text-xs text-gray-400 mt-1">
                Credits will unlock {creditUnlockDays} days after the referral purchase
              </p>
            </div>
          )}

          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
            <p className="text-xs text-gray-300">
              <strong>Current setting:</strong>{' '}
              {creditUnlockType === 'event_based' && 'Credits unlock after event end date'}
              {creditUnlockType === 'immediate' && 'Credits available immediately'}
              {creditUnlockType === 'delayed' && `Credits unlock ${creditUnlockDays} days after purchase`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
