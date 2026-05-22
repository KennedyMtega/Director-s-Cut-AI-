import { NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/utils/cron-auth'
import { runDailyContentPipeline } from '@/lib/pipeline/daily-content'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runDailyContentPipeline()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('Daily post cron failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
