'use client'

import { useState } from 'react'

interface WebShareButtonProps {
  creativeUrl: string
  campaignName: string
  referralLink: string
  contactId: string
}

export default function WebShareButton({
  creativeUrl,
  campaignName,
  referralLink,
  contactId
}: WebShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)

    try {
      // Track share attempt
      fetch('/api/share-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          action: 'web_share_attempted'
        })
      }).catch(console.error)

      // Try Web Share API
      if (navigator.share) {
        await navigator.share({
          title: campaignName,
          text: `Check out ${campaignName}! Join me at this event:`,
          url: referralLink
        })

        // Track successful share
        fetch('/api/share-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_id: contactId,
            action: 'web_share_completed'
          })
        }).catch(console.error)
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(referralLink)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      // User cancelled or error occurred
      console.error('Share error:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">💬</span>
        <div className="text-left">
          <div className="text-sm font-semibold">
            {isSharing ? 'Opening...' : 'Share with Friends'}
          </div>
          <div className="text-xs opacity-90">
            WhatsApp, Messages, Instagram DMs
          </div>
        </div>
      </div>
    </button>
  )
}
