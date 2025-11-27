import { createClient } from '@/lib/supabase/server'

interface RateLimitResult {
  allowed: boolean
  limit: number
  current: number
  resetAt: Date
}

interface WebhookLogData {
  campaign_id: string
  webhook_type: 'campaign' | 'organization'
  request_ip: string | null
  request_headers: Record<string, string>
  request_payload: any
  response_status: number
  response_message: string
  processing_time_ms: number
  error_message?: string
}

/**
 * Check if request is within rate limit
 */
export async function checkRateLimit(
  campaignId: string
): Promise<RateLimitResult> {
  const supabase = await createClient()

  // Get campaign rate limit settings
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('rate_limit_per_hour, rate_limit_enabled')
    .eq('id', campaignId)
    .single()

  if (!campaign) {
    return {
      allowed: false,
      limit: 0,
      current: 0,
      resetAt: new Date()
    }
  }

  // If rate limiting is disabled for this campaign
  if (!campaign.rate_limit_enabled) {
    return {
      allowed: true,
      limit: campaign.rate_limit_per_hour,
      current: 0,
      resetAt: new Date(Date.now() + 3600000) // 1 hour from now
    }
  }

  // Count requests in last hour
  const oneHourAgo = new Date(Date.now() - 3600000)
  const { count } = await supabase
    .from('webhook_logs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .gte('created_at', oneHourAgo.toISOString())

  const currentCount = count || 0
  const limit = campaign.rate_limit_per_hour

  // Calculate when the rate limit resets (top of next hour)
  const now = new Date()
  const resetAt = new Date(now)
  resetAt.setHours(now.getHours() + 1, 0, 0, 0)

  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
    resetAt
  }
}

/**
 * Log webhook request
 */
export async function logWebhookRequest(data: WebhookLogData): Promise<void> {
  const supabase = await createClient()

  await supabase.from('webhook_logs').insert({
    campaign_id: data.campaign_id,
    webhook_type: data.webhook_type,
    request_ip: data.request_ip,
    request_headers: data.request_headers,
    request_payload: data.request_payload,
    response_status: data.response_status,
    response_message: data.response_message,
    processing_time_ms: data.processing_time_ms,
    error_message: data.error_message
  })
}

/**
 * Check if suspicious activity detected
 */
export async function detectSuspiciousActivity(
  campaignId: string
): Promise<{ suspicious: boolean; reason?: string }> {
  const supabase = await createClient()

  const fiveMinutesAgo = new Date(Date.now() - 300000) // 5 minutes

  // Check for rapid requests (more than 20 in 5 minutes)
  const { count: rapidRequests } = await supabase
    .from('webhook_logs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .gte('created_at', fiveMinutesAgo.toISOString())

  if ((rapidRequests || 0) > 20) {
    return {
      suspicious: true,
      reason: 'Rapid requests detected: more than 20 requests in 5 minutes'
    }
  }

  // Check for high error rate (more than 50% errors in last 10 requests)
  const { data: recentLogs } = await supabase
    .from('webhook_logs')
    .select('response_status')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (recentLogs && recentLogs.length >= 5) {
    const errorCount = recentLogs.filter(
      (log) => log.response_status >= 400
    ).length
    const errorRate = errorCount / recentLogs.length

    if (errorRate > 0.5) {
      return {
        suspicious: true,
        reason: `High error rate: ${Math.round(errorRate * 100)}% of recent requests failed`
      }
    }
  }

  return { suspicious: false }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string | null {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return null
}

/**
 * Extract relevant headers for logging (exclude sensitive data)
 */
export function getRelevantHeaders(request: Request): Record<string, string> {
  const relevantHeaders = [
    'content-type',
    'user-agent',
    'x-forwarded-for',
    'x-real-ip',
    'referer'
  ]

  const headers: Record<string, string> = {}
  relevantHeaders.forEach((header) => {
    const value = request.headers.get(header)
    if (value) {
      headers[header] = value
    }
  })

  return headers
}
