'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

export function InspirationUploader() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('caption', caption)
    formData.append('type', file.type.startsWith('video') ? 'video' : 'image')

    const res = await fetch('/api/inspiration/upload', { method: 'POST', body: formData })
    const data = await res.json()

    setUploading(false)
    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
    } else {
      setFile(null)
      setCaption('')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragging ? 'border-zinc-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-600'
        }`}
        onClick={() => document.getElementById('inspiration-file-input')?.click()}
      >
        <Upload size={20} className="mx-auto text-zinc-600 mb-2" />
        {file ? (
          <p className="text-zinc-300 text-sm">{file.name}</p>
        ) : (
          <p className="text-zinc-600 text-sm">Drop image or video here, or click to browse</p>
        )}
        <input
          id="inspiration-file-input"
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inspiration-caption" className="text-zinc-500 text-xs uppercase tracking-wider">Note (optional)</Label>
        <Input
          id="inspiration-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Why do you love this?"
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-white text-black hover:bg-zinc-200"
      >
        {uploading ? 'Uploading & Analyzing…' : 'Upload Inspiration'}
      </Button>
    </div>
  )
}
