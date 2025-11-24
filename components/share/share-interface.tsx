'use client'

import { useState, useEffect } from 'react'
import WebShareButton from './web-share-button'
import InstagramShareButton from './instagram-share-button'
import CopyLinkButton from './copy-link-button'

interface ShareInterfaceProps {
  contactId: string
  contactName: string
  uniqueCode: string
  referralLink: string
  campaignName: string
  creativeUrl?: string | null
  destinationUrl: string
}

export default function ShareInterface({
  contactId,
  contactName,
  uniqueCode,
  referralLink,
  campaignName,
  creativeUrl,
  destinationUrl
}: ShareInterfaceProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Track page view
    fetch('/api/share-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: contactId,
        action: 'page_view',
        unique_code: uniqueCode
      })
    }).catch(console.error)
  }, [contactId, uniqueCode])

  if (!mounted) {
    return null // Avoid hydration issues
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-white text-xl font-bold text-center">{campaignName}</h1>
          {contactName && (
            <p className="text-white/80 text-sm text-center mt-1">
              Hi {contactName}! 👋
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Creative Preview (only if creative exists) */}
        {creativeUrl && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
            <div className="relative">
              <img
                src={creativeUrl}
                alt={campaignName}
                className="w-full h-auto"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-lg">
                  📸 Your Creative
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Share Options */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Share This Event!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Choose how you want to share
          </p>

          {/* Primary Share Buttons */}
          <div className="space-y-3 mb-6">
            <WebShareButton
              creativeUrl={creativeUrl}
              campaignName={campaignName}
              referralLink={referralLink}
              contactId={contactId}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <InstagramShareButton
              creativeUrl={creativeUrl}
              campaignName={campaignName}
              referralLink={referralLink}
              contactId={contactId}
            />
          </div>

          {/* Referral Link */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Your Unique Referral Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <CopyLinkButton
                link={referralLink}
                contactId={contactId}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Share this link to track referrals
            </p>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-3 text-center">
            💡 How It Works
          </h3>
          <ol className="space-y-2 text-white/90 text-sm">
            <li className="flex items-start gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Share the creative or your link with friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>They click your link and buy tickets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>You get credit for every referral!</span>
            </li>
          </ol>
        </div>

      </div>
    </div>
  )
}
