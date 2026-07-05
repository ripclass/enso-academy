'use client'

import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Copy,
  FileText,
  Layers,
  LayoutGrid,
  Scale,
  Shuffle,
  type LucideIcon,
} from 'lucide-react'

/**
 * The course workspace navigation, shared by every hub page so the sidebar reads
 * identically across the course. "View" items (Overview / Modules / Progress) are
 * in-page toggles on the course home (via onSelectView) and links back to it from
 * anywhere else; the practice tools and study guide are always route links.
 */

export type WorkspaceViewKey = 'overview' | 'modules' | 'progress'
export type WorkspaceActiveKey =
  | WorkspaceViewKey
  | 'mock'
  | 'desk-mix'
  | 'cases'
  | 'flashcards'
  | 'guide'

type Item =
  | { kind: 'view'; key: WorkspaceViewKey; label: string; icon: LucideIcon; badge?: string }
  | { kind: 'route'; key: WorkspaceActiveKey; label: string; icon: LucideIcon; seg: string; badge?: string }

const GROUPS: { heading: string; items: Item[] }[] = [
  {
    heading: 'Learn',
    items: [
      { kind: 'view', key: 'overview', label: 'Overview', icon: LayoutGrid },
      { kind: 'view', key: 'modules', label: 'Modules', icon: Layers },
    ],
  },
  {
    heading: 'Practice',
    items: [
      { kind: 'route', key: 'mock', label: 'Mock exams', icon: FileText, seg: 'mock' },
      { kind: 'route', key: 'desk-mix', label: 'Desk Mix', icon: Shuffle, seg: 'desk-mix' },
      { kind: 'route', key: 'cases', label: 'Case Mode', icon: Scale, seg: 'cases', badge: 'New' },
      { kind: 'route', key: 'flashcards', label: 'Flashcards', icon: Copy, seg: 'flashcards', badge: 'New' },
    ],
  },
  {
    heading: 'Prepare',
    items: [{ kind: 'view', key: 'progress', label: 'Progress', icon: Activity }],
  },
]

export function CourseNav({
  slug,
  activeKey,
  onSelectView,
  onNavigate,
}: {
  slug: string
  activeKey: WorkspaceActiveKey
  /** Present on the course home: view items toggle in place instead of navigating. */
  onSelectView?: (key: WorkspaceViewKey) => void
  /** Called after any nav interaction, used to close the mobile drawer. */
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Course sections" className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.heading}>
          <span className="block px-3 font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
            {group.heading}
          </span>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = item.key === activeKey
              const base =
                'flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm transition-colors'
              const state = isActive
                ? 'border-primary bg-primary-light font-semibold text-primary'
                : 'border-transparent font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              const inner = (
                <>
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-neutral-400'}`}
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-accent-light px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                      {item.badge}
                    </span>
                  )}
                </>
              )

              if (item.kind === 'view') {
                if (onSelectView) {
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectView(item.key)
                          onNavigate?.()
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`${base} ${state} w-full text-left`}
                      >
                        {inner}
                      </button>
                    </li>
                  )
                }
                const href =
                  item.key === 'overview' ? `/courses/${slug}` : `/courses/${slug}?view=${item.key}`
                return (
                  <li key={item.key}>
                    <Link href={href} onClick={onNavigate} className={`${base} ${state}`}>
                      {inner}
                    </Link>
                  </li>
                )
              }

              return (
                <li key={item.key}>
                  <Link
                    href={`/courses/${slug}/${item.seg}`}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${base} ${state}`}
                  >
                    {inner}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {/* The study guide is a standalone printable reference, not a workspace
          view, so it sits apart from the section nav and opens on its own. */}
      <div className="border-t border-neutral-200 pt-4">
        <Link
          href={`/courses/${slug}/guide`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          <BookOpen className="h-4 w-4 shrink-0 text-neutral-400" />
          <span className="min-w-0 truncate">Study guide</span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-neutral-300" />
        </Link>
      </div>
    </nav>
  )
}
