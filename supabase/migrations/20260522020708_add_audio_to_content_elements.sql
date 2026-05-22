-- Add audio narration columns to content_library_elements (Prompt 8 / TTS).
-- audio_url        — public Supabase Storage URL of the pre-generated MP3
-- audio_generated_at — when the narration was last synthesized
-- audio_duration_seconds — estimated playback length

ALTER TABLE content_library_elements
  ADD COLUMN audio_url TEXT,
  ADD COLUMN audio_generated_at TIMESTAMPTZ,
  ADD COLUMN audio_duration_seconds NUMERIC(8,2);

CREATE INDEX idx_content_lib_has_audio
  ON content_library_elements(course_id)
  WHERE audio_url IS NOT NULL;
