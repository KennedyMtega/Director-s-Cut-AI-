import { NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/utils/cron-auth'

export const maxDuration = 120

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const response = await fetch(`${appUrl}/api/engagement/outbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })

  const data = await response.json()
  return NextResponse.json({ success: true, ...data })
}
