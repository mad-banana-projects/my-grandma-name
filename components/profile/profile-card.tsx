'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  updateProfile,
  updateFreeProfile,
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

type AllFormValues = z.infer<typeof paidSchema>

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

export function ProfileCard({ profile, role }: ProfileCardProps) {
  const router = useRouter()
  const isPaid = role === 'grandma'
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">About you</CardTitle>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Always-editable fields */}
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

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

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

            {/* Paid-only fields */}
            <div className="space-y-1.5">
              <Label htmlFor="grandma_name" className="block">
                {isPaid ? 'Grandma name' : <LockedLabel>Grandma name</LockedLabel>}
              </Label>
              <Input
                id="grandma_name"
                disabled={!isPaid}
                placeholder={isPaid ? '' : 'Upgrade to unlock'}
                {...register('grandma_name')}
              />
              {errors.grandma_name && (
                <p className="text-xs text-destructive">{errors.grandma_name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birthday" className="block">
                  {isPaid ? 'Birthday' : <LockedLabel>Birthday</LockedLabel>}
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  disabled={!isPaid}
                  {...register('birthday')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number" className="block">
                  {isPaid ? 'Phone number' : <LockedLabel>Phone number</LockedLabel>}
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  disabled={!isPaid}
                  placeholder={isPaid ? '' : 'Upgrade to unlock'}
                  {...register('phone_number')}
                />
              </div>
            </div>

            <div className={cn('flex items-center gap-2.5', !isPaid && 'opacity-50')}>
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
                {isPaid ? (
                  'Receive text updates'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Receive text updates
                  </span>
                )}
              </Label>
              {!isPaid && (
                <a
                  href="/subscribe"
                  className="ml-auto text-xs text-muted-foreground/60 underline underline-offset-2 hover:text-muted-foreground transition-colors"
                >
                  Upgrade
                </a>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4 text-sm">
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

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="mt-0.5">{profile.email}</dd>
            </div>

            {(profile.bio || isPaid) && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{profile.bio || '—'}</dd>
              </div>
            )}

            {/* Paid-only fields */}
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

            <div className="grid gap-3 sm:grid-cols-2">
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
      </CardContent>
    </Card>
  )
}
