'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Menu, X } from 'lucide-react'

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#courses', label: 'Courses' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
        <Link href="/" aria-label="Enso Academy home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
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

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-full border border-foreground bg-transparent px-5 text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Get started
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground text-foreground md:hidden hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-foreground bg-background px-6 py-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-foreground/20" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-foreground bg-transparent text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}

    </header>
  )
}
