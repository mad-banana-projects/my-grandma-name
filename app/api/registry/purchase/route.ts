import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { item_id } = await request.json() as { item_id: string }

  // RLS ensures only linked family members can update is_purchased
  const { data, error } = await supabase
    .from('registry_items')
    .update({ is_purchased: true, purchased_by: user.id })
    .eq('id', item_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
