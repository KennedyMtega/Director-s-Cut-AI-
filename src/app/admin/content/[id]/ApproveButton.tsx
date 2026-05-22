'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function ApproveButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/content/approve/${postId}`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      onClick={handleApprove}
      disabled={loading}
      className="bg-white text-black hover:bg-zinc-200"
    >
      <CheckCircle size={14} className="mr-2" />
      {loading ? 'Approving…' : 'Approve & Render'}
    </Button>
  )
}
