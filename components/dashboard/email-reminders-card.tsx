'use client'

import { useState, useTransition } from 'react'
import { Pencil, Plus, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { updateReminders, sendTestReminder, type ReminderFormValues } from '@/app/(app)/dashboard/actions'

type CustomDate = { label: string; date: string }

interface EmailRemindersCardProps {
  id?: string
  initial: {
    reminder_grandparents_day: boolean
    reminder_mothers_day: boolean
    reminder_birthday: boolean
    reminder_christmas: boolean
    reminder_custom_dates: CustomDate[]
    reminder_frequency: number[]
  }
}

const OCCASIONS = [
  { key: 'reminder_grandparents_day' as const, label: "Grandparents' Day" },
  { key: 'reminder_mothers_day' as const, label: "Mother's Day" },
  { key: 'reminder_birthday' as const, label: 'Birthday' },
  { key: 'reminder_christmas' as const, label: 'Christmas' },
]

const PRESET_FREQUENCY = [
  { days: 30, label: '1 month' },
  { days: 14, label: '2 weeks' },
  { days: 7, label: '1 week' },
]

type OccasionKey = (typeof OCCASIONS)[number]['key']

export function EmailRemindersCard({ id, initial }: EmailRemindersCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const [occasions, setOccasions] = useState<Record<OccasionKey, boolean>>({
    reminder_grandparents_day: initial.reminder_grandparents_day,
    reminder_mothers_day: initial.reminder_mothers_day,
    reminder_birthday: initial.reminder_birthday,
    reminder_christmas: initial.reminder_christmas,
  })
  const [customDates, setCustomDates] = useState<CustomDate[]>(initial.reminder_custom_dates)
  const [frequency, setFrequency] = useState<number[]>(initial.reminder_frequency)

  // draft state while editing
  const [draftOccasions, setDraftOccasions] = useState(occasions)
  const [draftCustomDates, setDraftCustomDates] = useState(customDates)
  const [draftFrequency, setDraftFrequency] = useState(frequency)

  const [newLabel, setNewLabel] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCustomDays, setNewCustomDays] = useState('')
  const [showDateForm, setShowDateForm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [testError, setTestError] = useState<string | null>(null)

  function handleTestSend() {
    setTestStatus('sending')
    setTestError(null)
    startTransition(async () => {
      const result = await sendTestReminder()
      if (result.success) {
        setTestStatus('sent')
        setTimeout(() => setTestStatus('idle'), 4000)
      } else {
        setTestStatus('error')
        setTestError('error' in result ? result.error : 'Something went wrong.')
      }
    })
  }

  function startEdit() {
    setDraftOccasions({ ...occasions })
    setDraftCustomDates([...customDates])
    setDraftFrequency([...frequency])
    setNewLabel('')
    setNewDate('')
    setNewCustomDays('')
    setShowDateForm(false)
    setError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setError(null)
  }

  function toggleDraftOccasion(key: OccasionKey) {
    setDraftOccasions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleDraftFrequency(days: number) {
    setDraftFrequency((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days].sort((a, b) => b - a)
    )
  }

  function addCustomFrequency() {
    const days = parseInt(newCustomDays, 10)
    if (!isNaN(days) && days >= 1 && days <= 365 && !draftFrequency.includes(days)) {
      setDraftFrequency((prev) => [...prev, days].sort((a, b) => b - a))
    }
    setNewCustomDays('')
  }

  function addCustomDate() {
    if (!newLabel.trim() || !newDate) return
    setDraftCustomDates((prev) => [...prev, { label: newLabel.trim(), date: newDate }])
    setNewLabel('')
    setNewDate('')
    setShowDateForm(false)
  }

  function removeDraftCustomDate(index: number) {
    setDraftCustomDates((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    setError(null)

    const data: ReminderFormValues = {
      ...draftOccasions,
      reminder_custom_dates: draftCustomDates,
      reminder_frequency: draftFrequency,
    }

    startTransition(async () => {
      const result = await updateReminders(data)
      if (result.success) {
        setOccasions({ ...draftOccasions })
        setCustomDates([...draftCustomDates])
        setFrequency([...draftFrequency])
        setIsEditing(false)
      } else {
        setError(result.error)
      }
    })
  }

  const presetDays = PRESET_FREQUENCY.map((p) => p.days)

  return (
    <div id={id} className="flex flex-col gap-4 h-full scroll-mt-24">
      <h2 className="text-[clamp(24px,2.66vw,34px)] font-semibold">Email Reminders</h2>

      <Card className="flex-1 flex flex-col relative">
        {/* Edit / Cancel pencil button */}
        {!isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit reminders"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelEdit}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cancel editing"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <CardContent className="flex flex-col flex-1 py-6 gap-6">

          {/* Two-column body */}
          <div className="grid grid-cols-2 gap-6 flex-1 items-start">

            {/* Column 1: Send reminders for */}
            <div className="space-y-3">
              <p className="text-[clamp(13px,1.33vw,17px)] font-medium">Send Reminders For:</p>
              <div className="space-y-2">
                {OCCASIONS.map(({ key, label }) => {
                  const checked = isEditing ? draftOccasions[key] : occasions[key]
                  return (
                    <div
                      key={key}
                      onClick={isEditing ? () => toggleDraftOccasion(key) : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                        isEditing ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                          checked
                            ? 'border-[#8f6593] bg-[#8f6593] text-white'
                            : 'border-input bg-background'
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Column 2: Custom dates + Remind me */}
            <div className="space-y-6">

              {/* Custom dates */}
              <div className="space-y-3">
                <p className="text-[clamp(13px,1.33vw,17px)] font-medium">Custom Dates</p>

                {(isEditing ? draftCustomDates : customDates).length > 0 && (
                  <div className="space-y-2">
                    {(isEditing ? draftCustomDates : customDates).map((cd, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{cd.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{cd.date}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeDraftCustomDate(i)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Remove date"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isEditing && (
                  showDateForm ? (
                    <div className="rounded-md border p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="e.g. Anniversary"
                            maxLength={50}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addCustomDate}
                          disabled={!newLabel.trim() || !newDate}
                          className="rounded-md bg-[#618985] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowDateForm(false); setNewLabel(''); setNewDate('') }}
                          className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDateForm(true)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add custom date
                    </button>
                  )
                )}

                {!isEditing && customDates.length === 0 && (
                  <p className="text-sm text-muted-foreground">None added</p>
                )}
              </div>

              {/* Remind me */}
              <div className="space-y-3">
                <p className="text-[clamp(13px,1.33vw,17px)] font-medium">Remind Me</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_FREQUENCY.map(({ days, label }) => {
                    const active = (isEditing ? draftFrequency : frequency).includes(days)
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={isEditing ? () => toggleDraftFrequency(days) : undefined}
                        disabled={!isEditing}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition-colors',
                          active
                            ? 'border-[#8f6593] bg-[#8f6593] text-white'
                            : 'border-[#8f6593] bg-white text-[#8f6593]',
                          isEditing && !active && 'hover:bg-[#8f6593]/10',
                          !isEditing && 'cursor-default'
                        )}
                      >
                        {label} before
                      </button>
                    )
                  })}
                  {(isEditing ? draftFrequency : frequency)
                    .filter((d) => !presetDays.includes(d))
                    .map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={isEditing ? () => toggleDraftFrequency(days) : undefined}
                        disabled={!isEditing}
                        className="flex items-center gap-1 rounded-full border border-[#8f6593] bg-[#8f6593] px-3 py-1 text-xs text-white disabled:cursor-default"
                      >
                        {days}d before
                        {isEditing && <X className="h-3 w-3" />}
                      </button>
                    ))}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={newCustomDays}
                      onChange={(e) => setNewCustomDays(e.target.value)}
                      placeholder="Custom days"
                      className="h-8 w-32 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFrequency() } }}
                    />
                    <button
                      type="button"
                      onClick={addCustomFrequency}
                      disabled={!newCustomDays}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Save row — only in edit mode */}
          {isEditing && (
            <div className="flex items-center gap-3 border-t pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-md bg-[#618985] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              >
                {isPending ? 'Saving…' : 'Save reminders'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {/* Test reminder row — always visible */}
          <div className="flex items-center gap-3 border-t pt-4">
            <button
              type="button"
              onClick={handleTestSend}
              disabled={testStatus === 'sending' || isPending}
              className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {testStatus === 'sending' ? 'Sending…' : 'Send test reminder'}
            </button>
            {testStatus === 'sent' && (
              <p className="text-sm text-green-600">Test email sent to all accepted family members.</p>
            )}
            {testStatus === 'error' && (
              <p className="text-sm text-destructive">{testError}</p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
