import Link from 'next/link'

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

export function FooterBar() {
  return (
    <footer className="bg-[#dcb6c9] px-6 py-4">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4">

        {/* Left: copyright */}
        <p className="text-xs text-white/90">
          &copy; My Grandma Name, All Rights Reserved
        </p>

        {/* Center: social icons */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.youtube.com/@MyGrandmaName"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <YouTubeIcon />
          </a>
          <a
            href="https://www.tiktok.com/@crya.mygrandmaname?lang=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <TikTokIcon />
          </a>
        </div>

        {/* Right: links */}
        <div className="flex items-center gap-4 text-xs text-white/90">
          <Link href="/privacy-policy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
          <a
            href="https://madbananamktg.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Web Design By Mad Banana marketing
          </a>
        </div>

      </div>
    </footer>
  )
}
