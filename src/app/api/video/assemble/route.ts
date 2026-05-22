import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitRenderJob } from '@/lib/creatomate/render'

export async function POST(request: NextRequest) {
  const { contentPostId } = await request.json() as { contentPostId: string }
  const supabase = createAdminClient()

  const { data: post } = await supabase.from('content_posts').select('*').eq('id', contentPostId).single()
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const job = await submitRenderJob({
    backgroundVideoUrl: post.background_video_url,
    textOverlay: post.text_overlay,
  })

  await supabase
    .from('content_posts')
    .update({ status: 'rendering', creatomate_job_id: job.id })
    .eq('id', contentPostId)

  return NextResponse.json({ jobId: job.id })
}
