import cron, { type ScheduledTask } from 'node-cron'
import { getDb, getSetting } from './db'
import { renderVideo, pickBackground } from './renderer'
import { publishToYouTube } from './publisher'
import { randomUUID } from 'crypto'

let job1: ScheduledTask | null = null
let job2: ScheduledTask | null = null

function timeToCron(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  // Convert EAT (UTC+3) to UTC
  let utcH = h - 3
  if (utcH < 0) utcH += 24
  return `${m} ${utcH} * * *`
}

export function startScheduler() {
  stopScheduler()

  const autoSchedule = getSetting('auto_schedule')
  if (autoSchedule !== '1') return

  const time1 = getSetting('schedule_time_1') ?? '07:00'
  const time2 = getSetting('schedule_time_2') ?? '19:00'

  job1 = cron.schedule(timeToCron(time1), () => runScheduledPost(), { timezone: 'UTC' })
  job2 = cron.schedule(timeToCron(time2), () => runScheduledPost(), { timezone: 'UTC' })

  console.log(`[Scheduler] Running at ${time1} and ${time2} EAT`)
}

export function stopScheduler() {
  job1?.stop()
  job2?.stop()
  job1 = null
  job2 = null
}

export async function runScheduledPost(): Promise<{ success: boolean; error?: string; postId?: string }> {
  const db = getDb()

  // Pick next unused quote (FIFO, style rotation)
  const quote = db.prepare(
    `SELECT * FROM quotes WHERE used = 0 ORDER BY id ASC LIMIT 1`
  ).get() as any

  if (!quote) return { success: false, error: 'No unused quotes remaining' }

  const postId = randomUUID()
  const now = new Date().toISOString()

  // Insert post record
  db.prepare(
    `INSERT INTO posts (id, quote_id, status, scheduled_for) VALUES (?, ?, 'rendering', ?)`
  ).run(postId, quote.id, now)

  try {
    // Mark quote used immediately to prevent double-use
    db.prepare(`UPDATE quotes SET used = 1, used_at = ?, post_id = ? WHERE id = ?`)
      .run(now, postId, quote.id)

    const watermark = getSetting('watermark') ?? '@solitude_script'
    const bgVideo = pickBackground()

    // Render
    db.prepare(`UPDATE posts SET status = 'rendering' WHERE id = ?`).run(postId)
    const videoPath = await renderVideo({
      hook: quote.hook,
      body: quote.body,
      watermark,
      style: quote.style,
      backgroundVideo: bgVideo,
    })

    db.prepare(`UPDATE posts SET video_path = ?, status = 'ready' WHERE id = ?`).run(videoPath, postId)

    // Publish to YouTube
    const { videoId, videoUrl } = await publishToYouTube({
      videoPath,
      title: quote.hook,
      description: quote.cta,
      caption: quote.caption,
    })

    db.prepare(
      `UPDATE posts SET youtube_url = ?, status = 'posted', posted_at = ?, instagram_status = 'queued' WHERE id = ?`
    ).run(videoUrl, new Date().toISOString(), postId)

    return { success: true, postId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    db.prepare(`UPDATE posts SET status = 'failed' WHERE id = ?`).run(postId)
    console.error('[Scheduler] Post failed:', msg)
    return { success: false, error: msg, postId }
  }
}
