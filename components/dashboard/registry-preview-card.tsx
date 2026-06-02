import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type RegistryPreviewItem = {
  id: string
  product: {
    name: string
    image_urls: string[]
    price: string | null
    brand: string | null
    affiliate_url: string | null
    product_url: string
  } | null
  variant: { id: string; label: string } | null
}

function formatPrice(price: string | null) {
  if (!price) return null
  return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function RegistryPreviewCard({
  grandmaProfileId,
  items,
}: {
  grandmaProfileId: string
  items: RegistryPreviewItem[]
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col h-full p-4 gap-4">

        {/* Items area — grows to fill available space */}
        <div className="flex-1 flex flex-col justify-start gap-2 min-h-0">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
              <a
                href="/browse-products"
                className="mt-1 text-sm font-medium italic underline underline-offset-4 text-[#618985] hover:text-[#618985]/80"
              >
                Browse gift ideas →
              </a>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product
              if (!product) return null
              const imageUrl = product.image_urls?.[0] ?? null
              const outboundUrl = product.affiliate_url ?? product.product_url
              const price = formatPrice(product.price)

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border bg-background p-2.5"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted/30">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    {product.brand && (
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {product.brand}
                      </p>
                    )}
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">{item.variant.label}</p>
                    )}
                    {price && (
                      <p className="text-xs text-muted-foreground">{price}</p>
                    )}
                  </div>

                  <a
                    href={outboundUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0 text-xs')}
                  >
                    View
                  </a>
                </div>
              )
            })
          )}
        </div>

        {/* Button always pinned to bottom */}
        <Link
          href={`/registry/${grandmaProfileId}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-1/2 mx-auto')}
        >
          View my registry
        </Link>

      </CardContent>
    </Card>
  )
}
