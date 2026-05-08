'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updatePassword } from '@/app/(app)/grandma-profile/actions'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function handleOpen() {
    reset()
    setSuccess(false)
    setServerError(null)
    setIsOpen(true)
  }

  function handleCancel() {
    setIsOpen(false)
    setSuccess(false)
    setServerError(null)
  }

  function onSubmit(values: FormValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await updatePassword(values)
      if (!result.success) {
        setServerError(result.error)
      } else {
        setSuccess(true)
        setIsOpen(false)
        reset()
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Password</CardTitle>
        {!isOpen && (
          <button
            onClick={handleOpen}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Change
          </button>
        )}
      </CardHeader>

      <CardContent>
        {success ? (
          <p className="text-sm text-emerald-700">Password updated successfully.</p>
        ) : isOpen ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? 'Saving…' : 'Update password'}
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
          <p className="text-sm text-muted-foreground">••••••••</p>
        )}
      </CardContent>
    </Card>
  )
}
