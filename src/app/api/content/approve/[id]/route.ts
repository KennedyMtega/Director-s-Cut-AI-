import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitRenderJob } from '@/lib/creatomate/render'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase.from('content_posts').select('*').eq('id', id).single()
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  if (post.rendered_video_url) {
    await supabase.from('content_posts').update({ status: 'ready' }).eq('id', id)
    return NextResponse.json({ status: 'ready' })
  }

  const job = await submitRenderJob({
    backgroundVideoUrl: post.background_video_url,
    textOverlay: post.text_overlay,
  })

  await supabase
    .from('content_posts')
    .update({ status: 'rendering', creatomate_job_id: job.id })
    .eq('id', id)

  return NextResponse.json({ status: 'rendering', jobId: job.id })
}
