-- Director's Cut AI — Initial Schema

CREATE TABLE settings (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_video_url        text,
  background_video_public_id  text,
  brand_voice_summary         text,
  brand_voice_updated_at      timestamptz,
  default_hashtags            text[] DEFAULT '{}',
  post_time_utc               time DEFAULT '14:00:00',
  instagram_user_id           text,
  instagram_page_id           text,
  facebook_page_id            text,
  youtube_channel_id          text,
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

CREATE TABLE inspiration_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  text NOT NULL CHECK (type IN ('video', 'image', 'post_screenshot')),
  cloudinary_url        text NOT NULL,
  cloudinary_public_id  text NOT NULL,
  caption               text,
  ai_analysis           text,
  analyzed_at           timestamptz,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE content_posts (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status                   text NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft','approved','rendering','ready','posted','failed')),
  text_overlay             text NOT NULL,
  caption                  text NOT NULL,
  hashtags                 text[] DEFAULT '{}',
  background_video_url     text NOT NULL,
  rendered_video_url       text,
  rendered_video_public_id text,
  creatomate_job_id        text,
  scheduled_for            timestamptz,
  posted_at                timestamptz,
  inspiration_ids          uuid[] DEFAULT '{}',
  generation_prompt        text,
  generation_model         text,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE INDEX content_posts_status_idx ON content_posts (status);
CREATE INDEX content_posts_scheduled_idx ON content_posts (scheduled_for);

CREATE TABLE platform_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_post_id  uuid NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  platform         text NOT NULL CHECK (platform IN ('instagram','youtube','facebook')),
  platform_post_id text,
  platform_url     text,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','published','failed')),
  error_message    text,
  published_at     timestamptz,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX platform_posts_content_idx ON platform_posts (content_post_id);
CREATE INDEX platform_posts_platform_status_idx ON platform_posts (platform, status);

CREATE TABLE post_metrics (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_post_id uuid NOT NULL REFERENCES platform_posts(id) ON DELETE CASCADE,
  platform         text NOT NULL,
  likes            integer DEFAULT 0,
  comments         integer DEFAULT 0,
  shares           integer DEFAULT 0,
  saves            integer DEFAULT 0,
  reach            integer DEFAULT 0,
  impressions      integer DEFAULT 0,
  views            integer DEFAULT 0,
  follower_count   integer,
  recorded_at      timestamptz DEFAULT now()
);

CREATE INDEX post_metrics_platform_post_idx ON post_metrics (platform_post_id, recorded_at DESC);

CREATE TABLE comments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction           text NOT NULL CHECK (direction IN ('inbound','outbound')),
  platform            text NOT NULL,
  platform_comment_id text,
  platform_post_id    uuid REFERENCES platform_posts(id),
  external_post_url   text,
  commenter_username  text,
  commenter_id        text,
  comment_text        text NOT NULL,
  reply_text          text,
  replied_at          timestamptz,
  auto_replied        boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX comments_direction_platform_idx ON comments (direction, platform);
CREATE UNIQUE INDEX comments_platform_comment_id_idx ON comments (platform_comment_id) WHERE platform_comment_id IS NOT NULL;

CREATE TABLE monetization_config (
  id                               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_follower_threshold     integer DEFAULT 100000,
  youtube_subscriber_threshold     integer DEFAULT 100000,
  digital_products_enabled         boolean DEFAULT false,
  storefront_url                   text,
  adsense_publisher_id             text,
  newsletter_url                   text,
  sponsor_contact_email            text,
  updated_at                       timestamptz DEFAULT now()
);
