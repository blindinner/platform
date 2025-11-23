'use client'

import { useRouter } from 'next/navigation'

interface DuplicateCampaignButtonProps {
  campaign: {
    id: string
    name: string
    event_date: string
    promotion_end_date: string
    creative_image_url: string
    destination_url: string
    email_subject: string
    email_template: string
  }
}

export default function DuplicateCampaignButton({ campaign }: DuplicateCampaignButtonProps) {
  const router = useRouter()

  const handleDuplicate = () => {
    // Store campaign data in localStorage for the new campaign page to use
    localStorage.setItem('duplicateCampaign', JSON.stringify(campaign))
    router.push('/campaigns/new?mode=duplicate')
  }

  return (
    <button
      onClick={handleDuplicate}
      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
    >
      📋 Duplicate Campaign
    </button>
  )
}
