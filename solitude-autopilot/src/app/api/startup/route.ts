import { NextResponse } from 'next/server'
import { startScheduler } from '@/lib/scheduler'

// Called once on first request to boot the cron scheduler
let started = false

export async function GET() {
  if (!started) {
    startScheduler()
    started = true
  }
  return NextResponse.json({ started: true })
}
