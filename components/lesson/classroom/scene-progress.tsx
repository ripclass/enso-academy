'use client'

import type { Scene, SceneType } from '@/lib/lesson/scenes'

const TYPE_LABEL: Record<SceneType, string> = {
  reading: 'Reading',
  slide: 'Slide',
  quiz: 'Knowledge check',
  interactive: 'Interactive',
  pbl: 'Project',
  challenge: 'Apply it',
}

/**
 * Chapter-tick progress bar: one segment per scene. Past scenes are filled,
 * the current scene pulses, future scenes are empty. Click any tick to jump.
 */
export function SceneProgress({
  scenes,
  currentIndex,
  onJump,
}: {
  scenes: Scene[]
  currentIndex: number
  onJump: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {scenes.map((s, i) => {
        const done = i < currentIndex
        const current = i === currentIndex
        const label = `${i + 1}. ${s.title ?? TYPE_LABEL[s.sceneType]}`
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to ${label}`}
            title={label}
            className="group relative h-1.5 flex-1 rounded-full bg-neutral-200 transition-all hover:h-2.5"
          >
            <span
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                done ? 'bg-primary' : current ? 'bg-accent' : 'bg-transparent'
              }`}
            />
            {current && (
              <span className="absolute inset-0 animate-pulse rounded-full bg-accent/40" />
            )}
          </button>
        )
      })}
    </div>
  )
}
