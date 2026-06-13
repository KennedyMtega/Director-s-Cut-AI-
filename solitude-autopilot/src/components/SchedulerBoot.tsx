'use client'

import { useEffect } from 'react'

export function SchedulerBoot() {
  useEffect(() => {
    // Ping the startup endpoint once so node-cron starts in the server process
    fetch('/api/startup').catch(() => {})
  }, [])
  return null
}
