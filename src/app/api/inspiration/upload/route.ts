import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadToCloudinary } from '@/lib/cloudinary/upload'
import { analyzeInspirationItem, buildBrandVoiceSummary } from '@/lib/anthropic/analyze-inspiration'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const caption = formData.get('caption') as string | null
  const type = (formData.get('type') as string) || 'image'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const { url, publicId } = await uploadToCloudinary(buffer, {
    folder: 'solitude-script/inspiration',
    resourceType: type === 'video' ? 'video' : 'image',
  })

  const aiAnalysis = await analyzeInspirationItem(url)

  const { data: item, error } = await supabase
    .from('inspiration_items')
    .insert({
      type: type as 'video' | 'image' | 'post_screenshot',
      cloudinary_url: url,
      cloudinary_public_id: publicId,
      caption: caption ?? null,
      ai_analysis: aiAnalysis,
      analyzed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Regenerate brand voice summary in background
  const { data: allItems } = await supabase.from('inspiration_items').select('*')
  const summary = await buildBrandVoiceSummary(allItems ?? [])
  await supabase
    .from('settings')
    .update({ brand_voice_summary: summary, brand_voice_updated_at: new Date().toISOString() })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ item })
}
