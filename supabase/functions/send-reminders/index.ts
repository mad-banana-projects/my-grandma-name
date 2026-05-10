import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const CRON_SECRET = Deno.env.get("CRON_SECRET")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const APP_URL = Deno.env.get("APP_URL") ?? "https://mygrandmaname.com"

type CustomDate = { label: string; date: string }
type FamilyMember = { id: string; first_name: string | null; email: string }

// ─── Date helpers ────────────────────────────────────────────────────────────

function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  // month: 0-indexed. weekday: 0=Sun…6=Sat. n: 1=first, 2=second, …
  const first = new Date(Date.UTC(year, month, 1))
  const offset = (weekday - first.getUTCDay() + 7) % 7
  return new Date(Date.UTC(year, month, 1 + offset + (n - 1) * 7))
}

function getMothersDay(year: number): Date {
  return getNthWeekday(year, 4, 0, 2) // 2nd Sunday of May
}

function getLaborDay(year: number): Date {
  return getNthWeekday(year, 8, 1, 1) // 1st Monday of September
}

function getGrandparentsDay(year: number): Date {
  // 1st Sunday after Labor Day (Labor Day is Monday, +6 = Sunday)
  const ld = getLaborDay(year)
  return new Date(Date.UTC(year, 8, ld.getUTCDate() + 6))
}

function getChristmas(year: number): Date {
  return new Date(Date.UTC(year, 11, 25))
}

// isoDateStr is YYYY-MM-DD; returns that month+day in the given year
function annualDate(year: number, isoDateStr: string): Date {
  const parts = isoDateStr.split("-")
  return new Date(Date.UTC(year, parseInt(parts[1]) - 1, parseInt(parts[2])))
}

// Returns the next occurrence of an occasion on or after today
function nextOccurrence(today: Date, dateFn: (year: number) => Date): Date {
  const y = today.getUTCFullYear()
  const thisYear = dateFn(y)
  return thisYear >= today ? thisYear : dateFn(y + 1)
}

function daysUntil(today: Date, target: Date): number {
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

// ─── Email builder ────────────────────────────────────────────────────────────

function buildEmail(opts: {
  grandmaName: string
  grandmaProfileId: string
  occasion: string
  days: number
  recipientName: string | null
}): { subject: string; html: string } {
  const registryUrl = `${APP_URL}/registry/${opts.grandmaProfileId}`
  const greeting = opts.recipientName ? `Hi ${opts.recipientName},` : "Hi there,"
  const timeFrame = opts.days === 1 ? "tomorrow" : `in ${opts.days} days`

  const subject = `${opts.grandmaName}'s ${opts.occasion} is ${timeFrame} — check out her wishlist`

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111;">
  <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
    Just a heads-up: <strong>${opts.grandmaName}'s ${opts.occasion}</strong> is coming up ${timeFrame}.
    Don't miss the chance to get her something she'll love.
  </p>
  <a href="${registryUrl}"
     style="display:inline-block;background:#111;color:#fff;text-decoration:none;
            padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;">
    View ${opts.grandmaName}'s Wishlist →
  </a>
  <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
  <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
    You're receiving this reminder because you were added to ${opts.grandmaName}'s
    family list on <a href="${APP_URL}" style="color:#999;">My Grandma Name</a>.
  </p>
</div>`

  return { subject, html }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const auth = req.headers.get("Authorization")
  if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // 1. Get all active paid grandma user IDs
  const { data: paidUsers, error: usersErr } = await supabase
    .from("users")
    .select("id")
    .eq("role", "grandma")
    .eq("subscription_status", "active")

  if (usersErr) {
    return new Response(JSON.stringify({ error: usersErr.message }), { status: 500 })
  }
  if (!paidUsers?.length) {
    return new Response(JSON.stringify({ sent: 0, skipped: "no active paid users" }))
  }

  const paidUserIds = paidUsers.map((u: { id: string }) => u.id)

  // 2. Fetch grandma profiles + family members
  const { data: profiles, error: profilesErr } = await supabase
    .from("grandma_profiles")
    .select(`
      id, first_name, grandma_name, birthday,
      reminder_grandparents_day, reminder_mothers_day,
      reminder_birthday, reminder_christmas,
      reminder_custom_dates, reminder_frequency,
      family_members ( id, first_name, email )
    `)
    .in("user_id", paidUserIds)

  if (profilesErr) {
    return new Response(JSON.stringify({ error: profilesErr.message }), { status: 500 })
  }

  let totalSent = 0
  const errors: string[] = []

  for (const profile of profiles ?? []) {
    const displayName: string = profile.grandma_name || profile.first_name || "Grandma"
    const frequency: number[] = (profile.reminder_frequency as number[] | null) ?? [30, 14, 7]
    const family: FamilyMember[] = (profile.family_members as FamilyMember[] | null) ?? []

    if (!family.length) continue

    // Build occasion list for this profile
    const occasions: { label: string; date: Date }[] = []

    if (profile.reminder_mothers_day) {
      occasions.push({ label: "Mother's Day", date: nextOccurrence(today, getMothersDay) })
    }
    if (profile.reminder_grandparents_day) {
      occasions.push({ label: "Grandparents' Day", date: nextOccurrence(today, getGrandparentsDay) })
    }
    if (profile.reminder_christmas) {
      occasions.push({ label: "Christmas", date: nextOccurrence(today, getChristmas) })
    }
    if (profile.reminder_birthday && profile.birthday) {
      const bday = profile.birthday as string
      occasions.push({
        label: "Birthday",
        date: nextOccurrence(today, (y) => annualDate(y, bday)),
      })
    }
    for (const cd of (profile.reminder_custom_dates as CustomDate[] | null) ?? []) {
      if (cd.date) {
        occasions.push({
          label: cd.label,
          date: nextOccurrence(today, (y) => annualDate(y, cd.date)),
        })
      }
    }

    // Check which occasions fire today
    for (const { label, date } of occasions) {
      const days = daysUntil(today, date)
      if (!frequency.includes(days)) continue

      for (const member of family) {
        if (!member.email) continue
        try {
          const { subject, html } = buildEmail({
            grandmaName: displayName,
            grandmaProfileId: profile.id,
            occasion: label,
            days,
            recipientName: member.first_name,
          })

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "My Grandma Name <reminders@mygrandmaname.com>",
              to: member.email,
              subject,
              html,
            }),
          })

          if (res.ok) {
            totalSent++
          } else {
            const body = await res.json()
            errors.push(`${member.email} (${label}): ${JSON.stringify(body)}`)
          }
        } catch (e) {
          errors.push(`${member.email} (${label}): ${e}`)
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: totalSent, ...(errors.length ? { errors } : {}) }),
    { headers: { "Content-Type": "application/json" } }
  )
})
