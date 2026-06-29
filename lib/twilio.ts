import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { accountSid: process.env.TWILIO_ACCOUNT_SID! }
    )
  }
  return _client
}

export const twilioClient = new Proxy({} as ReturnType<typeof twilio>, {
  get(_, prop: string | symbol) {
    const client = getClient()
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
