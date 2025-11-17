'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RestoreCampaignButtonProps {
  campaignId: string
  campaignName: string
}

export default function RestoreCampaignButton({ campaignId, campaignName }: RestoreCampaignButtonProps) {
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState(false)

  const handleRestore = async () => {
    if (!confirm(`Restore "${campaignName}"?\n\nThe campaign will be moved back to active campaigns.`)) {
      return
    }

    setIsRestoring(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      if (!res.ok) {
        throw new Error('Failed to restore campaign')
      }

      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      console.error('Restore error:', error)
      alert(error instanceof Error ? error.message : 'Failed to restore campaign')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <button
      onClick={handleRestore}
      disabled={isRestoring}
      className="text-green-600 hover:text-green-900 disabled:opacity-50"
    >
      {isRestoring ? 'Restoring...' : 'Restore'}
    </button>
  )
}
