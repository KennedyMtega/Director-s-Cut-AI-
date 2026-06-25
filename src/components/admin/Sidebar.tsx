'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileVideo, BarChart2, Settings,
  TrendingUp, LogOut, Library, Menu, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/content',      label: 'Content',      icon: FileVideo },
  { href: '/admin/overlays',     label: 'Overlays',     icon: Library },
  { href: '/admin/analytics',    label: 'Analytics',    icon: BarChart2 },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings },
  { href: '/admin/monetization', label: 'Monetization', icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navContent = (
    <>
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-white font-light tracking-[0.3em] uppercase" style={{ fontSize: 'var(--text-fluid-xs)' }}>
          Solitude Script
        </h1>
        <p className="text-zinc-600 mt-1" style={{ fontSize: 'var(--text-fluid-xs)' }}>Director's Cut AI</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                active
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
              style={{ fontSize: 'var(--text-fluid-sm)' }}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-900 transition-colors"
          style={{ fontSize: 'var(--text-fluid-sm)' }}
        >
          <LogOut size={15} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-zinc-900 text-zinc-400 hover:text-white"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-950 border-r border-zinc-800
          transition-transform duration-200
          md:translate-x-0 md:static md:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ width: 'var(--sidebar-w)' }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 text-zinc-500 hover:text-white"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {navContent}
      </aside>
    </>
  )
}
