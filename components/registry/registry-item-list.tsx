'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { removeRegistryItem } from '@/app/(app)/registry/actions'

export type RegistryItem = {
  id: string
  listId: string | null
  product: {
    id: string
    name: string
    image_urls: string[]
    product_url: string
    affiliate_url: string | null
    price: string | null
    brand: string | null
  }
  variant: { id: string; label: string } | null
}

function formatPrice(price: string | null): string | null {
  if (!price) return null
  return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function RemoveButton({ itemId, onRemove }: { itemId: string; onRemove: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await removeRegistryItem(itemId)
      if (result.success) onRemove()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Remove from registry"
      className={cn(
        'absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white disabled:opacity-40',
      )}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  )
}

export function RegistryItemList({ initialItems, isOwner = false }: { initialItems: RegistryItem[]; isOwner?: boolean }) {
  const [items, setItems] = useState(initialItems)

  function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-background">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
          <a href="/browse-products" className="text-sm font-medium underline underline-offset-4">
            Browse gift ideas →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => {
        const imageUrl = item.product.image_urls?.[0] ?? null
        const outboundUrl = item.product.affiliate_url ?? item.product.product_url
        const priceDisplay = formatPrice(item.product.price)

        return (
          <div key={item.id} className="group relative overflow-hidden rounded-lg border bg-background">
            <a
              href={outboundUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-0.5 p-3">
                {item.product.brand && (
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {item.product.brand}
                  </p>
                )}
                <p className="line-clamp-2 text-sm font-medium leading-snug">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">{item.variant.label}</p>
                )}
                {priceDisplay && (
                  <p className="mt-0.5 text-sm font-semibold">{priceDisplay}</p>
                )}
              </div>
            </a>

            {isOwner && (
              <RemoveButton itemId={item.id} onRemove={() => handleRemove(item.id)} />
            )}
          </div>
        )
      })}
    </div>
  )
}
