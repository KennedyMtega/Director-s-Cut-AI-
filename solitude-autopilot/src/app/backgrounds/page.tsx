'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, Video } from 'lucide-react'

export default function BackgroundsPage() {
  const [files, setFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const d = await fetch('/api/backgrounds').then(r => r.json())
    setFiles(d.backgrounds ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setMsg('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/backgrounds', { method: 'POST', body: fd }).then(r => r.json())
    setUploading(false)
    if (res.success) { setMsg(`✓ Uploaded ${res.filename}`); load() }
    else setMsg(`✗ ${res.error}`)
    e.target.value = ''
  }

  async function handleDelete(filename: string) {
    if (!confirm(`Delete ${filename}?`)) return
    await fetch('/api/backgrounds', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--text-fluid-2xl)] font-bold font-[var(--font-playfair)]">Background Videos</h1>
        <p className="text-muted-foreground text-[length:var(--text-fluid-sm)] mt-1">
          Add MP4 videos here. They'll be blurred behind your quotes. You can also drop files directly into the <code className="bg-secondary px-1 rounded">backgrounds/</code> folder.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">Upload a Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="cursor-pointer block">
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <div className={`border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-[length:var(--text-fluid-sm)] text-muted-foreground">{uploading ? 'Uploading…' : 'Click to select an MP4/MOV/WebM file'}</p>
            </div>
          </label>
          {msg && <p className={`text-[length:var(--text-fluid-sm)] ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-destructive'}`}>{msg}</p>}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-[length:var(--text-fluid-base)]">{files.length} Video{files.length !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-[length:var(--text-fluid-sm)]">
              <Video size={32} className="mx-auto mb-2 opacity-40" />
              <p>No backgrounds yet. Upload a video or drop MP4 files into the <code className="bg-secondary px-1 rounded">backgrounds/</code> folder.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(f => (
                <div key={f} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Video size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-[length:var(--text-fluid-sm)] truncate">{f}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(f)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
