'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomCommissionCreator() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [eventId, setEventId] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>('fixed')
  const [commissionValue, setCommissionValue] = useState<number>(3.00)
  const [creditUnlockType, setCreditUnlockType] = useState<'event_based' | 'immediate' | 'delayed'>('event_based')
  const [creditUnlockDays, setCreditUnlockDays] = useState<number>(0)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDefaults()
  }, [])

  const loadDefaults = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setCommissionType(data.webhookDefaultCommissionType || 'fixed')
        setCommissionValue(data.webhookDefaultCommissionValue || 3.00)
        setCreditUnlockType(data.defaultCreditUnlockType || 'event_based')
        setCreditUnlockDays(data.defaultCreditUnlockDays || 0)
      }
    } catch (error) {
      console.error('Failed to load defaults:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    if (!eventId.trim()) {
      alert('Please enter an Event ID')
      return
    }

    setCreating(true)
    try {
      const payload = {
        name: eventId,
        external_event_id: eventId,
        commission_type: commissionType,
        commission_value: commissionValue,
        credit_unlock_type: creditUnlockType,
        credit_unlock_days: creditUnlockDays,
        event_end_date: eventEndDate || null,
        destination_url: null,
        status: 'active',
        integration_type: 'webhook_organization'
      }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create campaign')
      }

      // Reset and close
      setEventId('')
      setEventEndDate('')
      setShowForm(false)
      router.refresh()
    } catch (error) {
      console.error('Create error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create custom commission')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Custom Event Commission</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pre-create campaigns with custom commission for specific events
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Custom Commission'}
        </button>
      </div>

      {showForm && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>💡 How it works:</strong> Create a campaign for a specific event_id with custom commission.
              When your webhook receives a purchase with this event_id, it will use these custom settings instead of your defaults.
            </p>
          </div>

          <div className="space-y-4">
            {/* Event ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="e.g., summer-fest-2024, vip-concert-dec"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                This must match the <code className="bg-gray-100 px-1 rounded">external_event_id</code> in your webhook payload
              </p>
            </div>

            {/* Event End Date (only for event_based unlock) */}
            {creditUnlockType === 'event_based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Credits will unlock after this date. Leave empty to set later.
                </p>
              </div>
            )}

            {/* Commission Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Type
                </label>
                <select
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value as 'fixed' | 'percentage')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="fixed">Fixed Amount ($)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {commissionType === 'fixed' ? '$' : '%'}
                  </span>
                  <input
                    type="number"
                    step={commissionType === 'fixed' ? '0.01' : '1'}
                    min="0"
                    max={commissionType === 'percentage' ? '100' : undefined}
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {commissionType === 'fixed'
                    ? `Referrers earn $${commissionValue.toFixed(2)} per sale`
                    : `Referrers earn ${commissionValue}% of ticket price`
                  }
                </p>
              </div>
            </div>

            {/* Credit Unlock Settings */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Credit Unlock Settings</h4>
              <p className="text-xs text-gray-600 mb-3">
                When should referrers be able to use their earned credits for this event?
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When to Unlock Credits
                  </label>
                  <select
                    value={creditUnlockType}
                    onChange={(e) => setCreditUnlockType(e.target.value as 'event_based' | 'immediate' | 'delayed')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="event_based">After Event Ends (requires event date)</option>
                    <option value="immediate">Immediately After Purchase</option>
                    <option value="delayed">After X Days</option>
                  </select>
                </div>

                {creditUnlockType === 'delayed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unlock After (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={creditUnlockDays}
                      onChange={(e) => setCreditUnlockDays(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="e.g., 30"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Credits will unlock {creditUnlockDays} days after the referral purchase
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={createCampaign}
                disabled={creating || !eventId.trim()}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
