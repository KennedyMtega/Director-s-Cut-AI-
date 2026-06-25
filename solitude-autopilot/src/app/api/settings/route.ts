import { NextRequest, NextResponse } from 'next/server'
import { getDb, getSetting, setSetting } from '@/lib/db'

export async function GET() {
  const keys = ['schedule_time_1', 'schedule_time_2', 'auto_schedule', 'timezone', 'watermark']
  const settings: Record<string, string> = {}
  for (const k of keys) settings[k] = getSetting(k) ?? ''
  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>
  for (const [k, v] of Object.entries(body)) {
    setSetting(k, String(v))
  }

  // Restart scheduler with new times
  const { startScheduler } = await import('@/lib/scheduler')
  startScheduler()

  return NextResponse.json({ success: true })
}
