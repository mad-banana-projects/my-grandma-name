'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export type RemoveResult = { success: true } | { success: false; error: string }

export async function removeRegistryItem(itemId: string): Promise<RemoveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const { error } = await service
    .from('registry_items')
    .delete()
    .eq('id', itemId)
    .eq('grandma_id', profile.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/registry')
  return { success: true }
}

export type ToggleResult =
  | { success: true; saved: boolean }
  | { success: false; error: string }

export async function toggleRegistryItem(
  productId: string,
  variantId: string | null,
  wantsToSave: boolean
): Promise<ToggleResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Grandma profile not found' }

  if (wantsToSave) {
    const { error } = await service
      .from('registry_items')
      .upsert(
        { grandma_id: profile.id, product_id: productId, variant_id: variantId },
        { onConflict: 'grandma_id,product_id' }
      )
    if (error) return { success: false, error: error.message }
    return { success: true, saved: true }
  } else {
    const { error } = await service
      .from('registry_items')
      .delete()
      .eq('grandma_id', profile.id)
      .eq('product_id', productId)
    if (error) return { success: false, error: error.message }
    return { success: true, saved: false }
  }
}
