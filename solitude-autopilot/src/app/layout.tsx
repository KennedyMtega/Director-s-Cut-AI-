import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { SchedulerBoot } from '@/components/SchedulerBoot'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Solitude Autopilot',
  description: 'Automated short-form video for @solitude_script',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-dvh flex bg-background text-foreground font-[var(--font-inter)]">
        <Sidebar />
        <SchedulerBoot />
        <main className="flex-1 ml-0 md:ml-[var(--sidebar-width)] min-h-dvh overflow-x-hidden">
          <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
