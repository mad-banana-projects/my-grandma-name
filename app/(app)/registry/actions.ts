'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export type ActionResult = { success: true } | { success: false; error: string }
export type RemoveResult = ActionResult

export type RegistryList = { id: string; name: string; created_at: string }

async function getAuthenticatedProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  return profile ? { userId: user.id, profileId: profile.id, service } : null
}

// ─── List CRUD ────────────────────────────────────────────────────────────────

export async function createList(
  name: string
): Promise<{ success: true; list: RegistryList } | { success: false; error: string }> {
  const trimmed = name.trim().slice(0, 100)
  if (!trimmed) return { success: false, error: 'Name is required' }

  const auth = await getAuthenticatedProfile()
  if (!auth) return { success: false, error: 'Not authenticated' }

  const { data, error } = await auth.service
    .from('registry_lists')
    .insert({ grandma_id: auth.profileId, name: trimmed })
    .select('id, name, created_at')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/registry/${auth.profileId}`)
  return { success: true, list: data as RegistryList }
}

export async function renameList(listId: string, name: string): Promise<ActionResult> {
  const trimmed = name.trim().slice(0, 100)
  if (!trimmed) return { success: false, error: 'Name is required' }

  const auth = await getAuthenticatedProfile()
  if (!auth) return { success: false, error: 'Not authenticated' }

  const { error } = await auth.service
    .from('registry_lists')
    .update({ name: trimmed })
    .eq('id', listId)
    .eq('grandma_id', auth.profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/registry/${auth.profileId}`)
  return { success: true }
}

export async function deleteList(listId: string): Promise<ActionResult> {
  const auth = await getAuthenticatedProfile()
  if (!auth) return { success: false, error: 'Not authenticated' }

  const { error } = await auth.service
    .from('registry_lists')
    .delete()
    .eq('id', listId)
    .eq('grandma_id', auth.profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/registry/${auth.profileId}`)
  return { success: true }
}

export async function assignItemToList(
  itemId: string,
  listId: string | null
): Promise<ActionResult> {
  const auth = await getAuthenticatedProfile()
  if (!auth) return { success: false, error: 'Not authenticated' }

  const { error } = await auth.service
    .from('registry_items')
    .update({ list_id: listId })
    .eq('id', itemId)
    .eq('grandma_id', auth.profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/registry/${auth.profileId}`)
  return { success: true }
}

// ─── Item actions ─────────────────────────────────────────────────────────────

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
