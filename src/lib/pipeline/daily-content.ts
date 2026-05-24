import { createAdminClient } from '@/lib/supabase/admin'
import { renderVideo } from '@/lib/renderer/render-video'
import { publishReel } from '@/lib/instagram/publish'
import { publishYouTubeShort } from '@/lib/youtube/publish'
import { publishToFacebookPage } from '@/lib/facebook/publish'
import type { PostResult } from '@/types/platform'

export async function runDailyContentPipeline(): Promise<{ contentPostId: string; results: PostResult[] }> {
  const supabase = createAdminClient()

  // 1. Load settings — background video URL is the one video used for all renders
  const { data: settings } = await supabase.from('settings').select('*').single()
  if (!settings?.background_video_url) {
    throw new Error('No background video configured in settings')
  }

  // 2. Pick next unused overlay (FIFO order — cycles through A→B→C→D naturally)
  const { data: overlay, error: overlayError } = await supabase
    .from('content_overlays')
    .select('*')
    .is('used_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (overlayError || !overlay) {
    throw new Error('No unused overlays remaining — import a new batch at /admin/overlays')
  }

  const fullCaption = `${overlay.caption}\n\n${overlay.cta}`

  // 3. Create content_posts row
  const { data: contentPost, error: insertError } = await supabase
    .from('content_posts')
    .insert({
      status: 'rendering',
      text_overlay: `${overlay.hook}\n\n${overlay.body}`,
      caption: overlay.caption,
      hashtags: [],
      background_video_url: settings.background_video_url,
    })
    .select()
    .single()

  if (insertError || !contentPost) throw insertError ?? new Error('Failed to create content post')

  // 4. Render video (Sharp + FFmpeg, free)
  let renderedUrl: string
  try {
    renderedUrl = await renderVideo({
      templateVideoUrl: settings.background_video_url,
      hook: overlay.hook,
      body: overlay.body,
    })
  } catch (err) {
    await supabase.from('content_posts').update({ status: 'failed' }).eq('id', contentPost.id)
    throw new Error(`Render failed: ${String(err)}`)
  }

  await supabase
    .from('content_posts')
    .update({ status: 'ready', rendered_video_url: renderedUrl })
    .eq('id', contentPost.id)

  // 5. Mark overlay as used immediately so parallel cron calls don't pick the same one
  await supabase
    .from('content_overlays')
    .update({ used_at: new Date().toISOString(), post_id: contentPost.id })
    .eq('id', overlay.id)

  // 6. Publish to platforms
  const results: PostResult[] = []

  // Instagram
  try {
    const ig = await publishReel(renderedUrl, fullCaption)
    await supabase.from('platform_posts').insert({
      content_post_id: contentPost.id,
      platform: 'instagram',
      platform_post_id: ig.postId,
      platform_url: ig.permalink,
      status: 'published',
      published_at: new Date().toISOString(),
    })
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
    const yt = await publishYouTubeShort(renderedUrl, overlay.hook, fullCaption)
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
    const fb = await publishToFacebookPage(renderedUrl, fullCaption)
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

  // 7. Mark post as posted
  await supabase
    .from('content_posts')
    .update({ status: 'posted', posted_at: new Date().toISOString() })
    .eq('id', contentPost.id)

  return { contentPostId: contentPost.id, results }
}
