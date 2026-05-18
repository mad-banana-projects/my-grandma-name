'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
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
  updatePassword,
  cancelSubscription,
  type ProfileFormValues,
} from '@/app/(app)/dashboard/actions'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  email: z.email('Enter a valid email'),
  phone_number: z.string().min(1, 'Required').max(30),
  text_updates_opt_in: z.boolean(),
  grandma_name: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  birthday: z.string().optional(),
  address: z.string().max(500).optional(),
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

type ProfileSchemaValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export interface UnifiedProfile {
  id: string | null
  first_name: string
  last_name: string
  email: string
  phone_number: string
  text_updates_opt_in: boolean
  grandma_name: string
  bio: string
  birthday: string | null
  address: string
}

interface ProfileCardProps {
  profile: UnifiedProfile
  subscriptionStatus?: string | null
}

const textareaClass =
  'min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none'

function formatBirthday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function ProfileCard({ profile, subscriptionStatus }: ProfileCardProps) {
  const router = useRouter()
  const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null)
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const [showManageDialog, setShowManageDialog] = useState(false)
  const [manageError, setManageError] = useState<string | null>(null)
  const [isManagePending, startManageTransition] = useTransition()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileSchemaValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone_number: profile.phone_number,
      text_updates_opt_in: profile.text_updates_opt_in,
      grandma_name: profile.grandma_name,
      bio: profile.bio,
      birthday: profile.birthday ?? '',
      address: profile.address,
    },
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } =
    useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  function handleEdit() {
    reset({
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone_number: profile.phone_number,
      text_updates_opt_in: profile.text_updates_opt_in,
      grandma_name: profile.grandma_name,
      bio: profile.bio,
      birthday: profile.birthday ?? '',
      address: profile.address,
    })
    setServerError(null)
    setIsEditing(true)
  }

  function handleCancel() {
    setIsEditing(false)
    setServerError(null)
  }

  function onSubmit(values: ProfileSchemaValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await updateProfile(values as ProfileFormValues)
      if (!result.success) {
        setServerError(result.error)
      } else {
        setIsEditing(false)
        router.refresh()
      }
    })
  }

  function handleCancelSubscription() {
    setManageError(null)
    startManageTransition(async () => {
      const result = await cancelSubscription()
      if (result.success) {
        setShowManageDialog(false)
        router.refresh()
      } else {
        setManageError(result.error)
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
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Row 2: Grandma name, Birthday */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="grandma_name">Grandma name</Label>
                <Input id="grandma_name" {...register('grandma_name')} />
                {errors.grandma_name && <p className="text-xs text-destructive">{errors.grandma_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birthday">Birthday</Label>
                <Input id="birthday" type="date" {...register('birthday')} />
              </div>
            </div>

            {/* Row 3: Email, Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input id="phone_number" type="tel" {...register('phone_number')} />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
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
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <Label className="block">Text updates</Label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="text_updates_opt_in"
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-foreground"
                    {...register('text_updates_opt_in')}
                  />
                  <Label htmlFor="text_updates_opt_in" className="font-normal cursor-pointer">
                    Receive text updates
                  </Label>
                </div>
              </div>
            </div>

            {/* Row 5: Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} placeholder="Street, city, state, zip" />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

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
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grandma name</dt>
                <dd className="mt-0.5">{profile.grandma_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Birthday</dt>
                <dd className="mt-0.5">{profile.birthday ? formatBirthday(profile.birthday) : '—'}</dd>
              </div>
            </div>

            {/* Row 3: Email, Phone */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd className="mt-0.5">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</dt>
                <dd className="mt-0.5">{profile.phone_number || '—'}</dd>
              </div>
            </div>

            {/* Row 4: Bio, Text updates */}
            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{profile.bio || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Text updates</dt>
                <dd className="mt-0.5">{profile.text_updates_opt_in ? 'Opted in' : 'Not opted in'}</dd>
              </div>
            </div>

            {/* Row 5: Address */}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</dt>
              <dd className="mt-0.5">{profile.address || '—'}</dd>
            </div>
          </dl>
        )}

        {/* Password row */}
        <div className="border-t pt-4">
          {isPasswordOpen ? (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" autoComplete="new-password" {...registerPassword('password')} />
                  {passwordErrors.password && <p className="text-xs text-destructive">{passwordErrors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" autoComplete="new-password" {...registerPassword('confirmPassword')} />
                  {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
                </div>
              </div>
              {passwordServerError && <p className="text-sm text-destructive">{passwordServerError}</p>}
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

        {/* Subscription row */}
        <div className="border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subscription</p>
              <p className="mt-0.5">
                {subscriptionStatus === 'active'
                  ? 'Active'
                  : subscriptionStatus === 'trialing'
                  ? 'Trial'
                  : 'Free'}
              </p>
            </div>
            <button
              onClick={() => { setManageError(null); setShowManageDialog(true) }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Manage subscription dialog */}
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent>
            {isSubscribed ? (
              <>
                <DialogHeader>
                  <DialogTitle>Cancel subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel? You&apos;ll lose access to premium features including your registry, email reminders, and family sharing.
                  </DialogDescription>
                </DialogHeader>
                {manageError && <p className="text-sm text-destructive px-1">{manageError}</p>}
                <DialogFooter showCloseButton>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isManagePending}
                  >
                    {isManagePending ? 'Saving…' : 'Cancel subscription'}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Upgrade your subscription</DialogTitle>
                  <DialogDescription>
                    You are currently using a free account. Would you like to upgrade to a paid subscription?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <a href="/subscribe" className={cn(buttonVariants())}>
                    Yes, upgrade now
                  </a>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
