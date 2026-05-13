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
    </>
  )
}
