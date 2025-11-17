import Link from 'next/link'

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Campaigns
            </h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-2">Active campaigns</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Clicks
            </h3>
            <span className="text-3xl">🔗</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-2">Referral link clicks</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Contacts
            </h3>
            <span className="text-3xl">✉️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-2">Email contacts</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Campaigns
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No campaigns yet</p>
          <Link
            href="/campaigns/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first campaign →
          </Link>
        </div>
      </div>
    </div>
  )
}
