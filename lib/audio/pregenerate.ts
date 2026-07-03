// lib/audio/pregenerate.ts
// Pre-generates MP3 narration for all content_library_elements of a course.
// Stores MP3 in Supabase Storage, writes audio_url back to the table.
// Idempotent: skips elements that already have audio_url set, unless force=true.

import { createAdminClient } from '@/lib/supabase/admin'
import { synthesizeSpeech, textToSpeechReady, LECTURER_VOICES, textClipFileName } from './tts'
import { readingBeats, slideBeats } from '@/lib/lesson/beats'
import { lecturerVariantFor } from '@/lib/lesson/scenes'

type PregenerateOptions = {
  courseId: string
  force?: boolean
  onProgress?: (current: number, total: number, elementId: string) => void
}

export type PregenerateResult = {
  totalElements: number
  generated: number
  skipped: number
  failed: number
  totalCostCents: number
  errors: Array<{ elementId: string; error: string }>
}

export async function pregenerateCourseAudio(opts: PregenerateOptions): Promise<PregenerateResult> {
  const admin = createAdminClient()

  const { data: elements, error } = await admin
    .from('content_library_elements')
    .select('id, body, audio_url')
    .eq('course_id', opts.courseId)

  if (error) throw new Error('Failed to fetch elements: ' + error.message)
  if (!elements) {
    return { totalElements: 0, generated: 0, skipped: 0, failed: 0, totalCostCents: 0, errors: [] }
  }

  const result: PregenerateResult = {
    totalElements: elements.length,
    generated: 0,
    skipped: 0,
    failed: 0,
    totalCostCents: 0,
    errors: [],
  }

  let i = 0
  for (const el of elements) {
    i++
    opts.onProgress?.(i, elements.length, el.id)

    // Skip if already has audio and force=false
    if (el.audio_url && !opts.force) {
      result.skipped++
      continue
    }

    try {
      // Normalize to natural speech (spells out §, strips markdown, etc.)
      const cleanText = textToSpeechReady(el.body ?? '')

      // Nothing to narrate — skip rather than send empty input to TTS.
      if (!cleanText) {
        result.skipped++
        continue
      }

      // Synthesize
      const { audioBuffer, costCents } = await synthesizeSpeech({ text: cleanText })

      // Upload to Supabase Storage
      const fileName = `${opts.courseId}/${el.id}.mp3`
      const { error: uploadError } = await admin.storage
        .from('lesson-audio')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        })

      if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

      // Get public URL
      const { data: publicUrl } = admin.storage.from('lesson-audio').getPublicUrl(fileName)

      // Estimate duration: ~150 words/min for spoken content
      const wordCount = cleanText.split(/\s+/).length
      const estimatedSeconds = Math.round((wordCount / 150) * 60)

      // Update the row
      const { error: updateError } = await admin
        .from('content_library_elements')
        .update({
          audio_url: publicUrl.publicUrl,
          audio_generated_at: new Date().toISOString(),
          audio_duration_seconds: estimatedSeconds,
        })
        .eq('id', el.id)

      if (updateError) throw new Error('Update failed: ' + updateError.message)

      result.generated++
      result.totalCostCents += costCents
    } catch (err) {
      result.failed++
      result.errors.push({
        elementId: el.id,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }

    // Small delay to avoid rate-limiting (60 requests/min default quota)
    await new Promise((resolve) => setTimeout(resolve, 1100))
  }

  return result
}

export type BeatPregenResult = {
  readingScenes: number
  beatsTotal: number
  generated: number
  skipped: number
  failed: number
  totalCostCents: number
  errors: Array<{ elementId: string; beat: number; error: string }>
}

/**
 * Pre-generate the per-beat narration clips for a course's reading scenes, at
 * the exact hash path the player's beat-audio queue requests (textClipFileName)
 * — so beat playback never waits on synthesis, including across scene changes.
 * Idempotent: skips clips already in storage. Only multi-beat reading scenes use
 * per-beat audio; single-beat readings + slides keep the whole-scene clip
 * (pregenerateCourseAudio).
 */
export async function pregenerateBeatAudio(opts: {
  courseId: string
  onProgress?: (current: number, total: number, label: string) => void
}): Promise<BeatPregenResult> {
  const admin = createAdminClient()
  const { data: scenes, error } = await admin
    .from('content_library_elements')
    .select('id, lesson_id, scene_type, scene_data, body')
    .eq('course_id', opts.courseId)
    .in('scene_type', ['reading', 'slide'])
  if (error) throw new Error('Failed to fetch scenes: ' + error.message)

  const result: BeatPregenResult = {
    readingScenes: scenes?.length ?? 0,
    beatsTotal: 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    totalCostCents: 0,
    errors: [],
  }
  if (!scenes) return result

  // Build the full beat work-list first (mirrors the client: effective body is
  // scene_data.body when present, else the row body; variant is per-lesson).
  type Job = { elementId: string; variant: 'male' | 'female'; index: number; text: string }
  const jobs: Job[] = []
  for (const s of scenes) {
    const sd = s.scene_data && typeof s.scene_data === 'object' ? (s.scene_data as Record<string, unknown>) : null
    let texts: string[] = []
    if (s.scene_type === 'reading') {
      const body = (typeof sd?.body === 'string' ? sd.body : s.body ?? '') || ''
      texts = readingBeats(body)
    } else if (s.scene_type === 'slide') {
      const narration = typeof sd?.narration === 'string' ? sd.narration : ''
      const itemCount = Array.isArray(sd?.items) ? (sd.items as unknown[]).length : 0
      const template = typeof sd?.template === 'string' ? sd.template : undefined
      texts = slideBeats(narration, itemCount, template).map((b) => b.narration)
    }
    // Only multi-beat scenes whose every beat has narration use per-beat audio
    // (mirrors the player's beatAudio() guard); the rest use a single clip.
    if (texts.length <= 1 || texts.some((t) => !t.trim())) continue
    const variant = lecturerVariantFor((s.lesson_id as string | null) ?? '')
    texts.forEach((text, index) => jobs.push({ elementId: s.id, variant, index, text }))
  }
  result.beatsTotal = jobs.length

  let i = 0
  for (const job of jobs) {
    i++
    opts.onProgress?.(i, jobs.length, `${job.elementId} · beat ${job.index + 1}`)
    try {
      const clean = textToSpeechReady(job.text)
      if (!clean) {
        result.skipped++
        continue
      }
      const fileName = textClipFileName(clean, job.variant)
      const dir = fileName.slice(0, fileName.lastIndexOf('/'))
      const name = fileName.slice(fileName.lastIndexOf('/') + 1)
      const { data: existing } = await admin.storage.from('lesson-audio').list(dir, { search: name, limit: 1 })
      if (existing && existing.length > 0) {
        result.skipped++
        continue
      }
      const { audioBuffer, costCents } = await synthesizeSpeech({
        text: clean,
        voiceName: LECTURER_VOICES[job.variant],
      })
      const { error: upErr } = await admin.storage
        .from('lesson-audio')
        .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
      if (upErr) throw new Error('Upload failed: ' + upErr.message)
      result.generated++
      result.totalCostCents += costCents
      // Throttle only after an actual synth (skips stay fast on re-runs).
      await new Promise((r) => setTimeout(r, 800))
    } catch (err) {
      result.failed++
      result.errors.push({
        elementId: job.elementId,
        beat: job.index,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }
  return result
}
