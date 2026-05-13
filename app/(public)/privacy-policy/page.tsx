import { LandingNav } from '@/components/nav/landing-nav'

export default function PrivacyPolicyPage() {
  return (
    <>
      <LandingNav alwaysSolid />
      <main className="min-h-screen bg-background px-4 pt-[88px] pb-20">
        <div className="mx-auto max-w-3xl space-y-8">

          <h1 className="font-heading text-5xl font-light tracking-tight">Privacy Policy</h1>

          <p className="text-sm leading-relaxed text-foreground/80">
            My Grandma Name (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting the information you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights related to that information.
          </p>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Information We Collect</h2>
            <ul className="space-y-4 text-sm leading-relaxed text-foreground/80">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60" />
                <div>
                  <span className="italic">Information You Provide</span>
                  <br />
                  We may collect information you provide directly, including: name (first and last), email address, responses submitted through forms (such as name preferences or generator inputs), and any information you choose to provide through contact forms or email sign-ups.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/60" />
                <div>
                  <span className="italic">Automatically Collected Information</span>
                  <br />
                  When you visit our site, we may automatically collect your IP address, browser type and device information, pages visited and time spent on the site, and referring website or source. This information helps us understand how visitors use our site and improve the experience.
                </div>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">How We Use Your Information</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              We use the information we collect to provide and improve our website and features, deliver results from tools such as the grandma name generator, send updates, announcements, and early access information, communicate with you when you sign up for the waitlist or email updates, and analyze site usage and improve performance. We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Email Communications</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              If you sign up for our waitlist or provide your email, you may receive product updates, early access invitations, and announcements related to My Grandma Name. You can unsubscribe at any time using the link provided in our emails.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Cookies and Tracking</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              We may use cookies and similar technologies to improve site functionality, understand user behavior, and remember preferences. You can adjust your browser settings to disable cookies if you prefer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Third-Party Services</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              We may use third-party tools to operate our website and services, including email marketing platforms, website hosting providers, and analytics tools. These services may process your data on our behalf but are only used to support the functionality of the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Data Security</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              We take reasonable measures to protect your information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Your Rights</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              Depending on your location, you may have the right to request access to your personal data, request correction or deletion of your data, and opt out of communications. To make a request, please contact us using the information below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Children&apos;s Privacy</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              This website is not intended for children under the age of 13, and we do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Changes to This Policy</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              We may update this Privacy Policy from time to time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Contact Us</h2>
            <p className="text-sm leading-relaxed text-foreground/80">
              If you have any questions about this Privacy Policy or how your information is handled, you can contact us at:{' '}
              <a href="mailto:crya@mygrandmaname.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
                crya@mygrandmaname.com
              </a>
            </p>
          </section>

        </div>
      </main>
    </>
  )
}
