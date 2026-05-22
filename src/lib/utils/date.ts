export function todayScheduledTime(timeUtc: string): Date {
  const [hours, minutes] = timeUtc.split(':').map(Number)
  const now = new Date()
  const scheduled = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes, 0))
  return scheduled
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
