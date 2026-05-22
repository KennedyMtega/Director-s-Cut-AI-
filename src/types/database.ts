export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: Settings
        Insert: Partial<Settings>
        Update: Partial<Settings>
        Relationships: []
      }
      inspiration_items: {
        Row: InspirationItem
        Insert: Omit<InspirationItem, 'id' | 'created_at'>
        Update: Partial<InspirationItem>
        Relationships: []
      }
      content_posts: {
        Row: ContentPost
        Insert: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<ContentPost>
        Relationships: []
      }
      platform_posts: {
        Row: PlatformPost
        Insert: Omit<PlatformPost, 'id' | 'created_at'>
        Update: Partial<PlatformPost>
        Relationships: []
      }
      post_metrics: {
        Row: PostMetric
        Insert: Omit<PostMetric, 'id' | 'recorded_at'>
        Update: Partial<PostMetric>
        Relationships: []
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Comment>
        Relationships: []
      }
      monetization_config: {
        Row: MonetizationConfig
        Insert: Partial<MonetizationConfig>
        Update: Partial<MonetizationConfig>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Settings {
  id: string
  background_video_url: string | null
  background_video_public_id: string | null
  brand_voice_summary: string | null
  brand_voice_updated_at: string | null
  default_hashtags: string[]
  post_time_utc: string
  instagram_user_id: string | null
  instagram_page_id: string | null
  facebook_page_id: string | null
  youtube_channel_id: string | null
  created_at: string
  updated_at: string
}

export interface InspirationItem {
  id: string
  type: 'video' | 'image' | 'post_screenshot'
  cloudinary_url: string
  cloudinary_public_id: string
  caption: string | null
  ai_analysis: string | null
  analyzed_at: string | null
  created_at: string
}

export interface ContentPost {
  id: string
  status: 'draft' | 'approved' | 'rendering' | 'ready' | 'posted' | 'failed'
  text_overlay: string
  caption: string
  hashtags: string[]
  background_video_url: string
  rendered_video_url: string | null
  rendered_video_public_id: string | null
  creatomate_job_id: string | null
  scheduled_for: string | null
  posted_at: string | null
  inspiration_ids: string[]
  generation_prompt: string | null
  generation_model: string | null
  created_at: string
  updated_at: string
}

export interface PlatformPost {
  id: string
  content_post_id: string
  platform: 'instagram' | 'youtube' | 'facebook'
  platform_post_id: string | null
  platform_url: string | null
  status: 'pending' | 'published' | 'failed'
  error_message: string | null
  published_at: string | null
  created_at: string
}

export interface PostMetric {
  id: string
  platform_post_id: string
  platform: string
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  views: number
  follower_count: number | null
  recorded_at: string
}

export interface Comment {
  id: string
  direction: 'inbound' | 'outbound'
  platform: string
  platform_comment_id: string | null
  platform_post_id: string | null
  external_post_url: string | null
  commenter_username: string | null
  commenter_id: string | null
  comment_text: string
  reply_text: string | null
  replied_at: string | null
  auto_replied: boolean
  created_at: string
}

export interface MonetizationConfig {
  id: string
  instagram_follower_threshold: number
  youtube_subscriber_threshold: number
  digital_products_enabled: boolean
  storefront_url: string | null
  adsense_publisher_id: string | null
  newsletter_url: string | null
  sponsor_contact_email: string | null
  updated_at: string
}
