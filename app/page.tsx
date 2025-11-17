import { redirect } from 'next/navigation'
import { getUser } from '@/app/actions/auth'
import Link from 'next/link'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Referral Link Tracking Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Create and manage referral campaigns for your events. Track performance, manage contacts, and grow your audience.
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-blue-600 text-2xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Track Performance
              </h3>
              <p className="text-gray-600 text-sm">
                Monitor clicks, conversions, and engagement in real-time
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-blue-600 text-2xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unique Links
              </h3>
              <p className="text-gray-600 text-sm">
                Generate unique referral links for each contact
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-blue-600 text-2xl mb-3">✉️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email Campaigns
              </h3>
              <p className="text-gray-600 text-sm">
                Send personalized emails with custom creatives
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
