'use client'

import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { type Scene } from '@/lib/lesson/scenes'
import { readingBeats, slideBeats, SLIDE_ITEMS_PER_BEAT } from '@/lib/lesson/beats'
import { SceneRenderer } from '@/components/lesson/scenes/scene-renderer'
import { SlideScene } from '@/components/lesson/scenes/slide-scene'

/**
 * Beat pagination (on by default in the player; `?beats=0` opts out).
 *
 * Breaks a scene into viewport-sized "beats" shown one at a time. For reading
 * scenes the player narrates one clip per beat and passes the authoritative
 * `audioBeat`, so the on-screen beat is exactly the clip being spoken — no
 * estimation, no drift. Paused / read-mode, the student steps with < >. Slides
 * (separate narration track) fall back to overall progress. A "Full text"
 * toggle reveals the whole scene as an escape hatch.
 */

const PROSE =
  "prose prose-sm max-w-none leading-relaxed text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h3]:font-medium [&_h3]:mt-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs"

type ReadingCitations = { label: string; url?: string }[]

type Beat =
  | { kind: 'reading'; body: string; citations?: ReadingCitations }
  | { kind: 'slideItems'; from: number; to: number }

function buildBeats(scene: Scene): Beat[] {
  if (scene.sceneType === 'reading') {
    const chunks = readingBeats(scene.data.body)
    const cites = scene.data.citations
    return chunks.map((body, i) => ({
      kind: 'reading' as const,
      body,
      // attach citations to the final beat so sources are never dropped
      citations: i === chunks.length - 1 ? cites : undefined,
    }))
  }
  if (scene.sceneType === 'slide') {
    const n = scene.data.items?.length ?? 0
    return slideBeats(scene.data.narration, n, scene.data.template).map((b) => ({
      kind: 'slideItems' as const,
      from: b.from,
      to: b.to,
    }))
  }
  return []
}

/** Whether this scene is eligible for (and benefits from) beat pagination. */
export function paginates(scene: Scene): boolean {
  if (scene.sceneType === 'reading') return readingBeats(scene.data.body).length > 1
  // Comparison slides never paginate: the item cap would split a column set
  // mid-column (US/UK shown, EU stranded on page two). They render whole,
  // with progressive reveal doing the pacing.
  if (scene.sceneType === 'slide') {
    return (
      scene.data.template !== 'comparison' &&
      (scene.data.items?.length ?? 0) > SLIDE_ITEMS_PER_BEAT
    )
  }
  return false
}

export function BeatPager({
  scene,
  progress,
  audioBeat,
  playing,
  onSeekBeat,
}: {
  /** Only `reading` and `slide` scenes are passed here (the player gates it). */
  scene: Scene
  /** Narration progress 0–1 (used for slides, which have one narration track). */
  progress: number
  /** Authoritative active beat when the player drives per-beat audio (reading
   *  scenes in listen mode). When set, the display equals the clip playing. */
  audioBeat?: number | null
  playing: boolean
  /** Seek the player's per-beat audio queue (reading + listen mode). */
  onSeekBeat?: (i: number) => void
}) {
  const beats = useMemo(() => buildBeats(scene), [scene])
  const [manual, setManual] = useState<number | null>(null)
  const [showFull, setShowFull] = useState(false)

  // Reset per scene.
  useEffect(() => {
    setManual(null)
    setShowFull(false)
  }, [scene.id])

  // Non-paginated scenes (or the escape hatch): render the whole scene.
  if (showFull || beats.length <= 1) {
    return (
      <div className="space-y-4">
        {showFull && beats.length > 1 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowFull(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:text-primary"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              Beat view
            </button>
          </div>
        )}
        <SceneRenderer scene={scene} />
      </div>
    )
  }

  const progressBeat = Math.min(beats.length - 1, Math.max(0, Math.floor(progress * beats.length)))
  const active =
    audioBeat != null
      ? Math.min(beats.length - 1, Math.max(0, audioBeat))
      : playing
        ? progressBeat
        : manual ?? progressBeat
  const beat = beats[active]

  // Seek a beat — drive the audio queue when the player owns it, else local.
  const seek = (i: number) => {
    const c = Math.min(beats.length - 1, Math.max(0, i))
    if (onSeekBeat) onSeekBeat(c)
    else setManual(c)
  }
  // Manual stepping shows whenever the player isn't auto-advancing audio, or
  // when we can seek the audio queue directly.
  const showControls = onSeekBeat != null || !playing

  return (
    <div className="flex h-full flex-col">
      {/* Top row: scene title + show-full toggle */}
      <div className="mb-3 flex items-start justify-between gap-3">
        {scene.title ? (
          <h2 className="text-lg font-medium text-foreground">{scene.title}</h2>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setShowFull(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-400 transition-colors hover:text-primary"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Full text
        </button>
      </div>

      {/* The active beat — one thought at a time, centered in the stage */}
      <div className="flex flex-1 items-center">
        <div key={active} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
          {beat.kind === 'reading' ? (
            <div className="space-y-4">
              <div className={PROSE}>
                <ReactMarkdown>{beat.body}</ReactMarkdown>
              </div>
              {beat.citations && beat.citations.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Sources</div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {beat.citations.map((c, i) => (
                      <li key={i}>
                        {c.url ? (
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                            {c.label}
                          </a>
                        ) : (
                          c.label
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : scene.sceneType === 'slide' ? (
            <SlideScene
              data={{ ...scene.data, items: (scene.data.items ?? []).slice(beat.from, beat.to) }}
              // Within the page, items build in as the page's clip plays (the
              // lecturer walks them one by one); reading silently shows all.
              revealed={
                playing
                  ? Math.max(1, Math.ceil((progress || 0) * (beat.to - beat.from)))
                  : Infinity
              }
            />
          ) : null}
        </div>
      </div>

      {/* Beat rail: dots + manual step */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {beats.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-5 bg-primary' : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs tabular-nums text-neutral-400">
            {active + 1} / {beats.length}
          </span>
          {showControls && (
            <>
              <button
                type="button"
                onClick={() => seek(active - 1)}
                disabled={active === 0}
                aria-label="Previous beat"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => seek(active + 1)}
                disabled={active === beats.length - 1}
                aria-label="Next beat"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:text-primary disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
