import { NextRequest } from 'next/server'

export function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.CRON_SECRET
}
