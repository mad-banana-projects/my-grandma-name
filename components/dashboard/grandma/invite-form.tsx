'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InviteForm({ memberCount, className }: { memberCount: number; className?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (memberCount >= 10) {
    return <p className="text-sm text-muted-foreground">You've reached the 10-member limit.</p>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, relationship }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to create invite. Please try again.')
      } else {
        setInviteUrl(data.inviteUrl)
        router.refresh()
      }
    } catch {
      setError('Failed to create invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleInviteAnother() {
    setInviteUrl(null)
    setEmail('')
    setFirstName('')
    setLastName('')
    setRelationship('')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Invite a family member</CardTitle>
      </CardHeader>
      <CardContent>
        {inviteUrl ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">
                {firstName ? `${firstName} has been added.` : 'Member added.'} Share this link with them:
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="font-mono text-xs text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Once they click the link and sign in, they'll have read-only access to your registry.
              </p>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={handleInviteAnother}>
              Invite another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <Input
              type="email"
              placeholder="Email *"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Relationship (optional)"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-1/2 mx-auto block">
              {loading ? 'Creating…' : 'Create invite'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
