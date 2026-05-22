import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromCloudinary } from '@/lib/cloudinary/upload'
import { buildBrandVoiceSummary } from '@/lib/anthropic/analyze-inspiration'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: item } = await supabase.from('inspiration_items').select('*').eq('id', id).single()
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteFromCloudinary(item.cloudinary_public_id, item.type === 'video' ? 'video' : 'image').catch(() => {})
  await supabase.from('inspiration_items').delete().eq('id', id)

  const { data: remaining } = await supabase.from('inspiration_items').select('*')
  const summary = await buildBrandVoiceSummary(remaining ?? [])
  await supabase
    .from('settings')
    .update({ brand_voice_summary: summary, brand_voice_updated_at: new Date().toISOString() })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ success: true })
}
