import { NextRequest, NextResponse } from 'next/server'
import { runScheduledPost, startScheduler, stopScheduler } from '@/lib/scheduler'

export async function POST(req: NextRequest) {
  const { action } = await req.json() as { action: 'post_now' | 'start' | 'stop' }

  if (action === 'post_now') {
    const result = await runScheduledPost()
    return NextResponse.json(result)
  }
  if (action === 'start') { startScheduler(); return NextResponse.json({ success: true }) }
  if (action === 'stop') { stopScheduler(); return NextResponse.json({ success: true }) }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
