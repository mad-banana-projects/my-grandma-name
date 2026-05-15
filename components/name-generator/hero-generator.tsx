'use client'

import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

type Result = {
  winner: { name: string }
  runnerUp: { name: string }
  explanation: string
  usesRemaining?: number
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition-colors',
        selected
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-white text-foreground/70 hover:border-primary/50 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

interface HeroGeneratorProps {
  anonUsesRemaining: number
  isSignedIn?: boolean
  isPaidGrandma?: boolean
  freeUsesRemaining?: number | null
}

export function HeroGenerator({
  anonUsesRemaining,
  isSignedIn = false,
  isPaidGrandma = false,
  freeUsesRemaining = null,
}: HeroGeneratorProps) {
  const [firstName, setFirstName] = useState('')
  const [nameToAvoid, setNameToAvoid] = useState('')
  const [style, setStyle] = useState('')
  const [vibe, setVibe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [anonUsesLeft, setAnonUsesLeft] = useState(anonUsesRemaining)
  const [freeUsesLeft, setFreeUsesLeft] = useState(freeUsesRemaining)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const limitReached =
    (!isSignedIn && anonUsesLeft <= 0) ||
    (isSignedIn && !isPaidGrandma && freeUsesLeft !== null && freeUsesLeft <= 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isSignedIn && anonUsesLeft <= 0) return
    if (isSignedIn && !isPaidGrandma && freeUsesLeft !== null && freeUsesLeft <= 0) {
      setShowUpgradePrompt(true)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, nameToAvoid, style, vibe }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429 && isSignedIn && !isPaidGrandma) {
          setShowUpgradePrompt(true)
          return
        }
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setResult(data)
        if (!isSignedIn && typeof data.usesRemaining === 'number') {
          setAnonUsesLeft(data.usesRemaining)
        }
        if (isSignedIn && !isPaidGrandma && typeof data.usesRemaining === 'number') {
          setFreeUsesLeft(data.usesRemaining)
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">

      {/* Generator form card */}
      <div className="rounded-3xl bg-white px-14 py-8 shadow-[0_4px_32px_rgba(53,51,48,0.12)]">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Row 1: first name + name to avoid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Input
              id="hero-first-name"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              id="hero-name-avoid"
              placeholder="Name to avoid (optional)"
              value={nameToAvoid}
              onChange={(e) => setNameToAvoid(e.target.value)}
            />
          </div>

          {/* Row 2: preferred style + preferred vibe */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Preferred style</Label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <PillButton
                    key={s.value}
                    selected={style === s.value}
                    onClick={() => setStyle(style === s.value ? '' : s.value)}
                  >
                    {s.label}
                  </PillButton>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred vibe</Label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <PillButton
                    key={v.value}
                    selected={vibe === v.value}
                    onClick={() => setVibe(vibe === v.value ? '' : v.value)}
                  >
                    {v.label}
                  </PillButton>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: submit + rate limit display */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={loading || !firstName || (!isSignedIn && anonUsesLeft <= 0)}
              className="w-full sm:w-auto"
            >
              {loading ? 'Finding your name…' : 'Find my grandma name'}
            </Button>

            {/* Anon limit */}
            {!isSignedIn && (
              <p className="text-xs text-muted-foreground">
                {anonUsesLeft > 0
                  ? `${anonUsesLeft} free ${anonUsesLeft === 1 ? 'generation' : 'generations'} remaining`
                  : 'Limit reached — create an account for more'}
              </p>
            )}

            {/* Free-tier limit */}
            {isSignedIn && !isPaidGrandma && freeUsesLeft !== null && (
              <p className="text-xs text-muted-foreground">
                {freeUsesLeft > 0
                  ? `${freeUsesLeft} ${freeUsesLeft === 1 ? 'generation' : 'generations'} remaining`
                  : <>Limit reached. <a href="/subscribe" className="underline underline-offset-2 hover:text-foreground">Upgrade</a> for more.</>}
              </p>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 border-t border-border pt-8 space-y-6">

            {/* Winner */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Your grandma name is
              </p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <h2 className="font-heading text-5xl font-light tracking-tight">
                  {result.winner.name}
                </h2>
                {!isPaidGrandma && (
                  <a
                    href={
                      isSignedIn
                        ? `/subscribe?grandmaName=${encodeURIComponent(result.winner.name)}`
                        : `/signup?grandmaName=${encodeURIComponent(result.winner.name)}&intent=subscribe`
                    }
                    className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
                  >
                    {isSignedIn ? 'Upgrade to save' : 'Subscribe to save'}
                  </a>
                )}
              </div>
            </div>

            {/* Explanation */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {result.explanation}
            </p>

            {/* Runner-up */}
            <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm gap-4">
              <div>
                <span className="text-muted-foreground">Runner-up: </span>
                <span className="font-medium">{result.runnerUp.name}</span>
              </div>
              {!isPaidGrandma && (
                <a
                  href={
                    isSignedIn
                      ? `/subscribe?grandmaName=${encodeURIComponent(result.runnerUp.name)}`
                      : `/signup?grandmaName=${encodeURIComponent(result.runnerUp.name)}&intent=subscribe`
                  }
                  className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'shrink-0 h-7 px-2 text-xs')}
                >
                  {isSignedIn ? 'Upgrade to save' : 'Subscribe to save'}
                </a>
              )}
            </div>

            {/* Try again */}
            <Button variant="outline" onClick={() => setResult(null)}>
              Try again
            </Button>

          </div>
        )}
      </div>

      {/* Upgrade prompt dialog */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to unlock</DialogTitle>
            <DialogDescription>
              You've reached your free generation limit. Upgrade for unlimited name generations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <a href="/subscribe" className={cn(buttonVariants())}>
              Upgrade
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
