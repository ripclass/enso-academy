'use client'

import { Avatar } from './avatar'

export type LecturerVariant = 'male' | 'female'

/**
 * The lecturer's on-stage presence:
 *  - LecturerAvatar — the round portrait (reused in the dock, Ask panel, chat).
 *    `variant` picks the male/female lecturer (the player alternates by chapter).
 *  - LecturerDock — avatar + name, bottom-left, alive while narrating.
 *  - NarrationBubble — the floating bubble with the spoken script.
 */

export function LecturerAvatar({
  size = 56,
  variant = 'female',
  speaking,
  thinking,
}: {
  size?: number
  variant?: LecturerVariant
  speaking?: boolean
  thinking?: boolean
}) {
  const active = speaking || thinking
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`h-full w-full overflow-hidden rounded-full border bg-white transition-all duration-500 ${
          active ? 'border-primary/40 shadow-[0_0_0_4px_rgba(15,61,62,0.14)]' : 'border-neutral-200 shadow-sm'
        }`}
      >
        <Avatar src={`/avatars/lecturer-${variant}.webp`} size={size} />
      </div>
      {speaking && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/15" />}
      {active && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary" />
      )}
    </div>
  )
}

export function LecturerDock({
  name = 'Enso Guide',
  variant = 'female',
  speaking,
  thinking,
}: {
  name?: string
  variant?: LecturerVariant
  speaking: boolean
  thinking?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <LecturerAvatar size={56} variant={variant} speaking={speaking} thinking={thinking} />
      <div className="hidden min-w-0 sm:block">
        <div className="truncate text-sm font-bold text-neutral-900">{name}</div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-primary">
            Lecturer
          </span>
          {speaking && <SpeakingBars />}
        </div>
      </div>
    </div>
  )
}

/**
 * The lecturer's live subtitle. It shows the line currently being spoken
 * (`text`, advanced sentence-by-sentence by the player as the audio plays) and
 * collapses to nothing when the lecturer is silent — so the stage stays clean.
 * A little tail on the left points back at the lecturer dock.
 */
export function NarrationBubble({
  text,
  speaking,
  thinking,
}: {
  text: string
  speaking?: boolean
  thinking?: boolean
}) {
  // Quiet unless the lecturer is actually speaking (or composing an answer).
  if (!thinking && (!speaking || !text)) return null
  return (
    <div className="relative max-w-2xl rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
      {/* tail pointing left, toward the lecturer */}
      <span
        aria-hidden
        className="absolute -left-1.5 top-5 h-3 w-3 rotate-45 border-b border-l border-neutral-200 bg-white"
      />
      {thinking ? (
        <p className="font-mono text-xs text-neutral-400">The lecturer is thinking…</p>
      ) : (
        <p
          key={text}
          className="line-clamp-3 text-sm leading-relaxed text-neutral-700 duration-300 animate-in fade-in"
        >
          {text}
        </p>
      )}
    </div>
  )
}

function SpeakingBars() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-0.5 animate-pulse rounded-full bg-accent"
          style={{ height: 9, animationDelay: `${delay}ms`, animationDuration: '700ms' }}
        />
      ))}
    </span>
  )
}
