'use client'

import { useState } from 'react'

interface Campaign {
  id: string
  name: string
  credit_unlock_type: 'event_based' | 'immediate' | 'delayed'
  credit_unlock_days: number
  event_end_date: string | null
}

interface Props {
  campaign: Campaign
  onUpdate?: () => void
}

export default function CampaignUnlockSettings({ campaign, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [eventEndDate, setEventEndDate] = useState(
    campaign.event_end_date ? new Date(campaign.event_end_date).toISOString().slice(0, 16) : ''
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_end_date: eventEndDate || null
        })
      })

      if (!res.ok) throw new Error('Failed to update')

      setEditing(false)
      onUpdate?.()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update event end date')
    } finally {
      setSaving(false)
    }
  }

  const getUnlockStatus = () => {
    if (campaign.credit_unlock_type === 'immediate') {
      return { text: 'Credits unlock immediately', color: 'text-green-600' }
    }

    if (campaign.credit_unlock_type === 'delayed') {
      return {
        text: `Credits unlock ${campaign.credit_unlock_days} days after purchase`,
        color: 'text-blue-600'
      }
    }

    // event_based
    if (campaign.event_end_date) {
      const endDate = new Date(campaign.event_end_date)
      const now = new Date()
      if (endDate < now) {
        return { text: 'Event ended - credits unlocking', color: 'text-green-600' }
      }
      return {
        text: `Credits unlock after ${endDate.toLocaleDateString()}`,
        color: 'text-orange-600'
      }
    }

    return { text: 'Event end date not set', color: 'text-red-600' }
  }

  const status = getUnlockStatus()

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <span className={status.color}>{status.text}</span>

        {campaign.credit_unlock_type === 'event_based' && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-gray-600 hover:text-gray-900 underline text-xs"
          >
            {campaign.event_end_date ? 'Edit' : 'Set Date'}
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="datetime-local"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded text-sm"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 text-xs"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setEditing(false)
              setEventEndDate(campaign.event_end_date ? new Date(campaign.event_end_date).toISOString().slice(0, 16) : '')
            }}
            className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-xs"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
