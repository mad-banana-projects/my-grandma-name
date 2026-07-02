import { getTwilioClient } from './twilio'

const FROM = process.env.TWILIO_PHONE_NUMBER!

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`
}

export async function sendOptInSms(to: string) {
  const client = getTwilioClient()
  await client.messages.create({
    from: FROM,
    to: toE164(to),
    body: 'Thanks for joining MyGrandmaName! You\'ll get simple reminders that help you feel supported, celebrated, and connected in your grandma role.',
  })
}

export async function sendFamilyAcceptedSms(to: string) {
  const client = getTwilioClient()
  await client.messages.create({
    from: FROM,
    to: toE164(to),
    body: 'Great news! A family member accepted your MyGrandmaName invitation. They\'ll now receive updates that help them support you with meaningful, clutter‑free gifting.',
  })
}
