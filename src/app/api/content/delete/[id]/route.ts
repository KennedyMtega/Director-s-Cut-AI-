import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromCloudinary } from '@/lib/cloudinary/upload'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: post } = await supabase.from('content_posts').select('*').eq('id', id).single()
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  if (post.rendered_video_public_id) {
    await deleteFromCloudinary(post.rendered_video_public_id, 'video').catch(() => {})
  }

  await supabase.from('content_posts').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
