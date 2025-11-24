'use client'

import { useState } from 'react'

interface InstagramShareButtonProps {
  creativeUrl?: string | null
  campaignName: string
  referralLink: string
  contactId: string
}

export default function InstagramShareButton({
  creativeUrl,
  campaignName,
  referralLink,
  contactId
}: InstagramShareButtonProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleInstagramShare = async () => {
    if (!creativeUrl) {
      alert('No creative image available for this campaign.')
      return
    }

    setIsDownloading(true)

    try {
      // Download the image
      const response = await fetch(creativeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaignName.replace(/\s+/g, '-')}-creative.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Copy link to clipboard
      await navigator.clipboard.writeText(referralLink)

      // Track download
      fetch('/api/share-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          action: 'instagram_download'
        })
      }).catch(console.error)

      // Show instructions
      setShowInstructions(true)

      // Try to open Instagram app (mobile only)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        setTimeout(() => {
          window.location.href = 'instagram://story-camera'
        }, 2000)
      }

    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download image. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleInstagramShare}
        disabled={isDownloading}
        className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">📸</span>
          <div className="text-left">
            <div className="text-sm font-semibold">
              {isDownloading ? 'Downloading...' : 'Share to Instagram Story'}
            </div>
            <div className="text-xs opacity-90">
              Download creative + instructions
            </div>
          </div>
        </div>
      </button>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Share!
              </h3>
              <p className="text-gray-600 text-sm">
                Image downloaded & link copied!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📱</span>
                How to Post to Instagram Story:
              </h4>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span>Open Instagram app</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span>Tap <strong>+</strong> to create a story</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span>Select the downloaded image from your gallery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  <span>Add a <strong>Link Sticker</strong> and paste your copied link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">5</span>
                  <span>Share to your story!</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium mb-1">
                ✂️ Your link is copied!
              </p>
              <p className="text-xs text-blue-700 break-all">
                {referralLink}
              </p>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
