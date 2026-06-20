import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export const metadata: Metadata = { title: 'Terms of Service' }

const LAST_UPDATED = '20 June 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/" aria-label="Enso Academy home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Terms of Service</h1>
        <p className="mt-3 text-2xs font-mono uppercase tracking-wider text-neutral-400">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-neutral-700">
          These Terms of Service (“Terms”) govern your access to and use of Enso Academy, operated by
          Enso Intelligence Inc. (“Enso Academy”, “we”, “us”). By creating an account or purchasing or
          using the service, you agree to these Terms. If you do not agree, do not use the service.
        </p>

        <Section title="1. The service">
          <p>
            Enso Academy is a professional-certification exam-preparation platform. It provides
            interactive courses, an AI tutor, practice questions, and mock exams designed to help you
            prepare for certain certification examinations.
          </p>
          <p>
            Enso Academy is a study aid only. We do <strong>not</strong> administer any certification
            exam, and we do <strong>not</strong> guarantee that you will pass any exam or achieve any
            particular result. Exam outcomes depend on many factors outside our control.
          </p>
        </Section>

        <Section title="2. Independence and third-party marks">
          <p>
            Certification names and marks (including, where referenced, CAMS, CDCS, CCAS and the names
            of their awarding bodies such as ACAMS) are the property of their respective owners. Enso
            Academy is an independent provider and is <strong>not</strong> affiliated with, endorsed
            by, sponsored by, or otherwise associated with any of those organizations. References to
            such exams are for identification and descriptive purposes only.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>
            You must provide accurate registration information and keep it current. You are responsible
            for the activity under your account and for keeping your credentials secure. Accounts are
            for a single individual; you may not share, sell, or transfer your account or access.
          </p>
        </Section>

        <Section title="4. Purchases and payments">
          <p>
            Purchases are one-time payments (there is no subscription). Course access includes the
            number of mock-exam attempts stated at the point of sale; additional mock attempts may be
            purchased individually. Prices are shown at checkout and may change for future purchases.
          </p>
          <p>
            Payments are processed by Stripe. We do not store your full payment-card details. You are
            responsible for any taxes that may apply to your purchase.
          </p>
        </Section>

        <Section title="5. Refunds">
          <p>
            If you are not satisfied with a course purchase, you may request a refund within{' '}
            <strong>7 days</strong> of purchase provided you have not substantially consumed the
            content (for example, completed a large portion of the course or used most included exam
            simulations). Single exam-simulation purchases are non-refundable once the simulation has
            been started. To request a refund, contact us at the address below.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>copy, redistribute, resell, or publicly post the course content or questions;</li>
            <li>scrape, crawl, or use automated means to extract content;</li>
            <li>share your account or circumvent access or payment controls;</li>
            <li>misuse the service in any unlawful way or interfere with its operation.</li>
          </ul>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            All course content, questions, software, and materials are owned by Enso Intelligence Inc.
            or its licensors and are protected by intellectual-property laws. We grant you a limited,
            personal, non-transferable, non-exclusive license to access and use the content for your
            own study. All rights not expressly granted are reserved.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            The service is provided “as is” and “as available”, without warranties of any kind, whether
            express or implied, including any implied warranties of merchantability, fitness for a
            particular purpose, or non-infringement. We do not warrant that the content is error-free
            or that the service will be uninterrupted. The content is educational and does not
            constitute legal, compliance, financial, or professional advice.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Enso Intelligence Inc. will not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or for any loss of
            profits, data, or goodwill arising from your use of the service. Our total liability for
            any claim relating to the service will not exceed the amount you paid us in the twelve
            months before the claim.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            We may suspend or terminate your access if you breach these Terms or misuse the service.
            You may stop using the service at any time. Provisions that by their nature should survive
            termination (including intellectual property, disclaimers, and limitation of liability)
            will survive.
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Material changes will be reflected by updating
            the “Last updated” date above and, where appropriate, by notice. Your continued use after
            changes take effect constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Governing law">
          <p>
            These Terms are governed by the laws of the State of Delaware, USA, without regard to its
            conflict-of-laws rules.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these Terms? Contact Enso Intelligence Inc. at{' '}
            <a href="mailto:support@ensoacademy.ai" className="font-semibold text-primary hover:underline">
              support@ensoacademy.ai
            </a>
            .
          </p>
        </Section>

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-semibold text-primary hover:underline"
        >
          &larr; Back to home
        </Link>
      </main>
    </div>
  )
}
