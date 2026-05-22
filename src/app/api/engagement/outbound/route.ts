import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOutboundComment } from '@/lib/anthropic/generate-reply'
import { searchHashtagPosts, commentOnMedia, getPostComments } from '@/lib/instagram/comments'

const NICHE_HASHTAGS = ['minimalism', 'philosophy', 'solitude', 'innerpeace', 'contemplation']
const MAX_DAILY_COMMENTS = 10
const MIN_DELAY_MS = 10000
const MAX_DELAY_MS = 30000

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { count: todayCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('direction', 'outbound')
    .gte('created_at', today.toISOString())

  if ((todayCount ?? 0) >= MAX_DAILY_COMMENTS) {
    return NextResponse.json({ message: 'Daily outbound comment limit reached' })
  }

  const { data: settings } = await supabase.from('settings').select('brand_voice_summary').single()
  const brandVoice = settings?.brand_voice_summary ?? ''

  const hashtag = NICHE_HASHTAGS[Math.floor(Math.random() * NICHE_HASHTAGS.length)]
  const mediaIds = await searchHashtagPosts(hashtag, 20)

  const { data: alreadyCommented } = await supabase
    .from('comments')
    .select('external_post_url')
    .eq('direction', 'outbound')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const commentedIds = new Set((alreadyCommented ?? []).map((c) => c.external_post_url).filter(Boolean))
  const freshIds = mediaIds.filter((id) => !commentedIds.has(id))

  const limit = Math.min(5, MAX_DAILY_COMMENTS - (todayCount ?? 0))
  const targets = freshIds.slice(0, limit)
  const posted: string[] = []

  for (const mediaId of targets) {
    try {
      // Get post caption as context
      const comments = await getPostComments(mediaId).catch(() => [])
      const context = `Post on #${hashtag}`

      const commentText = await generateOutboundComment(context, brandVoice)

      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
      await new Promise((r) => setTimeout(r, delay))

      await commentOnMedia(mediaId, commentText)

      await supabase.from('comments').insert({
        direction: 'outbound',
        platform: 'instagram',
        external_post_url: mediaId,
        comment_text: commentText,
      })

      posted.push(mediaId)
    } catch {
      // Skip failures silently to not break the loop
    }
  }

  return NextResponse.json({ posted: posted.length, mediaIds: posted })
}
