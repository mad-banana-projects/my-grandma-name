import Image from 'next/image'
import { DinnerPartySection } from '@/components/sections/dinner-party-section'

export default function GrandmaTipsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-4 pb-20 pt-[108px] text-center">
        <div className="mx-auto max-w-6xl space-y-6">

          <div className="flex justify-center">
            <Image
              src="/images/wording/purple-logo-with-words.png"
              alt="My Grandma Name"
              width={96}
              height={96}
              className="h-24 w-auto"
              priority
            />
          </div>

          <h1 className="font-heading text-[88px] font-light tracking-tight">
            Tips for Grandmas
          </h1>

          <p className="text-[17px] tracking-widest text-muted-foreground">
            - Grandma Inspiration &amp; Ideas -
          </p>

          <p className="text-[17px] leading-relaxed text-foreground/80">
            Short, thoughtful videos with tips, encouragement, and little moments of inspiration as you step into your grandma name.
          </p>

          <p className="text-[17px] leading-relaxed text-foreground/80">
            I support grandmas as they strengthen their family connections, embrace their role as a supportive guide, and create a legacy they&apos;re proud of. Too often, grandmas feel overlooked or unsure of where they fit when their adult children begin raising families of their own. Many carry the weight of past self&#8209;criticism or the desire for a &ldquo;second chance&rdquo; at motherhood&mdash;yet the role of a grandma isn&apos;t a re-do, but a beautifully distinct season defined by intention, presence &amp; love. <strong>Every grandma deserves to feel seen, celebrated and appreciated.</strong>
          </p>

          <div className="pt-2">
            <a
              href="https://www.youtube.com/@MyGrandmaName"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/50 bg-[#618985] px-6 text-base text-white transition-colors hover:bg-[#527673]"
            >
              View on YouTube
            </a>
          </div>

        </div>
      </section>
      {/* Featured video */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex gap-3">

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
            <div className="flex w-1/2 flex-col items-start justify-center rounded-tr-2xl bg-[#f2eaec] px-8 py-10">
              <Image src="/images/icons/heart_icon2.png" alt="" width={48} height={48} className="mb-5 h-12 w-auto" aria-hidden />
              <p className="font-heading text-[32px] font-light leading-snug text-foreground">
                Always speak positively about your grandkids&apos; parents.
              </p>
            </div>

          </div>
        </div>

        {/* Video 2 — text left, video right */}
        <div className="mx-auto mt-10 max-w-2xl px-4">
          <div className="flex gap-3">

            {/* Left: content panel */}
            <div className="flex w-1/2 flex-col items-start justify-center rounded-bl-2xl bg-[#f2eaec] px-8 py-10">
              <p className="font-heading text-[32px] font-light leading-snug text-foreground">
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
          <div className="flex gap-3">

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
            <div className="flex w-1/2 flex-col items-start justify-center gap-5 rounded-br-2xl bg-[#f2eaec] px-8 py-10">
              <Image
                src="/images/logo/purple-white-logo.png"
                alt="My Grandma Name"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
              <p className="font-heading text-[32px] font-light leading-snug text-foreground">
                Encourage grandkids to find &amp; pursue their passion.
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* Founder quote banner */}
      <section className="bg-[#618985] py-16">
        <div className="mx-auto max-w-5xl px-8 text-center">
          <blockquote className="font-heading text-4xl font-light leading-snug text-white sm:text-5xl">
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
            <h2 className="font-heading text-[52px] font-light tracking-tight">
              <em>Why</em> we started this platform
            </h2>
            <p className="text-[17px] tracking-widest text-muted-foreground">
              - About Us -
            </p>
          </div>

          <div className="grid gap-10 text-[17px] leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">
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

      <DinnerPartySection />
    </>
  )
}
