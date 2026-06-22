# CCAS course generation — new-session kickoff

Paste the block below into a fresh session to start generating **CCAS** (the 2nd global course). Everything it needs is referenced from the repo. This file is the durable copy; the prompt is self-contained.

---

```
Read docs/HANDOFF.md, then CLAUDE.md (esp. the milestone line + "Generation is INLINE" gotcha),
then docs/COURSE-GENERATION-PROMPT.md (v1.1 — the methodology, this is the contract),
then docs/RUNBOOK-course-generation.md. I'm Ripon — talk to me directly.

GOAL: generate a full **CCAS** course — Certified Cryptoasset Anti-Financial Crime
Specialist (ACAMS) — the 2nd of our 3 global Phase-1 courses (CAMS done, CCAS now, CDCS later).
CAMS is the proven template: 11 modules / 49 lessons / 502 questions, all cross-checked, LIVE.
Build CCAS to the same bar. This is a multi-session marathon — pace it, one lesson per turn.

⛔ DO NOT TOUCH CAMS. Another track owns CAMS finalization. You work only under
generated/ccas/ and the CCAS DB course (which doesn't exist yet — the writer creates it as a draft).

═══ HOW WE GENERATE (read this twice — it's the #1 recurring mistake) ═══
• Generation is INLINE — YOU (this Claude session) write each lesson's scene JSON directly,
  following docs/COURSE-GENERATION-PROMPT.md + the scene contract in lib/lesson/scenes.ts,
  and save it to generated/ccas/lessons/<slug>.json.
  NEVER run `scripts/generate-course.ts lesson|full` — that's the OpenRouter API path (costs
  money, can't be funded from BD, and is the path to AVOID). The script's `outline`/`write`
  modes are fine; `lesson`/`full` are NOT.
• After writing each lesson JSON, run the gates + cross-check:
    pnpm tsx scripts/validate-lesson.ts ccas <lesson-slug>        # 7 deterministic gates
    pnpm tsx scripts/crosscheck-lesson.ts ccas <lesson-slug>      # Codex methodology + fidelity (parallel)
  On DISAGREE/SPLIT, fix the JSON and re-run. On AGREE (or SPLIT with no hard blocker), move on.
  Read the verdict from the cross-check LOG/output, not just the exit code.
• Codex is on the MAX plan right now — cross-check is no longer the bottleneck (it was the wall
  that stalled CAMS for weeks). Use it freely. Generation throughput (inline, one lesson/turn)
  is now the constraint. Run ONE cross-check at a time (parallel Codex from two places contends/hangs).

═══ SEQUENCE ═══
1. CONFIRM THE EXAM SHAPE FIRST. Verify the current ACAMS **CCAS** candidate handbook for:
   domains + their weights, total #questions, time, pass mark, and whether it uses multiple-response.
   Ask me to confirm before you build the outline (we did this for CAMS — domain names/weights
   must match the real handbook, not a guess).
2. WRITE THE OUTLINE: generated/ccas/outline.json — mirror the structure of generated/cams/outline.json
   (modules[{slug, title, domain, sources[], lessons[{slug, title, conceptTags[], teachesConcepts[]}]}]).
   Tag each module with its primary CCAS domain. Keep it global (see framing below). Show me the
   outline for approval before generating lessons.
3. FACTS PACK: add CCAS-relevant verified facts to lib/ai/generator/facts_pack.ts and bump
   FACTS_PACK_AS_OF. Crypto/VASP is fast-moving — every fact must be primary-source-verified.
   Carry over the CAMS TODO: enumerate the **revised INR.16 Virtual-Asset Travel Rule data elements**
   (the June-2025 R.16 revision, reflected in the Oct-2025 FATF Recommendations) — CAMS deferred this.
4. GENERATE LESSONS inline, one per turn → gate → cross-check → fix → AGREE → next.
5. ASSESSMENT per module: generated/ccas/assessment/<module-slug>.json (questions + glossary),
   then `pnpm tsx scripts/crosscheck-assessment.ts ccas <module-slug>`.
6. PROMOTE: `pnpm tsx scripts/generate-course.ts write` (creates the CCAS course as DRAFT). I publish
   after a spot review.
7. FAITHFUL MOCK: create scripts/seed-ccas-mock.ts (model on scripts/seed-cams-mock.ts) with the
   CCAS domain weights + question counts from the handbook. Run after the promote.

═══ CCAS CONTENT GUIDANCE ═══
• GLOBAL-FIRST — no country privileged. (Hard lesson from CAMS: Bangladesh got woven in as the
  default example jurisdiction and we had to sweep it out of ~30 lessons. Don't repeat it.) Frame
  around FATF as the global standard + US / UK / EU as the major regimes + "map it to any
  jurisdiction." Use Bangladesh/other countries only where a point genuinely needs a national
  example, never as the default.
• HUGE OVERLAP WITH CAMS — reuse it. CCAS shares CAMS's VASP / sanctions / typology / Travel-Rule
  spine. Lean on the existing facts pack and the cleared CAMS lessons (virtual-assets-and-vasps,
  sanctions-*, the typology lessons) as reference for accuracy — but write fresh CCAS-depth content.
• SOURCE DISCIPLINE (methodology v1.1 — primary/public only; NO third-party prep material; NO
  copyrighted standards text). Strong CCAS sources:
   - FATF: Recommendation 15 / INR.15 (VASPs), Recommendation 16 / INR.16 (Travel Rule), the FATF
     Virtual Assets / VASP guidance (Oct 2021) + the targeted-update reports, New Technologies guidance.
   - EU: MiCA (Markets in Crypto-Assets Regulation, Reg (EU) 2023/1114) + the crypto Transfer of
     Funds Regulation (Reg (EU) 2023/1113) for the EU travel rule; 6AMLD; the AML package/AMLA.
   - US: FinCEN (MSB/CVC guidance, the 2019 CVC guidance), OFAC (crypto designations), DOJ/CFTC/SEC
     public enforcement; the BSA as applied to CVC.
   - UK: FCA cryptoasset registration regime; the UK travel rule (MLR amendments); POCA.
   - DEEP CASES (real, named, public — one per case-study lesson): e.g. Tornado Cash (OFAC 2022 +
     Van Loon 2024 + 2025 delisting + DOJ founders), Bitfinex/2016 hack + 2022 DOJ seizure, BitMEX
     (CFTC/FinCEN/DOJ), Binance 2023 (~USD 4.3bn DOJ/Treasury), Lazarus/DPRK (incl. the Bangladesh
     Bank heist as ONE example), Welcome to Video, Silk Road, FTX (fraud lens). Verify every
     amount/date/disposition against the primary release before using it.
• Each lesson: a real-public-matter deep-case scene; reading scenes each with a citations[] array;
  slides that NAME instruments in the narration and carry NO numerics in slide bodies (gate rules);
  substantively distinct teachesConcepts per scene; a scenario-based formative quiz; and ONE
  interactive (risk-classify | red-flags) or PBL (project) application scene where the material
  supports it (the generator/validator already handle these types).

═══ QUESTION-BANK TEST-INTEGRITY STANDARD (bake in from the start) ═══
• Randomise the correct-answer position (~25% each a/b/c/d); write substantive parity-length
  distractors; make a DISTRACTOR the longest option in ~half the items (so "pick longest" ≈ chance).
• ~10% multiple-response items (multiple_choice type, correct_answer = array of option ids, selectCount).
• Position is fixed mechanically: scripts/shuffle-assessment-positions.js — BUT never run it on
  multiple_choice / multi-select items (it corrupts correctOptionIds). Run it only on single-answer.
• Never auto-trim correct options to dodge the length tell; write them tight from the start.

═══ ALREADY BUILT — you get it for free ═══
The classroom experience (player, Google Chirp 3 HD voice on-demand, avatars, animated slides,
cast-on-stage, interactive + PBL renderers, faithful-mock engine, student model) is DONE and LIVE.
CCAS content flows into all of it automatically once promoted — no UI work needed.

═══ DEFINITION OF DONE ═══
Outline approved → all lessons gated + cross-checked (AGREE/cleared-with-fix) → assessment per module
cross-checked → promoted as a DRAFT course → seed-ccas-mock.ts run → I spot-review and publish.

Start by confirming the CCAS exam shape with me, then draft the outline. Don't generate lessons
until I approve the outline. Update docs/HANDOFF.md + SESSION-NOTES at the end of each work block.
```
