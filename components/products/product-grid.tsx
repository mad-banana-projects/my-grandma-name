'use client'

import { useState } from 'react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { ProductCard, type Product } from '@/components/products/product-card'
import { cn } from '@/lib/utils'

type Category = 'all' | 'personal' | 'home' | 'entertaining'

const FILTERS: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'home', label: 'Home' },
  { value: 'entertaining', label: 'Entertaining' },
]

type Props = {
  products: Product[]
  isAnonymous: boolean
  previewLimit: number
  savedItems?: Map<string, string | null>
  grandmaProfileId?: string | null
}

export function ProductGrid({
  products,
  isAnonymous,
  previewLimit,
  savedItems = new Map(),
  grandmaProfileId = null,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory)

  const visible = isAnonymous ? filtered.slice(0, previewLimit) : filtered
  const hiddenCount = isAnonymous ? Math.max(0, filtered.length - previewLimit) : 0

  const isPaidUser = grandmaProfileId !== null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              activeCategory === value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-foreground hover:border-foreground/40'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i === 0}
              isSaved={savedItems.has(product.id)}
              savedVariantId={savedItems.get(product.id) ?? null}
              isPaidUser={isPaidUser}
            />
          ))}
        </div>
      )}

      {isAnonymous && hiddenCount > 0 && (
        <div className="rounded-lg border bg-muted/30 px-6 py-10 text-center space-y-4">
          <p className="text-sm font-medium">
            {hiddenCount} more {hiddenCount === 1 ? 'product' : 'products'} in the collection
          </p>
          <p className="text-sm text-muted-foreground">
            Create a free account to browse the full curated marketplace.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup/grandma" className={buttonVariants()}>
              Create free account
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
              Sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
