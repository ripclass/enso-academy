import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Outfit } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Outfit — the editorial display typeface (brand identity v2, ADR 0018).
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ensoacademy.ai'),
  title: {
    default: 'Enso Academy — Professional certification readiness',
    template: '%s · Enso Academy',
  },
  description:
    'AI-rendered interactive classrooms with a real student knowledge model and a calibrated readiness signoff. Preparation for CAMS, CDCS, and CCAS certification exams.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${outfit.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
