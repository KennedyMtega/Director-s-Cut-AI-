import { createAdminClient } from '@/lib/supabase/admin'
import { buildBrandVoiceSummary } from '@/lib/anthropic/analyze-inspiration'
import { generateTextOverlay } from '@/lib/anthropic/generate-overlay'
import { generateCaption } from '@/lib/anthropic/generate-caption'
import { submitRenderJob, waitForRender } from '@/lib/creatomate/render'
import { publishReel } from '@/lib/instagram/publish'
import { publishYouTubeShort } from '@/lib/youtube/publish'
import { publishToFacebookPage } from '@/lib/facebook/publish'
import type { PostResult } from '@/types/platform'

export async function runDailyContentPipeline(): Promise<{ contentPostId: string; results: PostResult[] }> {
  const supabase = createAdminClient()

  // 1. Load settings
  const { data: settings } = await supabase.from('settings').select('*').single()
  if (!settings?.background_video_url) {
    throw new Error('No background video configured in settings')
  }

  // 2. Load inspiration items for brand voice
  const { data: inspirations } = await supabase
    .from('inspiration_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const brandVoice = settings.brand_voice_summary
    ?? await buildBrandVoiceSummary(inspirations ?? [])

  // 3. Load recent overlays to avoid repetition
  const { data: recentPosts } = await supabase
    .from('content_posts')
    .select('text_overlay')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentOverlays = (recentPosts ?? []).map((p) => p.text_overlay)

  // 4. Generate content
  const textOverlay = await generateTextOverlay({ brandVoiceSummary: brandVoice, recentOverlays })
  const { caption, hashtags } = await generateCaption({
    brandVoiceSummary: brandVoice,
    textOverlay,
    defaultHashtags: settings.default_hashtags,
  })

  const fullCaption = `${caption}\n\n${hashtags.join(' ')}`

  // 5. Create content_posts row
  const { data: contentPost, error: insertError } = await supabase
    .from('content_posts')
    .insert({
      status: 'rendering',
      text_overlay: textOverlay,
      caption,
      hashtags,
      background_video_url: settings.background_video_url,
      inspiration_ids: (inspirations ?? []).map((i) => i.id).slice(0, 5),
      generation_model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    })
    .select()
    .single()

  if (insertError || !contentPost) throw insertError ?? new Error('Failed to create content post')

  // 6. Render video via Creatomate
  const renderJob = await submitRenderJob({
    backgroundVideoUrl: settings.background_video_url,
    textOverlay,
  })

  await supabase.from('content_posts').update({ creatomate_job_id: renderJob.id }).eq('id', contentPost.id)

  const finishedJob = await waitForRender(renderJob.id)
  if (finishedJob.status !== 'succeeded' || !finishedJob.url) {
    await supabase.from('content_posts').update({ status: 'failed' }).eq('id', contentPost.id)
    throw new Error(`Render failed: ${renderJob.id}`)
  }

  await supabase
    .from('content_posts')
    .update({ status: 'ready', rendered_video_url: finishedJob.url })
    .eq('id', contentPost.id)

  // 7. Publish to platforms
  const results: PostResult[] = []

  // Instagram
  try {
    const ig = await publishReel(finishedJob.url, fullCaption)
    const { data: platformPost } = await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id,
      platform: 'instagram',
      platform_post_id: ig.postId,
      platform_url: ig.permalink,
      status: 'published',
      published_at: new Date().toISOString(),
    }).select().single()
    results.push({ platform: 'instagram', success: true, platformPostId: ig.postId, platformUrl: ig.permalink })
  } catch (err) {
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id, platform: 'instagram', status: 'failed',
      error_message: String(err),
    })
    results.push({ platform: 'instagram', success: false, error: String(err) })
  }

  // YouTube Shorts
  try {
    const yt = await publishYouTubeShort(finishedJob.url, textOverlay, fullCaption)
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id,
      platform: 'youtube',
      platform_post_id: yt.videoId,
      platform_url: yt.videoUrl,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    results.push({ platform: 'youtube', success: true, platformPostId: yt.videoId, platformUrl: yt.videoUrl })
  } catch (err) {
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id, platform: 'youtube', status: 'failed',
      error_message: String(err),
    })
    results.push({ platform: 'youtube', success: false, error: String(err) })
  }

  // Facebook
  try {
    const fb = await publishToFacebookPage(finishedJob.url, fullCaption)
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id,
      platform: 'facebook',
      platform_post_id: fb.postId,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    results.push({ platform: 'facebook', success: true, platformPostId: fb.postId })
  } catch (err) {
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id, platform: 'facebook', status: 'failed',
      error_message: String(err),
    })
    results.push({ platform: 'facebook', success: false, error: String(err) })
  }

  // 8. Mark content post as posted
  await supabase
    .from('content_posts')
    .update({ status: 'posted', posted_at: new Date().toISOString() })
    .eq('id', contentPost.id)

  return { contentPostId: contentPost.id, results }
}
