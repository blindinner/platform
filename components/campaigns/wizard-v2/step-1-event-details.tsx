interface Step1EventDetailsProps {
  formData: {
    campaignName: string
    eventDate: string
    eventEndDate: string
    ticketUrl: string
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step1EventDetails({ formData, updateFormData }: Step1EventDetailsProps) {
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Event Details</h2>
        <p className="text-gray-600">Set up the basic information for your event</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.campaignName}
          onChange={(e) => updateFormData('campaignName', e.target.value)}
          placeholder="e.g., Summer Music Festival 2024"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-sm text-gray-500 mt-1">The name of your event</p>
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ticket Purchase URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={formData.ticketUrl}
          onChange={(e) => updateFormData('ticketUrl', e.target.value)}
          placeholder="https://tickets.yoursite.com/event"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-sm text-gray-500 mt-1">
          Where referral links will send people to buy tickets
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Next step:</strong> You'll get a webhook URL and tracking code to integrate with your ticketing system.
        </p>
      </div>
    </div>
  )
}
