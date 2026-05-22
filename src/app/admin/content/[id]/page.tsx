import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { VideoPreview } from '@/components/admin/VideoPreview'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import { ApproveButton } from './ApproveButton'
import type { ContentPost, PlatformPost } from '@/types/database'

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: postRaw } = await supabase.from('content_posts').select('*').eq('id', id).single()
  if (!postRaw) notFound()
  const post = postRaw as ContentPost

  const { data: platformsRaw } = await supabase
    .from('platform_posts')
    .select('*')
    .eq('content_post_id', id)
  const platforms = (platformsRaw ?? []) as PlatformPost[]

  return (
    <div>
      <Header title="Post Detail" description={`Created ${new Date(post.created_at).toLocaleDateString()}`} />

      <div className="flex gap-8 flex-wrap">
        <VideoPreview url={post.rendered_video_url} textOverlay={post.text_overlay} status={post.status} />

        <div className="flex-1 min-w-[300px] space-y-6">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Text Overlay</p>
            <p className="text-white text-lg font-light leading-relaxed whitespace-pre-line">{post.text_overlay}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Caption</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{post.caption}</p>
          </div>

          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Hashtags</p>
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-zinc-400 border-zinc-700 text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Status</p>
            <Badge className="capitalize">{post.status}</Badge>
          </div>

          {platforms.length > 0 && (
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Published To</p>
              <div className="space-y-1">
                {platforms.map((pp) => (
                  <div key={pp.id} className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400 capitalize">{pp.platform}</span>
                    <Badge variant="outline" className={pp.status === 'published' ? 'border-green-700 text-green-400' : 'border-red-700 text-red-400'}>
                      {pp.status}
                    </Badge>
                    {pp.platform_url && (
                      <a href={pp.platform_url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400 text-xs">
                        View →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.status === 'draft' && <ApproveButton postId={id} />}
        </div>
      </div>
    </div>
  )
}
