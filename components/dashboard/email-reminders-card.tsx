'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { updateReminders, type ReminderFormValues } from '@/app/(app)/dashboard/actions'

type CustomDate = { label: string; date: string }

interface EmailRemindersCardProps {
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

export function EmailRemindersCard({ initial }: EmailRemindersCardProps) {
  const [occasions, setOccasions] = useState<Record<OccasionKey, boolean>>({
    reminder_grandparents_day: initial.reminder_grandparents_day,
    reminder_mothers_day: initial.reminder_mothers_day,
    reminder_birthday: initial.reminder_birthday,
    reminder_christmas: initial.reminder_christmas,
  })
  const [customDates, setCustomDates] = useState<CustomDate[]>(initial.reminder_custom_dates)
  const [frequency, setFrequency] = useState<number[]>(initial.reminder_frequency)

  const [newLabel, setNewLabel] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCustomDays, setNewCustomDays] = useState('')
  const [showDateForm, setShowDateForm] = useState(false)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleOccasion(key: OccasionKey) {
    setOccasions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleFrequency(days: number) {
    setFrequency((prev) =>
      prev.includes(days) ? prev.filter((d) => d !== days) : [...prev, days].sort((a, b) => b - a)
    )
  }

  function addCustomFrequency() {
    const days = parseInt(newCustomDays, 10)
    if (!isNaN(days) && days >= 1 && days <= 365 && !frequency.includes(days)) {
      setFrequency((prev) => [...prev, days].sort((a, b) => b - a))
    }
    setNewCustomDays('')
  }

  function addCustomDate() {
    if (!newLabel.trim() || !newDate) return
    setCustomDates((prev) => [...prev, { label: newLabel.trim(), date: newDate }])
    setNewLabel('')
    setNewDate('')
    setShowDateForm(false)
  }

  function removeCustomDate(index: number) {
    setCustomDates((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    setSaved(false)
    setError(null)

    const data: ReminderFormValues = {
      ...occasions,
      reminder_custom_dates: customDates,
      reminder_frequency: frequency,
    }

    startTransition(async () => {
      const result = await updateReminders(data)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  const presetDays = PRESET_FREQUENCY.map((p) => p.days)
  const customFrequencyValues = frequency.filter((d) => !presetDays.includes(d))

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Email Reminders</h2>

      <Card>
        <CardContent className="space-y-6 py-6">
          {/* Occasions */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Send reminders for</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OCCASIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      occasions[key]
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-input bg-background'
                    )}
                    onClick={() => toggleOccasion(key)}
                  >
                    {occasions[key] && <Check className="h-3 w-3" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={occasions[key]}
                    onChange={() => toggleOccasion(key)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom dates */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Custom dates</p>

            {customDates.length > 0 && (
              <div className="space-y-2">
                {customDates.map((cd, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{cd.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{cd.date}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomDate(i)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Remove date"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDateForm ? (
              <div className="rounded-md border p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Anniversary"
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
                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
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
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Remind me</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_FREQUENCY.map(({ days, label }) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => toggleFrequency(days)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors',
                    frequency.includes(days)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground/40'
                  )}
                >
                  {label} before
                </button>
              ))}
              {customFrequencyValues.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => toggleFrequency(days)}
                  className="flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs text-background"
                >
                  {days}d before
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
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
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Saving…' : 'Save reminders'}
            </button>
            {saved && (
              <p className="text-sm text-muted-foreground">Saved.</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
