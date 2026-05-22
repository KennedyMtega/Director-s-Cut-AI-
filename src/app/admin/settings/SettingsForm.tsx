'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Settings } from '@/types/database'

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [postTime, setPostTime] = useState(settings?.post_time_utc ?? '14:00:00')
  const [hashtags, setHashtags] = useState((settings?.default_hashtags ?? []).join(', '))
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('settings') as any)
      .update({
        post_time_utc: postTime,
        default_hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean),
      })
      .not('id', 'is', null)

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Saved')
    if (!error) router.refresh()
  }

  async function handleBgVideoUpload() {
    if (!bgVideoFile) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', bgVideoFile)
    formData.append('type', 'video')

    const res = await fetch('/api/inspiration/upload', { method: 'POST', body: formData })
    const data = await res.json() as { item?: { cloudinary_url?: string; cloudinary_public_id?: string } }

    if (res.ok && data.item) {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('settings') as any).update({
        background_video_url: data.item.cloudinary_url,
        background_video_public_id: data.item.cloudinary_public_id,
      }).not('id', 'is', null)
      setMessage('Background video updated')
      router.refresh()
    }

    setUploading(false)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm font-light">Background Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings?.background_video_url && (
            <video src={settings.background_video_url} loop muted autoPlay className="w-32 h-56 object-cover rounded-lg" />
          )}
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Upload New Video</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setBgVideoFile(e.target.files?.[0] ?? null)}
              className="bg-zinc-900 border-zinc-700 text-white text-sm"
            />
          </div>
          <Button
            onClick={handleBgVideoUpload}
            disabled={!bgVideoFile || uploading}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {uploading ? 'Uploading…' : 'Update Background Video'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm font-light">Posting Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Daily Post Time (UTC)</Label>
            <Input
              type="time"
              value={postTime.slice(0, 5)}
              onChange={(e) => setPostTime(e.target.value + ':00')}
              className="bg-zinc-900 border-zinc-700 text-white w-36"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Default Hashtags (comma-separated)</Label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {message && <p className="text-zinc-400 text-sm">{message}</p>}

      <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200">
        {saving ? 'Saving…' : 'Save Settings'}
      </Button>
    </div>
  )
}
