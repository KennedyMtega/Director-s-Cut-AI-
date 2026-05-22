'use client'

import type { InspirationItem } from '@/types/database'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function InspirationGrid({ items }: { items: InspirationItem[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remove this inspiration?')) return
    setDeleting(id)
    await fetch(`/api/inspiration/delete/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeleting(null)
  }

  if (items.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-800 rounded-lg p-12 text-center">
        <p className="text-zinc-600 text-sm">No inspiration items yet.</p>
        <p className="text-zinc-700 text-xs mt-1">Upload images, screenshots, or videos you love.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden">
            {item.type === 'video' ? (
              <video src={item.cloudinary_url} className="w-full h-full object-cover" muted />
            ) : (
              <Image
                src={item.cloudinary_url}
                alt={item.caption ?? 'Inspiration'}
                fill
                className="object-cover"
                sizes="200px"
              />
            )}
          </div>

          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-2">
            {item.ai_analysis && (
              <p className="text-white text-xs leading-relaxed line-clamp-4">{item.ai_analysis}</p>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deleting === item.id}
              className="self-end p-1.5 rounded-full bg-red-900/80 hover:bg-red-800 transition-colors"
            >
              <Trash2 size={12} className="text-red-300" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
