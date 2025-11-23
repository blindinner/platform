import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    campaign?: string
    date?: string
    destination?: string
  }>
}

export default async function CampaignExpiredPage({ searchParams }: PageProps) {
  const params = await searchParams
  const campaignName = params.campaign || 'This campaign'
  const endDate = params.date ? new Date(params.date).toLocaleDateString() : 'recently'
  const destinationUrl = params.destination

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Ended
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-1">
          {campaignName} ended on <span className="font-medium text-gray-900">{endDate}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          The referral link you followed is no longer active, but you can still visit the destination if you'd like.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {destinationUrl && (
            <a
              href={destinationUrl}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Continue to Destination →
            </a>
          )}
          <Link
            href="/"
            className="w-full px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-400">
          This campaign has ended and clicks are no longer being tracked.
        </p>
      </div>
    </div>
  )
}
