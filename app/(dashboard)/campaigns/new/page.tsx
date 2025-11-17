'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Step1Basics from '@/components/campaigns/wizard/step-1-basics'
import Step2Creative from '@/components/campaigns/wizard/step-2-creative'
import Step3Destination from '@/components/campaigns/wizard/step-3-destination'
import Step4Contacts from '@/components/campaigns/wizard/step-4-contacts'
import Step5Email from '@/components/campaigns/wizard/step-5-email'
import Step6Review from '@/components/campaigns/wizard/step-6-review'

const STEPS = [
  { number: 1, name: 'Basics', description: 'Campaign details' },
  { number: 2, name: 'Creative', description: 'Upload image' },
  { number: 3, name: 'Destination', description: 'Ticket URL' },
  { number: 4, name: 'Contacts', description: 'Add recipients' },
  { number: 5, name: 'Email', description: 'Email template' },
  { number: 6, name: 'Review', description: 'Review & send' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basics
    campaignName: '',
    eventName: '',
    eventDate: '',
    eventEndDate: '',

    // Step 2: Creative
    creativeFile: null as File | null,
    creativePreview: null as string | null,

    // Step 3: Destination
    ticketUrl: '',
    destinationDescription: '',

    // Step 4: Contacts
    contacts: [] as any[],

    // Step 5: Email
    fromName: '',
    fromEmail: '',
    subject: '',
    emailBody: '',
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Helper function to convert dd-mm-yyyy to yyyy-mm-dd for database
      const toDbFormat = (dateStr: string) => {
        if (!dateStr) return ''
        const parts = dateStr.split('-')
        if (parts.length === 3 && parts[0].length === 2) {
          return `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd
        }
        return dateStr
      }

      // Step 1: Upload creative image
      let creativeImageUrl = ''

      if (formData.creativeFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', formData.creativeFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadRes.json()
        creativeImageUrl = uploadData.url
      }

      // Step 2: Create campaign
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          event_date: toDbFormat(formData.eventDate),
          promotion_end_date: toDbFormat(formData.eventEndDate || formData.eventDate),
          creative_image_url: creativeImageUrl,
          destination_url: formData.ticketUrl,
          email_subject: formData.subject,
          email_template: formData.emailBody
        })
      })

      if (!campaignRes.ok) {
        throw new Error('Failed to create campaign')
      }

      const campaign = await campaignRes.json()

      // Step 3: Send emails to contacts
      const sendRes = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: formData.contacts
        })
      })

      if (!sendRes.ok) {
        throw new Error('Failed to send emails')
      }

      const sendData = await sendRes.json()

      alert(`Campaign created! Sent ${sendData.sent} emails successfully.`)
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Campaign submission error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create campaign')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600 mt-2">
          Follow the steps to create and send your referral campaign
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ marginTop: '-2rem' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[500px]">
        {currentStep === 1 && (
          <Step1Basics formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <Step2Creative formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3Destination formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <Step4Contacts formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 5 && (
          <Step5Email formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 6 && (
          <Step6Review formData={formData} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              🚀 Send Campaign
            </button>
          )}
        </div>
      </div>

      {/* Step Counter */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Step {currentStep} of {STEPS.length}
      </div>
    </div>
  )
}
