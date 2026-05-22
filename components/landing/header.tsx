'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" aria-label="Enso Academy home">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#courses" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
            Courses
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white transition-all hover:bg-primary-hover shadow-sm"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 md:hidden hover:bg-neutral-50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#courses"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Courses
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <hr className="my-2 border-neutral-200" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-600 hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary text-base font-medium text-white transition-all hover:bg-primary-hover shadow-sm"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
