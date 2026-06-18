import Image from 'next/image'

export function DinnerPartySection() {
  return (
    <section className="flex flex-col sm:flex-row sm:items-stretch bg-[linear-gradient(to_bottom,#ffffff_0%,#dcb6c9_100%)]">

      {/* Left: text — inherits section gradient */}
      <div className="flex w-full items-center px-10 py-10 sm:w-3/5 sm:px-16">
        <div className="max-w-2xl space-y-4">
          <h2 className="font-subheading text-[clamp(24px,2.66vw,34px)] tracking-tight">
            Being a grandma looks different for everyone
          </h2>
          <span className="block h-px w-12 bg-foreground/20" />
          <div className="space-y-4 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/70">
            <p>
              Every family has different traditions, personalities, and histories — but one thing is shared across all grandparents: the love we have for our grandkids.
            </p>
            <p>
              My Grandma Name is built as a thoughtful resource for this role, from finding a grandma name that feels like you to discovering meaningful gifts, reminders, tips, and personalized touches designed around family connection.
            </p>
          </div>
        </div>
      </div>

      {/* Right: image — py-10 matches text column so image spans exactly from heading top to body bottom */}
      <div className="w-full sm:flex sm:w-2/5 sm:flex-col sm:py-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-bl-3xl sm:aspect-auto sm:flex-1">
          <Image
            src="/images/home-page/grandmother-dinner-party.jpg"
            alt="Grandmother celebrating with family at dinner"
            fill
            className="object-cover object-top sm:object-center"
          />
        </div>
      </div>

    </section>
  )
}
