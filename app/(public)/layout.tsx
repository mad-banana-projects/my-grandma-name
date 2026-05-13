import { FooterBar } from '@/components/footer/footer-bar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FooterBar />
    </>
  )
}
