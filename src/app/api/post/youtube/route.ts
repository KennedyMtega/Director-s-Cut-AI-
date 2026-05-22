import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { publishYouTubeShort } from '@/lib/youtube/publish'

export async function POST(request: NextRequest) {
  const { contentPostId } = await request.json() as { contentPostId: string }
  const supabase = createAdminClient()

  const { data: post } = await supabase.from('content_posts').select('*').eq('id', contentPostId).single()
  if (!post?.rendered_video_url) return NextResponse.json({ error: 'No rendered video' }, { status: 400 })

  const description = `${post.caption}\n\n${post.hashtags.join(' ')}`

  try {
    const result = await publishYouTubeShort(post.rendered_video_url, post.text_overlay, description)
    await supabase.from('platform_posts').insert({
      content_post_id: contentPostId,
      platform: 'youtube',
      platform_post_id: result.videoId,
      platform_url: result.videoUrl,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    await supabase.from('platform_posts').insert({
      content_post_id: contentPostId,
      platform: 'youtube',
      status: 'failed',
      error_message: String(err),
    })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
