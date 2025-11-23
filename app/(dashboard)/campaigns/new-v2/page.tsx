'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Step1EventDetails from '@/components/campaigns/wizard-v2/step-1-event-details'
import Step2Integration from '@/components/campaigns/wizard-v2/step-2-integration'
import Step3Review from '@/components/campaigns/wizard-v2/step-3-review'

const STEPS = [
  { number: 1, name: 'Event Details', description: 'Event info & ticket URL' },
  { number: 2, name: 'Integration', description: 'Webhook & tracking' },
  { number: 3, name: 'Review', description: 'Review & create' },
]

export default function NewCampaignV2Page() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [createdCampaignId, setCreatedCampaignId] = useState<string | undefined>(undefined)
  const [formData, setFormData] = useState({
    campaignName: '',
    eventDate: '',
    eventEndDate: '',
    ticketUrl: '',
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

      // Create campaign
      const campaignRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.campaignName,
          event_date: toDbFormat(formData.eventDate),
          promotion_end_date: toDbFormat(formData.eventEndDate || formData.eventDate),
          destination_url: formData.ticketUrl,
          // No creative, contacts, or email template needed for webhook-based campaigns
          status: 'active'
        })
      })

      if (!campaignRes.ok) {
        throw new Error('Failed to create campaign')
      }

      const campaign = await campaignRes.json()

      alert(`Event created successfully! Your webhook URL is ready.`)
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Campaign creation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create event')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Event
        </h1>
        <p className="text-gray-600 mt-2">
          Set up your event and get your integration webhook URL
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
                      ? 'bg-gray-900 text-white'
                      : currentStep === step.number
                      ? 'bg-gray-900 text-white'
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
                    currentStep > step.number ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  style={{ marginTop: '-2rem' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8 min-h-[500px]">
        {currentStep === 1 && (
          <Step1EventDetails formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <Step2Integration campaign_id={createdCampaignId} />
        )}
        {currentStep === 3 && (
          <Step3Review formData={formData} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create Event
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
