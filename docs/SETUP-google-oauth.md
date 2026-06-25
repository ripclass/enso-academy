# Google OAuth Setup for Enso Academy

**Status:** Code is wired (the "Continue with Google" buttons call `supabase.auth.signInWithOAuth({ provider: 'google' })` on `/login` and `/signup`). The button is INERT until the operator steps below are done: the Google provider must be enabled in Supabase with a real Google OAuth client. Until then, clicking it redirects to Supabase, errors with "provider is not enabled", and bounces to `/auth/auth-error`.

## How the flow works (so the redirect URIs make sense)

Supabase brokers the OAuth handshake. The chain is:

1. App calls `signInWithOAuth` with `redirectTo: <origin>/auth/callback?next=<dest>`.
2. Browser goes to Supabase, then to Google for consent.
3. Google returns to **Supabase's** callback: `https://yffwnyuodulbfjjobhmf.supabase.co/auth/v1/callback`.
4. Supabase then redirects to **our** `redirectTo` (`/auth/callback?next=...`), which exchanges the code for a session and lands the user on `next` (default `/dashboard`).

So: Google's "Authorized redirect URI" is the **Supabase** URL (step 3). Our app's `/auth/callback` is a Supabase **Redirect URL allowlist** entry (step 4), NOT a Google redirect URI.

## Steps to complete (Ripon, manual)

### A. Google Cloud Console (https://console.cloud.google.com/)
1. Use the existing `enso-academy` GCP project (same one as the TTS service account) or create one.
2. **OAuth consent screen** (APIs & Services -> OAuth consent screen): User type External; app name "Enso Academy"; support email; scopes `email`, `profile`, `openid`. Publish it (or add test users while in Testing).
3. **Credentials** -> Create Credentials -> OAuth client ID -> Application type "Web application", name "Enso Academy".
   - **Authorized JavaScript origins:**
     - `https://www.ensoacademy.ai`
     - `http://localhost:3000`
   - **Authorized redirect URIs** (this is the Supabase callback, the one that matters):
     - `https://yffwnyuodulbfjjobhmf.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**.

### B. Supabase Dashboard
5. Authentication -> Providers -> Google: toggle **Enable**, paste Client ID + Client Secret, Save.
6. Authentication -> URL Configuration: confirm **Site URL** = `https://www.ensoacademy.ai`, and the **Redirect URLs** allowlist includes:
   - `https://www.ensoacademy.ai/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://enso-academy-*.vercel.app/auth/callback` (optional, for Vercel preview deploys)

No app env vars are needed (Supabase holds the Google client secret). No deploy is needed to make it work once the provider is enabled.

## Verify (after the steps above)
1. Go to `https://www.ensoacademy.ai/login`, click "Continue with Google".
2. Confirm: redirect to Google -> consent -> back to the app -> authenticated, landed on `/dashboard` (or the `?next=` destination).
3. Repeat from `/signup` to confirm new-account creation via Google.
4. Once confirmed, remove the "Google OAuth pending" line from CLAUDE.md "Gotchas".
