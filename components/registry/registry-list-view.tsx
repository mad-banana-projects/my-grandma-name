'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Pencil, Trash2, Plus, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createList,
  renameList,
  deleteList,
  assignItemToList,
  removeRegistryItem,
  type RegistryList,
} from '@/app/(app)/registry/actions'
import type { RegistryItem } from './registry-item-list'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: string | null): string | null {
  if (!price) return null
  return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// ─── List assignment dropdown ─────────────────────────────────────────────────

function AssignListDropdown({
  item,
  lists,
  onAssign,
}: {
  item: RegistryItem
  lists: RegistryList[]
  onAssign: (itemId: string, listId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(listId: string | null) {
    setOpen(false)
    startTransition(async () => {
      const result = await assignItemToList(item.id, listId)
      if (result.success) onAssign(item.id, listId)
    })
  }

  const currentList = lists.find((l) => l.id === item.listId)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <span>{currentList ? currentList.name : 'No list'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-md border bg-background shadow-md">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
          >
            {!item.listId && <Check className="h-3 w-3 shrink-0" />}
            <span className={cn(!item.listId && 'font-medium')}>No list</span>
          </button>
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => handleSelect(list.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted"
            >
              {item.listId === list.id && <Check className="h-3 w-3 shrink-0" />}
              <span className={cn(item.listId === list.id && 'font-medium')}>{list.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single item card ─────────────────────────────────────────────────────────

function RegistryItemCard({
  item,
  lists,
  isOwner,
  onRemove,
  onAssign,
}: {
  item: RegistryItem
  lists: RegistryList[]
  isOwner: boolean
  onRemove: (itemId: string) => void
  onAssign: (itemId: string, listId: string | null) => void
}) {
  const [isRemoving, startRemoveTransition] = useTransition()
  const imageUrl = item.product.image_urls?.[0] ?? null
  const outboundUrl = item.product.affiliate_url ?? item.product.product_url
  const priceDisplay = formatPrice(item.product.price)

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault()
    startRemoveTransition(async () => {
      const result = await removeRegistryItem(item.id)
      if (result.success) onRemove(item.id)
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background">
      <a href={outboundUrl} target="_blank" rel="noopener noreferrer" className="block">
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
          {item.variant && <p className="text-xs text-muted-foreground">{item.variant.label}</p>}
          {priceDisplay && <p className="mt-0.5 text-sm font-semibold">{priceDisplay}</p>}
        </div>
      </a>

      {/* List assignment — outside the link */}
      {isOwner && (
        <div className="px-3 pb-3">
          <AssignListDropdown item={item} lists={lists} onAssign={onAssign} />
        </div>
      )}

      {/* Remove button */}
      {isOwner && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label="Remove from registry"
          className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── List section header ──────────────────────────────────────────────────────

function ListSectionHeader({
  list,
  isOwner,
  onRenamed,
  onDeleted,
}: {
  list: RegistryList
  isOwner: boolean
  onRenamed: (listId: string, name: string) => void
  onDeleted: (listId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(list.name)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleRename() {
    if (!draft.trim() || draft.trim() === list.name) { setEditing(false); setDraft(list.name); return }
    startTransition(async () => {
      const result = await renameList(list.id, draft.trim())
      if (result.success) { onRenamed(list.id, draft.trim()); setEditing(false) }
      else { setDraft(list.name); setEditing(false) }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteList(list.id)
      if (result.success) onDeleted(list.id)
    })
  }

  return (
    <div className="flex items-center gap-2 border-b pb-2">
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setEditing(false); setDraft(list.name) } }}
            className="flex-1 rounded border px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
            maxLength={50}
          />
          <button
            type="button"
            onClick={handleRename}
            disabled={isPending}
            className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Save name"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setDraft(list.name) }}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <h2 className="flex-1 text-sm font-semibold">{list.name}</h2>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Rename list"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
                aria-label="Delete list"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── Create list form ─────────────────────────────────────────────────────────

function CreateListForm({ onCreate }: { onCreate: (list: RegistryList) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => {
      const result = await createList(name.trim())
      if (result.success) {
        onCreate(result.list)
        setName('')
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        New list
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setOpen(false); setName('') } }}
        placeholder="List name"
        maxLength={50}
        className="rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={!name.trim() || isPending}
        className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background disabled:opacity-40"
      >
        Create
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setName('') }}
        className="rounded p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RegistryListViewProps {
  initialItems: RegistryItem[]
  initialLists: RegistryList[]
  isOwner: boolean
  isPaidOwner: boolean
  grandmaId: string
}

export function RegistryListView({
  initialItems,
  initialLists,
  isOwner,
  isPaidOwner,
}: RegistryListViewProps) {
  const [items, setItems] = useState(initialItems)
  const [lists, setLists] = useState(initialLists)

  function handleRemoveItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  function handleAssign(itemId: string, listId: string | null) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, listId } : i))
  }

  function handleCreateList(list: RegistryList) {
    setLists((prev) => [...prev, list])
  }

  function handleRenameList(listId: string, name: string) {
    setLists((prev) => prev.map((l) => l.id === listId ? { ...l, name } : l))
  }

  function handleDeleteList(listId: string) {
    setLists((prev) => prev.filter((l) => l.id !== listId))
    setItems((prev) => prev.map((i) => i.listId === listId ? { ...i, listId: null } : i))
  }

  const itemsByList = lists.map((list) => ({
    list,
    items: items.filter((i) => i.listId === list.id),
  }))
  const uncategorized = items.filter((i) => !i.listId)

  const isEmpty = items.length === 0

  return (
    <div className="space-y-8">
      {/* Owner: new list button */}
      {isOwner && isPaidOwner && (
        <CreateListForm onCreate={handleCreateList} />
      )}

      {isEmpty && (
        <div className="rounded-lg border bg-background">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">No gifts saved yet.</p>
            <a href="/browse-products" className="text-sm font-medium underline underline-offset-4">
              Browse gift ideas →
            </a>
          </div>
        </div>
      )}

      {/* Named lists */}
      {itemsByList.map(({ list, items: listItems }) => {
        if (!isOwner && listItems.length === 0) return null
        return (
          <div key={list.id} className="space-y-3">
            <ListSectionHeader
              list={list}
              isOwner={isOwner && isPaidOwner}
              onRenamed={handleRenameList}
              onDeleted={handleDeleteList}
            />
            {listItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this list yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {listItems.map((item) => (
                  <RegistryItemCard
                    key={item.id}
                    item={item}
                    lists={lists}
                    isOwner={isOwner && isPaidOwner}
                    onRemove={handleRemoveItem}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div className="space-y-3">
          {lists.length > 0 && (
            <div className="border-b pb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Uncategorized</h2>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {uncategorized.map((item) => (
              <RegistryItemCard
                key={item.id}
                item={item}
                lists={lists}
                isOwner={isOwner && isPaidOwner}
                onRemove={handleRemoveItem}
                onAssign={handleAssign}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
