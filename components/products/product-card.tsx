import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type Product = {
  id: string
  name: string
  image_urls: string[]
  product_url: string
  affiliate_url: string | null
  category: 'personal' | 'home' | 'entertaining'
  price: string | null
  brand: string | null
  short_description: string | null
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  personal: 'Personal',
  home: 'Home',
  entertaining: 'Entertaining',
}

export function ProductCard({ product }: { product: Product }) {
  const outboundUrl = product.affiliate_url ?? product.product_url
  const imageUrl = product.image_urls?.[0] ?? null

  const priceDisplay = product.price
    ? `$${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : null

  return (
    <Card className="group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
          {priceDisplay && (
            <p className="text-sm text-muted-foreground">{priceDisplay}</p>
          )}
        </div>

        {product.short_description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <a
            href={outboundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
          >
            View product
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
