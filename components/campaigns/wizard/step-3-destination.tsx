interface Step3DestinationProps {
  formData: {
    ticketUrl: string
    destinationDescription: string
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step3Destination({ formData, updateFormData }: Step3DestinationProps) {
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Destination URL</h2>
        <p className="text-gray-600">
          Where should referral links redirect to? (e.g., ticket purchase page, registration form)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={formData.ticketUrl}
            onChange={(e) => updateFormData('ticketUrl', e.target.value)}
            placeholder="https://example.com/tickets"
            required
            className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
              formData.ticketUrl && !isValidUrl(formData.ticketUrl)
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200'
            }`}
          />
          {formData.ticketUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidUrl(formData.ticketUrl) ? (
                <span className="text-green-500 text-xl">✓</span>
              ) : (
                <span className="text-red-500 text-xl">✕</span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          This is where users will be redirected when they click referral links
        </p>
        {formData.ticketUrl && !isValidUrl(formData.ticketUrl) && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid URL starting with http:// or https://
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formData.destinationDescription}
          onChange={(e) => updateFormData('destinationDescription', e.target.value)}
          placeholder="e.g., Official ticket sales page for VIP access"
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-sm text-gray-500 mt-1">
          Internal note to remember what this URL is for
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">
          💡 Common destination types:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
          <li>Ticket purchase page (Eventbrite, Ticketmaster, etc.)</li>
          <li>Event registration form</li>
          <li>Landing page with event details</li>
          <li>Custom checkout page</li>
        </ul>
      </div>

      {formData.ticketUrl && isValidUrl(formData.ticketUrl) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <p className="text-sm text-gray-600 break-all">
            Referral links will redirect to: <span className="font-mono text-gray-900">{formData.ticketUrl}</span>
          </p>
        </div>
      )}
    </div>
  )
}
