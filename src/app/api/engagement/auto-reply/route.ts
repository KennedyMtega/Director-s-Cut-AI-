import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCommentReply } from '@/lib/anthropic/generate-reply'
import { replyToComment } from '@/lib/instagram/comments'

export async function POST(request: NextRequest) {
  const { commentId } = await request.json() as { commentId: string }
  const supabase = createAdminClient()

  const { data: comment } = await supabase
    .from('comments')
    .select('*, platform_posts(content_post_id)')
    .eq('id', commentId)
    .single()

  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  if (comment.auto_replied) return NextResponse.json({ error: 'Already replied' }, { status: 400 })

  const { data: settings } = await supabase.from('settings').select('brand_voice_summary').single()
  const brandVoice = settings?.brand_voice_summary ?? ''

  // Get the post overlay text for context
  let postOverlay = ''
  if (comment.platform_post_id) {
    const { data: pp } = await supabase
      .from('platform_posts')
      .select('content_post_id')
      .eq('id', comment.platform_post_id)
      .single()
    if (pp?.content_post_id) {
      const { data: cp } = await supabase
        .from('content_posts')
        .select('text_overlay')
        .eq('id', pp.content_post_id)
        .single()
      postOverlay = cp?.text_overlay ?? ''
    }
  }

  const replyText = await generateCommentReply({
    brandVoiceSummary: brandVoice,
    postOverlay,
    commenterUsername: comment.commenter_username ?? 'there',
    commentText: comment.comment_text,
  })

  const replyId = await replyToComment(comment.platform_comment_id!, replyText)

  await supabase.from('comments').update({
    reply_text: replyText,
    replied_at: new Date().toISOString(),
    auto_replied: true,
  }).eq('id', commentId)

  return NextResponse.json({ success: true, replyId })
}
