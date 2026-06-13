import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSetting } from '@/lib/db'
import { renderVideo, pickBackground } from '@/lib/renderer'
import { randomUUID } from 'crypto'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { quoteId } = await req.json() as { quoteId: number }
  const db = getDb()

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId) as any
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (quote.used) return NextResponse.json({ error: 'Quote already used' }, { status: 400 })

  const postId = randomUUID()
  const now = new Date().toISOString()
  const watermark = getSetting('watermark') ?? '@solitude_script'

  db.prepare(`INSERT INTO posts (id, quote_id, status, scheduled_for) VALUES (?, ?, 'rendering', ?)`)
    .run(postId, quoteId, now)
  db.prepare(`UPDATE quotes SET used = 1, used_at = ?, post_id = ? WHERE id = ?`)
    .run(now, postId, quoteId)

  try {
    const videoPath = await renderVideo({
      hook: quote.hook,
      body: quote.body,
      watermark,
      style: quote.style,
      backgroundVideo: pickBackground(),
    })

    db.prepare(`UPDATE posts SET video_path = ?, status = 'ready' WHERE id = ?`).run(videoPath, postId)
    return NextResponse.json({ postId, videoPath: `/api/video/${postId}` })
  } catch (err) {
    db.prepare(`UPDATE posts SET status = 'failed' WHERE id = ?`).run(postId)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
