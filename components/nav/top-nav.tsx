'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth-actions'

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@MyGrandmaName',
  tiktok: 'https://www.tiktok.com/@crya.mygrandmaname?lang=en',
}

interface TopNavProps {
  user: { email: string } | null
  appNavItems?: { label: string; href: string }[]
}

export function TopNav({ user, appNavItems = [] }: TopNavProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isHome = pathname === '/'
  const isSolid = !isHome || scrolled

  useEffect(() => {
    if (!isHome) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    if (!profileOpen) return
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <nav
        className={cn(
          'fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between px-6 py-4 transition-colors duration-300',
          isSolid ? 'bg-[#dcb6c9]' : 'bg-transparent'
        )}
      >
        {/* Left: logo + app nav items */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image
              src="/images/wording/white-logo-with-wording.png"
              alt="My Grandma Name"
              width={168}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {appNavItems.length > 0 && (
            <div className="hidden items-center gap-1 md:flex">
              {appNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    pathname.startsWith(item.href)
                      ? 'bg-white/30 font-medium text-white'
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: auth-dependent links — desktop only */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <User className="size-5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg">
                  <div className="px-4 py-2">
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="my-1 border-t border-border" />

                  <Link
                    href="/about"
                    className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/grandma-tips"
                    className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    Grandma Tips
                  </Link>

                  <div className="flex items-center gap-3 px-4 py-2">
                    <a
                      href={SOCIAL_LINKS.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <YouTubeIcon />
                    </a>
                    <a
                      href={SOCIAL_LINKS.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <TikTokIcon />
                    </a>
                  </div>

                  <div className="my-1 border-t border-border" />

                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/90 transition-colors hover:text-white">
                Log in
              </Link>
              <Link href="/about" className="text-sm text-white/90 transition-colors hover:text-white">
                About
              </Link>
              <Link href="/grandma-tips" className="text-sm text-white/90 transition-colors hover:text-white">
                Grandma Tips
              </Link>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <YouTubeIcon />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <TikTokIcon />
              </a>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] z-40 flex flex-col gap-1 bg-[#dcb6c9] px-4 py-4 md:hidden">
          {appNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-3 text-base font-medium text-white transition-colors hover:bg-white/20',
                pathname.startsWith(item.href) && 'bg-white/30'
              )}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <>
              {appNavItems.length > 0 && <div className="my-1 border-t border-white/30" />}
              <p className="px-3 py-1 text-xs text-white/70 truncate">{user.email}</p>
              <Link href="/about" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">About</Link>
              <Link href="/grandma-tips" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Grandma Tips</Link>
              <div className="flex items-center gap-5 px-3 py-3">
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/90 hover:text-white"><YouTubeIcon /></a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/90 hover:text-white"><TikTokIcon /></a>
              </div>
              <div className="my-1 border-t border-white/30" />
              <form action={signOut}>
                <button type="submit" className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-white hover:bg-white/20">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              {appNavItems.length > 0 && <div className="my-1 border-t border-white/30" />}
              <Link href="/login" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Log in</Link>
              <Link href="/about" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">About</Link>
              <Link href="/grandma-tips" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Grandma Tips</Link>
              <div className="flex items-center gap-5 px-3 py-3">
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/90 hover:text-white"><YouTubeIcon /></a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/90 hover:text-white"><TikTokIcon /></a>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
