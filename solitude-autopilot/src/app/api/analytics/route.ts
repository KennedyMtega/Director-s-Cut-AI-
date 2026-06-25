import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  // Local stats
  const db = getDb()
  const totalQuotes = (db.prepare('SELECT COUNT(*) as n FROM quotes').get() as any).n
  const usedQuotes = (db.prepare('SELECT COUNT(*) as n FROM quotes WHERE used = 1').get() as any).n
  const totalPosts = (db.prepare('SELECT COUNT(*) as n FROM posts').get() as any).n
  const postedCount = (db.prepare("SELECT COUNT(*) as n FROM posts WHERE status = 'posted'").get() as any).n

  let youtube = null
  try {
    const { getYouTubeAnalytics } = await import('@/lib/publisher')
    youtube = await getYouTubeAnalytics()
  } catch {
    youtube = null
  }

  return NextResponse.json({
    local: { totalQuotes, usedQuotes, remaining: totalQuotes - usedQuotes, totalPosts, postedCount },
    youtube,
  })
}
