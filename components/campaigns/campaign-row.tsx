'use client'

import { useRouter } from 'next/navigation'
import CampaignActionsMenu from './campaign-actions-menu'

interface CampaignRowProps {
  campaign: {
    id: string
    name: string
    event_date: string
    status: string
    created_at: string
    destination_url?: string
    creative_image_url?: string
    stats: {
      contacts: number
      clicks: number
      conversions: number
      revenue: number
    }
  }
}

export default function CampaignRow({ campaign }: CampaignRowProps) {
  const router = useRouter()

  const handleRowClick = () => {
    router.push(`/campaigns/${campaign.id}`)
  }

  // Check if campaign is expired
  const today = new Date().toISOString().split('T')[0]
  const isExpired = campaign.event_date < today
  const displayStatus = isExpired ? 'expired' : campaign.status

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {campaign.name}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(campaign.event_date).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {campaign.stats.contacts}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {campaign.stats.clicks}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {campaign.stats.conversions}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
        ${campaign.stats.revenue.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(campaign.created_at).toLocaleDateString()}
      </td>
      <td
        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end">
          <CampaignActionsMenu campaign={campaign} />
        </div>
      </td>
    </tr>
  )
}
