// lib/lesson/scenes.ts
// The scene-data contract — Prompt 12 / ADR 0016.
//
// A lesson is an ordered list of typed SCENES. Each content_library_elements
// row carries a `scene_type` discriminator and a `scene_data` jsonb payload.
// This file is the canonical contract: the scene renderers (components/lesson/
// scenes/) consume it, and the Opus course-generation pipeline emits it.
// Keep it explicit and bounded — no free-form layout.

// ── Slide templates ─────────────────────────────────────────────────────────
// A bounded set the renderer and the generator both target. This is NOT an
// arbitrary-layout engine — the generator picks one of these per slide.
export type SlideTemplate = 'key-points' | 'definition' | 'comparison' | 'callout'

export type SlideItem = {
  /** Optional leading emoji or short glyph. */
  icon?: string
  /** Optional bold lead-in — a term, a step label, a column heading. */
  label?: string
  /** The item's text. */
  text: string
}

// ── Per-scene-type payloads (the shape of scene_data) ───────────────────────

/** `reading` — prose taught from primary sources, with visible citations. */
export type ReadingSceneData = {
  body: string // markdown
  citations?: { label: string; url?: string }[]
}

/**
 * `slide` — a designed slide. `template` selects the layout; `items` carries
 * the points / rows; `narration` is the spoken script for TTS.
 *  - key-points : heading + a list of point cards (icon / label / text)
 *  - definition : heading is the term; items[0].text is the definition
 *  - comparison : two columns; items split by `label` (the column heading)
 *  - callout    : a single emphasised statement (items[0].text)
 */
export type SlideSceneData = {
  template: SlideTemplate
  heading: string
  subheading?: string
  items?: SlideItem[]
  narration: string
}

/** A single inline quiz question. */
export type QuizQuestion = {
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation: string
  /** Concepts this question assesses — feeds the student knowledge model. */
  conceptTags: string[]
  points?: number
}

/**
 * `quiz` — an inline, formative knowledge check. This is NOT the faithful mock
 * exam (that is the mock engine, untouched). Answers feed recordEvidence.
 */
export type QuizSceneData = {
  intro?: string
  questions: QuizQuestion[]
}

/**
 * `interactive` / `pbl` payload. `spec` carries the renderer-specific build
 * data; when it names a known interactive `kind`, that widget renders, else the
 * scene falls back to a title + summary placeholder.
 */
export type PlaceholderSceneData = {
  title: string
  summary: string
  spec?: InteractiveSpec | PblSpec | unknown
}

// ── Interactive widgets ─────────────────────────────────────────────────────
// A bounded set of signature interactions. The renderer dispatches on `kind`.

/** One customer/scenario to sort into a risk tier. */
export type RiskClassifyItem = {
  id: string
  label: string
  tier: 'low' | 'medium' | 'high'
  /** Why it belongs in that tier — shown as feedback after placement. */
  why: string
}

/** One statement to judge as a red flag (or not) in a scenario. */
export type RedFlagItem = {
  id: string
  label: string
  /** True if this is genuinely a red flag / indicator. */
  flag: boolean
  /** Why it is (or is not) a red flag — shown as feedback after checking. */
  why: string
}

export type InteractiveSpec =
  | { kind: 'risk-classify'; prompt?: string; items: RiskClassifyItem[] }
  | { kind: 'red-flags'; prompt?: string; scenario?: string; items: RedFlagItem[] }

/** Narrow an unknown spec to a known interactive kind. */
export function asInteractiveSpec(spec: unknown): InteractiveSpec | null {
  if (!spec || typeof spec !== 'object') return null
  const kind = (spec as { kind?: unknown }).kind
  const hasItems = Array.isArray((spec as { items?: unknown }).items)
  if ((kind === 'risk-classify' || kind === 'red-flags') && hasItems) {
    return spec as InteractiveSpec
  }
  return null
}

// ── Project-based learning (PBL) ────────────────────────────────────────────
// A project brief the student works, then an AI mentor grades the submission.

export type PblSpec = {
  kind: 'project'
  /** The scenario / context. */
  brief: string
  /** What the student must do. */
  task: string
  /** What to produce, e.g. "a 4-6 sentence SAR narrative". */
  deliverable?: string
  /** The criteria a strong answer meets — shown to the student and used to grade. */
  rubric: string[]
}

/** Narrow an unknown spec to a project (PBL) kind. */
export function asPblSpec(spec: unknown): PblSpec | null {
  if (
    spec &&
    typeof spec === 'object' &&
    (spec as { kind?: unknown }).kind === 'project' &&
    typeof (spec as { brief?: unknown }).brief === 'string' &&
    Array.isArray((spec as { rubric?: unknown }).rubric)
  ) {
    return spec as PblSpec
  }
  return null
}

// ── The discriminated Scene union ───────────────────────────────────────────

/** Fields every scene carries regardless of type (from the content row). */
export type SceneBase = {
  id: string
  /** Display title (the content row's `title`). */
  title: string | null
  /** Concepts — read by the classmate gap-detection and the knowledge model. */
  conceptTags: string[]
  teachesConcepts: string[]
  /** Pre-generated narration audio, if any. */
  audioUrl: string | null
  estimatedSeconds: number | null
}

export type Scene = SceneBase & (
  | { sceneType: 'reading'; data: ReadingSceneData }
  | { sceneType: 'slide'; data: SlideSceneData }
  | { sceneType: 'quiz'; data: QuizSceneData }
  | { sceneType: 'interactive'; data: PlaceholderSceneData }
  | { sceneType: 'pbl'; data: PlaceholderSceneData }
)

export type SceneType = Scene['sceneType']

// ── Parsing a content row into a typed Scene ────────────────────────────────

/** The shape getLessonContent returns per content_library_elements row. */
export type ContentRow = {
  id: string
  scene_type: string | null
  scene_data: unknown
  title: string | null
  body: string
  concept_tags: string[] | null
  teaches_concepts: string[] | null
  audio_url: string | null
  estimated_seconds: number | null
}

/**
 * Read a content row into a typed Scene. A row with no scene_type, or any row
 * with an empty payload, falls back to a `reading` scene built from `body` —
 * so pre-scene content is never orphaned (backward compatible).
 */
export function parseScene(row: ContentRow): Scene {
  const base: SceneBase = {
    id: row.id,
    title: row.title,
    conceptTags: row.concept_tags ?? [],
    teachesConcepts: row.teaches_concepts ?? [],
    audioUrl: row.audio_url,
    estimatedSeconds: row.estimated_seconds,
  }
  const type = (row.scene_type ?? 'reading') as SceneType
  const data = (row.scene_data && typeof row.scene_data === 'object'
    ? (row.scene_data as Record<string, unknown>)
    : {})
  const hasPayload = Object.keys(data).length > 0

  if (hasPayload) {
    switch (type) {
      case 'slide':
        return { ...base, sceneType: 'slide', data: data as unknown as SlideSceneData }
      case 'quiz':
        return { ...base, sceneType: 'quiz', data: data as unknown as QuizSceneData }
      case 'interactive':
        return { ...base, sceneType: 'interactive', data: data as unknown as PlaceholderSceneData }
      case 'pbl':
        return { ...base, sceneType: 'pbl', data: data as unknown as PlaceholderSceneData }
      case 'reading':
        return { ...base, sceneType: 'reading', data: data as unknown as ReadingSceneData }
    }
  }
  // No payload (or unknown type) → a reading scene from the row's `body`.
  return { ...base, sceneType: 'reading', data: { body: row.body } }
}

/**
 * Deterministic male/female lecturer for a lesson, so chapters alternate but
 * each lesson is consistent. Shared by the player (avatar) and the narration
 * synthesis (voice), so the face and the voice always match.
 */
export function lecturerVariantFor(lessonId: string): 'male' | 'female' {
  let h = 0
  for (let i = 0; i < lessonId.length; i++) h = (h + lessonId.charCodeAt(i)) % 2
  return h === 0 ? 'female' : 'male'
}

/** The narration text for a scene — what TTS speaks. */
export function sceneNarration(scene: Scene): string {
  switch (scene.sceneType) {
    case 'reading': return scene.data.body
    case 'slide': return scene.data.narration
    case 'quiz': return scene.data.intro ?? ''
    case 'interactive':
    case 'pbl': return scene.data.summary
  }
}

/**
 * Split narration/body text into display sentences (markdown stripped). Shared
 * by the live subtitle and beat pagination so both index the same sentence
 * stream — keeping the lecturer's bubble and the on-screen beat in lockstep.
 */
export function splitSentences(raw: string): string[] {
  const clean = raw
    .replace(/\*\*|__|\*|_|`/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return []
  const parts = clean.match(/[^.!?]+[.!?]+["')\]]*(?:\s|$)|[^.!?]+$/g)
  return (parts ?? [clean]).map((s) => s.trim()).filter(Boolean)
}

/**
 * Up to three starter questions for a scene — shown as clickable chips so the
 * student learns *how* to ask, not just that they can. Tuned to the scene type.
 */
export function suggestedQuestions(scene: Scene): string[] {
  switch (scene.sceneType) {
    case 'reading':
      return ['Summarize the key point', 'Give me an example', 'How is this tested on the exam?']
    case 'slide':
      switch (scene.data.template) {
        case 'comparison':
          return ["What's the key difference?", 'When does each one apply?', 'Give me an example']
        case 'definition':
          return ['What does this mean in practice?', 'Give me an example', 'Why does this matter?']
        case 'callout':
          return ['Why does this matter?', 'How do I apply this?', 'Give me an example']
        case 'key-points':
        default:
          return ['Explain this more simply', 'Give me a real example', 'How is this tested?']
      }
    case 'interactive':
    case 'pbl':
      return ['What should I do here?', 'Give me a hint']
    case 'quiz':
      return []
  }
}

/** Plain-text context for a scene — fed to the lecturer Q&A and classmate prompts. */
export function sceneContext(scene: Scene): string {
  const t = scene.title ? `${scene.title}\n` : ''
  switch (scene.sceneType) {
    case 'reading':
      return t + scene.data.body
    case 'slide':
      return t + scene.data.heading + '\n' +
        (scene.data.items ?? []).map((i) => `- ${i.label ? i.label + ': ' : ''}${i.text}`).join('\n') +
        '\n' + scene.data.narration
    case 'quiz':
      return t + (scene.data.intro ?? '') + '\n' +
        scene.data.questions.map((q) => q.prompt).join('\n')
    case 'interactive':
    case 'pbl':
      return t + scene.data.summary
  }
}
