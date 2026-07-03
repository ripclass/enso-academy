import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Pitch } from '@/components/landing/pitch'
import { HowItWorks } from '@/components/landing/how-it-works'
import { CourseLineup } from '@/components/landing/course-lineup'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import { faqs } from '@/components/landing/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Enso Academy · Know you’re ready before exam day' },
  description:
    'Exam prep for compliance and finance professionals sitting CAMS, CDCS, or CCAS, taught in an AI classroom built from primary sources. It adapts to what you know and tells you when you’re ready.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Enso Academy · Know you’re ready before exam day',
    description:
      'An AI classroom for compliance and finance exam prep, built from primary sources.',
    type: 'website',
    url: 'https://www.ensoacademy.ai',
    siteName: 'Enso Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enso Academy · Know you’re ready before exam day',
    description:
      'An AI classroom for compliance and finance exam prep, built from primary sources.',
  },
}

// Structured data: Organization + FAQPage. Rendered as JSON-LD so course and
// FAQ rich results are available to search engines.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.ensoacademy.ai/#organization',
      name: 'Enso Academy',
      url: 'https://www.ensoacademy.ai',
      description:
        'An AI classroom for compliance and finance certification prep, built from primary sources.',
      parentOrganization: { '@type': 'Organization', name: 'Enso Intelligence Inc.' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Pitch />
        <HowItWorks />
        <CourseLineup />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
