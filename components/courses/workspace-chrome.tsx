'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { CourseNav, type WorkspaceActiveKey, type WorkspaceViewKey } from './course-nav'

/**
 * The course workspace shell: the app header, a persistent left nav, and a main
 * content slot, shared by every hub page (course home, mock exams, Desk Mix, and
 * the enrolled Case Mode / Flashcards views). The focused runners (taking a mock)
 * and the public documents (study guide) deliberately do NOT use this chrome, so
 * it is applied per page rather than as a route layout.
 */
export function WorkspaceChrome({
  slug,
  shortName,
  courseName,
  activeKey,
  onSelectView,
  children,
}: {
  slug: string
  shortName: string
  courseName: string
  activeKey: WorkspaceActiveKey
  /** Only the course home passes this, to toggle its in-page views. */
  onSelectView?: (key: WorkspaceViewKey) => void
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const head = (
    <div className="mb-6">
      <span className="block font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
        {shortName}
      </span>
      <h2 className="mt-0.5 text-base font-bold leading-snug tracking-tight text-neutral-900">
        {courseName}
      </h2>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 py-8 lg:py-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="lg:sticky lg:top-6">
            {head}
            <CourseNav slug={slug} activeKey={activeKey} onSelectView={onSelectView} />
          </div>
        </aside>

        {/* Content pane */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
            >
              <Menu className="h-4 w-4" /> Sections
            </button>
            <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
              {shortName}
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-neutral-900/40"
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
                {shortName}
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="text-neutral-400 transition-colors hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CourseNav
              slug={slug}
              activeKey={activeKey}
              onSelectView={onSelectView}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
