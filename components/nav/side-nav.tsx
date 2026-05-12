'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  familyRegistryId?: string | null
}

export function SideNav({ email, grandmaProfileId, isAnon, isFreeUser, familyRegistryId }: SideNavProps) {
  const pathname = usePathname()

  const navItems = isAnon
    ? ANON_NAV_ITEMS
    : familyRegistryId
    ? [{ label: 'My Registry', href: `/registry/${familyRegistryId}` }]
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
      <nav className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-muted sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/">
            <Image
              src="/images/wording/white-black-logo-with-wording.png"
              alt="My Grandma Name"
              width={176}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-primary/20 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border px-5 py-4 space-y-2">
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
      <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-muted sticky top-0 z-10">
        <Link href="/">
          <Image
            src="/images/wording/white-black-logo-with-wording.png"
            alt="My Grandma Name"
            width={140}
            height={19}
            className="h-[19px] w-auto"
            priority
          />
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
