'use client'

import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import type { Scene } from '@/lib/lesson/scenes'
import { SceneRenderer } from '@/components/lesson/scenes/scene-renderer'
import { SlideScene } from '@/components/lesson/scenes/slide-scene'

/**
 * Beat-pagination prototype (gated by `?beats=1` in the player).
 *
 * Instead of dumping a whole scene into a scrolling card, we break it into
 * "beats" sized to fit the stage, and show one at a time. While the narration
 * plays, beats advance with the voice (a slide that "plays like a video");
 * when paused or reading silently, the student steps through manually. A
 * "show full" toggle always reveals the complete scene as an escape hatch.
 *
 * Only `reading` and multi-item `slide` scenes are paginated; everything else
 * (quiz / interactive / pbl, and short scenes) renders normally.
 */

const PROSE =
  "prose prose-sm max-w-none leading-relaxed text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h3]:font-medium [&_h3]:mt-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs"

// Character budget per reading beat — tuned so a beat reads as ~3-5 sentences
// and fits the stage without scrolling on a typical screen.
const READING_BUDGET = 620
const SLIDE_ITEMS_PER_BEAT = 4

type ReadingCitations = { label: string; url?: string }[]

type Beat =
  | { kind: 'reading'; body: string; citations?: ReadingCitations }
  | { kind: 'slideItems'; from: number; to: number }

/** Group markdown blocks (split on blank lines) into beats under a char budget. */
function splitReadingBeats(body: string): string[] {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
  if (blocks.length === 0) return [body]
  const beats: string[] = []
  let cur = ''
  for (const block of blocks) {
    const candidate = cur ? `${cur}\n\n${block}` : block
    // A single block longer than the budget gets its own beat.
    if (cur && candidate.length > READING_BUDGET) {
      beats.push(cur)
      cur = block
    } else {
      cur = candidate
    }
  }
  if (cur) beats.push(cur)
  return beats
}

function buildBeats(scene: Scene): Beat[] {
  if (scene.sceneType === 'reading') {
    const chunks = splitReadingBeats(scene.data.body)
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
    if (n <= SLIDE_ITEMS_PER_BEAT) return [{ kind: 'slideItems', from: 0, to: n }]
    const beats: Beat[] = []
    for (let i = 0; i < n; i += SLIDE_ITEMS_PER_BEAT) {
      beats.push({ kind: 'slideItems', from: i, to: Math.min(n, i + SLIDE_ITEMS_PER_BEAT) })
    }
    return beats
  }
  return []
}

/** Whether this scene is eligible for (and benefits from) beat pagination. */
export function paginates(scene: Scene): boolean {
  if (scene.sceneType === 'reading') return splitReadingBeats(scene.data.body).length > 1
  if (scene.sceneType === 'slide') return (scene.data.items?.length ?? 0) > SLIDE_ITEMS_PER_BEAT
  return false
}

export function BeatPager({
  scene,
  progress,
  playing,
}: {
  /** Only `reading` and `slide` scenes are passed here (the player gates it). */
  scene: Scene
  /** Narration progress 0–1 for the current scene (0 when not playing). */
  progress: number
  playing: boolean
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
  const active = playing ? progressBeat : manual ?? progressBeat
  const beat = beats[active]

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
        <div key={active} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
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
              revealed={Infinity}
            />
          ) : null}
        </div>
      </div>

      {/* Beat rail: dots + manual step (when not auto-advancing) */}
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
          {!playing && (
            <>
              <button
                type="button"
                onClick={() => setManual(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Previous beat"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setManual(Math.min(beats.length - 1, active + 1))}
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
