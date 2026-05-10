import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { RegistryItemList, type RegistryItem } from '@/components/registry/registry-item-list'

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
    .from('grandma_profiles')
    .select('grandma_name, first_name, last_name')
    .eq('id', grandmaId)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: items } = await service
    .from('registry_items')
    .select(`
      id,
      added_at,
      variant:product_variants ( id, label ),
      product:products (
        id, name, image_urls, product_url, affiliate_url, price, brand, short_description
      )
    `)
    .eq('grandma_id', grandmaId)
    .order('added_at', { ascending: false })

  const savedItems: RegistryItem[] = (items ?? [])
    .filter((item) => item.product !== null)
    .map((item) => ({
      id: item.id,
      product: item.product as unknown as RegistryItem['product'],
      variant: item.variant as unknown as RegistryItem['variant'],
    }))

  const displayName = profile.grandma_name || profile.first_name

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {displayName}'s Registry
        </h1>
        <RegistryItemList initialItems={savedItems} />
      </div>
    </main>
  )
}
