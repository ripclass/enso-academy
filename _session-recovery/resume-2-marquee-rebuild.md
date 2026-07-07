# RESUME PROMPT — Session 2: catalog-wide marquee rebuild
Paste everything below the line into a fresh Claude Code session opened in the enso-academy repo.

---

Resume the **catalog-wide marquee rebuild**. Read `CLAUDE.md`, `docs/HANDOFF.md`, and `_session-recovery/SESSION-STATUS-2026-06-29.md` first. We crashed mid-run; nothing was lost (the crash was at the audit stage, before any rebuild wrote content).

**Goal:** roll the audit-first recipe across the catalog so every lesson reads ~8-9/10, not just the marquee lessons. Recipe per lesson: baseline Codex audit → make the objective/verifiable fixes → re-validate gates → re-audit → **stop at "No remaining publication-blockers"** (the asymptote rule: keep iterating while blockers are objective; stop when they turn subjective). Do NOT promote (gated: "do not promote now").

**Already at world-class this arc (do not redo):** Danske 8, 1MDB 9, Westpac 9, correspondent-banking 9, CCAS on-chain 9, CCAS Travel Rule 8.5, CAMS EDD 8.5. The 2026-06-28 CAMS re-promote is live.

**In flight at the crash — three lessons were freshly baseline-audited this morning. Verdicts saved in `scratchpad/audit-*.out`; audit prompts in `scripts/_audit-*.txt`. Resume by making the fixes:**

1. **`structure-of-the-40-recommendations`** (CAMS) — **6.5/10**.
   - Citations: all 17 label-only; add primary-source URLs; split the Standard Chartered bundle (NYDFS Aug 6 / OFAC Dec 10 / Fed Dec 10 / DOJ-DPA).
   - R.16 currency: VERIFY whether current FATF R.16 is now "Payment transparency" (vs "wire transfers") against the FATF primary source; if so, relabel throughout, keep SCB as a historical wire illustration.
   - Add the two FATF assessment dimensions: technical compliance (40 Recs, C/LC/PC/NC) vs effectiveness (11 Immediate Outcomes, H/S/M/L).
   - EU AMLR timing: Reg (EU) 2024/1624 applies from 10 July 2027 — qualify as incoming.
2. **`mapping-crypto-rules-to-any-jurisdiction`** (CCAS) — **7/10**.
   - Citations: all 8 label-only; add URLs. Singapore worked example: split the bundle; "in force from January 2020" → "commenced 28 January 2020"; keep the full "Corruption, Drug Trafficking and Other Serious Crimes (Confiscation of Benefits) Act" title (confirmed correct). Japan/Coincheck deep case: split the bundled citation (PSA regime / 29 Jan 2018 order / 8 Mar 2018 order / Monex); verify whether "PSA required AML measures" should cite Japan's AML framework not the PSA alone.
3. **`the-crypto-risk-assessment`** (CCAS) — **8/10** (closest to done).
   - Citations only: split + add URLs (FATF R.1 / FATF VA-VASP guidance / Basel; NYDFS consent order + release; FCA Final Notice + release). Pin or drop the FCA "first enforcement action" claim. No factual blocker; the source-discipline guard confirmed alerts are treated as signals (not SARs) and there's no monitor-extension overstatement — don't reintroduce either.

**The recipe mechanics:**
- Validate: `pnpm tsx scripts/validate-lesson.ts <cams|ccas> <slug>` → 7/7 PASS.
- Re-audit: `codex.cmd exec --skip-git-repo-check --model gpt-5.5 --output-last-message <out> < scripts/_audit-<x>.txt`.
- **Verify every audit claim against the primary source via WebSearch before editing — never trust the auditor alone.**
- Lesson artifacts are gitignored (`generated/.../lessons/*.json`); CAMS content is DB-served (DB = source of truth).

**Lane coordination (important):** **`mapping-crypto-rules` and `the-crypto-risk-assessment` are CCAS lessons owned by the CCAS-build session.** Editing them is a cross-lane change — coordinate with that session before rewriting (read-only audits are fine; content edits need a clear hand-off). The safest split: this session owns CAMS rebuilds (s40 + the rest of the CAMS catalog); hand the two CCAS verdicts to the CCAS session, or take explicit ownership of them first.

**Gotchas:** em-dash banned in all user-facing copy (0 em-dashes); reading renderer has no remark-gfm (tables don't render → use a slide); CCAS quizzes need `conceptTags`+`points` per question; promote stays gated.

After the three in-flight lessons, continue the catalog sweep: baseline-audit the next un-rebuilt CAMS lesson and repeat.
