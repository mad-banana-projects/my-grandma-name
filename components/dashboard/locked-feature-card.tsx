import { Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LockedFeatureCardProps {
  title?: string
  description: string
  upgradeHref?: string
  className?: string
}

export function LockedFeatureCard({
  title,
  description,
  upgradeHref = '/subscribe',
  className,
}: LockedFeatureCardProps) {
  return (
    <Card className={cn('border-dashed opacity-80', className)}>
      <CardContent className="flex items-start gap-4 py-6">
        <div className="mt-0.5 rounded-full bg-muted p-2 shrink-0">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-1">
          {title && <p className="text-sm font-semibold">{title}</p>}
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <a
          href={upgradeHref}
          className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}
        >
          Upgrade
        </a>
      </CardContent>
    </Card>
  )
}
