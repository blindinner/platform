'use client'

import { useState } from 'react'

interface CopyToClipboardButtonProps {
  text: string
  label?: string
  compact?: boolean
}

export default function CopyToClipboardButton({ text, label = 'Copy to Clipboard', compact = false }: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
      >
        {copied ? '✓' : label}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
    >
      {copied ? '✓ Copied!' : label}
    </button>
  )
}
