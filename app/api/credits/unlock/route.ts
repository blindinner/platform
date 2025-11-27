import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Credit Unlocking API
 *
 * This endpoint unlocks credits based on campaign unlock settings:
 * - event_based: Unlocks credits for campaigns where event_end_date has passed
 * - delayed: Unlocks credits where created_at + unlock_days has passed
 * - immediate: Credits are already unlocked when created
 *
 * Can be called manually or via cron job
 */
export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    let totalUnlocked = 0

    // 1. Unlock event-based credits
    // Find campaigns with event_based unlock type where event has ended
    const { data: eventCampaigns, error: eventError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, event_end_date')
      .eq('credit_unlock_type', 'event_based')
      .not('event_end_date', 'is', null)
      .lte('event_end_date', now.toISOString())

    if (eventError) {
      console.error('Error fetching event campaigns:', eventError)
    } else if (eventCampaigns && eventCampaigns.length > 0) {
      const campaignIds = eventCampaigns.map(c => c.id)

      // Unlock all pending credits for these campaigns
      const { data: unlockedEventCredits, error: unlockEventError } = await supabaseAdmin
        .from('credits')
        .update({
          status: 'available',
          unlocked_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .in('campaign_id', campaignIds)
        .eq('status', 'pending')
        .select('id, campaign_id, amount')

      if (unlockEventError) {
        console.error('Error unlocking event-based credits:', unlockEventError)
      } else if (unlockedEventCredits) {
        totalUnlocked += unlockedEventCredits.length
        console.log(`Unlocked ${unlockedEventCredits.length} event-based credits for ${eventCampaigns.length} campaigns`)
      }
    }

    // 2. Unlock delayed credits
    // Find campaigns with delayed unlock type
    const { data: delayedCampaigns, error: delayedError } = await supabaseAdmin
      .from('campaigns')
      .select('id, name, credit_unlock_days')
      .eq('credit_unlock_type', 'delayed')
      .gt('credit_unlock_days', 0)

    if (delayedError) {
      console.error('Error fetching delayed campaigns:', delayedError)
    } else if (delayedCampaigns && delayedCampaigns.length > 0) {
      // For each campaign, unlock credits where created_at + unlock_days has passed
      for (const campaign of delayedCampaigns) {
        const unlockDate = new Date()
        unlockDate.setDate(unlockDate.getDate() - campaign.credit_unlock_days)

        const { data: unlockedDelayedCredits, error: unlockDelayedError } = await supabaseAdmin
          .from('credits')
          .update({
            status: 'available',
            unlocked_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('campaign_id', campaign.id)
          .eq('status', 'pending')
          .lte('created_at', unlockDate.toISOString())
          .select('id')

        if (unlockDelayedError) {
          console.error(`Error unlocking delayed credits for campaign ${campaign.id}:`, unlockDelayedError)
        } else if (unlockedDelayedCredits) {
          totalUnlocked += unlockedDelayedCredits.length
          console.log(`Unlocked ${unlockedDelayedCredits.length} delayed credits for campaign ${campaign.name}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Unlocked ${totalUnlocked} credits`,
      unlocked_count: totalUnlocked,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Credit unlock error:', error)
    return NextResponse.json(
      {
        error: 'Failed to unlock credits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow GET requests to manually trigger unlocking (for testing/cron)
export async function GET(request: NextRequest) {
  return POST(request)
}
