'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseCSV, generateCSVTemplate } from '@/lib/utils/csv-parser'

interface ManualContactUploadProps {
  campaignId: string
}

export default function ManualContactUpload({ campaignId }: ManualContactUploadProps) {
  const router = useRouter()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)

    try {
      const text = await file.text()
      const parsedContacts = parseCSV(text)

      if (parsedContacts.length === 0) {
        setUploadError('No valid contacts found in CSV file')
        setUploading(false)
        return
      }

      // Send contacts to API
      const res = await fetch(`/api/campaigns/${campaignId}/add-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: parsedContacts })
      })

      if (!res.ok) {
        throw new Error('Failed to add contacts')
      }

      const data = await res.json()
      alert(`Successfully added ${data.count} contacts!`)

      // Refresh the page to show new contacts
      router.refresh()

      // Clear file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Error uploading CSV file')
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Contact Upload</h3>
      <p className="text-sm text-gray-600 mb-4">
        Need to add contacts manually? Upload a CSV file to generate referral links in bulk.
      </p>

      <div className="flex gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          disabled={uploading}
          className="hidden"
          id="manual-csv-upload"
        />
        <label
          htmlFor="manual-csv-upload"
          className={`px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors font-medium text-sm ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload CSV File'}
        </label>

        <button
          onClick={downloadTemplate}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Download Template
        </button>
      </div>

      {uploadError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>CSV Format:</strong> name, email, phone (one contact per line)</p>
      </div>
    </div>
  )
}
