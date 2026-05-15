'use client'

import Link from 'next/link'
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

const initialState: GrandmaSignupState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Creating account…' : 'Create free account'}
    </Button>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="text-sm text-destructive">{errors[0]}</p>
}

export function GrandmaSignupForm() {
  const [state, formAction] = useActionState(signUpGrandma, initialState)

  return (
    <Card className="w-full max-w-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Free to join. You can add more details and upgrade anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                autoComplete="given-name"
                required
                aria-invalid={Boolean(state.fieldErrors?.firstName)}
              />
              <FieldError errors={state.fieldErrors?.firstName} />
            </div>
            <div className="space-y-2">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                autoComplete="family-name"
                required
                aria-invalid={Boolean(state.fieldErrors?.lastName)}
              />
              <FieldError errors={state.fieldErrors?.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              required
              placeholder="Tell a little about yourself..."
              aria-invalid={Boolean(state.fieldErrors?.bio)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <FieldError errors={state.fieldErrors?.bio} />
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              minLength={8}
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            <FieldError errors={state.fieldErrors?.password} />
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
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
