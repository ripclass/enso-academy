// scripts/voice-ab.ts
// One-off: synthesize the same CAMS narration paragraph in several Google voices
// (current Wavenet vs the new Chirp 3: HD generative voices), upload to the public
// lesson-audio bucket, and print URLs to listen + compare. Run: pnpm tsx scripts/voice-ab.ts
import { config } from 'dotenv'
config({ path: '.env.local' })

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { createClient } from '@supabase/supabase-js'

const SAMPLE = `Money laundering is the process of making criminal proceeds appear legitimate. It moves through three stages: placement, layering, and integration. Understanding how dirty money enters the financial system, and how it is disguised along the way, is the first job of every anti-money-laundering professional.`

const BUCKET = 'lesson-audio'

async function main() {
  const tts = new TextToSpeechClient()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Discover available en-US Chirp 3 HD voices so we use valid names.
  const [voiceList] = await tts.listVoices({ languageCode: 'en-US' })
  const chirp3 = (voiceList.voices ?? [])
    .map(v => v.name!)
    .filter(n => n && n.includes('Chirp3-HD'))
    .sort()

  // Pick a couple of Chirp 3 HD voices (one likely-male, one likely-female if we can).
  const picks: { label: string; name: string }[] = [
    { label: '1-current-wavenet', name: 'en-US-Wavenet-D' },
  ]
  if (chirp3.length > 0) {
    // Charon / Kore are common male/female HD voices; fall back to whatever exists.
    const preferred = ['en-US-Chirp3-HD-Charon', 'en-US-Chirp3-HD-Kore', 'en-US-Chirp3-HD-Achernar', 'en-US-Chirp3-HD-Puck']
    const chosen = preferred.filter(p => chirp3.includes(p))
    const finalChirp = (chosen.length >= 2 ? chosen.slice(0, 2) : chirp3.slice(0, 2))
    finalChirp.forEach((name, i) => picks.push({ label: `${i + 2}-chirp3hd-${name.split('-').pop()!.toLowerCase()}`, name }))
  } else {
    console.log('No Chirp3-HD voices returned for en-US.')
  }

  console.log(`Chirp3-HD en-US voices available: ${chirp3.length}`)
  console.log('Generating samples for:', picks.map(p => p.name).join(', '))
  console.log('')

  for (const p of picks) {
    try {
      const [res] = await tts.synthesizeSpeech({
        input: { text: SAMPLE },
        voice: { languageCode: 'en-US', name: p.name },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
      })
      if (!res.audioContent) { console.log(`  ${p.label}: NO AUDIO`); continue }
      const buf = Buffer.from(res.audioContent as Uint8Array)
      const path = `voice-samples/${p.label}.mp3`
      const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
        contentType: 'audio/mpeg', upsert: true,
      })
      if (error) { console.log(`  ${p.label}: upload error ${error.message}`); continue }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      console.log(`  ${p.label.padEnd(24)} (${p.name})`)
      console.log(`    ${data.publicUrl}`)
    } catch (e) {
      console.log(`  ${p.label}: ERROR ${e instanceof Error ? e.message : String(e)}`)
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
