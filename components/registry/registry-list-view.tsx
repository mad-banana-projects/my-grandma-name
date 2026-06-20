'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, Pencil, Trash2, Plus, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

  function handleSelect(listId: string | null) {
    setOpen(false)
    startTransition(async () => {
      const result = await assignItemToList(item.id, listId)
      if (result.success) onAssign(item.id, listId)
    })
  }

  const currentList = lists.find((l) => l.id === item.listId)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="flex items-center gap-1 rounded-md bg-[#618985] px-2 py-1 text-xs text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition-colors hover:bg-[#527673] disabled:opacity-40"
      >
        <span>{currentList ? currentList.name : 'No List'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">Assign to list</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {!item.listId && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className={cn(!item.listId && 'font-medium')}>No List</span>
            </button>
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => handleSelect(list.id)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  {item.listId === list.id && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className={cn(item.listId === list.id && 'font-medium')}>{list.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const imageUrl = item.product.image_urls?.[0] ?? null
  const outboundUrl = item.product.affiliate_url ?? item.product.product_url
  const priceDisplay = formatPrice(item.product.price)

  function handleConfirmRemove() {
    startRemoveTransition(async () => {
      const result = await removeRegistryItem(item.id)
      if (result.success) {
        setConfirmOpen(false)
        onRemove(item.id)
      }
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      <a href={outboundUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col">
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
        <div className="flex flex-1 flex-col gap-0.5 p-3">
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
          onClick={(e) => { e.preventDefault(); setConfirmOpen(true) }}
          aria-label="Remove from registry"
          className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Remove confirmation modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove from Registry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <span className="font-medium text-foreground">{item.product.name}</span> from your registry?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <h2 className="flex-1 font-heading text-[clamp(24px,2.66vw,34px)] font-light tracking-tight">{list.name}</h2>
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
        className="flex items-center gap-1.5 rounded-md bg-[#618985] px-3 py-1.5 text-sm text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition-colors hover:bg-[#527673]"
      >
        <Plus className="h-4 w-4" />
        New List
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
        className="rounded-md bg-[#8f6593] px-3 py-1 text-xs font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition-colors hover:bg-[#7a5580] disabled:opacity-40"
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
              <h2 className="font-heading text-[clamp(24px,2.66vw,34px)] font-light tracking-tight text-muted-foreground">Uncategorized</h2>
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
