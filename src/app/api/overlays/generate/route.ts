import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateOverlayBatch } from '@/lib/gemini/generate-overlays'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const { style, count = 25 } = await request.json() as { style: 'A' | 'B' | 'C' | 'D'; count?: number }

  if (!['A', 'B', 'C', 'D'].includes(style)) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
  }

  const overlays = await generateOverlayBatch(style, count)

  const supabase = createAdminClient()
  const { error } = await supabase.from('content_overlays').insert(overlays)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: overlays.length })
}
