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
import { Label } from '@/components/ui/label'
import { signUpGrandma, type GrandmaSignupState } from '@/app/(auth)/signup/grandma/actions'

const initialState: GrandmaSignupState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Creating account...' : 'Create grandma account'}
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
        <CardTitle className="text-xl">Create your registry</CardTitle>
        <CardDescription>
          Set up your grandma profile so family can find the right gifts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                aria-invalid={Boolean(state.fieldErrors?.firstName)}
              />
              <FieldError errors={state.fieldErrors?.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                aria-invalid={Boolean(state.fieldErrors?.lastName)}
              />
              <FieldError errors={state.fieldErrors?.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grandmaName">Grandma name</Label>
            <Input
              id="grandmaName"
              name="grandmaName"
              type="text"
              placeholder="Mimi, Nana, Gigi…"
              autoComplete="nickname"
              required
              aria-invalid={Boolean(state.fieldErrors?.grandmaName)}
            />
            <FieldError errors={state.fieldErrors?.grandmaName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              required
              aria-invalid={Boolean(state.fieldErrors?.birthday)}
            />
            <FieldError errors={state.fieldErrors?.birthday} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(state.fieldErrors?.phoneNumber)}
            />
            <FieldError errors={state.fieldErrors?.phoneNumber} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About you</Label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              required
              placeholder="Tell your family a little about yourself…"
              aria-invalid={Boolean(state.fieldErrors?.bio)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <FieldError errors={state.fieldErrors?.bio} />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="textUpdatesOptIn"
              name="textUpdatesOptIn"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="textUpdatesOptIn" className="font-normal">
              I'd like to receive text updates (optional)
            </Label>
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            <FieldError errors={state.fieldErrors?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
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
