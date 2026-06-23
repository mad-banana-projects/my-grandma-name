'use client'

import { useState, useTransition } from 'react'
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
import { saveGrandmaName } from '@/app/(app)/dashboard/actions'

const CHAR_LIMIT = 30
const COUNTER_THRESHOLD = Math.floor(CHAR_LIMIT * 0.8) // show counter at 24+

function lettersOnly(value: string): string {
  return value.replace(/[^\p{L}]/gu, '')
}

function CharCounter({ value }: { value: string }) {
  if (value.length < COUNTER_THRESHOLD) return null
  return (
    <p className="text-right text-xs text-muted-foreground">{value.length} / {CHAR_LIMIT}</p>
  )
}

const STYLES = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'unique', label: 'Unique' },
  { value: 'playful', label: 'Playful' },
  { value: 'sweet', label: 'Sweet' },
  { value: 'trendy', label: 'Trendy' },
  { value: 'elegant', label: 'Elegant' },
] as const

const FORMATS = [
  { value: 'single-word', label: 'Single-Word' },
  { value: 'multi-word', label: 'Multi-Word' },
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
        'rounded-full border px-4 py-1.5 text-[clamp(12px,1.17vw,15px)] transition-colors',
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
  const [format, setFormat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [anonUsesLeft, setAnonUsesLeft] = useState(anonUsesRemaining)
  const [freeUsesLeft, setFreeUsesLeft] = useState(freeUsesRemaining)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const [pendingName, setPendingName] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSavePending, startSaveTransition] = useTransition()

  const [fieldErrors, setFieldErrors] = useState<{ firstName: boolean; nameToAvoid: boolean; style: boolean; format: boolean }>({ firstName: false, nameToAvoid: false, style: false, format: false })

  const [emailInput, setEmailInput] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

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

  function handleSaveClick(name: string) {
    setSaveError(null)
    setPendingName(name)
  }

  function handleConfirmSave() {
    if (!pendingName) return
    const nameToSave = pendingName
    startSaveTransition(async () => {
      const res = await saveGrandmaName(nameToSave)
      if (res.success) {
        setSavedName(nameToSave)
        setPendingName(null)
      } else {
        setSaveError(res.error)
        setPendingName(null)
      }
    })
  }

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

    const errors = { firstName: !firstName, nameToAvoid: !nameToAvoid, style: !style, format: !format }
    if (errors.firstName || errors.nameToAvoid || errors.style || errors.format) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({ firstName: false, nameToAvoid: false, style: false, format: false })

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, nameToAvoid, style, format }),
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
    <div className="mx-auto w-full max-w-[1030px] px-4">

      {/* Generator form card */}
      <div className="rounded-3xl bg-white px-4 py-6 sm:px-[64px] sm:py-[37px] shadow-[0_4px_32px_rgba(53,51,48,0.12)]">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">

          {/* Row 1: first name + name to avoid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-8">
            <div className="space-y-1">
              <Input
                id="hero-first-name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => { setFirstName(lettersOnly(e.target.value)); setFieldErrors(prev => ({ ...prev, firstName: false })) }}
                maxLength={CHAR_LIMIT}
                className={cn(fieldErrors.firstName && 'ring-2 ring-destructive/60 border-destructive/60')}
              />
              {fieldErrors.firstName
                ? <p className="text-xs text-destructive">Please Enter Your First Name</p>
                : <CharCounter value={firstName} />}
            </div>
            <div className="space-y-1">
              <Input
                id="hero-name-avoid"
                placeholder="Name to Avoid"
                value={nameToAvoid}
                onChange={(e) => { setNameToAvoid(lettersOnly(e.target.value)); setFieldErrors(prev => ({ ...prev, nameToAvoid: false })) }}
                maxLength={CHAR_LIMIT}
                className={cn(fieldErrors.nameToAvoid && 'ring-2 ring-destructive/60 border-destructive/60')}
              />
              {fieldErrors.nameToAvoid
                ? <p className="text-xs text-destructive">Please Enter a Name to Avoid</p>
                : <CharCounter value={nameToAvoid} />}
            </div>
          </div>

          {/* Row 2: preferred style + preferred vibe */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2 text-center">
              <Label className={cn('block text-center sm:text-left text-[clamp(14px,1.41vw,18px)] font-bold [font-family:var(--font-ivy-regular)]', fieldErrors.style && 'text-destructive')}>
                Preferred Style
              </Label>
              <div className={cn('flex flex-wrap justify-center sm:justify-start gap-2 rounded-lg transition-colors', fieldErrors.style && 'ring-2 ring-destructive/60 p-2')}>
                {STYLES.map((s) => (
                  <PillButton
                    key={s.value}
                    selected={style === s.value}
                    onClick={() => { setStyle(style === s.value ? '' : s.value); setFieldErrors(prev => ({ ...prev, style: false })) }}
                  >
                    {s.label}
                  </PillButton>
                ))}
              </div>
              {fieldErrors.style && <p className="text-xs text-destructive">Please Select a Preferred Style</p>}
            </div>
            <div className="space-y-2 text-center">
              <Label className={cn('block text-center sm:text-left text-[clamp(14px,1.41vw,18px)] font-bold [font-family:var(--font-ivy-regular)]', fieldErrors.format && 'text-destructive')}>
                Desired Name Format
              </Label>
              <div className={cn('flex flex-wrap justify-center sm:justify-start gap-2 rounded-lg transition-colors', fieldErrors.format && 'ring-2 ring-destructive/60 p-2')}>
                {FORMATS.map((f) => (
                  <PillButton
                    key={f.value}
                    selected={format === f.value}
                    onClick={() => { setFormat(format === f.value ? '' : f.value); setFieldErrors(prev => ({ ...prev, format: false })) }}
                  >
                    {f.label}
                  </PillButton>
                ))}
              </div>
              {fieldErrors.format && <p className="text-xs text-destructive">Please Select a Name Format</p>}
            </div>
          </div>

          {/* Row 3: submit + rate limit display */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={loading || (!isSignedIn && anonUsesLeft <= 0)}
              className="w-auto bg-[#618985] text-white hover:bg-[#527673] disabled:opacity-100 disabled:bg-[#618985]"
            >
              {loading ? 'Finding Your Name…' : <>Find <em>My</em> Grandma Name</>}
            </Button>

            {/* Anon limit */}
            {!isSignedIn && (
              <p className="text-[clamp(11px,1.09vw,14px)] text-muted-foreground [font-family:var(--font-ivy-regular)]">
                {anonUsesLeft > 0
                  ? `${anonUsesLeft} Free ${anonUsesLeft === 1 ? 'Generation' : 'Generations'} Remaining`
                  : 'Limit reached — create an account for more'}
              </p>
            )}

            {/* Free-tier limit */}
            {isSignedIn && !isPaidGrandma && freeUsesLeft !== null && (
              <p className="text-[18px] text-muted-foreground [font-family:var(--font-arno-italic)]">
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
                {isSignedIn ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleSaveClick(result.winner.name)}
                  >
                    Save to Profile
                  </Button>
                ) : (
                  <a
                    href={`/signup?grandmaName=${encodeURIComponent(result.winner.name)}`}
                    className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
                  >
                    Create Free Account to save
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
              {isSignedIn ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-7 px-2 text-xs"
                  onClick={() => handleSaveClick(result.runnerUp.name)}
                >
                  Save to Profile
                </Button>
              ) : (
                <a
                  href={`/signup?grandmaName=${encodeURIComponent(result.runnerUp.name)}`}
                  className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'shrink-0 h-7 px-2 text-xs')}
                >
                  Create Free Account to save
                </a>
              )}
            </div>

            {savedName && (
              <p className="text-sm text-emerald-700">
                <strong>{savedName}</strong> saved to your profile.
              </p>
            )}
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}

            {/* Email results */}
            <div className="border-t border-border pt-4">
              {emailSent ? (
                <p className="text-sm text-emerald-700">Sent! Check your inbox for your grandma name results.</p>
              ) : (
                <form onSubmit={handleEmailCertificate} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email results to yourself"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" variant="outline" disabled={emailSending} className="self-center">
                    {emailSending ? 'Sending…' : 'Send'}
                  </Button>
                </form>
              )}
              {emailError && (
                <p className="mt-2 text-sm text-destructive">{emailError}</p>
              )}
            </div>

            {/* Try again */}
            <Button onClick={() => { setResult(null); setSavedName(null); setSaveError(null); setEmailSent(false); setEmailError(null); setEmailInput('') }} className="bg-[#8f6593] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-[#7a5580]">
              Try Again
            </Button>

            {/* Save confirmation dialog */}
            <Dialog open={!!pendingName} onOpenChange={(open) => { if (!open) setPendingName(null) }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save to Profile</DialogTitle>
                  <DialogDescription>
                    Please confirm saving <strong>{pendingName}</strong> to your profile.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <Button onClick={handleConfirmSave} disabled={isSavePending}>
                    {isSavePending ? 'Saving…' : 'Confirm'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
