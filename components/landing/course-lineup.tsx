import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const courses = [
  {
    slug: 'cdcs',
    title: 'CDCS Prep',
    subtitle: 'Certified Documentary Credit Specialist',
    description:
      'Master international trade finance, letters of credit, UCP 600, and bank guarantees. Designed for bankers and trade finance professionals.',
    status: 'available',
    badgeText: 'Available now',
  },
  {
    slug: 'cams',
    title: 'CAMS Prep',
    subtitle: 'Certified Anti-Money Laundering Specialist',
    description:
      'Preparation for AML compliance, financial crime investigation, and regulatory reporting — built from FATF, Basel, and Wolfsberg frameworks.',
    status: 'soon',
    badgeText: 'Coming soon',
  },
  {
    slug: 'ccas',
    title: 'CCAS Prep',
    subtitle: 'Certified Cryptoasset Anti-Financial Crime Specialist',
    description:
      'Blockchain compliance, crypto transaction monitoring, DeFi risk assessment, and the global cryptoasset regulatory landscape.',
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
              Course lineup
            </h2>
            <p className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
              Select your path to readiness.
            </p>
            <p className="mt-4 text-lg text-neutral-600">
              Each syllabus is engineered from primary regulatory source material, mapped to the official exam outline.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isAvailable = course.status === 'available'
            return (
              <div
                key={course.slug}
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

                  <h3 className="mt-6 text-2xl font-bold text-neutral-900">
                    {course.title}
                  </h3>
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
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-md bg-neutral-50 border border-neutral-200 py-2.5 px-4 text-sm font-semibold text-neutral-400 cursor-not-allowed"
                    >
                      Coming soon
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
