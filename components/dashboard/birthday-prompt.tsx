'use client'

import { useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { saveBirthday } from '@/app/(app)/dashboard/actions'

interface BirthdayPromptProps {
  initialOpen: boolean
  needsBirthday: boolean
}

export function BirthdayPrompt({ initialOpen, needsBirthday }: BirthdayPromptProps) {
  const [modalOpen, setModalOpen] = useState(initialOpen)
  const [showBanner, setShowBanner] = useState(needsBirthday && !initialOpen)
  const [birthday, setBirthday] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!needsBirthday) return null

  function handleModalClose(open: boolean) {
    if (!open) {
      setModalOpen(false)
      setShowBanner(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await saveBirthday(birthday)
    setSaving(false)
    if (result.success) {
      setModalOpen(false)
      setShowBanner(false)
    } else {
      setError('error' in result ? result.error : 'Something went wrong.')
    }
  }

  return (
    <>
      {/* Banner — shown when modal is skipped and birthday still missing */}
      {showBanner && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          <p className="flex-1 text-sm">
            Add your birthday so family never misses it.{' '}
            <button
              onClick={() => { setModalOpen(true); setShowBanner(false) }}
              className="font-medium underline underline-offset-2 hover:no-underline"
            >
              Add now
            </button>
          </p>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal — shown immediately after checkout, or when re-opened from banner */}
      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold">One Last Thing — Add Your Birthday</DialogTitle>
            <DialogDescription>
              Your birthday helps family members know when to celebrate you. You can always update it later from your profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={saving} className="bg-[#8f6593] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] hover:bg-[#7a5580]">
                {saving ? 'Saving…' : 'Save Birthday'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
