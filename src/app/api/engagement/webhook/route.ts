import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHmac } from 'crypto'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_APP_SECRET) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') ?? ''
  const expectedSig = 'sha256=' + createHmac('sha256', process.env.INSTAGRAM_APP_SECRET!).update(rawBody).digest('hex')

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const payload = JSON.parse(rawBody) as {
    entry?: { changes?: { field: string; value: { comment_id?: string; text?: string; from?: { username?: string; id?: string }; media?: { id?: string } } }[] }[]
  }

  const supabase = createAdminClient()

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field === 'comments' && change.value.comment_id) {
        const { comment_id, text, from, media } = change.value

        // Find the platform_post by media id
        const { data: platformPost } = await supabase
          .from('platform_posts')
          .select('id')
          .eq('platform_post_id', media?.id ?? '')
          .single()

        await supabase.from('comments').upsert({
          direction: 'inbound',
          platform: 'instagram',
          platform_comment_id: comment_id,
          platform_post_id: platformPost?.id ?? null,
          commenter_username: from?.username ?? null,
          commenter_id: from?.id ?? null,
          comment_text: text ?? '',
        }, { onConflict: 'platform_comment_id' })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
