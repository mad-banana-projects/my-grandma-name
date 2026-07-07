'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUpGrandma, type GrandmaSignupState } from '@/app/(auth)/signup/actions'

const NAME_LIMIT = 30
const NAME_THRESHOLD = Math.floor(NAME_LIMIT * 0.8) // 24
const PHONE_LIMIT = 10
const PHONE_THRESHOLD = Math.floor(PHONE_LIMIT * 0.8) // 8
const PASSWORD_MAX = 50

function lettersOnly(value: string): string {
  return value.replace(/[^\p{L}]/gu, '')
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function CharCounter({ value, limit, threshold }: { value: string; limit: number; threshold: number }) {
  if (value.length < threshold) return null
  return (
    <p className="text-right text-xs text-muted-foreground">{value.length} / {limit}</p>
  )
}

function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 2) return 'weak'
  if (score <= 3) return 'fair'
  return 'strong'
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const strength = getPasswordStrength(password)
  const config = {
    weak:   { label: 'Weak',   width: 'w-1/3',  color: 'bg-destructive' },
    fair:   { label: 'Fair',   width: 'w-2/3',  color: 'bg-amber-500' },
    strong: { label: 'Strong', width: 'w-full', color: 'bg-emerald-600' },
  }[strength]
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${config.width} ${config.color}`} />
      </div>
      <p className="text-xs text-muted-foreground">{config.label}</p>
    </div>
  )
}

const initialState: GrandmaSignupState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Creating account…' : 'Create Free Account'}
    </Button>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-sm text-destructive">{errors[0]}</p>
}

interface GrandmaSignupFormProps {
  grandmaName?: string | null
}

export function GrandmaSignupForm({ grandmaName }: GrandmaSignupFormProps) {
  const [state, formAction] = useActionState(signUpGrandma, initialState)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setClientError(null)
    if (password.trim() !== confirmPassword.trim()) {
      e.preventDefault()
      setClientError('Passwords do not match.')
    }
  }

  return (
    <Card className="w-full max-w-lg rounded-lg">
      <CardHeader>
        <CardDescription>
          {grandmaName
            ? <>Create a free account to save <span className="font-medium text-foreground">{grandmaName}</span> to your profile. You can add more details and upgrade anytime.</>
            : 'Free to join. You can add more details and upgrade anytime.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
          {/* Grandma name — only shown when coming from the name generator */}
          {grandmaName != null && (
            <div className="space-y-2">
              <Input
                id="grandmaName"
                name="grandmaName"
                type="text"
                placeholder="Your grandma name"
                defaultValue={grandmaName}
                aria-label="Grandma name"
              />
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                autoComplete="given-name"
                required
                maxLength={NAME_LIMIT}
                value={firstName}
                onChange={(e) => setFirstName(lettersOnly(e.target.value))}
                aria-invalid={Boolean(state.fieldErrors?.firstName)}
              />
              <CharCounter value={firstName} limit={NAME_LIMIT} threshold={NAME_THRESHOLD} />
              <FieldError errors={state.fieldErrors?.firstName} />
            </div>
            <div className="space-y-1">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                autoComplete="family-name"
                required
                maxLength={NAME_LIMIT}
                value={lastName}
                onChange={(e) => setLastName(lettersOnly(e.target.value))}
                aria-invalid={Boolean(state.fieldErrors?.lastName)}
              />
              <CharCounter value={lastName} limit={NAME_LIMIT} threshold={NAME_THRESHOLD} />
              <FieldError errors={state.fieldErrors?.lastName} />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              required
              maxLength={PHONE_LIMIT}
              value={phone}
              onChange={(e) => setPhone(digitsOnly(e.target.value))}
              aria-invalid={Boolean(state.fieldErrors?.phone)}
            />
            <CharCounter value={phone} limit={PHONE_LIMIT} threshold={PHONE_THRESHOLD} />
            <FieldError errors={state.fieldErrors?.phone} />
          </div>

          {/* Text opt-in */}
          <div className="flex items-start gap-2.5">
            <input
              id="textUpdatesOptIn"
              name="textUpdatesOptIn"
              type="checkbox"
              className="h-4 w-4 mt-0.5 rounded border-input accent-foreground shrink-0"
            />
            <label htmlFor="textUpdatesOptIn" className="text-sm text-muted-foreground cursor-pointer leading-snug">
              I agree to receive text messages from My Grandma Name. Message Frequency varies. Msg &amp; data rates may apply. Reply STOP or unselect this checkbox on your profile to unsubscribe.
            </label>
          </div>

          <hr className="border-border" />

          {/* Email */}
          <div className="space-y-1">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            <FieldError errors={state.fieldErrors?.email} />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              maxLength={PASSWORD_MAX}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setClientError(null) }}
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            <PasswordStrengthBar password={password} />
            <FieldError errors={state.fieldErrors?.password} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
              maxLength={PASSWORD_MAX}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setClientError(null) }}
              aria-invalid={Boolean(clientError || state.fieldErrors?.confirmPassword)}
            />
            {clientError && <p className="text-sm text-destructive">{clientError}</p>}
            <FieldError errors={state.fieldErrors?.confirmPassword} />
          </div>

          {state.message ? (
            <div
              className={
                state.status === 'success'
                  ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950'
                  : 'rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive'
              }
              role={state.status === 'error' ? 'alert' : 'status'}
            >
              {state.message}
            </div>
          ) : null}

          <SubmitButton />
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already Have an Account?{' '}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
