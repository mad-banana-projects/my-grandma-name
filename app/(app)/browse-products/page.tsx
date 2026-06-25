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

  // Maps product_id → variant_id (null means saved with no specific variant)
  let savedItems: Map<string, string | null> = new Map()
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
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        grandmaProfileId = profile.id

        const { data: rows } = await service
          .from('registry_items')
          .select('product_id, variant_id')
          .eq('grandma_id', profile.id)

        savedItems = new Map(
          (rows ?? []).map((r) => [r.product_id, r.variant_id ?? null])
        )
      }
    }
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">Curated Gift Ideas for <em>You</em></h1>
          <p className="text-[22px] text-foreground/80 [font-family:var(--font-arno-italic)]">
            Browse curated products designed to inspire meaningful gifting. Save the items you love, organize your registry, and make celebrating life's moments a little more personal.
          </p>
        </div>

        <ProductGrid
          products={(products ?? []) as Product[]}
          isAnonymous={!user}
          previewLimit={ANONYMOUS_PREVIEW_LIMIT}
          savedItems={savedItems}
          grandmaProfileId={grandmaProfileId}
        />
      </div>
    </main>
  )
}
