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

        {/* Items area — scrollable with fixed max height */}
        <div className="overflow-y-auto max-h-[420px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
              <a
                href="/browse-products"
                className="mt-1 text-sm font-medium italic underline underline-offset-4 text-[#618985] hover:text-[#618985]/80"
              >
                Browse gift ideas →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => {
                const product = item.product
                if (!product) return null
                const imageUrl = product.image_urls?.[0] ?? null
                const outboundUrl = product.affiliate_url ?? product.product_url
                const price = formatPrice(product.price)

                return (
                  <a
                    key={item.id}
                    href={outboundUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5 p-2">
                      {product.brand && (
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {product.brand}
                        </p>
                      )}
                      <p className="line-clamp-2 text-xs font-medium leading-snug">{product.name}</p>
                      {item.variant && (
                        <p className="text-[10px] text-muted-foreground">{item.variant.label}</p>
                      )}
                      {price && (
                        <p className="text-xs font-semibold">{price}</p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Button pinned to bottom */}
        <Link
          href={`/registry/${grandmaProfileId}`}
          className={cn(buttonVariants({ size: 'lg' }), 'mt-auto mx-auto bg-[#618985] text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.8)] hover:bg-[#527673]')}
        >
          View My Registry
        </Link>

      </CardContent>
    </Card>
  )
}
