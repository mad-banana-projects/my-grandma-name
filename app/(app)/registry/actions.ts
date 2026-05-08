'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export type ToggleResult =
  | { success: true; saved: boolean }
  | { success: false; error: string }

export async function toggleRegistryItem(
  productId: string,
  currentlySaved: boolean
): Promise<ToggleResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('grandma_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Grandma profile not found' }

  if (currentlySaved) {
    const { error } = await service
      .from('registry_items')
      .delete()
      .eq('grandma_id', profile.id)
      .eq('product_id', productId)

    if (error) return { success: false, error: error.message }
    return { success: true, saved: false }
  } else {
    const { error } = await service
      .from('registry_items')
      .insert({ grandma_id: profile.id, product_id: productId })

    if (error) return { success: false, error: error.message }
    return { success: true, saved: true }
  }
}
