# ADR 0006: Production Deployment from Day One

**Date:** 2026-05-21
**Status:** Accepted

## Context

Prompts 1-4 verified work on localhost only. As the application gains real features (auth, database, AI plumbing, eventually Stripe webhooks and OAuth flows), localhost-only verification stops being sufficient.

Production reveals environment issues (env var mismatches, CORS, cookie domains, runtime differences) that localhost hides. OAuth redirects and Stripe webhooks require real public URLs to test end-to-end. "Deploy at the end" creates stressful big-bang launches.

## Decision

From Prompt 4.5 forward, every commit to main auto-deploys to https://www.ensoacademy.ai via Vercel. Every prompt's smoke test runs against production, not just localhost.

The canonical production URL is https://www.ensoacademy.ai; the bare apex `ensoacademy.ai` 308-redirects to it.

Localhost remains the iteration environment for debugging and rapid development, but is no longer the verification surface.

CLAUDE.md gains an "Active deployments" section so future sessions know where things live.

## Alternatives considered

- Deploy only at end of v1 build. Rejected: see Context.
- Deploy to a staging environment first, production only at launch. Rejected: adds an environment to manage with no clear benefit; Vercel's free preview deployments cover the "staging" use case for free.
- Continue localhost-only until launch readiness. Rejected: launch readiness IS production. The earlier we deploy, the earlier we surface issues.

## Consequences

- +real environment issues surface early
- +OAuth, webhooks, email links work with real URLs from day one
- +easy to share progress via the production URL
- +Vercel auto-deploy is free and instant
- -production reflects WIP code by default; need discipline to not break main
- -Vercel env vars must stay in sync with .env.local variable names; manage via the Vercel dashboard
- -if main breaks, www.ensoacademy.ai serves a broken page; mitigated by Vercel's instant rollback feature
