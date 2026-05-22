=== FILE: app/globals.css ===
```css
@theme {
  --font-sans: 'Outfit', var(--font-geist-sans), sans-serif;
  --font-display: 'Outfit', var(--font-geist-sans), sans-serif;

  --color-background: #FFFFFF;
  --color-foreground: #0F1717;

  --color-primary: #0F3D3E;
  --color-primary-hover: #155A5C;
  --color-primary-light: #EBF2F2;
  --color-primary-foreground: #FFFFFF;

  --color-accent: #E07856;
  --color-accent-hover: #E78C6D;
  --color-accent-light: #FDF1ED;
  --color-accent-foreground: #FFFFFF;

  --color-muted: #FAFAFA;
  --color-muted-foreground: #6B7280;

  --color-border: #E5E7EB;
  --color-input: #E5E7EB;
  --color-ring: #0F3D3E;

  --radius: 6px;
}
```

=== FILE: components/landing/Logo.tsx ===
```tsx
import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'mark-only' | 'full'
  size?: number | string
}

export function Logo({ variant = 'full', size = 32, className, ...props }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className || ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary transition-transform hover:rotate-12 duration-500 ease-out"
        {...props}
      >
        {/* Modern, geometric open Enso ring */}
        <path
          d="M 50 12 C 71 12 88 29 88 50 C 88 71 71 88 50 88 C 29 88 12 71 12 50 C 12 32 25 17 42 13"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="240"
          strokeDashoffset="10"
        />
        {/* Inner core accent dot */}
        <circle cx="50" cy="50" r="6" className="fill-accent" />
      </svg>
      {variant === 'full' && (
        <span className="wordmark text-xl font-medium tracking-tight text-neutral-900 font-sans">
          Enso<span className="text-accent font-semibold ml-0.5">.</span>Academy
        </span>
      )}
    </div>
  )
}
```

=== FILE: components/landing/Mascot.tsx ===
```tsx
import React from 'react'

interface MascotProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'default' | 'thinking' | 'welcoming'
  size?: number | string
}

export function Mascot({ variant = 'default', size = 120, className, ...props }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-primary transition-all duration-500 ${className || ''}`}
      {...props}
    >
      {/* Outer open Enso ring (the character body) */}
      <path
        id="enso-body"
        d="M 50 12 C 71 12 88 29 88 50 C 88 71 71 88 50 88 C 29 88 12 71 12 50 C 12 32 25 17 42 13"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="240"
        strokeDashoffset="10"
      />

      {/* Subtle inner background space */}
      <circle cx="50" cy="50" r="30" className="fill-neutral-50/40" />

      {/* Serene Zen-like gaze (Lottie-friendly, simple path elements) */}
      <g id="gaze" className="text-accent">
        {variant === 'default' && (
          <>
            {/* Serene horizontal slits representing deep focus */}
            <path
              id="eye-left"
              d="M 37 50 L 45 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              id="eye-right"
              d="M 55 50 L 63 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}
        {variant === 'thinking' && (
          <>
            {/* One slit is angled to suggest contemplation */}
            <path
              id="eye-left"
              d="M 37 48 L 45 52"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              id="eye-right"
              d="M 55 50 L 63 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}
        {variant === 'welcoming' && (
          <>
            {/* Upward curved arcs representing a warm presence */}
            <path
              id="eye-left"
              d="M 36 51 C 36 51 40 46 44 51"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              id="eye-right"
              d="M 56 51 C 56 51 60 46 64 51"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </g>
    </svg>
  )
}
```

=== FILE: components/landing/Header.tsx ===
```tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/">
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
```

=== FILE: components/landing/Hero.tsx ===
```tsx
import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Mascot } from './Mascot'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-[-10%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-[-5%] bottom-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      
      {/* Structural grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Copy & Actions */}
          <div className="text-left lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-8">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              The Science of Readiness
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl leading-[1.1] font-sans">
              Know you're ready <br />
              — <span className="relative inline-block text-primary">
                before exam day
                <span className="absolute bottom-1 left-0 h-2 w-full bg-accent/20 -z-10 rounded-full" />
              </span>.
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl text-neutral-600 leading-relaxed font-sans">
              Enso Academy prepares compliance and finance professionals for career-critical certifications. We build a live student knowledge model, calibrate learning gaps, and sign off only when you are guaranteed to pass.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-white transition-all hover:bg-primary-hover shadow-md hover:shadow-lg text-center"
              >
                Start studying free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#courses"
                className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors text-center"
              >
                Explore courses
              </Link>
            </div>

            {/* Quick value indicators */}
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-500 font-medium border-t border-neutral-100 pt-6">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" /> Calibrated Readiness Grader
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" /> Primary Sources Only
              </span>
            </div>
          </div>

          {/* Right Column: Mascot as AI Lecturer Panel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl duration-300">
              {/* Subtle top decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

              <div className="flex flex-col items-center text-center">
                {/* Mascot container with float animation */}
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 p-2 animate-[float_6s_ease-in-out_infinite]">
                  <Mascot variant="welcoming" size={100} />
                </div>
                
                <h3 className="mt-6 text-lg font-bold text-neutral-900">Your AI Lecturer</h3>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Enso Guide</span>
                
                {/* Simulated message dialog */}
                <div className="mt-6 w-full rounded-lg bg-neutral-50 p-4 border border-neutral-100 text-left">
                  <p className="text-sm text-neutral-700 leading-relaxed font-sans">
                    "Welcome back. I have analyzed your mock exam answers. We need to focus on UCP 600 Article 14 standard for examinations today. Let's close this gap."
                  </p>
                </div>

                {/* Simulated dynamic interface tags */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="rounded bg-primary-light px-2 py-1 text-2xs font-semibold text-primary">Active Model</span>
                  <span className="rounded bg-accent-light px-2 py-1 text-2xs font-semibold text-accent">Readiness 78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/Pitch.tsx ===
```tsx
import React from 'react'

export function Pitch() {
  return (
    <section className="bg-neutral-50 py-24 md:py-32 border-y border-neutral-200">
      <div className="mx-auto max-w-5xl px-6 md:px-8 text-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-6">
          Our Core Philosophy
        </h2>
        
        {/* Core statement */}
        <blockquote className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl leading-tight">
          "Enso Academy doesn't sell content. <br className="hidden sm:inline" />
          It sells <span className="text-primary italic">readiness</span>."
        </blockquote>
        
        {/* Supporting statement */}
        <p className="mx-auto mt-8 max-w-3xl text-lg md:text-xl text-neutral-600 leading-relaxed">
          Competitors give you thousands of pages of secondary guides and dry lecture videos, leaving you to guess if you're prepared. Enso does the opposite: we actively model your knowledge state, highlight your blind spots, and only sign off when the data says you are ready. You do not just study; you verify.
        </p>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/HowItWorks.tsx ===
```tsx
import React from 'react'
import { UserCheck, Clock, HelpCircle, FileText, CheckCircle2, Bookmark } from 'lucide-react'

const capabilities = [
  {
    icon: UserCheck,
    title: 'A tutor that actually knows you',
    description: 'Enso builds a live model of what you know, concept by concept, from every question you answer — and the AI lecturer adapts to your gaps instead of replaying a script.',
  },
  {
    icon: Clock,
    title: 'It remembers you',
    description: 'Come back after a week and the lecturer picks up where you left off — your goal, what you struggled with, the pace that worked.',
  },
  {
    icon: HelpCircle,
    title: 'A classmate that catches your blind spots',
    description: 'A consistent AI study companion raises its hand and asks the question you didn\'t know you needed answered.',
  },
  {
    icon: FileText,
    title: 'Mock exams that feel like the real thing',
    description: 'Same question count, same time limit, same pressure. The timer doesn\'t pause — you learn to manage the clock before exam day, not during it.',
  },
  {
    icon: CheckCircle2,
    title: 'A signoff you can trust',
    description: 'Enso tells you when you\'re genuinely ready, on a bar set deliberately stricter than the real exam. It would rather tell you to study one more week than let you walk in and fail.',
  },
  {
    icon: Bookmark,
    title: 'Built from the source',
    description: 'Every lesson is generated from primary regulatory material — FATF, Basel, Wolfsberg, OFAC — never from competitor study guides. You learn the actual reasoning.',
  },
]

export function HowItWorks() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            How It Works
          </h2>
          <h3 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Built for professionals who cannot afford to waste time.
          </h3>
          <p className="mt-4 text-lg text-neutral-600">
            A study platform engineered around active retrieval, precision feedback, and empirical readiness.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group relative rounded-lg border border-neutral-200 bg-white p-8 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="mt-6 text-xl font-bold text-neutral-900">
                  {item.title}
                </h4>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/CourseLineup.tsx ===
```tsx
import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const courses = [
  {
    slug: 'cdcs',
    title: 'CDCS Prep',
    subtitle: 'Certified Documentary Credit Specialist',
    description: 'Master international trade finance, letters of credit, UCP 600, and bank guarantees. Designed for bankers and trade finance professionals.',
    status: 'available',
    badgeText: 'Available now',
  },
  {
    slug: 'cams',
    title: 'CAMS Prep',
    subtitle: 'Certified Anti-Money Laundering Specialist',
    description: 'Accelerated prep for AML compliance, financial crime investigation, and regulatory reporting based strictly on FATF and Basel frameworks.',
    status: 'soon',
    badgeText: 'Coming soon',
  },
  {
    slug: 'ccas',
    title: 'CCAS Prep',
    subtitle: 'Certified Crypto-Asset Specialist',
    description: 'Learn blockchain compliance, crypto transaction monitoring, DeFi risk assessment, and global cryptocurrency regulations.',
    status: 'soon',
    badgeText: 'Coming soon',
  },
]

export function CourseLineup() {
  return (
    <section id="courses" className="py-24 md:py-32 bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
              Course Lineup
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
              Select your path to readiness.
            </h3>
            <p className="mt-4 text-lg text-neutral-600">
              Each syllabus is engineered from primary regulatory source material, mapped to the official exam outline.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            const isAvailable = course.status === 'available'
            return (
              <div
                key={index}
                className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-8 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                        isAvailable
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {course.badgeText}
                    </span>
                  </div>

                  <h4 className="mt-6 text-2xl font-bold text-neutral-900">
                    {course.title}
                  </h4>
                  <p className="text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-wider">
                    {course.subtitle}
                  </p>
                  
                  <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100">
                  {isAvailable ? (
                    <Link
                      href="/signup"
                      className="inline-flex w-full items-center justify-center rounded-md bg-primary py-2.5 px-4 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      Enroll in course
                      <ArrowUpRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-md bg-neutral-50 border border-neutral-200 py-2.5 px-4 text-sm font-semibold text-neutral-400 cursor-not-allowed"
                    >
                      Notify me when live
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/Pricing.tsx ===
```tsx
import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            Pricing
          </h2>
          <h3 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Flexible options built for your career.
          </h3>
          <p className="mt-4 text-lg text-neutral-600">
            Choose the plan that fits your study timeline. Cancel or switch anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Option 1: Per Course */}
          <div className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-8 md:p-10 hover:border-primary/40 hover:shadow-md transition-all">
            <div>
              <h4 className="text-xl font-bold text-neutral-900">Single Course Access</h4>
              <p className="mt-2 text-sm text-neutral-500">Perfect for focusing on one certification.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-neutral-900">$199</span>
                <span className="text-sm font-semibold text-neutral-500">/ one-time</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Includes 6 months of full access</p>

              <ul className="mt-8 space-y-4 text-sm text-neutral-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Full access to chosen certification prep</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Personalized AI lecturer with long-term memory</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Full mock exam engine with detailed reviews</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Official Readiness Signoff & certificate</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 py-3 px-4 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Get started with Single Course
              </Link>
            </div>
          </div>

          {/* Option 2: All Access */}
          <div className="relative flex flex-col justify-between rounded-lg border-2 border-primary bg-white p-8 md:p-10 shadow-md">
            <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Most Flexible
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-neutral-900">All-Access Subscription</h4>
              <p className="mt-2 text-sm text-neutral-500">Complete access to all certifications.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-neutral-900">$39</span>
                <span className="text-sm font-semibold text-neutral-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Cancel or pause subscription anytime</p>

              <ul className="mt-8 space-y-4 text-sm text-neutral-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-neutral-900">All courses included (CDCS, CAMS, CCAS)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Personalized AI lecturer with long-term memory</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Unlimited mock exams & updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Official Readiness Signoff for all certifications</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-sm"
              >
                Get started with All-Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/FAQ.tsx ===
```tsx
'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is Enso Academy?',
    answer: 'An AI-powered preparation platform for professional certification exams in compliance and finance.',
  },
  {
    question: 'How is it different from other exam-prep courses?',
    answer: 'It tracks what you actually know and adapts to it, it remembers you across sessions, and it tells you — conservatively — when you\'re genuinely ready for the real exam.',
  },
  {
    question: 'What does it cost?',
    answer: '$199 per course with six months of access, or $39 per month for all-access.',
  },
  {
    question: 'Which certifications do you cover?',
    answer: 'CAMS, CDCS, and CCAS at launch, with more in development.',
  },
  {
    question: 'Where does the content come from?',
    answer: 'It is generated from primary regulatory sources — never from third-party study guides — so you learn the underlying reasoning.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 md:py-32 bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            FAQ
          </h2>
          <h3 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="rounded-lg border border-neutral-200 bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between p-6 text-left font-bold text-neutral-900 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-48 border-t border-neutral-100' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <p className="p-6 text-sm text-neutral-600 leading-relaxed bg-neutral-50/50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

=== FILE: components/landing/Footer.tsx ===
```tsx
import React from 'react'
import Link from 'next/link'
import { Logo } from './Logo'

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
          &copy; {currentYear} Enso Academy. All rights reserved. Registered trademark of Enso Intelligence Inc.
        </div>
      </div>
    </footer>
  )
}
```

=== FILE: app/(marketing)/page.tsx ===
```tsx
import React from 'react'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Pitch } from '@/components/landing/Pitch'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CourseLineup } from '@/components/landing/CourseLineup'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'

export const metadata = {
  title: 'Enso Academy | Professional Certification Readiness Platform',
  description: 'AI-rendered interactive classrooms with personalized student knowledge models and calibrated readiness signoff. We prepare compliance and finance professionals for CAMS, CDCS, and CCAS exams.',
  openGraph: {
    title: 'Enso Academy | Professional Certification Readiness Platform',
    description: 'AI-rendered interactive classrooms with personalized student knowledge models and calibrated readiness signoff. We prepare compliance and finance professionals for CAMS, CDCS, and CCAS exams.',
    type: 'website',
    url: 'https://www.ensoacademy.ai',
    siteName: 'Enso Academy',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-primary/10 selection:text-primary">
      <Header />
      <main className="flex-1">
        <Hero />
        <Pitch />
        <HowItWorks />
        <CourseLineup />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
```

---

## Design Rationale

1. **Brand System & Logo**: The brand mark uses an elegant open-ring SVG (evoking the Zen *ensō*) in primary deep teal `#0F3D3E` and warm coral `#E07856` accents, evoking completeness, clarity, and focus.
2. **Typography**: Set up the Tailwind v4 theme using `Outfit` as a professional sans-serif typeface, combined with Geist Sans fallbacks. It balances large, bold, editorial headers with generous letter-spacing to build credibility and focus.
3. **Layout & Spacing**: Generous whitespace maintains a structured rhythm, separating sections cleanly. Custom grid line details support the editorial structure without looking cluttered.
4. **Mascot Placement**: Set in a simulated "AI Lecturer" card within the Hero section, providing functional product context rather than generic visual slop.

## Mascot Notes

1. **Derivation from the Mark**: The mascot is derived directly from the Enso brand mark. It takes the same open-ring Zen circle and inserts a serene, meditative gaze in the center using two simple, clean horizontal dash paths (accent coral) representing deep focus. It features no big eyes, cartoon limbs, or cartoonish expressions, preserving a professional posture.
2. **Animation Strategy**:
   - **Breathing Effect**: A gentle `scale` or `translate` transition on the inner face paths or the whole Enso circle to simulate a calm breathing pattern.
   - **Blinking Motion**: A quick vertical scale transition (`scaleY(0)`) on the eye path elements at random intervals to represent a quiet blink.
   - **Contemplation Rotation**: A slow, subtle rotation (`rotate(2deg)`) of the outer Enso stroke when shifting states (e.g. from `default` to `thinking`).
   - Lottie friendliness is preserved by using very few clean paths and standard vector transform parameters.

## Assumptions

1. **Font Support**: Assumes the `Outfit` Google Font is imported or resolves to Geist Sans appropriately.
2. **Path Configuration**: Assumes module resolution paths are configured using `@/*` mapping to the root directory for Next.js 16 components.
3. **Mascot States**: Built standard states (`default`, `thinking`, `welcoming`) supporting custom UI interactions.
