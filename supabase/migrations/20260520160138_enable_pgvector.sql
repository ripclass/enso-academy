-- Enable pgvector extension for embedding storage and similarity search.
-- Required for the Q&A cache layer (lib/cache/) and student knowledge embeddings.
-- See docs/ARCHITECTURE.md "Three-tier model architecture" — 60-70% of student
-- queries are served from this cache, making it foundational infrastructure.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Sanity check: confirm extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    RAISE EXCEPTION 'pgvector extension failed to enable';
  END IF;
END $$;
