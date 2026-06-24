import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Pitch } from '@/components/landing/pitch'
import { HowItWorks } from '@/components/landing/how-it-works'
import { CourseLineup } from '@/components/landing/course-lineup'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: { absolute: 'Enso Academy — Know you’re ready before exam day' },
  description:
    'Enso Academy prepares compliance and finance professionals for CAMS, CDCS, and CCAS — with a real student knowledge model, exam-faithful mock exams, and a calibrated readiness signoff.',
  openGraph: {
    title: 'Enso Academy — Know you’re ready before exam day',
    description:
      'AI-rendered interactive classrooms with a real student knowledge model and a calibrated readiness signoff.',
    type: 'website',
    url: 'https://www.ensoacademy.ai',
    siteName: 'Enso Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enso Academy — Know you’re ready before exam day',
    description:
      'AI-rendered interactive classrooms with a real student knowledge model and a calibrated readiness signoff.',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
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
