import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#courses', label: 'Courses' },
  { href: '#faq', label: 'FAQ' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Logo />
            <p className="mt-2 text-2xs font-mono uppercase tracking-wider text-foreground/45">
              An Enso Intelligence Inc. product.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-foreground/15 pt-8 text-center text-2xs font-mono uppercase tracking-wider text-foreground/40">
          &copy; {currentYear} Enso Academy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
