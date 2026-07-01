import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { accountSid: process.env.TWILIO_ACCOUNT_SID! }
    )
  }
  return _client
}
