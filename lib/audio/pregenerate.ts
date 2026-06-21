// lib/audio/pregenerate.ts
// Pre-generates MP3 narration for all content_library_elements of a course.
// Stores MP3 in Supabase Storage, writes audio_url back to the table.
// Idempotent: skips elements that already have audio_url set, unless force=true.

import { createAdminClient } from '@/lib/supabase/admin'
import { synthesizeSpeech, textToSpeechReady } from './tts'

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
