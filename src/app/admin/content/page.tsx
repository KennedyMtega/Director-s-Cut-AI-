import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { PostCard } from '@/components/admin/PostCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { ContentPost } from '@/types/database'

export default async function ContentQueuePage() {
  const supabase = await createClient()

  const { data: postsRaw } = await supabase
    .from('content_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const posts = (postsRaw ?? []) as ContentPost[]

  const grouped: Record<ContentPost['status'], ContentPost[]> = {
    draft: posts.filter((p) => p.status === 'draft'),
    approved: posts.filter((p) => p.status === 'approved'),
    rendering: posts.filter((p) => p.status === 'rendering'),
    ready: posts.filter((p) => p.status === 'ready'),
    posted: posts.filter((p) => p.status === 'posted'),
    failed: posts.filter((p) => p.status === 'failed'),
  }

  return (
    <div>
      <Header
        title="Content Queue"
        description={`${posts.length} total posts`}
        actions={
          <Link href="/admin/content/new">
            <Button className="bg-white text-black hover:bg-zinc-200 text-sm">New Post</Button>
          </Link>
        }
      />

      {Object.entries(grouped).map(([status, items]) => items.length > 0 && (
        <section key={status} className="mb-8">
          <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3 capitalize">{status} ({items.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      ))}

      {posts.length === 0 && (
        <p className="text-zinc-600 text-sm">No content yet. Generate your first post.</p>
      )}
    </div>
  )
}
