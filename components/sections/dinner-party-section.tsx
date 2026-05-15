import Image from 'next/image'

export function DinnerPartySection() {
  return (
    <section className="flex flex-col sm:flex-row sm:items-stretch bg-[linear-gradient(to_bottom,#ffffff_0%,#dcb6c9_100%)]">

      {/* Left: text — inherits section gradient */}
      <div className="flex w-full items-center px-10 py-16 sm:w-1/2 sm:px-16">
        <div className="max-w-lg space-y-4">
          <h2 className="font-heading text-3xl font-light tracking-tight sm:text-4xl">
            Placeholder text
          </h2>
          <span className="block h-px w-12 bg-foreground/20" />
          <p className="text-sm leading-relaxed text-foreground/70">
            This is placeholder text that will be updated
          </p>
        </div>
      </div>

      {/* Right: image — bottom-left corner rounded so gradient shows through */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-bl-3xl sm:aspect-auto sm:w-1/2">
        <Image
          src="/images/home-page/grandmother-dinner-party.jpg"
          alt="Grandmother celebrating with family at dinner"
          fill
          className="object-cover object-center"
        />
      </div>

    </section>
  )
}
