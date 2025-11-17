'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ArchiveCampaignButtonProps {
  campaignId: string
  campaignName: string
}

export default function ArchiveCampaignButton({ campaignId, campaignName }: ArchiveCampaignButtonProps) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)

  const handleArchive = async () => {
    if (!confirm(`Archive "${campaignName}"?\n\nThe campaign will be hidden but all data will be preserved.`)) {
      return
    }

    setIsArchiving(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      })

      if (!res.ok) {
        throw new Error('Failed to archive campaign')
      }

      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      console.error('Archive error:', error)
      alert(error instanceof Error ? error.message : 'Failed to archive campaign')
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <button
      onClick={handleArchive}
      disabled={isArchiving}
      className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
    >
      {isArchiving ? 'Archiving...' : 'Archive'}
    </button>
  )
}
