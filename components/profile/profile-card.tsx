'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  updateProfile,
  updateFreeProfile,
  updatePassword,
  type PaidProfileFormValues,
  type FreeProfileFormValues,
} from '@/app/(app)/dashboard/actions'
import { cn } from '@/lib/utils'

const paidSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  email: z.email('Enter a valid email'),
  bio: z.string().min(1, 'Required').max(1000),
  grandma_name: z.string().min(1, 'Required').max(100),
  birthday: z.string().min(1, 'Required'),
  phone_number: z.string().min(1, 'Required').max(30),
  text_updates_opt_in: z.boolean(),
})

const freeSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  email: z.email('Enter a valid email'),
  bio: z.string().min(1, 'Required').max(1000),
  grandma_name: z.string().optional(),
  birthday: z.string().optional(),
  phone_number: z.string().optional(),
  text_updates_opt_in: z.boolean().optional(),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type AllFormValues = z.infer<typeof paidSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export interface UnifiedProfile {
  id: string | null
  first_name: string
  last_name: string
  email: string
  bio: string
  grandma_name: string | null
  birthday: string | null
  phone_number: string | null
  text_updates_opt_in: boolean | null
}

interface ProfileCardProps {
  profile: UnifiedProfile
  role: 'free' | 'grandma'
  subscriptionStatus?: string | null
}

const textareaClass =
  'min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none'

function formatBirthday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function LockedLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground/60">
      <Lock className="h-3 w-3 shrink-0" />
      {children}
      <a
        href="/subscribe"
        className="ml-auto text-xs font-normal underline underline-offset-2 hover:text-muted-foreground transition-colors"
      >
        Upgrade
      </a>
    </span>
  )
}

export function ProfileCard({ profile, role, subscriptionStatus }: ProfileCardProps) {
  const router = useRouter()
  const isPaid = role === 'grandma'

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Password state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null)
  const [isPasswordPending, startPasswordTransition] = useTransition()
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AllFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isPaid ? paidSchema : freeSchema) as any,
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      bio: profile.bio,
      grandma_name: profile.grandma_name ?? '',
      birthday: profile.birthday ?? '',
      phone_number: profile.phone_number ?? '',
      text_updates_opt_in: profile.text_updates_opt_in ?? false,
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  function handleEdit() {
    reset({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      bio: profile.bio,
      grandma_name: profile.grandma_name ?? '',
      birthday: profile.birthday ?? '',
      phone_number: profile.phone_number ?? '',
      text_updates_opt_in: profile.text_updates_opt_in ?? false,
    })
    setServerError(null)
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    setServerError(null)
  }

  function onSubmit(values: AllFormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = isPaid
        ? await updateProfile(values as PaidProfileFormValues)
        : await updateFreeProfile({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            bio: values.bio,
          } as FreeProfileFormValues)

      if (!result.success) {
        setServerError(result.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  function handlePasswordCancel() {
    setIsPasswordOpen(false)
    setPasswordServerError(null)
    resetPassword()
  }

  function onPasswordSubmit(values: PasswordFormValues) {
    setPasswordServerError(null)
    startPasswordTransition(async () => {
      const result = await updatePassword(values)
      if (!result.success) {
        setPasswordServerError(result.error)
      } else {
        setPasswordSuccess(true)
        setIsPasswordOpen(false)
        resetPassword()
      }
    })
  }

  return (
    <Card className="relative">
      {!isEditing && (
        <button
          onClick={handleEdit}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Edit profile"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <CardContent className="pt-6 space-y-4">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: First name, Last name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-xs text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Row 2: Grandma name, Birthday */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="grandma_name" className="block">
                  {isPaid ? 'Grandma name' : <LockedLabel>Grandma name</LockedLabel>}
                </Label>
                <div className="relative">
                  <Input
                    id="grandma_name"
                    disabled={!isPaid}
                    {...register('grandma_name')}
                  />
                  {!isPaid && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSubscribePrompt(true)} />
                  )}
                </div>
                {errors.grandma_name && (
                  <p className="text-xs text-destructive">{errors.grandma_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birthday" className="block">
                  {isPaid ? 'Birthday' : <LockedLabel>Birthday</LockedLabel>}
                </Label>
                <div className="relative">
                  <Input
                    id="birthday"
                    type="date"
                    disabled={!isPaid}
                    {...register('birthday')}
                  />
                  {!isPaid && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSubscribePrompt(true)} />
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Email, Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number" className="block">
                  {isPaid ? 'Phone number' : <LockedLabel>Phone number</LockedLabel>}
                </Label>
                <div className="relative">
                  <Input
                    id="phone_number"
                    type="tel"
                    disabled={!isPaid}
                    {...register('phone_number')}
                  />
                  {!isPaid && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSubscribePrompt(true)} />
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Bio, Text updates */}
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className={cn(textareaClass, errors.bio && 'border-destructive')}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <Label className="block">
                  {isPaid ? 'Text updates' : <LockedLabel>Text updates</LockedLabel>}
                </Label>
                <div className={cn('relative flex items-center gap-2.5', !isPaid && 'opacity-50')}>
                  <input
                    id="text_updates_opt_in"
                    type="checkbox"
                    disabled={!isPaid}
                    className="h-4 w-4 rounded border-input accent-foreground disabled:cursor-not-allowed"
                    {...register('text_updates_opt_in')}
                  />
                  <Label
                    htmlFor="text_updates_opt_in"
                    className={cn('font-normal', isPaid ? 'cursor-pointer' : 'cursor-not-allowed')}
                  >
                    Receive text updates
                  </Label>
                  {!isPaid && (
                    <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSubscribePrompt(true)} />
                  )}
                </div>
              </div>
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4 text-sm">
            {/* Row 1: First name, Last name */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">First name</dt>
                <dd className="mt-0.5">{profile.first_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last name</dt>
                <dd className="mt-0.5">{profile.last_name || '—'}</dd>
              </div>
            </div>

            {/* Row 2: Grandma name, Birthday */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className={cn(
                  'text-xs font-medium uppercase tracking-wide flex items-center gap-1',
                  isPaid ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}>
                  {!isPaid && <Lock className="h-3 w-3" />}
                  Grandma name
                </dt>
                <dd className={cn('mt-0.5', !isPaid && 'text-muted-foreground/40')}>
                  {profile.grandma_name || '—'}
                </dd>
              </div>
              <div>
                <dt className={cn(
                  'text-xs font-medium uppercase tracking-wide flex items-center gap-1',
                  isPaid ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}>
                  {!isPaid && <Lock className="h-3 w-3" />}
                  Birthday
                </dt>
                <dd className={cn('mt-0.5', !isPaid && 'text-muted-foreground/40')}>
                  {profile.birthday ? formatBirthday(profile.birthday) : '—'}
                </dd>
              </div>
            </div>

            {/* Row 3: Email, Phone */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd className="mt-0.5">{profile.email}</dd>
              </div>
              <div>
                <dt className={cn(
                  'text-xs font-medium uppercase tracking-wide flex items-center gap-1',
                  isPaid ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}>
                  {!isPaid && <Lock className="h-3 w-3" />}
                  Phone
                </dt>
                <dd className={cn('mt-0.5', !isPaid && 'text-muted-foreground/40')}>
                  {profile.phone_number || '—'}
                </dd>
              </div>
            </div>

            {/* Row 4: Bio, Text updates */}
            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{profile.bio || '—'}</dd>
              </div>
              <div>
                <dt className={cn(
                  'text-xs font-medium uppercase tracking-wide flex items-center gap-1',
                  isPaid ? 'text-muted-foreground' : 'text-muted-foreground/50'
                )}>
                  {!isPaid && <Lock className="h-3 w-3" />}
                  Text updates
                </dt>
                <dd className={cn('mt-0.5', !isPaid && 'text-muted-foreground/40')}>
                  {profile.text_updates_opt_in === null
                    ? '—'
                    : profile.text_updates_opt_in
                    ? 'Opted in'
                    : 'Not opted in'}
                </dd>
              </div>
            </div>
          </dl>
        )}

        {/* Row 5: Password — always present */}
        <div className="border-t pt-4">
          {isPasswordOpen ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" autoComplete="new-password" {...registerPassword('password')} />
                  {passwordErrors.password && (
                    <p className="text-xs text-destructive">{passwordErrors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" autoComplete="new-password" {...registerPassword('confirmPassword')} />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              {passwordServerError && (
                <p className="text-sm text-destructive">{passwordServerError}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPasswordPending}>
                  {isPasswordPending ? 'Saving…' : 'Update password'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handlePasswordCancel} disabled={isPasswordPending}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Password</p>
                <p className="mt-0.5">
                  {passwordSuccess ? (
                    <span className="text-emerald-700">Updated successfully</span>
                  ) : (
                    '••••••••'
                  )}
                </p>
              </div>
              <button
                onClick={() => { setIsPasswordOpen(true); setPasswordSuccess(false) }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Row 6: Subscription status */}
        <div className="border-t pt-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subscription</p>
          <p className="mt-0.5">
            {subscriptionStatus === 'active'
              ? 'Active'
              : subscriptionStatus === 'trialing'
              ? 'Trial'
              : 'Free'}
          </p>
        </div>

        <Dialog open={showSubscribePrompt} onOpenChange={setShowSubscribePrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade to unlock</DialogTitle>
              <DialogDescription>
                Grandma name, birthday, phone, and text updates are available on paid plans.
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
  )
}
