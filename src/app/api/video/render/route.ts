import { NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/utils/cron-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { renderVideo } from '@/lib/renderer/render-video'

export const maxDuration = 300

export async function POST(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { overlayId } = await request.json() as { overlayId: string }
  const supabase = createAdminClient()

  const { data: overlay } = await supabase
    .from('content_overlays')
    .select('*')
    .eq('id', overlayId)
    .single()

  if (!overlay) return NextResponse.json({ error: 'Overlay not found' }, { status: 404 })

  const { data: settings } = await supabase.from('settings').select('background_video_url').single()
  if (!settings?.background_video_url) {
    return NextResponse.json({ error: 'No background video configured' }, { status: 400 })
  }

  const videoUrl = await renderVideo({
    templateVideoUrl: settings.background_video_url,
    hook: overlay.hook,
    body: overlay.body,
  })

  return NextResponse.json({ videoUrl })
}
