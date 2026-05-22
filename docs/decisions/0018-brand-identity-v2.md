# ADR 0018: Brand Identity v2

**Date:** 2026-05-22
**Status:** Accepted — supersedes / amends ADR 0007 (Design System v1)

## Context

ADR 0007 set a provisional v1 design system (Geist, teal/coral, light mode, a
text-only wordmark, "symbol commissioned later"). It was never developed into a
real identity, and there was no public marketing surface — a prospect could not
learn what Enso Academy is without an account. Prompt 14 (the UX/UI + branding
pass) addresses both.

The branding work used a Gemini-assisted workflow: Gemini produced a first-cut
implementation from a reference design and the framework; the Claude Code
session reviewed, refactored, fixed, and integrated it. The owner chose to keep
the teal/coral palette.

## Decision

**Brand identity v2 — the "Auditable Editorial / Cold Fidelity" design language.**

- **Palette retained.** Teal `#0F3D3E` primary, coral `#E07856` accent — used
  functionally (teal = authority/structure, coral = a live signal: an active
  model, a flagged gap, a warning). Added tints (`primary-light`,
  `accent-light`) and hovers; foreground deepened to `#0F1717`.
- **Typography.** `Outfit` becomes the display/UI typeface (`--font-sans`);
  `Geist Mono` is retained for all *data* — statistics, concept names, mastery
  percentages, timers, scores. The monospace is the signal that a value is
  empirical.
- **Brand mark + mascot.** A real `<Logo>` — an open single-stroke ensō ring
  with an accent core — replaces the text-only wordmark. A `<Mascot>` (the
  "Enso Guide" — the ensō ring given a calm meditative gaze) is introduced as a
  brand / lecturer visual anchor. Both are vector SVG, built from separable
  paths so they can be animated later. Components in `components/brand/`.
- **Auditable Editorial** is the default posture — a premium professional feel
  (Financial Times / Bloomberg Law, not consumer edtech). **Cold Fidelity** is
  the deliberate exception: the mock exam uses a sterile slate palette so the
  student rehearses exam-day conditions.
- **Light mode only** — unchanged from ADR 0007, and a FRAMEWORK commitment.
- The design language is documented in `docs/BRAND.md`, the working reference
  for all future UI and copy.

**The mascot reverses a framework commitment.** `docs/FRAMEWORK.md` ("What 6.0
is not") said "no cartoon mascots". The owner decided Enso *will* have a
mascot — but a calm, mature, ensō-derived one, not a gamified or childish
character. FRAMEWORK.md is updated to record this: the rejection stands for
childish/gamified mascots, not a restrained brand character.

## Scope

Prompt 14 also shipped the public landing page (`/`) and re-skinned the in-app
journey (dashboard, courses, course detail, lesson player, mock taker, mock
results) in this design language, via a shared `AppHeader` + UI kit in
`components/in-app/`. It deliberately did **not** build new features — three
ideas surfaced during the design work are deferred to post-launch: an
interactive concept node-graph visualizer, a portfolio / evidence hub, and
reactive/animated mascot states.

## Consequences

- + A real public face and one coherent visual language across the product.
- + The brand is documented (`docs/BRAND.md`) rather than provisional.
- + The mascot is built to animate later with no rework (separable SVG paths).
- − The token change cascades to every component; verified via `pnpm build` and
  visual review.
- − ADR 0007's text-only wordmark and "symbol commissioned later" are now
  obsolete; its light-mode-only and teal/coral decisions carry forward.

## Supersedes

ADR 0007 (Design System v1) — superseded for the wordmark, typography, and the
"v1 provisional" framing. The light-mode-only commitment is retained.
