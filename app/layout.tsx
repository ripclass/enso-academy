import { GeistMono } from 'geist/font/mono'
import { Outfit } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Outfit — the clean display/UI typeface to match the design reference.
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ensoacademy.ai'),
  title: {
    default: 'Enso Academy · Professional certification readiness',
    template: '%s · Enso Academy',
  },
  description:
    'An AI classroom for compliance and finance exam prep, built from primary sources. Preparation for the CAMS, CDCS, and CCAS exams.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

