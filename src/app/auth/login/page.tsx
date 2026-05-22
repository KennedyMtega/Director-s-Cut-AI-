'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl font-light tracking-widest">SOLITUDE SCRIPT</CardTitle>
          <CardDescription className="text-zinc-500">Director's Cut AI — Admin Access</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-zinc-300 text-sm text-center">
              Check your email. A magic link was sent to <span className="text-white">{email}</span>.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200"
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
