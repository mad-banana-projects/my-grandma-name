'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-actions'
import { buttonVariants } from '@/components/ui/button'

const ANON_NAV_ITEMS = [
  { label: 'Name Generator', href: '/name-generator' },
  { label: 'Browse Gifts', href: '/browse-products' },
]

const BASE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Name Generator', href: '/name-generator' },
  { label: 'Browse Gifts', href: '/browse-products' },
]

interface SideNavProps {
  email?: string
  grandmaProfileId?: string | null
  isAnon?: boolean
  isFreeUser?: boolean
}

export function SideNav({ email, grandmaProfileId, isAnon, isFreeUser }: SideNavProps) {
  const pathname = usePathname()

  const navItems = isAnon
    ? ANON_NAV_ITEMS
    : [
        ...BASE_NAV_ITEMS,
        ...(grandmaProfileId
          ? [{ label: 'My Registry', href: `/registry/${grandmaProfileId}` }]
          : isFreeUser
          ? [{ label: 'My Registry', href: '/registry' }]
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
          {isAnon ? (
            <div className="flex flex-col gap-2">
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }), 'w-full justify-center')}>
                Create account
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full justify-center')}>
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          My Grandma Name
        </Link>
        <nav className="flex items-center gap-3">
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
          {isAnon && (
            <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-7 px-2 text-xs')}>
              Sign in
            </Link>
          )}
        </nav>
      </header>
    </>
  )
}
