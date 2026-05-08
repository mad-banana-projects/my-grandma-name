'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InviteForm({ memberCount }: { memberCount: number }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (memberCount >= 10) {
    return <p className="text-sm text-muted-foreground">You've reached the 10-member limit.</p>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, relationship }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to send invite. Please try again.')
      } else {
        setSuccess(true)
        setEmail('')
        setFirstName('')
        setLastName('')
        setRelationship('')
        router.refresh()
      }
    } catch {
      setError('Failed to send invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite a family member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-first-name">First name</Label>
              <Input
                id="invite-first-name"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-last-name">Last name</Label>
              <Input
                id="invite-last-name"
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="jane@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-relationship">
              Relationship{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="invite-relationship"
              placeholder="e.g. Daughter, Son-in-law"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-700">Invite sent!</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending…' : 'Send invite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
