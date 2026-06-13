import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { publishToYouTube } from '@/lib/publisher'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const { postId, platform } = await req.json() as { postId: string; platform: 'youtube' | 'instagram' }
  const db = getDb()

  const post = db.prepare(`
    SELECT p.*, q.hook, q.body, q.caption, q.cta, q.style
    FROM posts p JOIN quotes q ON p.quote_id = q.id
    WHERE p.id = ?
  `).get(postId) as any

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  if (!post.video_path) return NextResponse.json({ error: 'Video not rendered yet' }, { status: 400 })

  try {
    if (platform === 'youtube') {
      const { videoUrl } = await publishToYouTube({
        videoPath: post.video_path,
        title: post.hook,
        description: post.cta,
        caption: post.caption,
      })
      db.prepare(`UPDATE posts SET youtube_url = ?, status = 'posted', posted_at = ? WHERE id = ?`)
        .run(videoUrl, new Date().toISOString(), postId)
      return NextResponse.json({ success: true, url: videoUrl })
    }

    if (platform === 'instagram') {
      // Mark queued for manual confirm flow
      db.prepare(`UPDATE posts SET instagram_status = 'queued' WHERE id = ?`).run(postId)
      return NextResponse.json({ success: true, queued: true })
    }

    return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
