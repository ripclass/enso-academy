import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Logo size={28} />
            <p className="mt-2 text-xs text-neutral-500">
              An Enso Intelligence Inc. product.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-neutral-500">
            <Link href="#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
          </nav>
        </div>

        <div className="mt-12 border-t border-neutral-100 pt-8 text-center text-xs text-neutral-400">
          &copy; {currentYear} Enso Academy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
