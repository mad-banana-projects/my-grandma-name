import Image from 'next/image'
import { DinnerPartySection } from '@/components/sections/dinner-party-section'

export default function AboutPage() {
  return (
    <>
      {/* Hero: image left, content right */}
      <section className="flex flex-col sm:flex-row sm:items-stretch">

        {/* Left: photo — full image, no crop */}
        <div className="w-full sm:w-1/2">
          <Image
            src="/images/about-page/grandmother-with-grandkid.jpg"
            alt="Grandmother with grandchild"
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
      <section className="relative overflow-hidden px-8 py-20 sm:py-28">
        <Image
          src="/images/about-page/grandmother-running.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 sm:items-center">
          <h2 className="font-heading text-4xl font-light leading-tight text-white sm:text-5xl">
            Personal,<br />
            Thoughtful, and<br />
            Entirely Yours
          </h2>
          <p className="text-base leading-relaxed text-white/80 sm:text-right">
            From the name they call you to the way you&apos;re celebrated,<br />
            every detail should feel like it fits.
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

      {/* Closing about section */}
      <section className="bg-[linear-gradient(135deg,#f5eef2_0%,#faf7f8_50%,#f0edf5_100%)] py-24">
        <div className="mx-auto max-w-2xl px-8">
          <Image
            src="/images/wording/white-black-logo-with-wording.png"
            alt="My Grandma Name"
            width={320}
            height={80}
            className="h-16 w-auto"
          />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              My Grandma Name is being built to make gifting feel thoughtful again — with curated ideas, gentle reminders, and personalized touches that reflect who you are and how your family knows you.
            </p>
            <p>
              Everything is centered around your grandma name, so every gift, every moment, and every memory feels a little more intentional.
            </p>
          </div>
        </div>
      </section>

      {/* 3-photo grid + quote */}
      <section className="bg-white">

        {/* Images */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/about-page/grandmother-with-family-gifting.jpg"
              alt="Grandmother receiving a gift from family"
              fill
              className="object-cover object-top"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/about-page/grandmother-with-family-hugging.jpg"
              alt="Grandmother hugging family member"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/about-page/grandmother-with-family-cooking.jpg"
              alt="Grandmother cooking with family"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Quote */}
        <div className="mx-auto w-[80%] py-16 text-center">
          <blockquote className="font-heading text-3xl font-light leading-snug text-foreground sm:text-4xl">
            &ldquo;It becomes part of how you&apos;re remembered &ndash; in the little voices calling for you, in handwritten cards, and in the way your role takes shape within your family.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="h-px w-10 bg-foreground/40" />
            <cite className="not-italic text-sm text-foreground/60">Crya, founder</cite>
          </div>
        </div>

      </section>

      {/* Fixed parallax background section */}
      <section
        className="relative bg-fixed bg-cover bg-center py-24"
        style={{ backgroundImage: "url('/images/about-page/grandmother-with-family.jpg')" }}
      >
        <div className="mx-auto max-w-4xl rounded-2xl bg-white px-12 py-14 shadow-[0_4px_40px_rgba(53,51,48,0.15)]">

          {/* Heading */}
          <h2 className="font-heading text-center text-4xl font-light tracking-tight sm:text-5xl">
            <em>Why</em> we started this platform
          </h2>
          <p className="mt-3 text-center text-sm tracking-widest text-muted-foreground">
            - About Us -
          </p>

          {/* 2-col body */}
          <div className="mt-10 grid gap-10 text-sm leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">
            <div className="space-y-4">
              <p>A grandma name is the name your family comes to know you by, the one that shows up in memories, traditions, and the everyday moments that matter most.</p>
              <p>
                For some, it&apos;s something they&apos;ve always known.<br />
                For others, it&apos;s something that evolves naturally over time.
              </p>
              <p>But when it feels right, it sticks.</p>
              <p>It becomes part of how you&apos;re remembered &ndash; in the little voices calling for you, in handwritten cards, and in the way your role takes shape within your family.</p>
            </div>
            <div className="space-y-4">
              <p>Whether you choose something timeless, playful, or entirely your own, your <em>grandma</em> name becomes a small but meaningful part of your identity, and a thread that carries through every gift, every visit, and every celebration.</p>
              <p>This platform is built to support that. To help you find it, define it, and carry it forward in thoughtful ways.</p>
            </div>
          </div>

        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      <DinnerPartySection />
    </>
  )
}
