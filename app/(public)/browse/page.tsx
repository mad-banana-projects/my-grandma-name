import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/products/product-grid'
import type { Product } from '@/components/products/product-card'

const ANONYMOUS_PREVIEW_LIMIT = 6

export default async function BrowsePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_urls, product_url, affiliate_url, category, price, brand, short_description')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <main className="min-h-screen bg-background px-4 py-12">
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
        />
      </div>
    </main>
  )
}
