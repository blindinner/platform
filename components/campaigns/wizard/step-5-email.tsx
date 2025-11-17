interface Step5EmailProps {
  formData: {
    fromEmail: string
    fromName: string
    subject: string
    emailBody: string
  }
  updateFormData: (field: string, value: any) => void
}

export default function Step5Email({ formData, updateFormData }: Step5EmailProps) {
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.emailBody
      const before = text.substring(0, start)
      const after = text.substring(end)
      updateFormData('emailBody', before + variable + after)

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Email Template</h2>
        <p className="text-gray-600">
          Customize the email that will be sent to your contacts with their unique referral links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) => updateFormData('fromName', e.target.value)}
            placeholder="Your Company"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.fromEmail}
            onChange={(e) => updateFormData('fromEmail', e.target.value)}
            placeholder="events@yourcompany.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Must be verified in Resend
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => updateFormData('subject', e.target.value)}
          placeholder="You're invited to share our event!"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Body <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => insertVariable('{name}')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              + {'{name}'}
            </button>
            <button
              type="button"
              onClick={() => insertVariable('{event}')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              + {'{event}'}
            </button>
            <button
              type="button"
              onClick={() => insertVariable('{link}')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              + {'{link}'}
            </button>
          </div>
        </div>
        <textarea
          id="email-body"
          value={formData.emailBody}
          onChange={(e) => updateFormData('emailBody', e.target.value)}
          rows={10}
          required
          placeholder="Hi {name},&#10;&#10;We're excited to invite you to share {event} with your network!&#10;&#10;Your unique referral link: {link}&#10;&#10;Thank you for being part of our community!"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Use variables to personalize the email. The creative image and unique link will be automatically included.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">
          📧 Available Variables:
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><code className="bg-blue-100 px-2 py-1 rounded">{'{name}'}</code> - Contact's name (will be skipped if not available)</li>
          <li><code className="bg-blue-100 px-2 py-1 rounded">{'{event}'}</code> - Event name from Step 1</li>
          <li><code className="bg-blue-100 px-2 py-1 rounded">{'{link}'}</code> - Unique referral link for the contact</li>
        </ul>
      </div>

      {/* Preview */}
      {formData.emailBody && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview:</h3>
          <div className="bg-white p-4 rounded border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>From:</strong> {formData.fromName || 'Your Name'} ({formData.fromEmail || 'email@example.com'})
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Subject:</strong> {formData.subject || 'No subject'}
            </p>
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {formData.emailBody
                .replace(/{name}/g, '[Name]')
                .replace(/{event}/g, '[Event Name]')
                .replace(/{link}/g, 'https://yourapp.com/r/ABC123')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
