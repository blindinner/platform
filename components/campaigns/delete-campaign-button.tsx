'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteCampaignButtonProps {
  campaignId: string
  campaignName: string
}

export default function DeleteCampaignButton({ campaignId, campaignName }: DeleteCampaignButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    // Extra confirmation for permanent deletion
    if (!confirm(`⚠️ PERMANENTLY DELETE "${campaignName}"?\n\nThis action CANNOT be undone!\n\nAll data including contacts, clicks, and conversions will be permanently removed.\n\nAre you absolutely sure?`)) {
      setShowConfirm(false)
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete campaign')
      }

      // Refresh the page to show updated list
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete campaign')
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 font-bold disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : '⚠️ Confirm Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-900"
    >
      Delete
    </button>
  )
}
