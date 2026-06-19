# CAMS Question-Bank Standard — the "best-in-world" bar

**Status:** draft for Ripon's sign-off (2026-06-19). The reproducible quality bar every CAMS question is generated and gated against. Pairs with `docs/CAMS-EXAM-BLUEPRINT.md` (the frame) and the test-integrity standard already in CLAUDE.md (position/length de-biasing). Target: **1,000+ questions**, distributed by the blueprint domain weights, every one meeting this bar.

Honest framing: this is the **craft** bar — it makes our questions better than commercial prep on construction, fidelity, and coverage. *"Best in the world"* as a market claim is earned by the real-candidate pass data (the final pilot step), not asserted here.

## 1. Construction

- **Single-best-answer, 4 options (a–d).** Exactly one defensible-correct answer; no "all/none of the above" (the real exam tests best-answer judgment).
- **Scenario-first, not recall.** The stem puts the candidate in a real practitioner situation and asks them to *apply* judgment — classify the risk, sequence the response, pick the correct obligation, spot the flaw. Pure definition-recall questions are the exception, used only where the exam genuinely tests a definition.
- **One correct answer, defensible to a challenge.** The key is unambiguously best against primary-source standards (FATF Recommendations, statutes, enforcement practice). If two options are arguably right, the question is broken — rewrite or kill it.
- **Plausible, substantive distractors.** Each of the 3 wrong options is a *real* misconception or a sounds-right-but-wrong approach a competent candidate might pick — at full length parity, never one-liner throwaways.
- **A `wrongAnswerRationale` for every distractor** — precisely why it's wrong. This is where the teaching happens; a missed question becomes a lesson.
- **A teaching `explanation`** — why the correct answer is right and the underlying principle.

## 2. Integrity (test-fairness — already built, enforced bank-wide)

- **No position bias.** Correct answer randomized ~25% each a/b/c/d (the shuffle script enforces this bank-wide).
- **No length tell.** Correct answer is not systematically the longest; a distractor is the longest in ~half the questions.
- **No clueing.** Options parallel in grammar, structure, and length; no grammatical agreement or absolute-word ("always/never") tells that leak the answer.

## 3. Factual integrity (same bar as the lessons)

- **Primary-source-grounded.** Every fact traces to FATF Recs/INRs, statutes, or real public enforcement actions — current as of the maintained facts pack.
- **DURABLE.** No current-list-membership facts (never "is country X grey-listed", "is entity Y on the SDN list") and nothing that goes stale on a plenary/list/threshold update. Test the **principle and mechanism**, not the current state. (This is what lets the bank survive without constant maintenance.)
- **Original and clean.** 100% original items. **Never** real, leaked, or paraphrased ACAMS exam questions, and no third-party prep material (methodology bar). The course already carries the ACAMS non-affiliation disclaimer.
- **Answer key + rationales fidelity-cross-checked.** A wrong key or stale fact in a question is worse than in a lesson — it trains the wrong reflex. Every batch goes through the same Codex factual cross-check the lessons did.

## 4. Tagging & coverage

Every question carries:
- `domain` — exactly one of the 4 blueprint domains.
- `conceptTags` — ⊆ the course concept vocabulary (so it feeds the student knowledge model + classmate).
- `difficulty` — `foundational | standard | advanced | expert`.

Coverage is driven by a **coverage matrix** (domain × competency × difficulty), built from the blueprint subdomains, so the 1,000 cover the *whole* exam — not just where questions are easy to write. Difficulty mix skews toward the real exam's application weighting (mostly standard/advanced, a foundational floor, a thin expert tail).

## 5. Verification spine (per generation batch — questions get the lesson treatment)

1. **Structural gate** (deterministic): 4 options, valid `correctOptionId`, a rationale for every distractor, `conceptTags ⊆ vocab`, `domain ∈ {4}`, `difficulty` set.
2. **Integrity gate** (bank-wide): position balance, length-tell ratio, no clueing/banned patterns.
3. **Coverage check**: batch fills the matrix cells it targets; log any cell left thin (no silent gaps).
4. **Codex factual cross-check**: answer key + every fact, on a sampled-per-batch + all-flagged basis (full-bank one-by-one doesn't scale to 1,000 — the machine catches errors, Ripon spot-checks judgment).

A question ships to the bank only when 1–2 pass and the Codex pass raises no factual blocker. Flagged questions go to Ripon's spot review.

## 6. The execution sequence

1. Lock blueprint ✅ (`CAMS-EXAM-BLUEPRINT.md`).
2. Sign off this standard.
3. Extract handbook subdomains → build the coverage matrix.
4. Re-tag the existing 180 questions to the 4 official domains.
5. Generate to the matrix in batches (by domain × competency), inline (subscription, no API cost).
6. Gate + integrity + Codex-fidelity per batch; Ripon spot-checks sample + flagged.
7. Assemble faithful 120-q mocks by domain weight; calibrate readiness thresholds.
8. Real-candidate pilot → calibrate the signoff against actual pass outcomes.
