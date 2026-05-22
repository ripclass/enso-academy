# Enso Academy — Brand Guide

**Version:** 2 (brand identity v2)
**Status:** Active — supersedes the provisional design system in ADR 0007
**Decision record:** `docs/decisions/0018-brand-identity-v2.md`

This is the reference for all UI and copy. When a surface or a sentence is in
doubt, it is measured against this document.

---

## The name

**Enso Academy.** *Ensō* (円相) is the Japanese Zen circle, drawn in a single
brushstroke. It stands for completeness, clarity, and a mind that is prepared.
That is the product's promise — a student who is genuinely ready — so the ensō
drives the brand mark and the mascot.

The brand mark is an open single-stroke ring with an accent core. The mascot —
the **Enso Guide** — is that same ring, given a calm meditative gaze. They are
deliberately the same object.

---

## The design language — "Auditable Editorial / Cold Fidelity"

Two postures, used in different places.

**Auditable Editorial** — the default, for marketing and the learning surfaces.
The audience is compliance and finance professionals preparing for
career-critical exams. The product carries a premium, professional posture
closer to a financial publication (*Financial Times*, *Bloomberg Law*) than a
consumer SaaS app:

- Typography is the interface — large, structured headings; clean body text;
  a monospace for every piece of *data* (statistics, concept names, mastery
  percentages, timers, scores).
- Restraint signals credibility — generous whitespace, clean structure, no
  decorative clutter.
- Colour is functional, not festive — teal carries authority and structure;
  coral is a live signal (an active model, a flagged gap, a weak concept, a
  warning). Never colour for decoration's sake.
- Technical, geometric accents (fine grid lines, clean data borders, structured
  cards) over illustration.

**Cold Fidelity** — one surface deliberately breaks the editorial style: the
**mock exam**. It is sterile, cold (slate / gray-blue), and exam-realistic — it
echoes the feel of a computer-based testing centre so the student rehearses
exam-day conditions. It does not copy any real testing vendor's interface or
branding. This contrast is intentional; do not "correct" the mock exam to the
editorial palette.

---

## Voice and tone

Honest, conservative, professional. The reader is an adult professional, not a
child being entertained.

**Do:**
- State what the product *is* and *does*, plainly. "It sells readiness."
- Be specific and technical. "A live model of what you know, concept by concept."
- Be conservative about claims. The signoff is a *readiness claim*, never a
  guarantee.

**Don't:**
- No hype, no exclamation marks, no emoji, no gamified language.
- No fabricated proof — no testimonials, student counts, pass-rate
  percentages, ratings, or "trusted by" logos until they are real.
- Never imply a guaranteed pass. Never call the signoff a "certificate" — the
  certificate is the real CAMS / CDCS / CCAS credential; Enso signs off
  *readiness* for it.
- Don't paraphrase copyrighted study guides or quote copyrighted rule text in
  marketing copy. Reference standards by name (FATF, Basel, Wolfsberg, UCP 600
  by section) — prefer public-domain examples (FATF) in marketing surfaces.

---

## Palette

Tokens live in `app/globals.css` (`@theme`). Light mode only — no dark mode.

| Role | Token | Hex |
|---|---|---|
| Primary (authority, structure) | `--color-primary` | `#0F3D3E` |
| Primary hover | `--color-primary-hover` | `#155A5C` |
| Primary light (tints, fills) | `--color-primary-light` | `#EBF2F2` |
| Accent (live signal, gap, warning) | `--color-accent` | `#E07856` |
| Accent hover | `--color-accent-hover` | `#E78C6D` |
| Accent light (tints, fills) | `--color-accent-light` | `#FDF1ED` |
| Foreground | `--color-foreground` | `#0F1717` |
| Background | `--color-background` | `#FFFFFF` |
| Muted surface | `--color-muted` | `#FAFAFA` |
| Border | `--color-border` | `#E5E7EB` |

Tailwind's `neutral` scale is the neutral foundation. The mock exam uses an
off-palette cold slate/amber/red set on purpose ("Cold Fidelity").

---

## Typography

- **Display + UI:** `Outfit` (`--font-sans` / `--font-display`) — the editorial
  voice. Geist Sans is the fallback.
- **Data:** `Geist Mono` (`--font-mono`) — every statistic, concept name,
  mastery percentage, timer, and score. The monospace *is* the signal that a
  value is empirical.
- Headings are large and confident; body text is clean and readable.

---

## Logo and mascot usage

- `<Logo>` (`components/brand/logo.tsx`) — the brand mark. `variant="full"`
  (mark + wordmark) or `variant="mark-only"`.
- `<Mascot>` (`components/brand/mascot.tsx`) — the Enso Guide. Calm, mature,
  geometric. Variants: `default`, `thinking`, `welcoming`. Use it sparingly and
  as a calm anchor (e.g. the AI lecturer panel) — never stamped on every block,
  never as a cartoon. It is built from simple SVG paths so it can be animated
  later (breathing, blink, a slow stroke rotation).
- The mascot is a **brand / lecturer** presence. It is **not** the per-course
  classmate character — keep the two distinct.
