'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'

export function ContentGenerateForm() {
  const router = useRouter()
  const [themeHint, setThemeHint] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')

    const res = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeHint: themeHint.trim() || undefined }),
    })

    const data = await res.json()
    setGenerating(false)

    if (!res.ok) {
      setError(data.error ?? 'Generation failed')
    } else {
      router.push(`/admin/content/${data.post.id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="theme-hint" className="text-zinc-400 text-xs uppercase tracking-wider">Theme Hint (optional)</Label>
        <Input
          id="theme-hint"
          value={themeHint}
          onChange={(e) => setThemeHint(e.target.value)}
          placeholder="e.g. letting go, the weight of silence, new beginnings…"
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
        />
        <p className="text-zinc-600 text-xs">Leave blank and the AI will choose freely from your inspiration board.</p>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-white text-black hover:bg-zinc-200"
      >
        <Sparkles size={14} className="mr-2" />
        {generating ? 'Generating…' : 'Generate Content'}
      </Button>
    </div>
  )
}
