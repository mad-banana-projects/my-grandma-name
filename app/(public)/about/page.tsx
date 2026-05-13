import Image from 'next/image'
import { LandingNav } from '@/components/nav/landing-nav'

export default function AboutPage() {
  return (
    <>
      <LandingNav alwaysSolid />

      {/* Hero: image left, content right */}
      <section className="flex flex-col sm:flex-row sm:items-stretch">

        {/* Left: photo — full image, no crop */}
        <div className="w-full sm:w-1/2">
          <Image
            src="/images/about-page/about-page.jpg"
            alt="Two women smiling together"
            width={821}
            height={583}
            className="h-auto w-full"
            priority
          />
        </div>

        {/* Right: content */}
        <div className="flex w-full items-center bg-background px-10 py-10 sm:w-1/2 sm:px-16">
          <div className="max-w-lg space-y-5">
            <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
              About <em>My</em> Grandma Name
            </h1>
            <p className="font-heading text-lg font-semibold italic">
              Where a name becomes part of something bigger
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              My Grandma Name is being built to make gifting feel thoughtful again — with curated ideas, gentle reminders, and personalized touches that reflect who you are and how your family knows you.
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              Everything is centered around your grandma name, so every gift, every moment, and every memory feels a little more intentional.
            </p>
          </div>
        </div>

      </section>

      {/* About Us — for grandparents and families */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">

          {/* Logo + heading */}
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <Image
              src="/images/wording/purple-logo-with-words.png"
              alt="My Grandma Name"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
            <h2 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
              About Us
            </h2>
            <p className="text-sm tracking-widest text-muted-foreground">
              - For grandparents and families alike -
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid gap-10 text-sm leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">

            {/* Col 1: For grandparents */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">For grandparents...</h3>
              <p>This is a space designed with you in mind.</p>
              <p>
                To help you define what you want to be called.<br />
                To give you a way to express your style, your personality, and how you show up in your family.
              </p>
              <p>And eventually, to make sure the things you receive feel just as thoughtful as the role you hold.</p>
              <p>
                My Grandma Name is being built to help take the guesswork out of gifting and replace it with something more personal, more useful, and more reflective of you. From curated gift ideas to personalized touches and gentle reminders for the people who love you, the goal is to make every part of the experience feel a little more intentional.
              </p>
              <p>Because this role is meaningful, and the way your family celebrates you should feel that way too.</p>
            </div>

            {/* Col 2: For families */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">For families...</h3>
              <p>This is just as much for the people giving as it is for the one receiving.</p>
              <p>
                My Grandma Name is being built to take the pressure out of figuring out what to get, when to get it, and whether it will actually feel meaningful. Instead of scrambling for ideas or defaulting to something generic, families will have a more thoughtful way to stay connected to what she likes, how she wants to be celebrated, and what feels personal to her.
              </p>
              <p>From gift inspiration to reminders and personalized touches, the goal is to make showing up feel easier — and getting it right feel natural.</p>
              <p>Because the best gifts are not just useful. They feel considered, personal, and chosen with her in mind.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Personal, Thoughtful, and Entirely Yours */}
      <section className="bg-[#353330] px-8 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 sm:items-center">
          <h2 className="font-heading text-4xl font-light leading-tight text-white sm:text-5xl">
            Personal,<br />
            Thoughtful, and<br />
            Entirely Yours
          </h2>
          <p className="text-base leading-relaxed text-white/80 sm:text-right">
            From the name they call you to the way you&apos;re celebrated, every detail should feel like it fits.
          </p>
        </div>
      </section>

      {/* What this is becoming */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
            What this is becoming
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-foreground/70">
            <em>My</em> Grandma Name is evolving into a platform designed to make gifting, remembering, and celebrating feel more intentional — without adding more to think about.
          </p>

          <div className="mt-16 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Col 1 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14 text-secondary" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <p className="text-sm font-bold italic text-foreground">Curated gift ideas</p>
              <p className="text-sm text-foreground/70">that actually feel thoughtful</p>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14 text-secondary" aria-hidden>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zM7 10h5v5H7z" />
              </svg>
              <p className="text-sm font-bold italic text-foreground">Reminders</p>
              <p className="text-sm text-foreground/70">for the moments that matter</p>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14 text-secondary" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <p className="text-sm font-bold italic text-foreground">Personalized touches</p>
              <p className="text-sm text-foreground/70">built around your <em>grandma</em> name</p>
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
    </>
  )
}
