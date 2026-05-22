export interface MetricSnapshot {
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  views: number
  followerCount?: number
  recordedAt: string
}

export interface PlatformMetrics {
  platform: string
  postId: string
  metrics: MetricSnapshot
}

export interface DashboardStats {
  totalPosts: number
  totalLikes: number
  totalReach: number
  instagramFollowers: number
  youtubeSubscribers: number
}
