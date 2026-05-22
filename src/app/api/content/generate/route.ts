import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBrandVoiceSummary } from '@/lib/anthropic/analyze-inspiration'
import { generateTextOverlay } from '@/lib/anthropic/generate-overlay'
import { generateCaption } from '@/lib/anthropic/generate-caption'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  const body = await request.json() as { themeHint?: string }
  const { themeHint } = body

  const { data: settings } = await supabase.from('settings').select('*').single()
  if (!settings?.background_video_url) {
    return NextResponse.json({ error: 'No background video configured' }, { status: 400 })
  }

  const { data: inspirations } = await supabase
    .from('inspiration_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const brandVoice = settings.brand_voice_summary ?? await buildBrandVoiceSummary(inspirations ?? [])

  const { data: recentPosts } = await supabase
    .from('content_posts')
    .select('text_overlay')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentOverlays = (recentPosts ?? []).map((p) => p.text_overlay)

  const textOverlay = await generateTextOverlay({ brandVoiceSummary: brandVoice, recentOverlays, themeHint })
  const { caption, hashtags } = await generateCaption({
    brandVoiceSummary: brandVoice,
    textOverlay,
    defaultHashtags: settings.default_hashtags,
    themeHint,
  })

  const { data: contentPost, error } = await supabase
    .from('content_posts')
    .insert({
      status: 'draft',
      text_overlay: textOverlay,
      caption,
      hashtags,
      background_video_url: settings.background_video_url,
      inspiration_ids: (inspirations ?? []).map((i) => i.id).slice(0, 5),
      generation_model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post: contentPost })
}
