import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, Montserrat, Allura } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
})
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['500', '600'],
  style: ['normal', 'italic'],
})
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})
const allura = Allura({
  subsets: ['latin'],
  variable: '--font-allura',
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'GlowAgenda · Lumi Nails Studios',
  description: 'Agende seu horário com Natielle — manicure profissional',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable} ${allura.variable}`}
    >
      <body style={{ minHeight: '100vh', background: '#FAF8F6' }}>{children}</body>
    </html>
  )
}
