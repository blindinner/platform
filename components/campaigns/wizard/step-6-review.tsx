interface Step6ReviewProps {
  formData: {
    campaignName: string
    eventName: string
    eventDate: string
    eventEndDate: string
    creativeFile: File | null
    creativePreview: string | null
    ticketUrl: string
    destinationDescription: string
    contacts: any[]
    fromName: string
    fromEmail: string
    subject: string
    emailBody: string
  }
}

export default function Step6Review({ formData }: Step6ReviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review & Send Campaign</h2>
        <p className="text-gray-600">
          Please review all campaign details before sending
        </p>
      </div>

      {/* Campaign Basics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Basics</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600">Campaign Name:</dt>
            <dd className="text-sm text-gray-900 mt-1">{formData.campaignName || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Event Name:</dt>
            <dd className="text-sm text-gray-900 mt-1">{formData.eventName || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Event Date:</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatDate(formData.eventDate)}
              {formData.eventEndDate && ` - ${formatDate(formData.eventEndDate)}`}
            </dd>
          </div>
        </dl>
      </div>

      {/* Creative */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Creative</h3>
        {formData.creativePreview ? (
          <div>
            <img
              src={formData.creativePreview}
              alt="Campaign creative"
              className="max-w-md h-auto rounded-lg border border-gray-200 shadow-sm"
            />
            {formData.creativeFile && (
              <p className="text-sm text-gray-600 mt-2">
                File: {formData.creativeFile.name} ({(formData.creativeFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No creative uploaded</p>
        )}
      </div>

      {/* Destination */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination URL</h3>
        <div>
          <dt className="text-sm font-medium text-gray-600">Referral links will redirect to:</dt>
          <dd className="text-sm text-blue-600 mt-1 break-all">{formData.ticketUrl || '-'}</dd>
          {formData.destinationDescription && (
            <p className="text-sm text-gray-500 mt-2">{formData.destinationDescription}</p>
          )}
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contacts ({formData.contacts.length})
        </h3>
        {formData.contacts.length > 0 ? (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                ✓ {formData.contacts.length} contacts ready to receive emails
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {formData.contacts.slice(0, 5).map((contact, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">{contact.name || 'No name'}</span>
                  <span className="text-gray-600"> - {contact.email}</span>
                </div>
              ))}
              {formData.contacts.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ... and {formData.contacts.length - 5} more
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600">⚠️ No contacts added</p>
        )}
      </div>

      {/* Email Template */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Template</h3>
        <div className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-600">From:</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formData.fromName || '-'} ({formData.fromEmail || '-'})
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Subject:</dt>
            <dd className="text-sm text-gray-900 mt-1">{formData.subject || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">Body:</dt>
            <dd className="text-sm text-gray-900 mt-2 p-4 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap">
              {formData.emailBody || 'No email body'}
            </dd>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc ml-4">
              <li>Emails will be sent immediately to all {formData.contacts.length} contacts</li>
              <li>Each contact will receive a unique referral tracking link</li>
              <li>Once sent, this campaign cannot be edited or recalled</li>
              <li>Make sure your "From Email" is verified in Resend</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">{formData.contacts.length}</div>
          <div className="text-sm text-blue-700 mt-1">Total Recipients</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-900">{formData.contacts.length}</div>
          <div className="text-sm text-green-700 mt-1">Unique Links</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-900">
            {formData.creativePreview ? '1' : '0'}
          </div>
          <div className="text-sm text-purple-700 mt-1">Creative Asset</div>
        </div>
      </div>
    </div>
  )
}
