import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const courses = [
  {
    slug: 'cdcs',
    title: 'CDCS Prep',
    subtitle: 'Certified Documentary Credit Specialist',
    description:
      'International trade finance, letters of credit, and bank guarantees — for bankers and trade finance professionals.',
    status: 'soon' as const,
  },
  {
    slug: 'cams',
    title: 'CAMS Prep',
    subtitle: 'Certified Anti-Money Laundering Specialist',
    description:
      'AML compliance, financial crime investigation, and regulatory reporting — built from FATF, Basel, and Wolfsberg frameworks.',
    status: 'available' as const,
  },
  {
    slug: 'ccas',
    title: 'CCAS Prep',
    subtitle: 'Certified Cryptoasset Specialist',
    description:
      'Blockchain compliance, crypto transaction monitoring, DeFi risk assessment, and the global cryptoasset regulatory landscape.',
    status: 'soon' as const,
  },
  {
    slug: 'fccs',
    title: 'FCCS Prep',
    subtitle: 'Financial Crime Compliance Specialist',
    description:
      'Advanced transaction monitoring logic, correspondent banking risk audits, and automated control frameworks.',
    status: 'soon' as const,
  },
]

function CourseCard({ course }: { course: typeof courses[0] }) {
  const isAvailable = course.status === 'available'

  return (
    <div
      className="group relative flex flex-col justify-end min-h-[460px] pb-10 cursor-pointer select-none"
    >
      {/* Background Portrait Card (revealed on hover) */}
      <div
        className="absolute top-0 left-0 right-0 h-[320px] bg-[#EAE7DF] border border-foreground rounded-[24px] overflow-hidden transition-all duration-500 ease-out opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
      >
        <Image
          src="/study_environment.png"
          alt="Study environment"
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover filter grayscale"
        />
      </div>

      {/* Foreground Text Card (turns dark, tilts left, and slides down on hover without shrinking) */}
      <div
        className="absolute w-full border border-foreground rounded-[24px] p-6 flex flex-col justify-between transition-all duration-500 ease-out z-10 bg-background text-foreground rotate-0 translate-y-0 scale-100 h-[420px] bottom-0 left-0 shadow-none group-hover:z-20 group-hover:bg-foreground group-hover:text-background group-hover:rotate-[-3.5deg] group-hover:translate-y-28 group-hover:scale-[1.02] group-hover:bottom-[-12px] group-hover:left-[-2%] group-hover:w-[104%] group-hover:shadow-xl"
      >
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tight font-sans transition-colors duration-500">
            {course.title}
          </h3>
          <p
            className="text-[9px] uppercase tracking-widest font-mono mt-0.5 transition-colors duration-500 text-foreground/50 group-hover:text-background/60"
          >
            {course.subtitle}
          </p>
          <div
            className="border-t my-4 transition-colors duration-500 border-foreground/15 group-hover:border-background/25"
          />
          <p
            className="text-xs leading-relaxed font-sans transition-colors duration-500 text-foreground/70 group-hover:text-background/80"
          >
            {course.description}
          </p>
        </div>

        <div className="mt-4">
          {isAvailable ? (
            <Link
              href="/signup"
              className="text-xs font-bold uppercase tracking-wider text-accent hover:underline inline-flex items-center gap-1.5"
            >
              Enroll now &rarr;
            </Link>
          ) : (
            <span
              className="text-[10px] font-mono uppercase tracking-widest block transition-colors duration-500 text-foreground/45 group-hover:text-background/40"
            >
              Coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function CourseLineup() {
  return (
    <section id="courses" className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        
        {/* Section Header */}
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans mb-12">
          OUR PROGRAM
        </span>

        {/* 4-Card Grid matching the reference layout */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch mt-8">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>

      </div>
    </section>
  )
}
