import { SubscribeContent } from './subscribe-content'

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ grandmaName?: string }>
}) {
  const params = await searchParams
  return <SubscribeContent grandmaName={params.grandmaName} />
}
