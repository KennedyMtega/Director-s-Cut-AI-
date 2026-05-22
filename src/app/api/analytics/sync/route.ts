import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMediaInsights, getFollowerCount } from '@/lib/instagram/analytics'
import { getVideoStats, getSubscriberCount } from '@/lib/youtube/analytics'
import type { PlatformPost } from '@/types/database'

export async function POST(_request: NextRequest) {
  const supabase = createAdminClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: rawPlatformPosts } = await supabase
    .from('platform_posts')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', thirtyDaysAgo)

  const platformPosts = (rawPlatformPosts ?? []) as PlatformPost[]
  if (!platformPosts.length) return NextResponse.json({ synced: 0 })

  const igFollowers = await getFollowerCount()
  const ytSubscribers = await getSubscriberCount()

  let synced = 0

  for (const pp of platformPosts) {
    try {
      let metrics: Partial<Record<string, number>> = {}

      if (pp.platform === 'instagram' && pp.platform_post_id) {
        metrics = await getMediaInsights(pp.platform_post_id)
      } else if (pp.platform === 'youtube' && pp.platform_post_id) {
        metrics = await getVideoStats(pp.platform_post_id)
      }

      const followerCount = pp.platform === 'instagram' ? igFollowers
        : pp.platform === 'youtube' ? ytSubscribers
        : undefined

      await supabase.from('post_metrics').insert({
        platform_post_id: pp.id,
        platform: pp.platform,
        likes: metrics.likes ?? 0,
        comments: metrics.comments ?? 0,
        shares: metrics.shares ?? 0,
        saves: metrics.saves ?? 0,
        reach: metrics.reach ?? 0,
        impressions: metrics.impressions ?? 0,
        views: metrics.views ?? 0,
        follower_count: followerCount,
      })

      synced++
    } catch {
      // Continue syncing other posts
    }
  }

  return NextResponse.json({ synced })
}
