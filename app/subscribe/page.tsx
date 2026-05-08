import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function SubscribePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Subscription setup</CardTitle>
          <CardDescription>
            Your account flow reached the subscription gate. Stripe checkout will be wired here next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            For now, use this screen as confirmation that signup and profile onboarding completed far enough to redirect into the paid app flow.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/grandma-profile" className={cn(buttonVariants(), 'w-full sm:w-auto')}>
              Go to my profile
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'w-full sm:w-auto')}>
              Back home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
