import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { overlays } = await request.json() as { overlays: Record<string, unknown>[] }

  if (!Array.isArray(overlays) || overlays.length === 0) {
    return NextResponse.json({ error: 'overlays must be a non-empty array' }, { status: 400 })
  }

  const valid = overlays.filter((o) =>
    typeof o.hook === 'string' &&
    typeof o.body === 'string' &&
    typeof o.caption === 'string' &&
    typeof o.cta === 'string' &&
    ['A', 'B', 'C', 'D'].includes(o.style as string)
  )

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid overlay entries found' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('content_overlays').insert(valid)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: valid.length })
}
