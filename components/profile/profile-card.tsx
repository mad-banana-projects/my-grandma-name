'use client'

import { useState, useTransition } from 'react'
import { usePlacesWidget } from 'react-google-autocomplete'
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
  first_name: z.string().min(1, 'Required').max(30, 'Max 30 characters').regex(/^[\p{L}]+$/u, 'Letters only'),
  last_name: z.string().min(1, 'Required').max(30, 'Max 30 characters').regex(/^[\p{L}]+$/u, 'Letters only'),
  email: z.email('Enter a valid email'),
  phone_number: z.string().regex(/^\d{10}$/, 'Enter a 10-digit phone number'),
  text_updates_opt_in: z.boolean(),
  grandma_name: z.string().max(30, 'Max 30 characters').optional(),
  bio: z.string().max(160, 'Max 160 characters').optional(),
  birthday: z.string().optional(),
  address: z.string().max(500).optional(),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must be 50 characters or fewer').transform((s) => s.trim()),
    confirmPassword: z.string().transform((s) => s.trim()),
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

interface SubscriptionData {
  status: string | null
  plan: string | null
  trial_end: string | null
  current_period_end: string | null
}

interface ProfileCardProps {
  profile: UnifiedProfile
  subscriptionStatus?: string | null
  subscriptionData?: SubscriptionData | null
}

const textareaClass =
  'min-h-[88px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none'

function lettersOnly(value: string): string {
  return value.replace(/[^\p{L}]/gu, '')
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function CharCounter({ value, max }: { value: string | undefined; max: number }) {
  const len = value?.length ?? 0
  if (len < Math.floor(max * 0.8)) return null
  return <p className="text-right text-xs text-muted-foreground">{len} / {max}</p>
}

type PasswordStrength = 'weak' | 'fair' | 'strong'

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak'
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return 'weak'
  if (score <= 4) return 'fair'
  return 'strong'
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const strength = getPasswordStrength(password)
  const segments: PasswordStrength[] = ['weak', 'fair', 'strong']
  const strengthIndex = segments.indexOf(strength)
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500']
  const labels = { weak: 'Weak', fair: 'Fair', strong: 'Strong' }
  const labelColors = { weak: 'text-red-500', fair: 'text-amber-500', strong: 'text-emerald-600' }

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {segments.map((_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i <= strengthIndex ? colors[strengthIndex] : 'bg-muted')}
          />
        ))}
      </div>
      <p className={cn('text-xs', labelColors[strength])}>{labels[strength]}</p>
    </div>
  )
}

// Rendered only while the form is in edit mode, so usePlacesWidget's one-time
// useEffect([]) runs with the input already in the DOM.
function AddressAutocompleteInput({
  id,
  defaultValue,
  onChange,
}: {
  id?: string
  defaultValue?: string
  onChange: (value: string) => void
}) {
  const { ref } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    onPlaceSelected: (place) => {
      onChange(place.formatted_address ?? '')
    },
    options: {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address'],
    },
  })

  return (
    <Input
      id={id}
      ref={ref}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing your address…"
      autoComplete="off"
    />
  )
}

function formatBirthday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatSubscriptionLabel(
  subscriptionStatus: string | null | undefined,
  subscriptionData: SubscriptionData | null | undefined
): string {
  if (!subscriptionStatus || subscriptionStatus === 'inactive') return 'Free'

  const isCanceling = subscriptionStatus === 'canceling'
  const isTrialing = subscriptionData?.status === 'trialing'

  const fmt = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isTrialing && !isCanceling) {
    return `Free trial ends ${fmt(subscriptionData?.trial_end ?? null)}`
  }

  if (isCanceling) {
    const date = fmt(subscriptionData?.current_period_end ?? subscriptionData?.trial_end ?? null)
    return `Cancels ${date}`
  }

  return 'Active'
}

export function ProfileCard({ profile, subscriptionStatus, subscriptionData }: ProfileCardProps) {
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


  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfileSchemaValues>({
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

  // Watch values needed for char counters
  const firstNameVal = watch('first_name')
  const lastNameVal = watch('last_name')
  const grandmaNameVal = watch('grandma_name')
  const phoneVal = watch('phone_number')
  const bioVal = watch('bio')

  // Destructure RHF onChange for fields that need input filtering
  const { onChange: onFirstNameChange, ...firstNameReg } = register('first_name')
  const { onChange: onLastNameChange, ...lastNameReg } = register('last_name')
  const { onChange: onPhoneChange, ...phoneReg } = register('phone_number')

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, watch: watchPassword, formState: { errors: passwordErrors } } =
    useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  const passwordVal = watchPassword('password') ?? ''

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
                <Input
                  id="first_name"
                  {...firstNameReg}
                  maxLength={30}
                  onChange={(e) => {
                    e.target.value = lettersOnly(e.target.value)
                    onFirstNameChange(e)
                  }}
                />
                <CharCounter value={firstNameVal} max={30} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  {...lastNameReg}
                  maxLength={30}
                  onChange={(e) => {
                    e.target.value = lettersOnly(e.target.value)
                    onLastNameChange(e)
                  }}
                />
                <CharCounter value={lastNameVal} max={30} />
                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Row 2: Grandma name, Birthday */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="grandma_name">Grandma name</Label>
                <Input id="grandma_name" maxLength={30} {...register('grandma_name')} />
                <CharCounter value={grandmaNameVal} max={30} />
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
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="10-digit number"
                  maxLength={10}
                  {...phoneReg}
                  onChange={(e) => {
                    e.target.value = digitsOnly(e.target.value)
                    onPhoneChange(e)
                  }}
                />
                <CharCounter value={phoneVal} max={10} />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
              </div>
            </div>

            {/* Row 4: Bio, Text updates */}
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  maxLength={160}
                  className={cn(textareaClass, errors.bio && 'border-destructive')}
                  {...register('bio')}
                />
                <CharCounter value={bioVal} max={160} />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <Label className="block">Text updates</Label>
                <div className="flex items-start gap-2.5">
                  <input
                    id="text_updates_opt_in"
                    type="checkbox"
                    className="h-4 w-4 mt-0.5 rounded border-input accent-foreground shrink-0"
                    {...register('text_updates_opt_in')}
                  />
                  <Label htmlFor="text_updates_opt_in" className="font-normal cursor-pointer leading-snug">
                    I agree to receive text messages from My Grandma Name. Message Frequency varies. Msg &amp; data rates may apply. Reply STOP or unselect this checkbox to unsubscribe. View our{' '}
                    <a href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
                  </Label>
                </div>
              </div>
            </div>

            {/* Row 5: Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <AddressAutocompleteInput
                id="address"
                defaultValue={watch('address')}
                onChange={(val) => setValue('address', val, { shouldDirty: true })}
              />
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
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">First name</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.first_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Last name</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.last_name || '—'}</dd>
              </div>
            </div>

            {/* Row 2: Grandma name, Birthday */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Grandma name</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.grandma_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Birthday</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.birthday ? formatBirthday(profile.birthday) : '—'}</dd>
              </div>
            </div>

            {/* Row 3: Email, Phone */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Phone</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.phone_number || '—'}</dd>
              </div>
            </div>

            {/* Row 4: Bio, Text updates */}
            <div className="grid gap-3 sm:grid-cols-2 items-start">
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Bio</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{profile.bio || '—'}</dd>
              </div>
              <div>
                <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Text updates</dt>
                <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.text_updates_opt_in ? 'Opted in' : 'Not opted in'}</dd>
              </div>
            </div>

            {/* Row 5: Address */}
            <div>
              <dt className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Address</dt>
              <dd className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">{profile.address || '—'}</dd>
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
                  <Input id="password" type="password" autoComplete="new-password" maxLength={50} {...registerPassword('password')} />
                  <PasswordStrengthBar password={passwordVal} />
                  {passwordErrors.password && <p className="text-xs text-destructive">{passwordErrors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" autoComplete="new-password" maxLength={50} {...registerPassword('confirmPassword')} />
                  {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
                </div>
              </div>
              {passwordServerError && <p className="text-sm text-destructive">{passwordServerError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPasswordPending} className="bg-[#8f6593] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-[#7a5580]">
                  {isPasswordPending ? 'Saving…' : 'Update Password'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handlePasswordCancel} disabled={isPasswordPending}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Password</p>
                <p className="mt-1 rounded-lg border border-border bg-[#f2eaec] px-3 py-2 text-sm">
                  {passwordSuccess ? (
                    <span className="text-emerald-700">Updated successfully</span>
                  ) : (
                    '••••••••'
                  )}
                </p>
              </div>
              <button
                onClick={() => { setIsPasswordOpen(true); setPasswordSuccess(false) }}
                className="rounded-full bg-[#618985] px-3 py-1.5 text-sm text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.8)] transition-colors hover:bg-[#527673]"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Subscription row */}
        <div className="border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[17px] font-bold uppercase tracking-wide text-muted-foreground">Subscription</p>
              <p className="text-sm">
                <span className="font-medium">Status:</span> {formatSubscriptionLabel(subscriptionStatus, subscriptionData)}
              </p>
              {subscriptionData?.plan && (
                <p className="text-sm">
                  <span className="font-medium">Plan:</span> {subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)}
                </p>
              )}
            </div>
            <button
              onClick={() => { setManageError(null); setShowManageDialog(true) }}
              className="rounded-full bg-[#618985] px-3 py-1.5 text-sm text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.8)] transition-colors hover:bg-[#527673]"
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
                <DialogHeader className="space-y-4">
                  <DialogTitle>Cancel Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel?<br />
                    You&apos;ll retain access until the end of your current billing period, after which your account and all of your data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                {manageError && <p className="text-sm text-destructive px-1">{manageError}</p>}
                <DialogFooter showCloseButton>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isManagePending}
                  >
                    {isManagePending ? 'Saving…' : 'Cancel Subscription'}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader className="space-y-4">
                  <DialogTitle>Upgrade Your Subscription</DialogTitle>
                  <DialogDescription>
                    You are currently using a free account. Would you like to upgrade to a paid subscription?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton>
                  <a href="/subscribe" className={cn(buttonVariants(), 'bg-[#8f6593] text-white border border-white hover:bg-[#7a5680]')}>
                    Yes, Upgrade Now
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
