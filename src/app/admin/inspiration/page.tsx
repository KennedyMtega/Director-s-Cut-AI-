import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { InspirationGrid } from '@/components/admin/InspirationGrid'
import { InspirationUploader } from '@/components/admin/InspirationUploader'
import type { InspirationItem, Settings } from '@/types/database'

export default async function InspirationPage() {
  const supabase = await createClient()

  const [{ data: itemsRaw }, { data: settingsRaw }] = await Promise.all([
    supabase.from('inspiration_items').select('*').order('created_at', { ascending: false }),
    supabase.from('settings').select('brand_voice_summary, brand_voice_updated_at').single(),
  ])

  const items = (itemsRaw ?? []) as InspirationItem[]
  const settings = settingsRaw as Pick<Settings, 'brand_voice_summary' | 'brand_voice_updated_at'> | null

  return (
    <div>
      <Header
        title="Inspiration Board"
        description="Upload content you love — the AI learns your aesthetic from it"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InspirationGrid items={items} />
        </div>

        <div className="space-y-6">
          <InspirationUploader />

          {settings?.brand_voice_summary && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Current Brand Voice</p>
              <p className="text-zinc-400 text-xs leading-relaxed">{settings.brand_voice_summary}</p>
              {settings.brand_voice_updated_at && (
                <p className="text-zinc-700 text-xs mt-2">
                  Updated {new Date(settings.brand_voice_updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
