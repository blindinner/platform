'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  external_event_id: string | null
  event_date: string
  status: string
  commission_type: string
  commission_value: number
  stats: {
    contacts: number
    clicks: number
    conversions: number
    revenue: number
  }
}

interface CampaignsListProps {
  campaigns: Campaign[]
}

export default function CampaignsList({ campaigns }: CampaignsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    commissionType: 'fixed' as 'fixed' | 'percentage',
    commissionValue: 3.00
  })
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const startEdit = (campaign: Campaign) => {
    setEditingId(campaign.id)
    setEditForm({
      commissionType: campaign.commission_type as 'fixed' | 'percentage',
      commissionValue: campaign.commission_value
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (campaignId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commission_type: editForm.commissionType,
          commission_value: editForm.commissionValue
        })
      })

      if (!res.ok) throw new Error('Failed to update commission')

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update commission')
    } finally {
      setSaving(false)
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
        <div className="text-center py-12 text-gray-500">
          <p className="text-base mb-2">No campaigns yet</p>
          <p className="text-sm">Campaigns will auto-create when your webhook receives purchases</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Your Campaigns
      </h2>

      <div className="space-y-3">
        {campaigns.map((campaign) => {
          const isExpired = campaign.event_date < today
          const displayStatus = isExpired ? 'expired' : campaign.status
          const isEditing = editingId === campaign.id

          return (
            <div
              key={campaign.id}
              className="p-5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="font-semibold text-gray-900 hover:text-gray-700"
                    >
                      {campaign.name}
                    </Link>
                    {campaign.external_event_id && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                        {campaign.external_event_id}
                      </span>
                    )}
                  </div>
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

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mb-4">
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

              {/* Commission Settings */}
              <div className="border-t border-gray-200 pt-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Commission Type
                        </label>
                        <select
                          value={editForm.commissionType}
                          onChange={(e) => setEditForm({ ...editForm, commissionType: e.target.value as 'fixed' | 'percentage' })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="fixed">Fixed ($)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Value
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            {editForm.commissionType === 'fixed' ? '$' : '%'}
                          </span>
                          <input
                            type="number"
                            step={editForm.commissionType === 'fixed' ? '0.01' : '1'}
                            min="0"
                            value={editForm.commissionValue}
                            onChange={(e) => setEditForm({ ...editForm, commissionValue: parseFloat(e.target.value) })}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(campaign.id)}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600">Commission: </span>
                      <span className="font-semibold text-gray-900">
                        {campaign.commission_type === 'fixed'
                          ? `$${campaign.commission_value.toFixed(2)} per sale`
                          : `${campaign.commission_value}% of ticket price`
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => startEdit(campaign)}
                      className="px-3 py-1 text-xs border border-gray-200 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Edit Commission
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
