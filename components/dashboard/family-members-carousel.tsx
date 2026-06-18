'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Member = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  relationship: string | null
  invite_status: string | null
}

const PAGE_SIZE = 5

export function FamilyMembersCarousel({ members }: { members: Member[] }) {
  const [page, setPage] = useState(0)

  if (members.length === 0) return null

  const totalPages = Math.ceil(members.length / PAGE_SIZE)
  const visible = members.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setPage((p) => p - 1)}
        disabled={page === 0}
        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#618985] text-[#618985] transition-colors hover:bg-[#618985]/10 disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Previous members"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="grid flex-1 grid-cols-5 gap-3">
        {visible.map((member) => (
          <div
            key={member.id}
            className="flex flex-col items-center gap-1.5 rounded-lg border bg-background p-3 text-center"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-[#f2eaec] text-sm font-semibold text-[#8f6593]">
              {member.first_name
                ? member.first_name[0].toUpperCase()
                : member.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 w-full">
              <p className="truncate text-xs font-medium">
                {member.first_name && member.last_name
                  ? `${member.first_name} ${member.last_name}`
                  : member.email}
              </p>
              {member.relationship && (
                <p className="truncate text-[10px] capitalize text-muted-foreground">
                  {member.relationship}
                </p>
              )}
            </div>
            <Badge
              variant={member.invite_status === 'accepted' ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {member.invite_status === 'accepted' ? 'Joined' : 'Invited'}
            </Badge>
          </div>
        ))}

        {/* Fill empty slots so the row stays full width */}
        {Array.from({ length: PAGE_SIZE - visible.length }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded-lg border border-dashed border-border/40 bg-transparent" />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPage((p) => p + 1)}
        disabled={page >= totalPages - 1}
        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#618985] text-[#618985] transition-colors hover:bg-[#618985]/10 disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Next members"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
