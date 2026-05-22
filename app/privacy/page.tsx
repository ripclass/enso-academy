import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/" aria-label="Enso Academy home">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Privacy Policy
        </h1>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Our full privacy policy is being finalized ahead of public launch. For
          any questions in the meantime, contact Enso Intelligence Inc.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-sm font-semibold text-primary hover:underline"
        >
          &larr; Back to home
        </Link>
      </main>
    </div>
  )
}
