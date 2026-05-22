import { getYouTubeClient } from './client'
import type { MetricSnapshot } from '@/types/analytics'

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!

export async function getVideoStats(videoId: string): Promise<Partial<Record<string, number>>> {
  try {
    const youtube = getYouTubeClient()
    const response = await youtube.videos.list({
      part: ['statistics'],
      id: [videoId],
    })

    const stats = response.data.items?.[0]?.statistics
    if (!stats) return {}

    return {
      views: parseInt(stats.viewCount ?? '0'),
      likes: parseInt(stats.likeCount ?? '0'),
      comments: parseInt(stats.commentCount ?? '0'),
    }
  } catch {
    return {}
  }
}

export async function getSubscriberCount(): Promise<number> {
  try {
    const youtube = getYouTubeClient()
    const response = await youtube.channels.list({
      part: ['statistics'],
      id: [CHANNEL_ID],
    })
    const count = response.data.items?.[0]?.statistics?.subscriberCount
    return count ? parseInt(count) : 0
  } catch {
    return 0
  }
}
