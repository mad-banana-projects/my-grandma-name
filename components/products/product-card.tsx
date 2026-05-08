'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toggleRegistryItem } from '@/app/(app)/registry/actions'

export type ProductVariant = {
  id: string
  label: string
  price: string | null
  image_urls: string[] | null
  product_url: string | null
  affiliate_url: string | null
  display_order: number
}

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
  product_variants: ProductVariant[]
}

const CATEGORY_LABELS: Record<Product['category'], string> = {
  personal: 'Personal',
  home: 'Home',
  entertaining: 'Entertaining',
}

function formatPrice(price: string | null): string | null {
  if (!price) return null
  return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface ProductCardProps {
  product: Product
  priority?: boolean
  isSaved?: boolean
  isPaidUser?: boolean
}

export function ProductCard({
  product,
  priority = false,
  isSaved = false,
  isPaidUser = false,
}: ProductCardProps) {
  const variants = product.product_variants ?? []
  const hasVariants = variants.length > 0

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? variants[0] : null
  )
  const [imageIndex, setImageIndex] = useState(0)
  const [saved, setSaved] = useState(isSaved)
  const [isPending, startTransition] = useTransition()

  const activeImages: string[] = (
    selectedVariant?.image_urls?.length ? selectedVariant.image_urls :
    product.image_urls?.length ? product.image_urls :
    []
  )
  const imageUrl = activeImages[imageIndex] ?? null
  const hasMultipleImages = activeImages.length > 1

  function selectVariant(v: ProductVariant) {
    setSelectedVariant(v)
    setImageIndex(0)
  }

  function prevImage(e: React.MouseEvent) {
    e.preventDefault()
    setImageIndex(i => (i - 1 + activeImages.length) % activeImages.length)
  }

  function nextImage(e: React.MouseEvent) {
    e.preventDefault()
    setImageIndex(i => (i + 1) % activeImages.length)
  }

  function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault()
    if (isPending) return
    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const result = await toggleRegistryItem(product.id, saved)
      if (!result.success) {
        setSaved(saved) // revert on error
      }
    })
  }

  const outboundUrl = (
    selectedVariant?.affiliate_url ??
    selectedVariant?.product_url ??
    product.affiliate_url ??
    product.product_url
  )

  const priceDisplay = formatPrice(
    selectedVariant?.price ?? product.price
  )

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
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-0.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-0.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {activeImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImageIndex(i) }}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors',
                    i === imageIndex ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          </>
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

        {hasVariants && (
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => selectVariant(v)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  selectedVariant?.id === v.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground/40'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <div className="flex items-center gap-2">
            {isPaidUser && (
              <button
                onClick={handleToggleSave}
                disabled={isPending}
                aria-label={saved ? 'Remove from registry' : 'Save to registry'}
                className={cn(
                  'rounded-md p-1 transition-colors',
                  saved
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  isPending && 'opacity-50'
                )}
              >
                {saved
                  ? <BookmarkCheck className="h-4 w-4" />
                  : <Bookmark className="h-4 w-4" />
                }
              </button>
            )}
            <a
              href={outboundUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
            >
              View product
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
