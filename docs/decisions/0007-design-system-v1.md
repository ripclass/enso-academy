# ADR 0007: Design System v1

**Date:** 2026-05-21
**Status:** Accepted

## Context

Enso Academy needs a deliberate visual identity that signals "serious educational product for compliance professionals" rather than "generic SaaS dashboard." The auth pages were the first place this gets decided; the choices propagate to every subsequent UI surface.

## Decision

v1 design system:

- **Typography**: Geist Sans for UI and body, Geist Mono for code. Loaded via next/font (no FOIT/FOUT). Slight letter-spacing tightening on the wordmark.
- **Palette**: deep teal primary (#0F3D3E), warm coral accent (#E07856), near-black foreground (#0A0A0A), pure white background, soft off-white muted background (#FAFAFA). No gradients.
- **Spacing**: generous. Card padding 32px, form field spacing 16px. Air is a feature.
- **Border radius**: 6px on cards/inputs, 4px on buttons.
- **Shadows**: single soft shadow on cards. No layered effects.
- **Light mode only for v1.** Dark mode deferred.
- **Logo**: text-only wordmark for v1. Symbol/icon commissioned later (~week 4).
- **shadcn/ui**: New York style with custom theme tokens overriding defaults to match this system.
- **Animation**: state-change microinteractions only. No decorative animation.

## Alternatives considered

- Standard shadcn defaults (slate base, etc.). Rejected: indistinguishable from every other Tailwind+shadcn SaaS.
- Bright colorful palette à la Duolingo. Rejected: wrong audience signal.
- Build dark mode in v1. Rejected: doubles UI surface area for marginal benefit; long-form lesson content reads better in light mode anyway.

## Consequences

- +distinctive visual identity from day one
- +typography and content carry the experience; UI fades into background
- +simpler maintenance (light mode only)
- +design tokens centralized in app/globals.css
- -if we change brand colors later, every component needs a refresh (but tokens are centralized, so it's a single-file change)
- -no dark mode v1 may disappoint some users; revisit in v2 based on actual demand
