import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let query = searchParams.get('q') ?? 'personalized grandma gift'

  // Append grandma name to query if available
  const { data: profile } = await supabase
    .from('grandma_profiles')
    .select('grandma_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.grandma_name) {
    query = `${query} ${profile.grandma_name}`
  }

  const response = await fetch(
    `https://openapi.etsy.com/v3/application/listings/active?keywords=${encodeURIComponent(query)}&limit=24`,
    {
      headers: {
        'x-api-key': process.env.ETSY_API_KEY!,
      },
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Etsy API error' }, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
