# RUNBOOK: Running the Case-Bank Factory Without Fable

**Written 2026-07-06, last Fable session. Read this + `docs/CASE-BANK.md` before running a batch.**

This file exists so an Opus (or Sonnet, or manual) session can run the case-bank factory at the quality that took it from 32 to 66 gated cases, without a premium orchestrator. The quality did NOT come from a smart conductor. It came from a documented loop + two cheap models (Opus soldiers, Codex gate) + a judgment layer that is written down here. Follow it literally and it works.

## The one rule that fixes everything

**You are a CONDUCTOR, not a PLAYER.** You brief, you audit, you triage, you decide, you close. You do NOT read big lesson files. You do NOT author case content. You do NOT do the web research yourself. Every time you feel the urge to "just do this one myself," STOP and dispatch a soldier. Opus fails as an orchestrator when it tries to be the whole factory. It succeeds when it runs the factory.

## Economics (non-negotiable, this is why it stays affordable)

- EVERY subagent call sets `model` EXPLICITLY. Never let a soldier inherit your tier.
- `model: "opus"` ONLY for first-draft authoring and research. `model: "sonnet"` for ALL fixes, sweeps, mechanical work.
- You (the orchestrator) do the cheap work yourself with node/grep/Bash: audit, triage, string-replace fixes, ledger, commit. You never spend a soldier on a one-phrase fix you can do in a `node -e`.
- The Codex gate is FREE to Claude quota (runs on the ChatGPT/Codex plan). One heavy gate batch per session window is the comfortable rhythm; it has not walled at ~6 batches/session but watch for it.

## The batch loop (do this, in order)

1. **SELECT.** Pick 3-6 un-banked matters against coverage needs. Dedup against `generated/case-bank/cases/*.json` by id. Prefer Lane A (conversion) when a cleared lesson has the matter; use Lane B (research) when it does not.
2. **DISPATCH AUTHORS.** Fire Opus soldiers, ~3 cases each, in ONE message so they run in parallel. The brief = the authoring-rules block in `docs/CASE-BANK.md` + the per-case cautions you pull from that matter's history in `CLAUDE.md`. For Lane B, research FIRST (see below), then author.
3. **AUDIT YOURSELF.** On each return, run `node scripts/_case-bank-audit.mjs <files>`. NEVER trust the soldier's self-report. Fix any deterministic failure yourself (em-dashes, length-tell, spread) with a node script.
4. **GATE.** `node scripts/_gate-case.mjs --drafts` (background). It reads each case's `factBasis` source and checks fidelity + decision quality with gpt-5.5. AGREE flips status to `gated`.
5. **TRIAGE VERDICTS YOURSELF.** Read each non-AGREE `generated/case-bank/<id>.gateout.txt`. Distinguish a real defect from gate over-reach (see triage rules below).
6. **FIX + RE-GATE.** One Sonnet fixer with the verbatim issue list, OR fix directly via node if it is mechanical. Re-audit, re-gate the fixed files. Apply the asymptote rule.
7. **CLOSE.** Update the `docs/CASE-BANK.md` ledger row, the `CLAUDE.md` case-bank block, and short `PROGRESS.md`/`SESSION-NOTES.md` entries. `git add` ONLY those named docs (NEVER `-A`; the tree is shared and full of untracked junk). `git pull --rebase --autostash` then push. Case JSONs are gitignored, so they never commit; that is correct.

## Lane A (conversion, cheapest, gates in 0-1 rounds)

Facts come from an already-cleared lesson deep-case scene, so the gate rarely fights you. The author extracts facts VERBATIM from the named lesson and only writes the interactive layer. `factBasis` = `generated/<course>/lessons/<slug>.json :: <scene titles>`.

Finding Lane A matters: grep lesson scenes for "Deep case:" / "Worked example:" / "Worked text:" titles AND scan `case-*.json` lesson files (their scenes are aspect-named, e.g. "The findings: a platform with no program", so the title grep misses them). Dedup against the bank. Lane A is now nearly mined out (BitMEX was the last clean one).

## Lane B (fresh research, gates in 1-4 rounds, needs discipline)

Facts come from a research fact sheet you produce and VERIFY before authoring. The gate only checks case-vs-factsheet, NEVER factsheet-vs-reality, so the fact sheet's accuracy is on YOU. Two mitigations make Lane B gate first-pass-clean (proven in Batch 6, 6/6 clean):

- **(1) Research phase.** Dispatch an Opus research soldier per 2-3 matters. It produces `generated/case-bank/research/<id>.json` shaped as `{id, matter, primarySources:[...], scenes:[{title:"Verified facts", sceneData:{entity, agencies, disposition, amounts, dates, conduct, allegationVsAdmitted, citations:[{title,url}]}}]}`. Discipline: PRIMARY government/court sources only for facts (DOJ, OFAC, FinCEN, SEC, OCC, NYDFS, courts); WebSearch to LOCATE, never to source a fact; exact release titles + real https URLs; no em-dashes in titles; flag anything unverifiable and leave it out.
  - Tooling reality: justice.gov/sec.gov 403 plain WebFetch; Firecrawl credits run out fast. **WebSearch with `allowed_domains` restricted to the .gov domain returns the primary-page title + summary and IS acceptable confirmation.**
- **(2) Orchestrator verify (do NOT skip).** Before authoring, spot-check every headline figure/date/disposition in each fact sheet against its cited primary source via WebSearch on .gov. This has caught a real figure error in three straight Lane B batches (Madoff omission, BAT 415 vs 418, US Bancorp forfeiture-vs-penalty). It also lets you safely ADD a verified fact a conservative soldier omitted (Madoff $170.799b forfeiture) or SUPPLEMENT a thin sheet (WorldCom verdict date). Correct the fact sheet, THEN author.
- **(3) Author brief LEADS with "state ONLY facts, ZERO interpretive characterisation."** Name the failure class explicitly: no "net winner", no "the clearing bank", no "X is what makes it willful", no "never sold", no invented licences, no quantifier inflation. This one sentence is the difference between 6/6-first-pass and 3-5-rounds-each.

## Triaging a gate DISAGREE (the judgment that was "Fable")

Read the exact quoted issue. Ask: does it misstate the RECORD, or is it flagging scenario/distractor framing?

- **Evidence cards ("observed"/"source") and reveals CLAIM THE RECORD.** Hold them to strict source support. If the gate says one asserts a fact the source does not support (a characterisation, a causal claim, an inflated quantifier, a wrong disposition verb), it is a REAL defect. Fix it.
- **Decision prompts may put the student in a CONSTRUCTED seat, and distractors assert wrong ideas BY DESIGN.** The gate is told not to flag these as unsupported facts. If it flags a distractor, check: does the distractor misstate a real amount/date/disposition, or make itself defensibly correct? If yes, fix. If it is just a wrong-by-design competing action, that is the residue the asymptote rule covers.
- **Fix the CLASS, not the phrase.** The gpt-5.5 gate surfaces ONE fidelity layer per round. After the first DISAGREE, grep the whole file for the same failure type (record quantifiers, "conceded in the plea", "everything from the record" scope claims, causal "what makes it willful", role labels) and fix them together. Otherwise it walks you through the class one round at a time (Rimasauskas took 3, Schlumberger 5, mostly for this reason).
- **Asymptote rule / cleared-with-flag.** Iterate while the blockers are OBJECTIVE. When a round surfaces only subjective or finer-layer residue (e.g. a wrong-by-design distractor the gate keeps rejecting after the real issues are fixed), STOP: set `status: "gated"` and record a `gate.resolution` cleared-with-flag note. Only 2 of 66 cases needed this. Do not chase the gate forever.
- **Distractor calibration (a known asymptote for "how do you respond to X" decisions).** The gate rejects both too-defensible wrong answers (narrow lawful compliance) AND too-obvious strawmen (overt wrongdoing). The sweet spot is a plausible MISDIRECTED action a real practitioner might take (Stanford: "argue the product's legitimacy to the regulator instead of producing the records").

## Gotchas that cost real time

- **NEVER chain `audit && gate`.** A failed audit short-circuits the gate, and you read a STALE gate verdict and misdiagnose. Run them as separate steps.
- **Strip em-dashes from citation labels.** The audit checks the WHOLE file including `sources[]`; a descriptive citation label containing an em-dash (e.g. "Deferred Prosecution Agreement, Entity") fails it. Replace the em-dash with a colon or comma.
- **When you SWAP a distractor, update the explanation that rebuts it.** Otherwise the gate flags a rebuttal aimed at an option no longer in the set (a self-inflicted extra round).
- **If a Sonnet fixer dies mid-run (session limit), finish the fixes yourself** with a node string-replace (verify each `split(before).length-1 === 1` before writing). Scratchpad `.mjs` files cannot resolve repo `node_modules`; use inline `node -e` or a `.cjs` in the OS temp dir with only `fs`.
- **Length-tell is measured on OPTION lengths only.** Editing an evidence card or reveal cannot change it. If the audit reports a length-tell failure after a non-option edit, it was latent in the authored file; extend a distractor to fix.

## What you lose without Fable, and how to cover it

You lose calibration on edge cases: knowing a fact sheet is subtly wrong before the gate proves it, sensing when a distractor is defensible, stopping at the right moment. Cover it by being SKEPTICAL by default: verify every Lane B fact sheet against primary sources, read every gate issue literally, and trust the deterministic audit + Codex gate as your floor. They catch most errors mechanically. The orchestrator judgment is a quality multiplier, not the safety net. At 64/66 clean AGREE, the system carries the quality; the human just has to run the loop honestly and not lie to themselves about a self-report.
