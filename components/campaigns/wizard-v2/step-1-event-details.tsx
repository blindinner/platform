interface Step1EventDetailsProps {
  formData: {
    campaignName: string
    eventDate: string
    eventEndDate: string
    ticketUrl: string
    externalEventId?: string
    commissionType: 'fixed' | 'percentage'
    commissionValue: number
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

      {/* Commission Settings */}
      <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Referral Commission Settings</h3>
        <p className="text-xs text-gray-600 mb-4">
          Set how much credit referrers earn for each ticket sale
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.commissionType}
              onChange={(e) => updateFormData('commissionType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="fixed">Fixed Amount ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.commissionType === 'fixed' ? '$' : '%'}
              </span>
              <input
                type="number"
                step={formData.commissionType === 'fixed' ? '0.01' : '1'}
                min="0"
                max={formData.commissionType === 'percentage' ? '100' : undefined}
                value={formData.commissionValue}
                onChange={(e) => updateFormData('commissionValue', parseFloat(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.commissionType === 'fixed'
                ? `$${formData.commissionValue.toFixed(2)} credit per sale`
                : `${formData.commissionValue}% of ticket price as credit`
              }
            </p>
          </div>
        </div>

        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            <strong>💡 How it works:</strong> When someone buys a ticket using a referral link, the referrer earns this commission as credit. Credits unlock after the event ends and can be redeemed on future purchases.
          </p>
        </div>
      </div>

      {/* Optional: External Event/Product ID for Organization Webhook */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-blue-900 mb-2">
          Your Event/Product ID (Optional - For Advanced Webhook)
        </label>
        <input
          type="text"
          value={formData.externalEventId || ''}
          onChange={(e) => updateFormData('externalEventId', e.target.value)}
          placeholder="e.g., A123, shopify_prod_789, evt_eventbrite_456"
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <div className="mt-2 text-sm text-blue-800">
          <p className="font-medium mb-1">💡 When to use this:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Shopify:</strong> Your product ID (e.g., "prod_ABC123")</li>
            <li><strong>Eventbrite:</strong> Your event ID (e.g., "123456789")</li>
            <li><strong>Custom Platform:</strong> Any identifier you use (e.g., "summer-fest")</li>
          </ul>
          <p className="mt-2 text-xs">
            This allows you to use one organization webhook for all events. Leave blank if using simple mode (one webhook per campaign).
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Next step:</strong> You'll get a webhook URL and tracking code to integrate with your ticketing system.
        </p>
      </div>
    </div>
  )
}
