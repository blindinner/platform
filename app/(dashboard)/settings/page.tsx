'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    // Core Info
    fullName: '',
    email: '',
    companyName: '',

    // Webhook & Integration
    clientId: '',
    webhookDefaultCommissionType: 'fixed' as 'fixed' | 'percentage',
    webhookDefaultCommissionValue: 3.00,

    // Branding
    logoUrl: '',
    brandColor: '#000000',
    industry: '',

    // Contact Info
    businessEmail: '',
    website: '',
    phone: '',
    address: '',

    // Social Media
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',

    // Email Defaults
    defaultFooter: '',
    timezone: 'America/New_York',

    // Legal
    privacyPolicyUrl: '',
    termsUrl: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setFormData(data)
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upload logo if there's a new one
      let logoUrl = formData.logoUrl
      if (logoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', logoFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          logoUrl = uploadData.url
        }
      }

      // Save profile
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logoUrl }),
      })

      if (res.ok) {
        alert('Profile updated successfully!')
        router.refresh()
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and organization profile</p>
      </div>

      {/* Core Information */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Core Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company/Organization Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Webhook & Integration */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook & Integration</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure your webhook URL and default commission settings for auto-created campaigns
        </p>

        {/* Webhook URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.clientId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/org/${formData.clientId}` : 'Loading...'}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
            />
            <button
              onClick={() => {
                const webhookUrl = `${window.location.origin}/api/webhooks/org/${formData.clientId}`
                navigator.clipboard.writeText(webhookUrl)
                alert('Webhook URL copied to clipboard!')
              }}
              disabled={!formData.clientId}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use this single webhook URL for all your events. We'll auto-create campaigns as purchases come in.
          </p>
        </div>

        {/* Default Commission */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Commission Settings</h3>
          <p className="text-xs text-gray-600 mb-4">
            When a new event_id arrives via webhook, we'll auto-create a campaign with these default settings. You can always customize individual campaigns later.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <select
                value={formData.webhookDefaultCommissionType}
                onChange={(e) => setFormData({ ...formData, webhookDefaultCommissionType: e.target.value as 'fixed' | 'percentage' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="fixed">Fixed Amount ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.webhookDefaultCommissionType === 'fixed' ? '$' : '%'}
                </span>
                <input
                  type="number"
                  step={formData.webhookDefaultCommissionType === 'fixed' ? '0.01' : '1'}
                  min="0"
                  max={formData.webhookDefaultCommissionType === 'percentage' ? '100' : undefined}
                  value={formData.webhookDefaultCommissionValue}
                  onChange={(e) => setFormData({ ...formData, webhookDefaultCommissionValue: parseFloat(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.webhookDefaultCommissionType === 'fixed'
                  ? `Referrers earn $${formData.webhookDefaultCommissionValue.toFixed(2)} per sale`
                  : `Referrers earn ${formData.webhookDefaultCommissionValue}% of ticket price`
                }
              </p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>💡 How it works:</strong> When a purchase comes in for a new event_id, we'll create a campaign with these settings automatically. For special events that need different commission rates, create a campaign manually before the first purchase arrives.
            </p>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            {logoPreview && (
              <div className="mb-3">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-auto border border-gray-200 rounded"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              This logo will appear in all campaign emails
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used for buttons and accents in emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select industry</option>
                <option value="events">Events & Entertainment</option>
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS & Technology</option>
                <option value="nonprofit">Non-profit</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              placeholder="hello@company.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default "from" email for campaigns
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourcompany.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              placeholder="123 Main St, City, State, ZIP"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/yourcompany"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/yourcompany"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter/X
            </label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              placeholder="https://twitter.com/yourcompany"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Email Defaults */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Defaults</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Email Footer
          </label>
          <textarea
            value={formData.defaultFooter}
            onChange={(e) => setFormData({ ...formData, defaultFooter: e.target.value })}
            rows={4}
            placeholder="This footer will be automatically added to all campaign emails.&#10;&#10;© 2024 Your Company. All rights reserved.&#10;123 Main St, City, State, ZIP"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be automatically added to all campaign emails
          </p>
        </div>
      </div>

      {/* Legal */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Policy URL
            </label>
            <input
              type="url"
              value={formData.privacyPolicyUrl}
              onChange={(e) => setFormData({ ...formData, privacyPolicyUrl: e.target.value })}
              placeholder="https://yourcompany.com/privacy"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms of Service URL
            </label>
            <input
              type="url"
              value={formData.termsUrl}
              onChange={(e) => setFormData({ ...formData, termsUrl: e.target.value })}
              placeholder="https://yourcompany.com/terms"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
