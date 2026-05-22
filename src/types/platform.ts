export type Platform = 'instagram' | 'youtube' | 'facebook'

export interface PostResult {
  platform: Platform
  success: boolean
  platformPostId?: string
  platformUrl?: string
  error?: string
}

export interface InstagramContainerStatus {
  id: string
  status: string
  status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED'
}
