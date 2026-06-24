import Link from 'next/link'
import { Check, ArrowRight, PlayCircle, ShieldCheck, GraduationCap, Sparkles } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Footer } from '@/components/landing/footer'
import { CoursePurchase } from '@/app/(dashboard)/courses/[slug]/course-purchase'

export type SalesPreviewLesson = { id: string; name: string; module: string }

type Props = {
  slug: string
  name: string
  shortName: string
  description: string
  certifyingBody: string | null
  isAuthenticated: boolean
  previewLessons: SalesPreviewLesson[]
  /** Facts about the exam this course prepares for. */
  exam: { about: string; facts: { label: string; value: string }[] }
  whatYouGet: string[]
}

const HOW_IT_WORKS = [
  {
    icon: PlayCircle,
    title: 'A classroom that plays',
    body: 'Each lesson plays one idea at a time. The lecturer narrates, the slide builds with it, and you set the pace. It is a class, not a wall of text next to a chat box.',
  },
  {
    icon: Sparkles,
    title: 'Ask the lecturer — and your classmates ask too',
    body: 'Ask by text or voice, any time. Named classmates raise their hands with the questions you should be asking, and the lecturer turns to you in office hours at the end of each lesson.',
  },
  {
    icon: GraduationCap,
    title: 'You do the work',
    body: 'Trace the money through a laundering network, adjudicate sanctions alerts, draft a SAR for an AI examiner. You practise the judgment the exam tests, not just the facts.',
  },
  {
    icon: ShieldCheck,
    title: "Know when you're ready",
    body: 'Full-length exam simulations and unlimited practice mocks feed a model of what you know. The readiness signoff tells you when to book the exam — on a bar set stricter than the real thing.',
  },
]

const FAQ = [
  {
    q: 'Is this affiliated with ACAMS?',
    a: 'No. Enso Academy is an independent preparation course and is not affiliated with, endorsed by, or sponsored by ACAMS. CAMS is administered by ACAMS; you register and sit the exam with them directly.',
  },
  {
    q: 'What exactly do I get for the price?',
    a: 'Full, lasting access to the complete course, the AI classroom, unlimited free practice mocks, and the full-length exam simulations with the readiness signoff. One payment — no subscription.',
  },
  {
    q: 'How does the refund work?',
    a: '14-day money-back guarantee. Within 14 days of purchase, email us for a full refund — as long as you’ve completed less than 25% of the lessons and haven’t started an exam simulation. (Single simulation purchases are non-refundable once started.)',
  },
  {
    q: 'What do the free preview lessons include?',
    a: 'The real thing — full lessons with the AI lecturer, voice narration, the hands-on interactives, and the end-of-lesson office hours. A quick sign-up unlocks them so you can try before you buy.',
  },
  {
    q: 'What device do I need?',
    a: 'Any modern browser on desktop or mobile. Voice narration plays everywhere; voice input for asking questions works in Chrome and Edge.',
  },
]

export function CourseSalesPage({
  slug,
  name,
  shortName,
  description,
  certifyingBody,
  isAuthenticated,
  previewLessons,
  exam,
  whatYouGet,
}: Props) {
  const previewHref = (id: string) =>
    isAuthenticated ? `/lessons/${id}` : `/signup?next=/lessons/${id}`
  const firstPreview = previewLessons[0]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Minimal header (the landing header's anchor nav doesn't apply here) */}
      <header className="sticky top-0 z-50 w-full border-b border-foreground bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" aria-label="Enso Academy home">
            <Logo />
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/courses"
              className="hidden sm:inline text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
            >
              All courses
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              className="text-2xs font-bold uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <span className="text-2xs font-bold uppercase tracking-[0.2em] text-accent font-mono">
              {shortName} Exam Prep
            </span>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">{name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/70">{description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link
                href="#pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Enroll — $299 <ArrowRight className="h-4 w-4" />
              </Link>
              {firstPreview && (
                <Link
                  href="#preview"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-foreground px-7 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <PlayCircle className="h-4 w-4" /> Try 2 lessons free
                </Link>
              )}
            </div>
            <p className="mt-4 font-mono text-2xs uppercase tracking-wider text-foreground/45">
              $100 off (was $399) · 14-day money-back · one payment, lasting access
            </p>
          </div>
        </section>

        {/* About the exam */}
        <section className="border-b border-foreground bg-[#F7F5F0]">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3 md:px-8">
            <div className="md:col-span-2">
              <h2 className="text-2xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans">
                About the {shortName} exam
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-foreground/75">{exam.about}</p>
              {certifyingBody && (
                <p className="mt-4 font-mono text-2xs uppercase tracking-wider text-foreground/45">
                  Certifying body: {certifyingBody}
                </p>
              )}
            </div>
            <dl className="space-y-3 rounded-2xl border border-foreground/15 bg-background p-6">
              {exam.facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-foreground/50">{f.label}</dt>
                  <dd className="text-right font-medium text-foreground">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8">
            <h2 className="text-2xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans">
              How the classroom works
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-foreground/15 bg-background p-6">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 text-base font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Free preview */}
        {previewLessons.length > 0 && (
          <section id="preview" className="border-b border-foreground bg-[#F7F5F0]">
            <div className="mx-auto max-w-6xl px-6 py-16 md:px-8">
              <h2 className="text-2xs font-bold uppercase tracking-[0.2em] text-accent font-sans">
                Try it free
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-foreground/75">
                Two full lessons, on us — the real classroom, voice and all. {isAuthenticated ? 'Jump in.' : 'A quick sign-up unlocks them.'}
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {previewLessons.map((l) => (
                  <Link
                    key={l.id}
                    href={previewHref(l.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-foreground bg-background p-6 transition-colors hover:bg-foreground hover:text-background"
                  >
                    <div>
                      <span className="font-mono text-2xs uppercase tracking-widest text-foreground/45 group-hover:text-background/50">
                        {l.module} · Free preview
                      </span>
                      <h3 className="mt-2 text-lg font-bold">{l.name}</h3>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-background">
                      <PlayCircle className="h-4 w-4" />
                      {isAuthenticated ? 'Play lesson' : 'Sign in to preview'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing + what you get */}
        <section id="pricing" className="border-b border-foreground">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-8">
            <div>
              <h2 className="text-2xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans">
                What you get
              </h2>
              <ul className="mt-6 space-y-3">
                {whatYouGet.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CoursePurchase
                courseSlug={slug}
                isAuthenticated={isAuthenticated}
                included={[]}
              />
              <div className="mt-5 rounded-xl border-2 border-foreground bg-background p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-foreground">Not ready to commit?</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-primary">
                    First one free
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  Prove where you stand. Sit the real 120-question, 3.5-hour exam simulation under exam
                  conditions — then <span className="font-semibold text-foreground">$14.99</span> per
                  attempt after your free one.
                </p>
                <Link
                  href={isAuthenticated ? `/courses/${slug}/mock` : `/signup?next=/courses/${slug}/mock`}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-foreground bg-background text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <PlayCircle className="h-4 w-4" /> Take your free simulation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 text-center font-mono text-2xs uppercase tracking-wider text-foreground/40">
                Built from primary regulatory sources &amp; public enforcement actions
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-foreground bg-[#F7F5F0]">
          <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
            <h2 className="text-2xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans">
              Questions
            </h2>
            <dl className="mt-8 divide-y divide-foreground/10">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="py-5">
                  <dt className="font-semibold text-foreground">{q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-foreground/70">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
