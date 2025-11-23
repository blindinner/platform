'use client'

import { useState } from 'react'
import { parseCSV, generateCSVTemplate } from '@/lib/utils/csv-parser'

interface Contact {
  name?: string
  email: string
  phone?: string
}

interface Step4ContactsProps {
  formData: {
    contacts: Contact[]
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step4Contacts({ formData, updateFormData }: Step4ContactsProps) {
  const [manualEntry, setManualEntry] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    try {
      const text = await file.text()
      const parsedContacts = parseCSV(text)

      if (parsedContacts.length === 0) {
        setUploadError('No valid contacts found in CSV file')
        return
      }

      updateFormData('contacts', parsedContacts)
    } catch (error) {
      setUploadError('Error parsing CSV file. Please check the format.')
    }
  }

  const handleAddManual = () => {
    if (!manualEntry.email) {
      alert('Email is required')
      return
    }

    const newContact: Contact = {
      name: manualEntry.name || undefined,
      email: manualEntry.email,
      phone: manualEntry.phone || undefined,
    }

    updateFormData('contacts', [...formData.contacts, newContact])

    // Reset form
    setManualEntry({ name: '', email: '', phone: '' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddManual()
    }
  }

  const handleRemoveContact = (index: number) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index)
    updateFormData('contacts', newContacts)
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Add Contacts</h2>
        <p className="text-gray-600">
          Upload a CSV file or manually add contacts who will receive referral links
        </p>
      </div>

      {/* CSV Upload */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV File</h3>
          <p className="text-sm text-gray-600 mb-4">
            CSV format: name, email, phone (one contact per line)
          </p>

          <div className="flex gap-4 justify-center mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors font-medium"
            >
              Choose CSV File
            </label>
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Download Template
            </button>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry - Inline Quick Add */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Contact</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Optional)
            </label>
            <input
              type="text"
              value={manualEntry.name}
              onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={manualEntry.email}
              onChange={(e) => setManualEntry({ ...manualEntry, email: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={manualEntry.phone}
              onChange={(e) => setManualEntry({ ...manualEntry, phone: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder="+1234567890"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            onClick={handleAddManual}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium h-[42px] flex items-center gap-2"
            title="Add contact (or press Enter)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">💡 Tip: Press Enter to quickly add contacts</p>
      </div>

      {/* Contacts List */}
      {formData.contacts.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Contacts ({formData.contacts.length})
            </h3>
            <button
              onClick={() => updateFormData('contacts', [])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {formData.contacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {contact.name || 'No name'}
                  </p>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.phone && (
                    <p className="text-xs text-gray-500">{contact.phone}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveContact(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove contact"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.contacts.length === 0 && (
        <p className="text-red-600 text-center text-sm">
          No contacts added yet. Please upload a CSV file or add contacts manually.
        </p>
      )}
    </div>
  )
}
