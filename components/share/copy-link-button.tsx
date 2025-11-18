'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
  link: string
  contactId: string
}

export default function CopyLinkButton({ link, contactId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)

      // Track copy action
      fetch('/api/share-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          action: 'link_copied'
        })
      }).catch(console.error)

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      alert('Failed to copy link')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors flex-shrink-0"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}
