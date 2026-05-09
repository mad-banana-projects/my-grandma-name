'use client'

import { useEffect, useRef, useState } from 'react'

import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Result = {
  winner: { name: string }
  runnerUp: { name: string }
  explanation: string
  usesRemaining?: number
}

const STYLES = [
  { value: 'classic', label: 'Classic' },
  { value: 'playful', label: 'Playful' },
  { value: 'modern', label: 'Modern' },
] as const

const VIBES = [
  { value: 'timeless', label: 'Timeless' },
  { value: 'sweet', label: 'Sweet' },
  { value: 'stylish', label: 'Stylish / Modern' },
  { value: 'playful', label: 'Playful' },
  { value: 'cozy', label: 'Cozy' },
] as const

interface GeneratorFormProps {
  isSignedIn: boolean
  isPaidGrandma: boolean
  anonUsesRemaining: number | null
  freeUsesRemaining: number | null
}

export function GeneratorForm({ isSignedIn, isPaidGrandma, anonUsesRemaining, freeUsesRemaining }: GeneratorFormProps) {
  const [firstName, setFirstName] = useState('')
  const [nameToAvoid, setNameToAvoid] = useState('')
  const [style, setStyle] = useState<string>('')
  const [vibe, setVibe] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  // Tracks remaining anonymous uses; initialized from server-read cookie
  const [anonUsesLeft, setAnonUsesLeft] = useState<number | null>(anonUsesRemaining)
  // Tracks remaining free-tier uses; initialized from server-read DB value
  const [freeUsesLeft, setFreeUsesLeft] = useState<number | null>(freeUsesRemaining)

  const [showAccountPrompt, setShowAccountPrompt] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const [emailInput, setEmailInput] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    // Pre-flight check so we don't hit the API unnecessarily
    if (!isSignedIn && anonUsesLeft !== null && anonUsesLeft <= 0) {
      setShowAccountPrompt(true)
      return
    }
    if (isSignedIn && !isPaidGrandma && freeUsesLeft !== null && freeUsesLeft <= 0) {
      setShowUpgradePrompt(true)
      return
    }

    if (!style) { setError('Choose a preferred style.'); return }
    if (!vibe) { setError('Choose a preferred vibe.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, nameToAvoid, style, vibe }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429 && !isSignedIn) {
          setShowAccountPrompt(true)
          return
        }
        if (res.status === 429 && isSignedIn && !isPaidGrandma) {
          setShowUpgradePrompt(true)
          return
        }
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setResult(data)
      setEmailSent(false)
      setEmailError(null)

      // Keep client counts in sync with authoritative server values
      if (!isSignedIn && typeof data.usesRemaining === 'number') {
        setAnonUsesLeft(data.usesRemaining)
      }
      if (isSignedIn && !isPaidGrandma && typeof data.usesRemaining === 'number') {
        setFreeUsesLeft(data.usesRemaining)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailCertificate(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
    if (!isSignedIn) {
      setShowAccountPrompt(true)
      return
    }
    if (!isPaidGrandma) {
      setShowUpgradePrompt(true)
      return
    }
    setEmailSending(true)
    setEmailError(null)

    try {
      const res = await fetch('/api/email/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          winnerName: result.winner.name,
          runnerUpName: result.runnerUp.name,
          explanation: result.explanation,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setEmailError(data.error ?? 'Failed to send. Please try again.')
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Failed to send. Please try again.')
    } finally {
      setEmailSending(false)
    }
  }

  function handleSaveToProfile() {
    if (!result) return
    if (!isSignedIn) {
      setShowAccountPrompt(true)
      return
    }
    if (!isPaidGrandma) {
      setShowUpgradePrompt(true)
      return
    }
    // Paid save flow — TODO
  }

  const limitReached = !isSignedIn && anonUsesLeft !== null && anonUsesLeft <= 0

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Your first name</Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Margaret"
            maxLength={50}
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameToAvoid">Name you don't want to be called <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="nameToAvoid"
            name="nameToAvoid"
            type="text"
            placeholder="Grandma"
            maxLength={50}
            value={nameToAvoid}
            onChange={(e) => setNameToAvoid(e.target.value)}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium leading-none">Preferred style</legend>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(({ value, label }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  style === value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground/40'
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={value}
                  className="sr-only"
                  checked={style === value}
                  onChange={() => setStyle(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium leading-none">Preferred vibe</legend>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(({ value, label }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  vibe === value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground/40'
                }`}
              >
                <input
                  type="radio"
                  name="vibe"
                  value={value}
                  className="sr-only"
                  checked={vibe === value}
                  onChange={() => setVibe(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Finding your name…' : 'Find my grandma name'}
          </Button>
          {!isSignedIn && anonUsesLeft !== null && (
            <p className="text-center text-xs text-muted-foreground">
              {limitReached
                ? <>Limit reached. <a href="/signup/grandma" className="underline underline-offset-2 hover:text-foreground">Create a free account</a> for more.</>
                : <>{anonUsesLeft} free {anonUsesLeft === 1 ? 'generation' : 'generations'} remaining</>
              }
            </p>
          )}
          {isSignedIn && !isPaidGrandma && freeUsesLeft !== null && (
            <p className="text-center text-xs text-muted-foreground">
              {freeUsesLeft <= 0
                ? <>Limit reached. <a href="/subscribe" className="underline underline-offset-2 hover:text-foreground">Upgrade</a> for more.</>
                : <>{freeUsesLeft} {freeUsesLeft === 1 ? 'generation' : 'generations'} remaining</>
              }
            </p>
          )}
        </div>
      </form>

      {result && (
        <div ref={resultRef} className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Your grandma name is</p>
              <CardTitle className="text-4xl font-semibold tracking-tight">{result.winner.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">{result.explanation}</p>
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Runner-up: </span>
                <span className="font-medium">{result.runnerUp.name}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button size="sm" onClick={handleSaveToProfile}>
                  Save to profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  Try again
                </Button>
              </div>

              <Dialog open={showAccountPrompt} onOpenChange={setShowAccountPrompt}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a free account</DialogTitle>
                    <DialogDescription>
                      Sign up to save your grandma name, email your results, and build your gift registry.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <a
                      href={`/signup/grandma?grandmaName=${encodeURIComponent(result?.winner.name ?? '')}`}
                      className={cn(buttonVariants())}
                    >
                      Create free account
                    </a>
                    <a
                      href="/login"
                      className={cn(buttonVariants({ variant: 'outline' }))}
                    >
                      Sign in
                    </a>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upgrade to unlock</DialogTitle>
                    <DialogDescription>
                      Saving your grandma name and emailing your results are available on paid plans.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <a href="/subscribe" className={cn(buttonVariants())}>
                      Upgrade
                    </a>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {isSignedIn && !isPaidGrandma ? (
            <Card className="rounded-lg border-dashed opacity-80">
              <CardContent className="flex items-start gap-4 py-6">
                <div className="mt-0.5 rounded-full bg-muted p-2 shrink-0">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">Email this to yourself</p>
                  <p className="text-sm text-muted-foreground">
                    Email your grandma name certificate with a paid subscription.
                  </p>
                </div>
                <a
                  href="/subscribe"
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
                >
                  Upgrade
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="text-base">Email this to yourself</CardTitle>
              </CardHeader>
              <CardContent>
                {emailSent ? (
                  <p className="text-sm text-emerald-700">Sent! Check your inbox for your grandma name certificate.</p>
                ) : (
                  <form onSubmit={handleEmailCertificate} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" variant="outline" disabled={emailSending}>
                      {emailSending ? 'Sending…' : 'Send'}
                    </Button>
                  </form>
                )}
                {emailError && (
                  <p className="mt-2 text-sm text-destructive">{emailError}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Shown when limit is hit before a result is visible */}
      {!result && (
        <Dialog open={showAccountPrompt} onOpenChange={setShowAccountPrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a free account</DialogTitle>
              <DialogDescription>
                Sign up to save your grandma name, email your results, and build your gift registry.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <a href="/signup/grandma" className={cn(buttonVariants())}>
                Create free account
              </a>
              <a href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
                Sign in
              </a>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
