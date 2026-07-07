# RESUME PROMPT — paste into a new session (Opus 4.8) to continue the CAMS merged rebuild

You are continuing the CAMS MERGED REBUILD — SIMULATOR CONVERSION as the lead execution session (Opus 4.8). Fable ran the first 5 lessons and distilled the complete method; your job is to execute it at the same bar, escalating only true judgment calls.

READ FIRST, in order:
1. `_session-recovery/cams-merged-rebuild-playbook.md` — THE METHOD. Follow it exactly: the loop, the blueprint spec, the pre-audit grep list (§5), the fix-vs-hold precedent table (§6), the audit-prompt template (§7), the Fable checkpoints (§8), the URL bank (§9), the gotchas (§10).
2. `_session-recovery/cams-merged-rebuild-progress.md` — state + 5 DONE blocks (your quality exemplars; match their audit trails).
3. `docs/SPEC-simulator-lesson-format.md` §2 (the arc) and skim `scripts/_convert-ssm.js` (the builder pattern you'll have Sonnet agents follow).

LANE (non-negotiable): CAMS only. Never touch generated/ccas/** (a parallel session owns it). Edit lesson JSONs via builder scripts only; no deploys, no app/lib code, no CLAUDE.md/PROGRESS/SESSION-NOTES writes. Log only to the progress file. Never overwrite a .bak. Zero em-dashes. Never re-run _build-pilot-wml.js / _build-pilot-cbr.js (live).

STATE: 7/49 converted. Live: what-money-laundering-actually-is, correspondent-banking-risk (do NOT restructure). Signed off pending deploy+warmup (outside this lane): from-alert-to-investigation, drafting-the-suspicious-transaction-report, the-life-of-a-financial-intelligence-product, the-multi-regime-landscape-of-sanctions, sanctions-screening-mechanics-and-design.

NEXT LESSON: `sanctions-evasion-typologies` (Queue B merged: quality-sweep + convert in one pass; deep case = Binance 2023; repo history documents the module-largest-resolution comparison fix and the 50%-rule aggregate wording — grep for regressions per playbook §5). THEN: `sanctions-program-governance` (SCB 2012-2019 arc; historically 5 fidelity iterations; the Commerzbank transaction-monitoring recast is already in its cleared text). Then Queue B continues per the progress file's NEXT section; Queue A (16 convert-only lessons) last.

OPERATING MODEL (cost discipline — this is why you, not Fable, are running it):
- You author blueprints and triage codex verdicts using the playbook's precedent table. Do not load full artifacts into context more than once; use the extraction habits in the playbook.
- Sonnet subagents do verification and builder drafting (parallel dispatch). Line-review the actual builder file, always.
- codex gpt-5.5 audits every lesson; iterate until a pass surfaces no new objective item. Verify its claims before editing.
- FABLE CHECKPOINTS: after writing each blueprint to `scripts/_blueprint-<abbr>.md`, PAUSE and tell Ripon "blueprint ready for Fable review, or proceed?" Escalate to Fable (via Ripon) any fix-vs-hold call you are not confident about, anything touching mens-rea/scope in retained text, and any auditor claim contradicting playbook §5/§6. Everything else, handle yourself.
- One lesson per turn; stop after each sign-off and wait for "go ahead".

QUALITY BAR: sign off only when a codex round returns no new objective factual/legal/sourcing item (9/10-range with only documented holds). The five DONE blocks show what that trail looks like. Case facts verbatim; retained text verbatim except sanctioned, logged, checked-replace fixes; every distractor a named practitioner misconception; correct options never the clear longest.

Begin: read the three documents, then take `sanctions-evasion-typologies` through the loop.
