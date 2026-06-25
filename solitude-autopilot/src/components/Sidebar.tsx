'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, BookOpen, Clock, BarChart2, Settings, Image, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Quotes Library', icon: BookOpen },
  { href: '/schedule', label: 'Schedule', icon: Clock },
  { href: '/backgrounds', label: 'Backgrounds', icon: Image },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const inner = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border">
        <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground tracking-widest uppercase">Autopilot</p>
        <p className="text-[length:var(--text-fluid-lg)] font-semibold font-[var(--font-playfair)] text-foreground mt-0.5">@solitude_script</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-[length:var(--text-fluid-sm)] transition-colors',
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              ].join(' ')}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[length:var(--text-fluid-xs)] text-muted-foreground">Solitude Autopilot v1</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-card border border-border text-foreground"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={[
        'fixed inset-y-0 left-0 z-40 w-[var(--sidebar-width)] bg-sidebar border-r border-border transition-transform duration-200',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        {inner}
      </aside>
    </>
  )
}
