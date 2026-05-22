-- Create a Supabase Storage bucket for lesson narration audio.
-- Public read: audio is served via CDN, not gated by auth — the content
-- tables themselves are gated, so a leaked audio URL is low-value.
-- Service-role write for the pre-generation pipeline.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-audio',
  'lesson-audio',
  true,
  10485760,  -- 10MB per file
  ARRAY['audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies on storage.objects for this bucket.
-- Service-role policy is scoped TO service_role per the project's advisor
-- conventions (see CLAUDE.md); service_role bypasses RLS anyway, so this is
-- belt-and-suspenders and keeps `supabase db advisors` clean.
DROP POLICY IF EXISTS "Anyone can read lesson audio" ON storage.objects;
CREATE POLICY "Anyone can read lesson audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-audio');

DROP POLICY IF EXISTS "Service role can manage lesson audio" ON storage.objects;
CREATE POLICY "Service role can manage lesson audio"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'lesson-audio')
  WITH CHECK (bucket_id = 'lesson-audio');
