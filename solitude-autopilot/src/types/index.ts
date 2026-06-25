export interface Quote {
  id: number
  style: 'A' | 'B' | 'C' | 'D' | 'E'
  style_label: string
  hook: string
  body: string
  caption: string
  cta: string
  used: number
  used_at: string | null
  post_id: string | null
  created_at: string
}

export interface Post {
  id: string
  quote_id: number
  video_path: string | null
  status: 'pending' | 'rendering' | 'ready' | 'posting' | 'posted' | 'failed'
  youtube_url: string | null
  instagram_status: 'pending' | 'queued' | 'posted' | 'skipped'
  scheduled_for: string | null
  posted_at: string | null
  created_at: string
}

export interface Background {
  id: number
  filename: string
  path: string
  active: number
  created_at: string
}

export interface Settings {
  schedule_time_1: string
  schedule_time_2: string
  auto_schedule: string
  timezone: string
  watermark: string
}
