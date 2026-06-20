import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export const metadata: Metadata = { title: 'Privacy Policy' }

const LAST_UPDATED = '20 June 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

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

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Privacy Policy</h1>
        <p className="mt-3 text-2xs font-mono uppercase tracking-wider text-neutral-400">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-neutral-700">
          This Privacy Policy explains how Enso Intelligence Inc. (“Enso Academy”, “we”, “us”)
          collects, uses, and protects your information when you use Enso Academy. By using the
          service, you agree to the practices described here.
        </p>

        <Section title="1. Information we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Account information</strong> — your name and email address, and authentication
              data when you sign in (including via a third-party sign-in provider if you choose one).
            </li>
            <li>
              <strong>Learning data</strong> — your progress, answers, the concept-mastery model we
              build for you, your questions to the AI tutor, and your mock-exam attempts and results.
              This is what powers the personalized experience.
            </li>
            <li>
              <strong>Payment information</strong> — purchases are processed by Stripe. We receive
              confirmation of payment and limited billing details; we do <strong>not</strong> collect
              or store your full payment-card number.
            </li>
            <li>
              <strong>Technical data</strong> — basic device, log, and usage information needed to
              operate and secure the service.
            </li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>to provide and personalize the service — including the student knowledge model, the
              tutor’s memory of your context, and your readiness assessment;</li>
            <li>to process purchases and provide access to what you have bought;</li>
            <li>to maintain, secure, and improve the service;</li>
            <li>to communicate with you about your account, purchases, and support requests;</li>
            <li>to comply with legal obligations.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </Section>

        <Section title="3. Service providers we share with">
          <p>
            We share data with vetted providers only as needed to run the service, including:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Stripe</strong> — payment processing.</li>
            <li><strong>Supabase</strong> — database, authentication, and hosting of your account and learning data.</li>
            <li><strong>AI and text-to-speech providers</strong> (including via an API gateway) — to power the AI tutor and audio narration. Your tutor questions and the context needed to answer them are processed by these providers to generate responses.</li>
            <li><strong>Hosting/infrastructure providers</strong> that run the application.</li>
          </ul>
          <p>These providers are bound to use the data only to provide their services to us.</p>
        </Section>

        <Section title="4. International transfers">
          <p>
            We operate internationally, and your information may be processed in countries other than
            your own (including the United States and Singapore). Where required, we rely on
            appropriate safeguards for such transfers.
          </p>
        </Section>

        <Section title="5. Data retention">
          <p>
            We keep your information for as long as your account is active and as needed to provide the
            service, comply with legal obligations, resolve disputes, and enforce our agreements. You
            may request deletion of your account, after which we delete or anonymize your personal data
            except where we are required to retain it.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            We use technical and organizational measures to protect your information, including access
            controls and encryption in transit. No method of transmission or storage is perfectly
            secure, but we work to protect your data and to respond promptly to any incident.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            Depending on where you live, you may have rights to access, correct, export, or delete your
            personal information, and to object to or restrict certain processing. To exercise these
            rights, contact us at the address below; we will respond as required by applicable law.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use cookies and similar technologies that are necessary to sign you in and keep the
            service working, and to understand usage so we can improve it. You can control cookies
            through your browser settings, though some features may not work without them.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            Enso Academy is intended for professionals and is not directed to children under 16. We do
            not knowingly collect personal information from children. If you believe a child has
            provided us information, contact us and we will delete it.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We may update this policy from time to time. Material changes will be reflected by updating
            the “Last updated” date above and, where appropriate, by notice.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about your privacy? Contact Enso Intelligence Inc. at{' '}
            <a href="mailto:privacy@ensoacademy.ai" className="font-semibold text-primary hover:underline">
              privacy@ensoacademy.ai
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
