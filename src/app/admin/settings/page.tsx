import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/admin/Header'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('settings').select('*').single()

  return (
    <div>
      <Header title="Settings" description="Configure background video, schedule, and platform connections" />
      <SettingsForm settings={settings} />
    </div>
  )
}
