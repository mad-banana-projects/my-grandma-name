import Image from 'next/image'

export default function GrandmaTipsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-4 pb-20 pt-[108px] text-center">
        <div className="mx-auto max-w-3xl space-y-6">

          <div className="flex justify-center">
            <Image
              src="/images/wording/purple-logo-with-words.png"
              alt="My Grandma Name"
              width={80}
              height={80}
              className="h-20 w-auto"
              priority
            />
          </div>

          <h1 className="font-heading text-5xl font-light tracking-tight sm:text-6xl">
            Tips for Grandmas
          </h1>

          <p className="text-sm tracking-widest text-muted-foreground">
            - Grandma Inspiration &amp; Ideas -
          </p>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-foreground/80">
            Short, thoughtful videos with tips, encouragement, and little moments of inspiration as you step into your grandma name.
          </p>

          <div className="pt-2">
            <a
              href="https://www.youtube.com/@MyGrandmaName"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-secondary/50 bg-transparent px-6 text-base text-secondary transition-colors hover:bg-secondary/10"
            >
              View on YouTube
            </a>
          </div>

        </div>
      </section>
      {/* Featured video */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(53,51,48,0.12)]">

            {/* Left: portrait video embed */}
            <div className="w-1/2 shrink-0">
              <div className="relative aspect-[9/16] w-full">
                <iframe
                  src="https://www.youtube.com/embed/sHvHsXx3SH4"
                  title="Always speak positively about your grandkids' parents"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

            {/* Right: content panel */}
            <div className="flex w-1/2 flex-col items-center justify-center bg-muted px-8 py-10 text-center">
              <svg viewBox="0 0 24 24" className="mb-5 h-12 w-12 text-secondary" fill="currentColor" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <p className="font-heading text-2xl font-light leading-snug text-foreground">
                Always speak positively about your grandkids&apos; parents.
              </p>
            </div>

          </div>
        </div>

        {/* Video 2 — text left, video right */}
        <div className="mx-auto mt-10 max-w-2xl px-4">
          <div className="flex overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(53,51,48,0.12)]">

            {/* Left: content panel */}
            <div className="flex w-1/2 flex-col items-center justify-center bg-muted px-8 py-10 text-center">
              <p className="font-heading text-2xl font-light leading-snug text-foreground">
                Include yourself in pictures!
              </p>
            </div>

            {/* Right: portrait video embed */}
            <div className="w-1/2 shrink-0">
              <div className="relative aspect-[9/16] w-full">
                <iframe
                  src="https://www.youtube.com/embed/x9GbEYu1KnU"
                  title="Include yourself in pictures"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Video 3 — video left, text right with logo */}
        <div className="mx-auto mt-10 max-w-2xl px-4">
          <div className="flex overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(53,51,48,0.12)]">

            {/* Left: portrait video embed */}
            <div className="w-1/2 shrink-0">
              <div className="relative aspect-[9/16] w-full">
                <iframe
                  src="https://www.youtube.com/embed/ZQ8RkgITKMU"
                  title="Encourage grandkids to find and pursue their passion"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

            {/* Right: content panel */}
            <div className="flex w-1/2 flex-col items-center justify-center gap-5 bg-muted px-8 py-10 text-center">
              <Image
                src="/images/logo/purple-white-logo.png"
                alt="My Grandma Name"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
              <p className="font-heading text-2xl font-light leading-snug text-foreground">
                Encourage grandkids to find &amp; pursue their passion.
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* Founder quote banner */}
      <section className="bg-[#618985] py-16">
        <div className="mx-auto max-w-3xl px-8 text-center">
          <blockquote className="font-heading text-3xl font-light leading-snug text-white sm:text-4xl">
            &ldquo;Your <em>grandma</em>{' '}name is more than a title. It&apos;s a connection to your loved ones.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="h-px w-10 bg-white/60" />
            <cite className="not-italic text-sm text-white/80">Crya, founder</cite>
          </div>
        </div>
      </section>
      {/* Why we started this platform */}
      <section className="bg-[linear-gradient(to_bottom,#f2eaec_0%,#ffffff_100%)] py-20">
        <div className="mx-auto max-w-5xl px-4">

          <div className="mb-12 text-center space-y-4">
            <h2 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
              <em>Why</em> we started this platform
            </h2>
            <p className="text-sm tracking-widest text-muted-foreground">
              - About Us -
            </p>
          </div>

          <div className="grid gap-10 text-sm leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">
            <div className="space-y-4">
              <p>A grandma name is the name your family comes to know you by, the one that shows up in memories, traditions, and the everyday moments that matter most.</p>
              <p>
                For some, it&apos;s something they&apos;ve always known.<br />
                For others, it&apos;s something that evolves naturally over time.
              </p>
              <p>But when it feels right, it sticks.</p>
              <p>It becomes part of how you&apos;re remembered – in the little voices calling for you, in handwritten cards, and in the way your role takes shape within your family.</p>
            </div>
            <div className="space-y-4">
              <p>Whether you choose something timeless, playful, or entirely your own, your grandma name becomes a small but meaningful part of your identity, and a thread that carries through every gift, every visit, and every celebration.</p>
              <p>
                This platform is built to support that.<br />
                To help you find it, define it, and carry it forward in thoughtful ways.
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
