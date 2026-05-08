import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/products/product-grid'
import type { Product } from '@/components/products/product-card'

const ANONYMOUS_PREVIEW_LIMIT = 6

export default async function BrowseProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = createServiceClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_urls, product_url, affiliate_url, category, price, brand, short_description, product_variants(id, label, price, image_urls, product_url, affiliate_url, display_order)')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('display_order', { referencedTable: 'product_variants', ascending: true })

  let savedProductIds: Set<string> = new Set()
  let grandmaProfileId: string | null = null

  if (user) {
    const { data: userData } = await service
      .from('users')
      .select('role, subscription_status')
      .eq('id', user.id)
      .single()

    const isPaid =
      userData?.role === 'grandma' && userData?.subscription_status === 'active'

    if (isPaid) {
      const { data: profile } = await service
        .from('grandma_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        grandmaProfileId = profile.id

        const { data: savedItems } = await service
          .from('registry_items')
          .select('product_id')
          .eq('grandma_id', profile.id)

        savedProductIds = new Set((savedItems ?? []).map((r) => r.product_id))
      }
    }
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Gift ideas she'll love</h1>
          <p className="text-muted-foreground">
            A curated collection of thoughtful gifts for grandma.
          </p>
        </div>

        <ProductGrid
          products={(products ?? []) as Product[]}
          isAnonymous={!user}
          previewLimit={ANONYMOUS_PREVIEW_LIMIT}
          savedProductIds={savedProductIds}
          grandmaProfileId={grandmaProfileId}
        />
      </div>
    </main>
  )
}
