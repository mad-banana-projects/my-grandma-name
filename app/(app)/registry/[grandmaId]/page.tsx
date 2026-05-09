import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatPrice(price: string | null): string | null {
  if (!price) return null
  return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

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

  const savedItems = (items ?? []).filter((item) => item.product !== null)

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {profile.grandma_name}'s Registry
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.first_name} {profile.last_name}
          </p>
        </div>

        {savedItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
              <a
                href="/browse-products"
                className="text-sm font-medium underline underline-offset-4"
              >
                Browse gift ideas →
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {savedItems.map((item) => {
              const product = item.product as unknown as {
                id: string
                name: string
                image_urls: string[]
                product_url: string
                affiliate_url: string | null
                price: string | null
                brand: string | null
                short_description: string | null
              }
              const variant = item.variant as unknown as { id: string; label: string } | null
              const imageUrl = product.image_urls?.[0] ?? null
              const outboundUrl = product.affiliate_url ?? product.product_url
              const priceDisplay = formatPrice(product.price)

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border bg-background p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/30">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    {product.brand && (
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {product.brand}
                      </p>
                    )}
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    {variant && (
                      <p className="text-xs text-muted-foreground">{variant.label}</p>
                    )}
                    {priceDisplay && (
                      <p className="text-xs text-muted-foreground">{priceDisplay}</p>
                    )}
                  </div>

                  <a
                    href={outboundUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
                  >
                    View
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
