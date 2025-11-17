interface Step1BasicsProps {
  formData: {
    campaignName: string
    eventName: string
    eventDate: string
    eventEndDate: string
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step1Basics({ formData, updateFormData }: Step1BasicsProps) {
  // Convert dd-mm-yyyy to yyyy-mm-dd for date input
  const toInputFormat = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd
    }
    return dateStr
  }

  // Convert yyyy-mm-dd to dd-mm-yyyy for storage
  const toStorageFormat = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}` // dd-mm-yyyy
    }
    return dateStr
  }

  const handleDateChange = (field: string, value: string) => {
    updateFormData(field, toStorageFormat(value))
  }

  const openCalendar = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.showPicker()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Campaign Basics</h2>
        <p className="text-gray-600">Set up the basic information for your referral campaign</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.campaignName}
          onChange={(e) => updateFormData('campaignName', e.target.value)}
          placeholder="e.g., Summer Music Festival 2024"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Internal name to identify this campaign</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.eventName}
          onChange={(e) => updateFormData('eventName', e.target.value)}
          placeholder="e.g., TechCon 2024"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">This will appear in referral emails and links</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative" onClick={() => openCalendar('eventDate-picker')}>
            <input
              type="text"
              value={formData.eventDate}
              placeholder="dd-mm-yyyy"
              readOnly
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <input
              id="eventDate-picker"
              type="date"
              value={toInputFormat(formData.eventDate)}
              onChange={(e) => handleDateChange('eventDate', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              tabIndex={-1}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event End Date
          </label>
          <div className="relative" onClick={() => openCalendar('eventEndDate-picker')}>
            <input
              type="text"
              value={formData.eventEndDate}
              placeholder="dd-mm-yyyy"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <input
              id="eventEndDate-picker"
              type="date"
              value={toInputFormat(formData.eventEndDate)}
              onChange={(e) => handleDateChange('eventEndDate', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              tabIndex={-1}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Optional for single-day events</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Choose a descriptive campaign name to easily identify it later in your dashboard.
        </p>
      </div>
    </div>
  )
}
