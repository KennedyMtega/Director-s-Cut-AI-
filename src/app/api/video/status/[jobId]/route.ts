import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRenderStatus } from '@/lib/creatomate/render'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const supabase = createAdminClient()

  const job = await getRenderStatus(jobId)

  if (job.status === 'succeeded' && job.url) {
    await supabase
      .from('content_posts')
      .update({ status: 'ready', rendered_video_url: job.url })
      .eq('creatomate_job_id', jobId)
  } else if (job.status === 'failed') {
    await supabase
      .from('content_posts')
      .update({ status: 'failed' })
      .eq('creatomate_job_id', jobId)
  }

  return NextResponse.json({ status: job.status, url: job.url })
}
