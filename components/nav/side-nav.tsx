'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-actions'

const BASE_NAV_ITEMS = [
  { label: 'My Profile', href: '/grandma-profile' },
  { label: 'Name Generator', href: '/name-generator' },
  { label: 'Browse Gifts', href: '/browse-products' },
]

interface SideNavProps {
  email: string
  grandmaProfileId: string | null
}

export function SideNav({ email, grandmaProfileId }: SideNavProps) {
  const pathname = usePathname()

  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(grandmaProfileId
      ? [{ label: 'My Registry', href: `/registry/${grandmaProfileId}` }]
      : []),
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r bg-background sticky top-0 h-screen">
        <div className="px-5 py-5 border-b">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            My Grandma Name
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="border-t px-5 py-4 space-y-2">
          <p className="text-xs text-muted-foreground truncate">{email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          My Grandma Name
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-xs transition-colors',
                isActive(item.href)
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label.split(' ')[0]}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}
