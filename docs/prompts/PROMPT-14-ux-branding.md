# Prompt 14 — UX/UI Flow + Branding Pass (revised)

**For:** Claude Code CLI
**Project:** Enso Academy
**Builds on:** the full launch engineering (Prompts 1–13) — the 6.0 spine, scene-based lessons, the mock engine, the content pipeline
**Purpose:** Before commerce, make the product *look and feel* like the product the framework describes. Build the public landing surface (there is none today), apply a real brand identity, and re-skin the whole student journey in one coherent design language. Payments are Prompt 15; this prompt makes the thing they will pay for worth arriving at.

**Why "revised":** the brand identity and the landing page were designed in a separate Gemini pass and exist as first-cut implementations on disk. This prompt is no longer a branding-discovery exercise — the identity is **decided**. It integrates the Gemini cuts, fixes their problems, re-skins the journey, and ships.

---

## Before pasting — confirm

- Prompts 1–13 shipped; the launch engineering is feature-complete and live in production
- Clean main branch, no uncommitted work
- This file is OUTSIDE the repo
- **Two Gemini design artifacts exist OUTSIDE the repo and must be present before running:**
  - `J:\Enso Intelligence\gemini-output.md` — round 1: the brand foundation (design tokens, `<Logo>`, `<Mascot>`) and the landing page
  - `J:\Enso Intelligence\gemini-output-2.md` — round 2: the in-app surface re-skin (a UI kit + presentational reference layouts for dashboard / course page / lesson player / mock taker / results)
  - If `gemini-output-2.md` is absent, Step 6 falls back to re-skinning the journey directly from `docs/BRAND.md` — do not block.

---

```
---BEGIN PROMPT---

You are continuing Enso Academy development. This prompt is the UX/UI flow + branding pass — the design polish before payments.

THE SITUATION. The engineering is done — the 6.0 spine, scene-based lessons, the mock engine and signoff, the content pipeline. But the product has never had a coherent design pass. There is no public landing page — a prospect cannot learn what Enso Academy is without an account. The brand was a provisional v1 token set never developed into an identity. And the student journey has never been re-skinned to one standard. This prompt fixes all three — working from brand and design work already done in a separate Gemini pass.

DECISIONS ALREADY TAKEN (do not relitigate):
  - The brand identity is DECIDED. Keep the existing teal #0F3D3E / coral #E07856 palette. Adopt the Gemini-produced design language — "Auditable Editorial / Cold Fidelity" — the Outfit display typeface, Geist + Geist Mono for body/data, the `<Logo>`, and the `<Mascot>`. There is NO branding-proposal step.
  - The design language in one line: a premium professional posture (think Financial Times / Bloomberg Law, not consumer edtech) — typography-as-interface, restraint, teal/coral used functionally, a monospace (Geist Mono) for data/stats/concepts, technical/geometric accents over illustration. "Cold Fidelity" = the mock exam is deliberately sterile and exam-realistic, the visual opposite of the editorial marketing pages.
  - Enso Academy WILL have a mascot — a calm, mature, ensō-derived "Enso Guide" (an explicit owner decision that reverses the docs/FRAMEWORK.md "no cartoon mascots" line). This prompt updates FRAMEWORK.md to record that reversal. The mascot is a brand/lecturer visual anchor; it is NOT the per-course classmate character — do not conflate them.
  - This is a PRESENTATION-LAYER pass: ADOPT THE DESIGN LANGUAGE AND RE-SKIN. Do not build new features. Do not modify the spine — lib/student-model/, lib/classmate/, lib/mock/, lib/ai/ — or the schema. If anything tempts you toward a schema change, stop and ask.
  - Light-mode-only stays. It is a docs/FRAMEWORK.md commitment. No dark mode, no `dark:` variants.
  - DEFERRED — capture in docs/ROADMAP.md as post-launch ideas, do NOT build them this prompt: (a) an interactive concept node-graph visualizer — re-skin the EXISTING "Your knowledge" card instead, do not replace it; (b) a portfolio / evidence hub — the portfolio feature is unbuilt and deferred; (c) reactive/animated mascot states tied to the student model — ship the static mascot with its three SVG variants; animation is a later bet.

MANDATORY READING — read in this order, confirm, summarize current state:
1. CLAUDE.md
2. docs/FRAMEWORK.md — the product vision, the voice, the commercial positioning, "What 6.0 is not"
3. docs/ROADMAP.md — the Prompt 14 section
4. docs/ARCHITECTURE.md
5. docs/decisions/0007-design-system-v1.md — the design system this prompt supersedes
6. docs/PROGRESS.md, docs/SESSION-NOTES.md
7. app/globals.css — the current design tokens; app/layout.tsx — the current fonts/root layout
8. The route tree under app/ — every page a student touches, what serves `/`, the route groups, proxy.ts (route protection)
9. J:\Enso Intelligence\gemini-output.md — the round-1 Gemini cut (brand foundation + landing page)
10. J:\Enso Intelligence\gemini-output-2.md — the round-2 Gemini cut (the in-app re-skin), if present

DESIGN PHILOSOPHY FOR THIS PROMPT:

1. Adopt the language, not new scope. The Gemini design thinking is the design language. Apply it by re-skinning what exists and integrating the landing page. Anything that is a new feature build (see DEFERRED above) is out of scope — capture it, do not build it.
2. The Gemini cuts are first cuts, not finished code. They have honesty problems and bugs (enumerated in Steps 5–6). Integrate by refactoring — never paste them in unreviewed.
3. Honest, conservative, professional. No fabricated proof anywhere — no testimonials, student counts, pass-rate percentages, "trusted by" logos, ratings, awards. The product has not launched. The framework's positioning sells on its own.
4. The re-skin keeps the spine. Re-skinning a surface means taking the visual treatment and keeping all existing data flow and logic. The student model still writes, the classmate still fires, mocks still score. Verify it after.
5. Mobile is first-class. Every surface works at phone width — the framework imagines students studying on a metro.
6. Token changes cascade — handle them deliberately. Merging the new tokens touches every shadcn component. The `@layer base` border rule in globals.css must survive. Verify the existing app still renders.

WHAT THIS PROMPT DOES:

Step 0 (sanity): on main, clean tree; https://www.ensoacademy.ai reachable; Supabase linked; pnpm build clean before you start; confirm both Gemini artifact files are readable.

Step 1 (inspect): Map the current state. List every route and what serves `/`. Read app/globals.css and catalog the current tokens; read app/layout.tsx and note the current fonts. Note the shadcn setup (Base UI variant; whether the tw-animate utilities are installed). Check proxy.ts — confirm how to make `/` and the landing page public while the app stays behind auth. Read both Gemini artifact files and summarize what each provides. Report what exists, what is missing (public surface, OG image, favicon), and your integration plan.

Step 2 (journey audit — OBSERVE, do not fix): With the test account, walk the full journey on production with Playwright at BOTH desktop and mobile width: whatever serves `/` -> /signup -> /login -> /dashboard -> /courses -> /courses/[slug] -> a lesson (reading, slide, quiz scenes) -> the Q&A panel -> a mock exam -> the results/signoff page -> /dashboard. Screenshot each. Produce a written audit: per surface, the rough edges — dead ends, missing empty/loading/error states, inconsistent spacing/copy, broken mobile layouts, anything unfinished. Group it into a PRIORITIZED fix list (must-fix for launch vs. nice-to-have).

Step 3 (REVIEW GATE — present, then STOP): Present to me, in one message:
  (a) the journey audit and the prioritized fix list, with screenshots;
  (b) the course-availability question — the landing page has a course lineup (CAMS / CDCS / CCAS) and each needs an honest availability state. CAMS is the intended launch course but is currently a draft; the CDCS course is a hand-seeded non-methodology-compliant dev placeholder. Ask me which courses to present as available vs. coming soon.
  WAIT for my answers — the approved fix-list scope and the course states — before implementing.

Step 4 (brand foundation): Establish the identity in the codebase.
  - Merge the round-1 Gemini `@theme` block into app/globals.css. Keep teal #0F3D3E / coral #E07856. Reconcile token-name collisions so existing shadcn Base UI components still render correctly — the new tokens and the shadcn tokens must coexist. Keep the `@layer base { * { @apply border-border } }` rule. No dark mode.
  - Wire the fonts in app/layout.tsx: Outfit (display) and Geist + Geist Mono (body/data) via next/font.
  - Add the `<Logo>` and `<Mascot>` components (refactored from the Gemini cut — typed, clean). Update the favicon.
  - Write docs/BRAND.md — the brand guide: the name and the ensō meaning; the "Auditable Editorial / Cold Fidelity" design language; voice and tone with do/don't examples from the framework; the palette with roles; typography; logo and mascot usage. This is the reference for all future UI and copy.

Step 5 (the landing page): Integrate the round-1 Gemini landing cut from gemini-output.md. Create the section components and the page, refactoring as you go. Mandatory fixes — do not ship without them:
  HONESTY FIXES:
  - The hero subhead claims the signoff means you are "guaranteed to pass." FALSE — the signoff is a conservative readiness claim, never a guarantee (the framework is explicit a signed-off student can still fail). Reword to readiness language.
  - The footer says "Registered trademark of Enso Intelligence Inc." — drop the registered-trademark claim; it is not registered.
  - The pricing lists "Official Readiness Signoff & certificate" — drop "& certificate"; Enso issues a signoff, not a certificate (the certificate is the real CAMS/CDCS credential).
  - The hero contains a simulated "AI Lecturer" mockup card (a fake lecturer message, a "Readiness 78%" tag). Keep it ONLY if it reads unmistakably as an illustrative UI mockup, not a real student result. Re-scan ALL landing copy for any other invented proof.
  BUG FIXES:
  - app/(marketing)/page.tsx uses `<Footer />` without importing it.
  - `animate-[float...]` references a `float` keyframe that is never defined — add the keyframe or use a defined animation.
  - `text-2xs` is not a real Tailwind size — define it or use `text-xs`.
  - `animate-in fade-in slide-in-from-top-4` depends on the tw-animate utilities — verify they exist; if not, replace with defined CSS.
  - Resolve the route placement: the landing page is the public `/`. Reconcile the `app/(marketing)/` route group (it has no layout) with whatever currently serves `/`. Make `/` public via proxy.ts; the authenticated app stays behind auth.
  Then: SEO — proper title/description, Open Graph + Twitter tags, an OG image, a real favicon. (For an OG or hero image the Higgsfield MCP is available — restrained, professional, abstract; CONFIRM with me before generating any image.)

Step 6 (the journey re-skin): Apply the design language to the real, wired in-app surfaces — dashboard, /courses, /courses/[slug], the lesson player, the mock taker, the results/signoff page. Use the round-2 Gemini cut (gemini-output-2.md) as the design reference / UI kit; if it is absent, work from docs/BRAND.md. CRITICAL: this is a RE-SKIN — the Gemini round-2 components are presentational references; port their visual treatment onto the live components and KEEP all spine wiring, data, and logic intact. Apply the approved Step-3 journey fixes. Add missing empty/loading/error states. Fix mobile layouts. Respect the DEFERRED list — re-skin the existing "Your knowledge" card (do not build a node graph), no portfolio hub, static mascot only. Mock exam: sterile / "Cold Fidelity", echoing a testing-center feel — do NOT copy any real testing vendor's exact interface or branding.
  ROUND-2 CUT — known issues to handle when porting it:
  - app/in-app/page.tsx in the cut is a SANDBOX preview (a tabbed `/in-app` route with mock data). Do NOT ship it as a real route — it is throwaway. Map the components onto the real routes (the dashboard, /courses/[slug], the lesson player, the mock taker, the results page) and delete the sandbox.
  - The round-2 components use `font-mono` for data/stats, but the round-1 `@theme` does not define `--font-mono`. When merging tokens (Step 4), add `--font-mono` mapped to Geist Mono — otherwise `font-mono` falls back to a generic monospace.
  - `text-2xs` and `h-4.5` / `w-4.5` are not real Tailwind utilities — define the tokens or replace them.
  - The mock-exam surface deliberately uses an OFF-PALETTE cold slate/amber/red theme ("Cold Fidelity"). That is intentional — keep it cold; do not "correct" it to teal/coral.
  - Copy fixes: "Certified Exam Ready" -> readiness language (Enso signs off readiness, it does not certify); keep any pass-probability copy conservative (no "guaranteed" or strong-prediction wording); "Bayesian mastery tracking" -> "adaptive mastery tracking" (the model is Bayesian-flavored, not full BKT — see CLAUDE.md).
  - The round-2 mock DATA quotes UCP 600 article text — illustrative placeholder only. The real re-skinned surfaces render real database content; do not carry placeholder copy into shipped UI.

Step 7 (build + verify): pnpm build (zero errors). pnpm dev. With Playwright, walk the whole journey again — landing -> signup -> course -> lesson (all scene types) -> mock -> results -> dashboard — at desktop AND mobile width. Confirm the design language is consistent on every surface; the landing page is public and renders logged-out; the spine still works (a lesson quiz records knowledge evidence, the classmate still fires, a mock scores and updates readiness); no flow has a dead end. Stop the dev server.

Step 8 (memory): update CLAUDE.md (Last updated; Current state — public landing page live, brand identity v2, journey re-skinned; What's next — Prompt 15 payments; gotchas — the merged tokens, BRAND.md, the mascot, ADR 0007 superseded). Append docs/PROGRESS.md and docs/SESSION-NOTES.md. Update docs/ROADMAP.md — mark Prompt 14 shipped and add the DEFERRED items to the post-launch list. Create docs/decisions/0018-brand-identity-v2.md — the new identity, the design language, the Gemini-assisted workflow, the mascot decision, and how it supersedes/amends 0007. Update docs/FRAMEWORK.md — revise the "no cartoon mascots" line to record the deliberate decision to ship a calm, mature, ensō-derived mascot (distinct from gamification mascots). docs/BRAND.md was created in Step 4.

Step 9 (commit): show me the staged diff and confirm before committing. Confirm before pushing. Do not commit anything from outside the repo.

Step 10 (deploy + verify production): after the Vercel deploy is READY, on https://www.ensoacademy.ai confirm the landing page renders for a logged-out visitor, the new design language is live across the app, and the journey works end to end. Report production-verified.

CONFIRMATIONS YOU MUST ASK ME EXPLICITLY:
- Step 3: the review gate — the journey audit fix-list and the course-availability question; STOP and wait
- Before generating any image with Higgsfield: confirm first
- If anything appears to need a schema change or migration: stop and ask (it should not)
- Before the Step 9 commit: show the staged diff
- Before push: confirm

REPORT BACK:
1. The Step 1 inspection — the route map, the current tokens/fonts, what each Gemini artifact provides, the integration plan
2. The journey audit and the prioritized fix list (part of the Step 3 gate)
3. After execution: the brand foundation (the token merge, fonts, Logo, Mascot, BRAND.md), the landing page (with the honesty fixes and bug fixes applied), and the journey re-skin
4. Confirmation the spine still works and the journey has no dead ends, desktop and mobile
5. The updated CLAUDE.md "Current state"

GO.

---END PROMPT---
```

---

## Notes on this prompt

**The branding-discovery step is gone — on purpose.** The original Prompt 14 had Claude propose 2–3 brand directions. That happened instead in a Gemini pass: Gemini designed from a reference sample, the owner chose to keep teal/coral, and the result is two first-cut implementations on disk. This prompt integrates them. The identity is decided; do not reopen it.

**Step 3 is the one hard gate and a natural session boundary.** This is a large prompt. The journey audit + the course-availability question is where the executing session stops for the owner. It may well end the session there and resume after the answers; that is expected.

**The Gemini cuts are first cuts.** They carry real honesty violations ("guaranteed to pass", a false registered-trademark claim, signoff-as-certificate) and real bugs (a missing import, an undefined keyframe, a non-existent utility class). Steps 5 and 6 enumerate them. Integration means refactoring, never pasting.

**Adopt the design language; defer the new features.** Gemini's design thinking sketched a near-full-product redesign — a concept node-graph, a portfolio hub, a reactive animated mascot. Those are good post-launch ideas and are captured in ROADMAP.md, but building them would turn a design pass into a feature rebuild and slip payments. The line is firm: re-skin what exists, build nothing new.

**The mascot reverses a framework commitment — so the framework is updated.** FRAMEWORK.md says "no cartoon mascots." The owner explicitly decided Enso will have a calm, mature, ensō-derived mascot. Per the framework's own rule (conflicts require explicit resolution), this prompt updates the framework line and records the decision in ADR 0018 — it is not left as a silent contradiction.

**ADR 0007 is superseded properly.** ADR 0018 records the new identity, the design language, and the Gemini-assisted workflow, and supersedes/amends 0007. The design system is documented, not silently overwritten.

**The spine is untouched.** This is presentation only — tokens, copy, new public pages, and re-skins. No spine or schema changes. Step 7 re-confirms the spine still fires.

**After this prompt:** the product has a public face and one coherent look. Prompt 15 — Stripe / payments — gates enrollment and adds the real Terms/Privacy pages. In parallel, the operator-run full CAMS generation + SME review remains the content launch gate.
