'use client'

import { useState } from 'react'
import { WorkspaceChrome } from './workspace-chrome'
import type { WorkspaceViewKey } from './course-nav'

/**
 * The course home. It owns the three in-page views (Overview, Modules, Progress)
 * and renders them inside the shared workspace shell. Overview leads with the
 * flight plan (the actionable "what to do, working back from the exam"), then the
 * course description and the exam-coverage map; Modules and Progress hold the
 * lesson list and the knowledge model. The practice tools and study guide live at
 * their own routes, reachable from the shell's sidebar.
 */
export function CourseWorkspace({
  slug,
  shortName,
  courseName,
  description,
  certifyingBody,
  flightPlan,
  overviewExtra,
  modules,
  progress,
  initialView = 'overview',
}: {
  slug: string
  shortName: string
  courseName: string
  description: string | null
  certifyingBody: string | null
  /** The flight plan, rendered at the top of Overview. */
  flightPlan: React.ReactNode
  /** The exam-coverage map, rendered lower on Overview. */
  overviewExtra: React.ReactNode
  /** The "Modules" view content: the module/lesson list. */
  modules: React.ReactNode
  /** The "Progress" view content: knowledge model and error ledger. */
  progress: React.ReactNode
  /** Initial view, so a sidebar link from another page can deep-link a view. */
  initialView?: WorkspaceViewKey
}) {
  const [active, setActive] = useState<WorkspaceViewKey>(initialView)

  return (
    <WorkspaceChrome
      slug={slug}
      shortName={shortName}
      courseName={courseName}
      activeKey={active}
      onSelectView={setActive}
    >
      {active === 'overview' && (
        <div>
          {/* The sidebar carries the course identity on desktop; show a heading
              here only on mobile, where the sidebar collapses into a drawer. */}
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 lg:hidden">
            {courseName}
          </h1>

          {flightPlan}

          {(description || certifyingBody) && (
            <div className="mt-8 max-w-2xl">
              {description && <p className="leading-relaxed text-neutral-600">{description}</p>}
              {certifyingBody && (
                <p className="mt-3 font-mono text-2xs uppercase tracking-wider text-neutral-400">
                  Certifying body: {certifyingBody}
                </p>
              )}
            </div>
          )}

          <div className="mt-10 border-t border-neutral-200 pt-10">{overviewExtra}</div>
        </div>
      )}

      {active === 'modules' && (
        <div>
          <ViewHeading
            title="Course modules"
            subtitle="Every lesson, in order. Pick up wherever you left off."
          />
          {modules}
        </div>
      )}

      {active === 'progress' && (
        <div>
          <ViewHeading
            title="Your progress"
            subtitle="What you've mastered, and the concepts to chase."
          />
          {progress}
        </div>
      )}
    </WorkspaceChrome>
  )
}

function ViewHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </div>
  )
}
