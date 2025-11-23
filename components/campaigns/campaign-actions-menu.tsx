'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CampaignActionsMenuProps {
  campaign: {
    id: string
    name: string
    status: string
    event_date: string
    destination_url?: string
    creative_image_url?: string
  }
}

export default function CampaignActionsMenu({ campaign }: CampaignActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 192 // w-48 = 12rem = 192px
      const menuHeight = 160 // approximate height

      // Calculate position
      let top = rect.bottom + 4 // 4px gap below button
      let left = rect.right - menuWidth // align right edge with button

      // Check if menu goes off bottom of screen
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4 // show above button instead
      }

      // Check if menu goes off left of screen
      if (left < 0) {
        left = rect.left // align left edge with button
      }

      setMenuPosition({ top, left })
    }

    setIsOpen(!isOpen)
  }

  const handleDuplicate = () => {
    // Store campaign data in localStorage for the duplicate flow
    const campaignData = {
      name: `${campaign.name} (Copy)`,
      event_date: campaign.event_date,
      destination_url: campaign.destination_url || '',
      creative_image_url: campaign.creative_image_url || '',
    }
    localStorage.setItem('duplicateCampaignData', JSON.stringify(campaignData))
    router.push('/campaigns/new')
    setIsOpen(false)
  }

  const handleArchive = async () => {
    if (!confirm(`Archive "${campaign.name}"?\n\nThe campaign will be hidden but all data will be preserved.`)) {
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      })

      if (!res.ok) {
        throw new Error('Failed to archive campaign')
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Archive error:', error)
      alert(error instanceof Error ? error.message : 'Failed to archive campaign')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${campaign.name}"?\n\nThis action cannot be undone. All campaign data, contacts, and analytics will be permanently deleted.`)) {
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete campaign')
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete campaign')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative">
      {/* Three-dot button */}
      <button
        ref={buttonRef}
        onClick={handleToggleMenu}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Campaign actions"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {/* Duplicate */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicate()
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-gray-100"></div>

          {/* Archive */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleArchive()
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
