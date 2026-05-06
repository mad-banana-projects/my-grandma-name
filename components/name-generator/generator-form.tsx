'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ANON_LIMIT = 2
const SESSION_KEY = 'grandma_name_uses'

type Result = {
  winner: { name: string }
  runnerUp: { name: string }
  explanation: string
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

function getSessionUses(): number {
  try {
    return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10)
  } catch {
    return 0
  }
}

function incrementSessionUses() {
  try {
    sessionStorage.setItem(SESSION_KEY, String(getSessionUses() + 1))
  } catch {
    // sessionStorage unavailable — fail silently
  }
}

export function GeneratorForm({ isSignedIn, isPaidGrandma }: { isSignedIn: boolean; isPaidGrandma: boolean }) {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [nameToAvoid, setNameToAvoid] = useState('')
  const [style, setStyle] = useState<string>('')
  const [vibe, setVibe] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const [emailInput, setEmailInput] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const resultRef = useRef<HTMLDivElement>(null)

  // Scroll to results when they appear
  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    // Anonymous session limit check
    if (!isSignedIn && getSessionUses() >= ANON_LIMIT) {
      setError("You've used your free generations. Sign up for 2 more — it's free.")
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
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      if (!isSignedIn) incrementSessionUses()
      setResult(data)
      setEmailSent(false)
      setEmailError(null)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailCertificate(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
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
      const params = new URLSearchParams({ grandmaName: result.winner.name })
      router.push(`/signup/grandma?${params.toString()}`)
    }
    // Free and paid grandma save flows handled in future iterations
  }

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
            {error.includes('Sign up') && (
              <a href="/signup/grandma" className="ml-1 underline underline-offset-2">Sign up free →</a>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Finding your name…' : 'Find my grandma name'}
        </Button>
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
                  {isSignedIn && isPaidGrandma ? 'Save to profile' : 'Save to profile'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>

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
        </div>
      )}
    </div>
  )
}
