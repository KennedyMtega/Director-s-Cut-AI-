import { graphRequest } from './client'
import type { MetricSnapshot } from '@/types/analytics'

const USER_ID = process.env.INSTAGRAM_USER_ID!

export async function getMediaInsights(mediaId: string): Promise<Partial<Record<string, number>>> {
  try {
    const result = await graphRequest<{ data: { name: string; values: { value: number }[] }[] }>(
      `/${mediaId}/insights?metric=likes,comments,shares,saved,reach,impressions,plays`
    )

    const metrics: Partial<Record<string, number>> = {}
    for (const metric of result.data) {
      const value = metric.values?.[0]?.value ?? 0
      switch (metric.name) {
        case 'likes': metrics.likes = value; break
        case 'comments': metrics.comments = value; break
        case 'shares': metrics.shares = value; break
        case 'saved': metrics.saves = value; break
        case 'reach': metrics.reach = value; break
        case 'impressions': metrics.impressions = value; break
        case 'plays': metrics.views = value; break
      }
    }
    return metrics
  } catch {
    return {}
  }
}

export async function getFollowerCount(): Promise<number> {
  try {
    const result = await graphRequest<{ followers_count: number }>(
      `/${USER_ID}?fields=followers_count`
    )
    return result.followers_count ?? 0
  } catch {
    return 0
  }
}
