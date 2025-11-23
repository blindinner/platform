interface Step3ReviewProps {
  formData: {
    campaignName: string
    eventDate: string
    eventEndDate: string
    ticketUrl: string
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
        </dl>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Your event will be created and you'll get a webhook URL</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Configure your ticketing system to send purchase data to the webhook</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>When tickets are sold, referral links will be automatically generated</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Buyers will receive an email with their unique referral link</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Track clicks, conversions, and revenue in your dashboard</span>
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
