interface Step3ReviewProps {
  formData: {
    campaignName: string
    eventDate: string
    eventEndDate: string
    ticketUrl: string
    externalEventId?: string
    commissionType: 'fixed' | 'percentage'
    commissionValue: number
  }
}

export default function Step3Review({ formData }: Step3ReviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    // Assuming dd-mm-yyyy format
    const parts = dateString.split('-')
    if (parts.length === 3) {
      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return dateString
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review & Create Event</h2>
        <p className="text-gray-600">
          Review your event details before creating
        </p>
      </div>

      {/* Event Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-600">Event Name:</dt>
            <dd className="text-sm text-gray-900 mt-1">{formData.campaignName || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Event Date:</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatDate(formData.eventDate)}
              {formData.eventEndDate && ` - ${formatDate(formData.eventEndDate)}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Ticket URL:</dt>
            <dd className="text-sm text-gray-900 mt-1 break-all">{formData.ticketUrl || '-'}</dd>
          </div>
          {formData.externalEventId && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Event/Product ID:</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{formData.externalEventId}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Commission Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-600">Commission Type:</dt>
            <dd className="text-sm text-gray-900 mt-1 capitalize">{formData.commissionType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Commission Value:</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formData.commissionType === 'fixed'
                ? `$${formData.commissionValue.toFixed(2)} per sale`
                : `${formData.commissionValue}% of ticket price`
              }
            </dd>
          </div>
        </dl>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900">
            Referrers earn {formData.commissionType === 'fixed' ? `$${formData.commissionValue.toFixed(2)}` : `${formData.commissionValue}%`} for each ticket sold through their link. Credits unlock after the event ends.
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Your event will be activated and ready to receive webhook notifications</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Configure your ticketing platform to send purchase data to the webhook URL</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>When tickets are sold, personalized referral links are generated instantly</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Share links with buyers via webhook response, CSV export, API, or email</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Buyers share their links, earn credits, and redeem after the event</span>
          </li>
        </ol>
      </div>

      {/* Summary */}
      <div className="flex justify-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center min-w-[200px]">
          <div className="text-4xl font-bold text-gray-900">🚀</div>
          <div className="text-sm text-gray-700 mt-2">Ready to launch!</div>
        </div>
      </div>
    </div>
  )
}
