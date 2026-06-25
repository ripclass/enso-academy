import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const courses = [
  {
    slug: 'cdcs',
    title: 'CDCS Prep',
    subtitle: 'Certified Documentary Credit Specialist',
    description:
      'International trade finance, letters of credit, and bank guarantees, for bankers and trade-finance professionals.',
    image: '/course-cdcs.png',
    status: 'soon' as const,
  },
  {
    slug: 'cams',
    title: 'CAMS Prep',
    subtitle: 'Certified Anti-Money Laundering Specialist',
    description:
      'AML compliance, financial crime investigation, and regulatory reporting, built from FATF, Basel, and Wolfsberg frameworks.',
    image: '/course-cams.png',
    status: 'available' as const,
  },
  {
    slug: 'ccas',
    title: 'CCAS Prep',
    subtitle: 'Certified Cryptoasset Specialist',
    description:
      'Blockchain compliance, crypto transaction monitoring, DeFi risk assessment, and the global cryptoasset regulatory landscape.',
    image: '/course-ccas.png',
    status: 'soon' as const,
  },
  {
    slug: 'fccs',
    title: 'FCCS Prep',
    subtitle: 'Financial Crime Compliance Specialist',
    description:
      'Advanced transaction monitoring logic, correspondent banking risk audits, and automated control frameworks.',
    image: '/study_environment.png',
    status: 'soon' as const,
  },
]

function CourseCard({ course }: { course: (typeof courses)[number] }) {
  const isAvailable = course.status === 'available'

  const inner = (
    <>
      {/* Course image (always visible; colorizes on hover) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover grayscale transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-[1.04]"
        />
        {!isAvailable && (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 backdrop-blur-sm">
            Coming soon
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col border-t border-foreground p-6">
        <h3 className="text-lg font-bold uppercase tracking-tight font-sans">{course.title}</h3>
        <p className="mt-0.5 text-[9px] uppercase tracking-widest font-mono text-foreground/50">
          {course.subtitle}
        </p>
        <p className="mt-4 flex-1 text-xs leading-relaxed font-sans text-foreground/70">
          {course.description}
        </p>
        {isAvailable ? (
          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent transition-all duration-300 group-hover:gap-2.5">
            View course &rarr;
          </span>
        ) : (
          <span className="mt-5 inline-block text-[10px] font-mono uppercase tracking-widest text-foreground/40">
            Coming soon
          </span>
        )}
      </div>
    </>
  )

  const cardClass =
    'group flex flex-col overflow-hidden rounded-[24px] border border-foreground bg-background transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl'

  return isAvailable ? (
    <Link href={`/courses/${course.slug}`} className={`${cardClass} cursor-pointer`}>
      {inner}
    </Link>
  ) : (
    <div className={`${cardClass} cursor-default`}>{inner}</div>
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

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  )
}
