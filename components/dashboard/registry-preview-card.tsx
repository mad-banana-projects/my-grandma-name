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
  firstItem,
}: {
  grandmaProfileId: string
  firstItem: RegistryPreviewItem | null
}) {
  const product = firstItem?.product ?? null
  const imageUrl = product?.image_urls?.[0] ?? null
  const outboundUrl = product ? (product.affiliate_url ?? product.product_url) : null

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        {product ? (
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/30">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              {product.brand && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {product.brand}
                </p>
              )}
              <p className="truncate text-sm font-semibold">{product.name}</p>
              {firstItem?.variant && (
                <p className="text-xs text-muted-foreground">{firstItem.variant.label}</p>
              )}
              {formatPrice(product.price) && (
                <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
              )}
            </div>
            {outboundUrl && (
              <a
                href={outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
              >
                View
              </a>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
            <a
              href="/browse-products"
              className="mt-1 block text-sm font-medium underline underline-offset-4"
            >
              Browse gift ideas →
            </a>
          </div>
        )}
        <Link
          href={`/registry/${grandmaProfileId}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
        >
          View my registry
        </Link>
      </CardContent>
    </Card>
  )
}
