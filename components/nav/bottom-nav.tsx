'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Gift, ShoppingBag, Users, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Profile',
    href: '/dashboard#about-me',
    icon: User,
    isActive: (pathname: string, hash: string) =>
      pathname === '/dashboard' && (!hash || hash === '#about-me'),
  },
  {
    label: 'Registry',
    href: '/registry',
    icon: Gift,
    isActive: (pathname: string) => pathname.startsWith('/registry'),
  },
  {
    label: 'Browse',
    href: '/browse-products',
    icon: ShoppingBag,
    isActive: (pathname: string) => pathname.startsWith('/browse-products'),
  },
  {
    label: 'Family',
    href: '/dashboard#my-family',
    icon: Users,
    isActive: (pathname: string, hash: string) =>
      pathname === '/dashboard' && hash === '#my-family',
  },
  {
    label: 'Reminders',
    href: '/dashboard#email-reminders',
    icon: Bell,
    isActive: (pathname: string, hash: string) =>
      pathname === '/dashboard' && hash === '#email-reminders',
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(window.location.hash)
    const handler = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-stretch border-t border-border bg-white md:hidden">
      {NAV_ITEMS.map(({ label, href, icon: Icon, isActive }) => {
        const active = isActive(pathname, hash)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setHash(new URL(href, window.location.href).hash)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors',
              active ? 'text-[#8f6593]' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
