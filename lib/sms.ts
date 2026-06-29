import { twilioClient } from './twilio'

const FROM = process.env.TWILIO_PHONE_NUMBER!

export async function sendOptInSms(to: string) {
  await twilioClient.messages.create({
    from: FROM,
    to,
    body: 'Thanks for joining MyGrandmaName! You\'ll get simple reminders that help you feel supported, celebrated, and connected in your grandma role.',
  })
}

export async function sendFamilyAcceptedSms(to: string) {
  await twilioClient.messages.create({
    from: FROM,
    to,
    body: 'Great news! A family member accepted your MyGrandmaName invitation. They\'ll now receive updates that help them support you with meaningful, clutter‑free gifting.',
  })
}
