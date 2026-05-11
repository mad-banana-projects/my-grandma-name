'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { removeRegistryItem } from '@/app/(app)/registry/actions'

export type RegistryItem = {
  id: string
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

  function handleClick() {
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
      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
    >
      <X className="h-4 w-4" />
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
    <div className="space-y-3">
      {items.map((item) => {
        const imageUrl = item.product.image_urls?.[0] ?? null
        const outboundUrl = item.product.affiliate_url ?? item.product.product_url
        const priceDisplay = formatPrice(item.product.price)

        return (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border bg-background p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/30">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.product.name}
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
              {item.product.brand && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.product.brand}
                </p>
              )}
              <p className="truncate text-sm font-semibold">{item.product.name}</p>
              {item.variant && (
                <p className="text-xs text-muted-foreground">{item.variant.label}</p>
              )}
              {priceDisplay && (
                <p className="text-xs text-muted-foreground">{priceDisplay}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <a
                href={outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
              >
                View
              </a>
              {isOwner && <RemoveButton itemId={item.id} onRemove={() => handleRemove(item.id)} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
