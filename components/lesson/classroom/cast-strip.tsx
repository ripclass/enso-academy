'use client'

import { Avatar } from './avatar'

/**
 * The classmate cast — the peers in the room. Each gets a stable character
 * avatar (seeded by name). Presence-only for now; a later pass wires them to
 * speak on stage. The lecturer is rendered separately (LecturerDock).
 */

export type CastMember = { name: string }

export function CastStrip({
  members,
  activeName,
}: {
  members: CastMember[]
  /** The peer currently speaking / raising a hand, if any. */
  activeName?: string | null
}) {
  return (
    <div className="flex items-center gap-2">
      {members.slice(0, 6).map((m) => {
        const active = activeName === m.name
        return (
          <div key={m.name} className="group relative" title={m.name}>
            <div
              className={`overflow-hidden rounded-full border bg-white transition-all duration-300 ${
                active
                  ? 'scale-110 border-accent shadow-[0_0_0_3px_rgba(224,120,86,0.18)]'
                  : 'border-neutral-200 shadow-sm'
              }`}
            >
              <Avatar seed={m.name} size={40} />
            </div>
            {/* presence dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
          </div>
        )
      })}
    </div>
  )
}
