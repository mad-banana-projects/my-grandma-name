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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/@MyGrandmaName',
  tiktok: 'https://www.tiktok.com/@crya.mygrandmaname?lang=en',
  instagram: 'https://www.instagram.com/crya.grandma/',
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
          'fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between px-6 py-1 transition-colors duration-300',
          isSolid ? 'bg-black/20 backdrop-blur-md' : 'bg-transparent'
        )}
      >
        {/* Left: logo + app nav items */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image
              src="/images/wording/white-logo-with-wording.png"
              alt="My Grandma Name"
              width={262}
              height={56}
              className="h-[56px] w-auto"
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
                className="flex size-9 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
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
                    <a
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <InstagramIcon />
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
              <Link href="/login" className="text-[17px] text-white/90 transition-colors hover:text-white">
                Log In
              </Link>
              <Link href="/about" className="text-[17px] text-white/90 transition-colors hover:text-white">
                About
              </Link>
              <Link href="/grandma-tips" className="text-[17px] text-white/90 transition-colors hover:text-white">
                Grandma Tips
              </Link>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex size-8 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
              >
                <YouTubeIcon />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex size-8 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
              >
                <TikTokIcon />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-8 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
              >
                <InstagramIcon />
              </a>
            </>
          )}
        </div>

        {/* Hamburger + social icons — mobile only */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="flex size-9 items-center justify-center rounded-full bg-[#8f6593] text-white transition-colors hover:bg-[#7a5680]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex size-9 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
          >
            <YouTubeIcon />
          </a>
          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex size-9 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
          >
            <TikTokIcon />
          </a>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex size-9 items-center justify-center rounded-full bg-white text-[#dcb6c9] transition-colors hover:bg-white/90"
          >
            <InstagramIcon />
          </a>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] z-40 flex flex-col gap-1 bg-[#dcb6c9] px-4 py-4 md:hidden">
          {user ? (
            <>
              <p className="px-3 py-1 text-xs text-white/70 truncate">{user.email}</p>
              <Link href="/about" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">About</Link>
              <Link href="/grandma-tips" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Grandma Tips</Link>
              <div className="flex items-center gap-5 px-3 py-3">
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/90 hover:text-white"><YouTubeIcon /></a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/90 hover:text-white"><TikTokIcon /></a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/90 hover:text-white"><InstagramIcon /></a>
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
              <Link href="/login" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Log in</Link>
              <Link href="/about" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">About</Link>
              <Link href="/grandma-tips" className="rounded-lg px-3 py-3 text-base font-medium text-white hover:bg-white/20">Grandma Tips</Link>
              <div className="flex items-center gap-5 px-3 py-3">
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/90 hover:text-white"><YouTubeIcon /></a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/90 hover:text-white"><TikTokIcon /></a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/90 hover:text-white"><InstagramIcon /></a>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
