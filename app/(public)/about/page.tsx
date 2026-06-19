import Image from 'next/image'
import { DinnerPartySection } from '@/components/sections/dinner-party-section'

export default function AboutPage() {
  return (
    <>
      {/* Hero: image left, content right */}
      <section className="flex flex-col pt-[clamp(58px,6.48vw,83px)] md:flex-row md:items-stretch">

        {/* Left: photo — fills column height, always rounded */}
        <div className="min-h-[400px] w-full overflow-hidden rounded-br-3xl md:w-1/2">
          <Image
            src="/images/about-page/grandmother-with-grandkid.jpg"
            alt="Grandmother with grandchild"
            width={821}
            height={583}
            className="h-full w-full object-cover object-center"
            priority
          />
        </div>

        {/* Right: content */}
        <div className="flex w-full items-center bg-background px-10 py-10 md:w-1/2 md:px-16">
          <div className="max-w-[45rem] space-y-5">
            <h1 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">
              About <em>My</em> Grandma Name
            </h1>
            <p className="text-[clamp(20px,1.95vw,25px)] [font-family:var(--font-arno-italic)]">
              Where a name becomes part of something bigger
            </p>
            <p className="text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80">
              My Grandma Name is being built to make gifting feel thoughtful again — with curated ideas, gentle reminders, and personalized touches that reflect who you are and how your family knows you.
            </p>
            <p className="text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80">
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
              width={115}
              height={115}
              className="h-[115px] w-auto"
            />
            <h2 className="font-heading text-[clamp(52px,6.875vw,88px)] font-light tracking-tight">
              About Us
            </h2>
            <p className="text-[clamp(13px,1.33vw,17px)] tracking-widest text-gray-300">
              - For grandparents and families alike -
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid gap-10 leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">

            {/* Col 1: For grandparents */}
            <div className="space-y-4 text-justify">
              <h3 className="text-[clamp(24px,2.66vw,34px)] text-foreground [font-family:var(--font-arno-italic)]">For grandparents...</h3>
              <p className="text-[clamp(13px,1.33vw,17px)]">This is a space designed with you in mind.</p>
              <p className="text-[clamp(13px,1.33vw,17px)]">
                To help you define what you want to be called.<br />
                To give you a way to express your style, your personality, and how you show up in your family.
              </p>
              <p className="text-[clamp(13px,1.33vw,17px)]">And eventually, to make sure the things you receive feel just as thoughtful as the role you hold.</p>
              <p className="text-[clamp(13px,1.33vw,17px)]">
                My Grandma Name is being built to help take the guesswork out of gifting and replace it with something more personal, more useful, and more reflective of you. From curated gift ideas to personalized touches and gentle reminders for the people who love you, the goal is to make every part of the experience feel a little more intentional.
              </p>
              <p className="text-[clamp(13px,1.33vw,17px)]">Because this role is meaningful, and the way your family celebrates you should feel that way too.</p>
            </div>

            {/* Col 2: For families */}
            <div className="space-y-4 text-justify">
              <h3 className="text-[clamp(24px,2.66vw,34px)] text-foreground [font-family:var(--font-arno-italic)]">For families...</h3>
              <p className="text-[clamp(13px,1.33vw,17px)]">This is just as much for the people giving as it is for the one receiving.</p>
              <p className="text-[clamp(13px,1.33vw,17px)]">
                My Grandma Name is being built to take the pressure out of figuring out what to get, when to get it, and whether it will actually feel meaningful. Instead of scrambling for ideas or defaulting to something generic, families will have a more thoughtful way to stay connected to what she likes, how she wants to be celebrated, and what feels personal to her.
              </p>
              <p className="text-[clamp(13px,1.33vw,17px)]">From gift inspiration to reminders and personalized touches, the goal is to make showing up feel easier — and getting it right feel natural.</p>
              <p className="text-[clamp(13px,1.33vw,17px)]">Because the best gifts are not just useful. They feel considered, personal, and chosen with her in mind.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Personal, Thoughtful, and Entirely Yours */}
      <section className="relative overflow-hidden px-8 py-28 sm:py-48">
        <Image
          src="/images/about-page/grandmother-running.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10">
          <h2 className="font-heading text-4xl font-light leading-tight text-white sm:text-5xl">
            Personal,<br />
            Thoughtful, and<br />
            Entirely Yours
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/80 sm:ml-auto sm:text-right">
            From the name they call you to the way you&apos;re celebrated,<br />
            every detail should feel like it fits.
          </p>
        </div>
      </section>

      {/* What this is becoming */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[90rem] px-4 text-center">
          <h2 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">
            What this is becoming
          </h2>
          <p className="mt-4 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/70">
            <em>My</em> Grandma Name is evolving into a platform designed to make gifting, remembering, and celebrating feel more intentional — without adding more to think about.
          </p>

          <div className="mt-16 grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Col 1 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <Image src="/images/icons/heart_icon2.png" alt="Curated gift ideas" width={111} height={111} />
              <p className="text-[clamp(20px,1.95vw,25px)] text-foreground [font-family:var(--font-arno-italic)]">Curated gift ideas</p>
              <p className="text-[clamp(13px,1.33vw,17px)] text-foreground/70">that actually feel thoughtful</p>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <Image src="/images/icons/calendar_icon.png" alt="Reminders" width={111} height={111} />
              <p className="text-[clamp(20px,1.95vw,25px)] text-foreground [font-family:var(--font-arno-italic)]">Reminders</p>
              <p className="text-[clamp(13px,1.33vw,17px)] text-foreground/70">for the moments that matter</p>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col items-center gap-4 px-8 py-8 sm:py-4">
              <Image src="/images/icons/heart_icon.png" alt="Personalized touches" width={111} height={111} />
              <p className="text-[clamp(20px,1.95vw,25px)] text-foreground [font-family:var(--font-arno-italic)]">Personalized touches</p>
              <p className="text-[clamp(13px,1.33vw,17px)] text-foreground/70">built around your <em>grandma</em> name</p>
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

      {/* Closing about section */}
      <section className="bg-[linear-gradient(135deg,#f5eef2_0%,#faf7f8_50%,#f0edf5_100%)] py-24">
        <div className="mx-auto max-w-3xl px-8">
          <Image
            src="/images/wording/white-black-logo-with-wording.png"
            alt="My Grandma Name"
            width={384}
            height={96}
            className="h-[77px] w-auto"
          />
          <div className="mt-8 space-y-4 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80">
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
        className="relative mx-14 overflow-hidden bg-cover bg-center py-24"
        style={{ backgroundImage: "url('/images/about-page/grandmother-with-family.jpg')" }}
      >
        {/* Green vertical line above card */}
        <div className="absolute left-1/2 top-5 h-14 w-[2px] -translate-x-1/2 bg-[#618985]" />

        <div className="mx-auto w-[88%] max-w-4xl rounded-2xl bg-white px-12 py-14 shadow-[0_4px_40px_rgba(53,51,48,0.15)]">

          {/* Heading */}
          <h2 className="font-heading text-center text-[clamp(26px,3.5vw,48px)] font-light tracking-tight">
            <em>Why</em> we started this platform
          </h2>
          <p className="mt-3 text-center text-sm tracking-widest text-muted-foreground">
            - About Us -
          </p>

          {/* 2-col body */}
          <div className="mt-10 grid gap-10 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80 min-[900px]:grid-cols-2 min-[900px]:gap-16">
            <div className="space-y-4 text-justify">
              <p>A grandma name is the name your family comes to know you by, the one that shows up in memories, traditions, and the everyday moments that matter most.</p>
              <p>
                For some, it&apos;s something they&apos;ve always known.<br />
                For others, it&apos;s something that evolves naturally over time.
              </p>
              <p>But when it feels right, it sticks.</p>
              <p>It becomes part of how you&apos;re remembered &ndash; in the little voices calling for you, in handwritten cards, and in the way your role takes shape within your family.</p>
            </div>
            <div className="space-y-4 text-justify">
              <p>Whether you choose something timeless, playful, or entirely your own, your <em>grandma</em> name becomes a small but meaningful part of your identity, and a thread that carries through every gift, every visit, and every celebration.</p>
              <p>This platform is built to support that. To help you find it, define it, and carry it forward in thoughtful ways.</p>
            </div>
          </div>

        </div>

        {/* Green vertical line below card */}
        <div className="absolute bottom-5 left-1/2 h-14 w-[2px] -translate-x-1/2 bg-[#618985]" />
      </section>

      <DinnerPartySection />
    </>
  )
}
