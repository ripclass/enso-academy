# ADR 0001: Clean-room implementation, no OpenMAIC fork

**Date:** 2026-05-20
**Status:** Accepted
**Decision maker:** Ripon Chowdhury

## Context

Enso Academy's interactive classroom architecture was originally going to be built by forking OpenMAIC (THU-MAIC, Tsinghua University), an open-source AI classroom platform with strong pedagogical primitives (two-stage generation pipeline, multi-agent orchestration, playback engine, action engine, SVG whiteboard, TTS/ASR provider abstraction).

OpenMAIC is licensed under AGPL-3.0.

## Decision

We will NOT fork OpenMAIC. Enso Academy is a clean-room implementation written from scratch.

We have read the OpenMAIC codebase for architectural understanding. We may build systems that are conceptually similar (a two-stage generation pipeline, a playback state machine, a whiteboard renderer). We will not copy any OpenMAIC source code, import any OpenMAIC modules, or vendor any OpenMAIC packages.

## Alternatives considered

1. Fork OpenMAIC and comply with AGPL-3.0. Rejected: requires releasing all Enso Academy source under AGPL-3.0, which is incompatible with our commercial IP strategy. A competitor could clone the repo and run a competing service.

2. Email Tsinghua and purchase a commercial license. Rejected for now: unknown cost, unknown timeline (universities are unpredictable licensors), and would still leave us building on a codebase designed for a different use case (general-topic research learning, not bounded certification prep).

3. Clean-room rebuild informed by OpenMAIC's architecture. Accepted: legally clean, fully owned, and allows us to make architectural choices specific to certification prep rather than retrofitting onto a research codebase.

## Consequences

- +2-4 weeks of additional build time vs. forking
- +full ownership of every line of code, no AGPL contamination, no source-disclosure obligation
- +no dependency on Tsinghua's continued maintenance or licensing posture
- +clean integration with other Enso Intelligence Inc. commercial products (TRDR Hub, Kestrel, ICE LLM) without license friction
- -we cannot benefit from upstream OpenMAIC improvements; we must port concepts manually if we want them

This is the right tradeoff. The build-time cost is bounded; the IP and license benefits are permanent.
