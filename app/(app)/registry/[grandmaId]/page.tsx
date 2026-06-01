import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { RegistryItemList, type RegistryItem } from '@/components/registry/registry-item-list'
import { RegistryListView } from '@/components/registry/registry-list-view'
import type { RegistryList } from '@/app/(app)/registry/actions'

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ grandmaId: string }>
}) {
  const { grandmaId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('grandma_name, first_name, user_id')
    .eq('id', grandmaId)
    .single()

  if (!profile) redirect('/dashboard')

  const isOwner = profile.user_id === user.id

  if (!isOwner) {
    const { data: membership } = await service
      .from('family_members')
      .select('id')
      .eq('grandma_id', grandmaId)
      .eq('user_id', user.id)
      .eq('invite_status', 'accepted')
      .single()

    if (!membership) redirect('/dashboard')
  }

  // Check if owner is a paid grandma
  let isPaidGrandma = false
  if (isOwner) {
    const { data: userData } = await service
      .from('users')
      .select('role, subscription_status')
      .eq('id', user.id)
      .single()
    isPaidGrandma = userData?.role === 'grandma' && userData?.subscription_status === 'active'
  }

  const [itemsResult, listsResult] = await Promise.all([
    service
      .from('registry_items')
      .select(`
        id,
        list_id,
        added_at,
        variant:product_variants ( id, label ),
        product:products (
          id, name, image_urls, product_url, affiliate_url, price, brand, short_description
        )
      `)
      .eq('grandma_id', grandmaId)
      .order('added_at', { ascending: false }),
    service
      .from('registry_lists')
      .select('id, name, created_at')
      .eq('grandma_id', grandmaId)
      .order('created_at', { ascending: true }),
  ])

  const savedItems: RegistryItem[] = (itemsResult.data ?? [])
    .filter((item) => item.product !== null)
    .map((item) => ({
      id: item.id,
      listId: item.list_id as string | null,
      product: item.product as unknown as RegistryItem['product'],
      variant: item.variant as unknown as RegistryItem['variant'],
    }))

  const lists: RegistryList[] = (listsResult.data ?? []) as RegistryList[]

  const displayName = profile.grandma_name || profile.first_name
  const showLists = isPaidGrandma || (!isOwner && lists.length > 0)

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {displayName}&apos;s Registry
        </h1>

        {showLists ? (
          <RegistryListView
            initialItems={savedItems}
            initialLists={lists}
            isOwner={isOwner}
            isPaidOwner={isPaidGrandma}
            grandmaId={grandmaId}
          />
        ) : (
          <>
            {isOwner && !isPaidGrandma && savedItems.length > 0 && (
              <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                Organize your registry into lists —{' '}
                <a href="/subscribe" className="font-medium underline underline-offset-4 hover:text-foreground">
                  upgrade to unlock
                </a>
              </div>
            )}
            <RegistryItemList initialItems={savedItems} isOwner={isOwner} />
          </>
        )}
      </div>
    </main>
  )
}
