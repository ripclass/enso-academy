# Google OAuth Setup for Enso Academy

**Status:** Pending (placeholder credentials in Supabase; real credentials added later)

## Steps to complete (Ripon, manual)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project (or use existing Enso Intelligence Inc. project) named "Enso Academy"
3. Enable the Google+ API and Google People API
4. Navigate to APIs & Services → Credentials
5. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Enso Academy
   - Authorized JavaScript origins:
     - http://localhost:3000
     - https://enso.academy (eventually)
     - Vercel preview URLs (pattern: https://enso-academy-*.vercel.app)
   - Authorized redirect URIs:
     - https://yffwnyuodulbfjjobhmf.supabase.co/auth/v1/callback
     - http://localhost:3000/auth/callback (for local dev)
6. Copy Client ID and Client Secret
7. In Supabase Dashboard → Authentication → Providers → Google:
   - Toggle Enable
   - Paste Client ID and Client Secret
   - Save
8. Update CLAUDE.md "Gotchas and notes" section to remove the "Google OAuth pending" line

## Verify

After setup, the test flow is:
1. Run `pnpm dev`
2. Navigate to a page that calls `signInWithOAuth({ provider: 'google' })`
3. Confirm redirect to Google → consent → callback → authenticated session

Implementation of the auth UI happens in a later prompt; this file documents what must be true before that prompt can succeed.
