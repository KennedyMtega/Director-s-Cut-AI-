'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentPost } from '@/types/database'
import { CheckCircle, Trash2, Clock } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  approved: 'bg-blue-900 text-blue-300',
  rendering: 'bg-yellow-900 text-yellow-300',
  ready: 'bg-green-900 text-green-300',
  posted: 'bg-purple-900 text-purple-300',
  failed: 'bg-red-900 text-red-300',
}

export function PostCard({ post }: { post: ContentPost }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/content/approve/${post.id}`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    setLoading(true)
    await fetch(`/api/content/delete/${post.id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/admin/content/${post.id}`} className="block">
              <p className="text-white text-sm font-light leading-relaxed whitespace-pre-line line-clamp-3 hover:text-zinc-300 transition-colors">
                {post.text_overlay}
              </p>
            </Link>
            <p className="text-zinc-600 text-xs mt-2 line-clamp-1">{post.caption}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                {post.status}
              </span>
              {post.scheduled_for && (
                <span className="flex items-center gap-1 text-zinc-600 text-xs">
                  <Clock size={11} />
                  {new Date(post.scheduled_for).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {post.rendered_video_url && (
            <video
              src={post.rendered_video_url}
              className="w-16 h-28 object-cover rounded-md bg-zinc-900"
              muted
            />
          )}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
          {post.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={loading}
              className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <CheckCircle size={12} className="mr-1" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-red-500 hover:text-red-400 hover:bg-red-950"
          >
            <Trash2 size={12} className="mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
