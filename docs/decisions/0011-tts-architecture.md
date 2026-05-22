# ADR 0011: TTS Audio Architecture

**Date:** 2026-05-22
**Status:** Accepted

## Context

ARCHITECTURE.md commitment #9 calls for multi-modality. Adding voice makes the AI lecturer feel like a real tutor and unlocks new contexts (commute, walking, hands-free study). Multiple TTS providers exist with different cost/quality tradeoffs.

## Decision

- Provider: Google Cloud Text-to-Speech (Wavenet voices for v1)
- Voice: en-US-Wavenet-D for all CDCS content (one voice for simplicity)
- Storage: Supabase Storage 'lesson-audio' bucket, public read
- Pre-generation: static lesson content rendered once at content-build time, MP3 stored at `{courseId}/{elementId}.mp3`
- Real-time: AI lecturer Q&A responses synthesized on the fly when the student has Listen mode on, stored at `qa-audio/{sessionId}-{timestamp}.mp3`
- Credentials: GCP service account JSON, stored as a file locally (in .secrets/, gitignored) and as an inline JSON env var (GOOGLE_APPLICATION_CREDENTIALS_JSON) in Vercel
- The TTS service account is created role-less: Cloud Text-to-Speech has no dedicated predefined IAM role, and TTS calls only require the API to be enabled on the project

## Alternatives considered

- ElevenLabs Multilingual v2: better voice quality (~$5-10 per course at retail) but plan-based pricing and slower streaming. Defer to v2 if Wavenet quality feedback is negative.
- OpenAI TTS: similar quality and cost to Wavenet, but adds an OpenAI dependency for audio. Wavenet chosen for Singapore region proximity + bn-BD support for future JAIBB/DAIBB courses.
- Real-time TTS only (no pre-generation): rejected; would add 2-4s latency on every lesson section start.

## Consequences

- + pre-generated content has zero startup latency; static audio works CDN-resilient
- + real-time Q&A TTS makes the lecturer feel responsive and human-like
- + Listen mode is opt-in but persistent; respects the student's preferred_modality
- + cost is bounded: ~$0.23 to pre-generate the CDCS dev course (16 elements) one-time, plus low real-time Q&A volume
- − voice variation across content element types is uniform (all en-US-Wavenet-D in v1); upgrade to multi-voice in v2 if compelling
- − bn-BD Bangla TTS for JAIBB/DAIBB courses requires separate voice selection; deferred
- − the GCP service account is a permanent dependency; key rotation must be tracked
