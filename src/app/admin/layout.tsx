import { Sidebar } from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main
        className="flex-1 overflow-auto pt-16 px-4 pb-8 md:pt-8 md:px-8"
        style={{ paddingLeft: undefined }}
      >
        {children}
      </main>
    </div>
  )
}
