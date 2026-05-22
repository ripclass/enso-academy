# Enso Academy — Execution Roadmap (toward 6.0)

**Created:** 2026-05-22
**Owner:** Ripon Chowdhury
**Status:** Working plan — supersedes the ad-hoc prompt sequence

**Companion documents:**
- `docs/FRAMEWORK.md` — the *what* and *why* (the 6.0 product vision)
- `docs/ARCHITECTURE.md` — the *how* (canonical technical design)
- `docs/PROGRESS.md` — what has shipped, milestone by milestone
- **This document** — the *what next, and in what order* (the execution sequence)

---

## Why this document exists

Enso Academy has been built so far through a relay of numbered `PROMPT-NN` files. Prompts 1–8 shipped a working, production-deployed platform. But the sequence drifted: it built **visible surfaces** (lesson player, mock engine, audio) and skipped the **spine** (the student model and lecturer memory). Most of the framework's defining 6.0 capabilities exist only as empty schema tables that no runtime code reads or writes.

This document re-derives the prompt sequence from the framework's own dependency graph, so that every remaining build step earns its place. It is the canonical answer to "what do we build next, and why."

---

## Current state — an honest scorecard

Mapped against the framework's five-generation ladder (`docs/FRAMEWORK.md`):

| Layer | Capability | Status |
|---|---|---|
| 2.0 | Curated content library | ✅ Built — `content_library_elements` (CDCS dev seed) |
| 3.0 | Persistent tracking | ✅ Built — `sessions`, `session_events`, enrollment, completion |
| 4.0 | Real student model | ✅ **Built** — Prompt 9 (2026-05-22); `lib/student-model/knowledge.ts`, written by mocks + lesson completion, read by the lecturer as preamble |
| **4.0** | **Lessons as paths through a library** | ❌ **NOT built** — content renders in fixed `metadata.order` (a linear deck) |
| 5.0 | Lecturer memory | ✅ **Built** — Prompt 10 (2026-05-22); `lib/student-model/memory.ts`, Sonnet summary at session end, read as preamble + a continuity greeting |
| 6.0 | Mock fidelity | ✅ Built — Prompt 7, genuinely strong |
| 6.0 | Signoff mechanism | ✅ Built — `student_readiness` + `signoff_events` |
| 6.0 | The classmate | ✅ **Built** — Prompt 11 (2026-05-22); `lib/classmate/actions.ts`, model-grounded gap detection, fires once/session, seeds cached_qa (moat 4) |
| 6.0 | Evidence portfolio | ❌ Not built — `portfolio_artifacts` empty |
| — | Multi-modality | ◑ Partial — standard + audio (Listen mode) done; dialogue + drill not built |
| — | Primary-source content | ◑ Pipeline not built — CDCS course is a hand-seeded placeholder, not Opus-generated |

**Verdict:** what is shipped is a strong **2.5/3.0 product with the 6.0 *assessment* layer added early.** The mock engine + signoff is excellent and genuinely differentiated. But the **4.0/5.0 spine — the student model and the memory — was never built.** The AI lecturer today grounds on a 3-element text window of the lesson, not on what the student knows; it is a context-grounded chatbot. The framework's own final note warns against shipping exactly that. This is the gap this roadmap closes.

**Good news:** nothing built is wasted. The lesson player, the lecturer, and the mock engine all become student-model-aware by *extension*, not rewrite. This is a **reorder, not a redo** — zero sunk cost.

---

## Operating principles

1. **Reorder, don't redo.** The 6.0-ready schema was the correct hard call (it makes the spine an addition, not a refactor — that is the framework's moat 2). Build the runtime that the schema already anticipates.
2. **Spine before surface.** Build the ladder in dependency order: 4.0 (student model) → 5.0 (memory) → 6.0 (classmate). A 6.0 surface on a missing spine is a fake.
3. **The per-prompt test.** Before any future prompt is written, ask: *"Does this build the spine, or a surface on a missing spine?"* If the latter, it waits.
4. **The framework is canonical.** If `ARCHITECTURE.md` or a prompt conflicts with `FRAMEWORK.md`, the framework wins (per the framework's own instruction). This roadmap is subordinate to the framework and revised when the framework is.

---

## The OpenMAIC / Lamppost legal stance

OpenMAIC (the Tsinghua research codebase) and Lamppost (the KhaM Labs K-12 product forked from it) are both **AGPL-3.0**. Two distinct legal matters — do not conflate them:

- **Content IP** — never paraphrase ACAMS / Wiley / Kaplan / ICA study materials. Generate only from primary regulatory sources. (Framework capability 10; already a standing commitment.)
- **Code copyleft** — the operating rule for OpenMAIC/Lamppost:
  - **Permitted:** reading the code; taking *ideas, architecture patterns, behaviors* — these are not copyrightable.
  - **Prohibited:** copying code, porting files, or closely paraphrasing code structure. Any of these makes Enso Academy a derivative work → AGPL copyleft → fatal for a closed commercial product.
  - **Practical rule:** Enso is implemented from `FRAMEWORK.md`, `ARCHITECTURE.md`, and its own schema — never with OpenMAIC/Lamppost source open as something to translate. Everything in Enso today (`lib/ai/`, the schema, the players) is clean-room original; keep that line absolutely clean. Never import a Lamppost migration or `lib/` module.

**Honest conclusion:** OpenMAIC cannot accelerate the hard part. It is genuinely a 1.0 — stateless, with no student model, no memory, no calibrated signoff, no portfolio. **The entire 6.0 spine does not exist in OpenMAIC.** Its one asset — the animated playing classroom — is the piece this roadmap recommends *not* building (see "The lesson-experience question"). Treat OpenMAIC as a 1.0 reference for inspiration, take zero code, and do not plan around it as a shortcut.

---

## The roadmap

Two tracks run in parallel and converge at launch.

### Track A — the engineering critical path (the spine)

#### Prompt 9 — Student Knowledge Model — ✅ shipped 2026-05-22

- **Goal:** make `student_knowledge_state` a live, continuously updated per-concept mastery model. Framework capability 1 — "the foundation."
- **Builds:**
  - A concept inventory derived from existing tags (`content_library_elements.concept_tags` / `teaches_concepts`, `question_bank.concept_tags`).
  - A mastery estimate per `(student, course, concept)` — a value in `[0,1]`. v1 uses a simple decaying weighted update (the framework says "Bayesian"; a simpler rule is honest and sufficient for v1, upgradeable later).
  - **Writers:** mock `submitMockExam` (correct ↑ / incorrect ↓ per the question's concept), `askLecturer` (a re-explain request nudges that concept ↓), `completeLesson` (small ↑ for concepts an element teaches).
  - **Reader:** `askLecturer` fetches mastery for the concepts in the current lesson context and injects it as system-prompt preamble ("the student is weak on X, strong on Y").
- **Depends on:** nothing new — schema and players exist.
- **Done when:** opening a lesson and asking the lecturer produces an answer measurably shaped by the student's mastery state; mock submission visibly moves mastery for the tested concepts.

#### Prompt 10 — Lecturer Memory — ✅ shipped 2026-05-22

- **Goal:** make `student_memory` a live editorial layer so the lecturer remembers the student across sessions. Framework capability 3 — the 5.0 layer.
- **Builds:**
  - A summarization job (Claude Sonnet) that runs at session end, distilling the session into 1–3 relationship-meaningful facts (stated goal, what they struggled with, tone that worked). It is an editorial layer, **not** a chat log.
  - **Reader:** lesson start and `askLecturer` inject the top-N memories as preamble. The dashboard "welcome back" reflects them.
- **Depends on:** Prompt 9 (shares the preamble-injection pattern; cheap once the student model exists).
- **Done when:** a returning student is greeted with a specific reference to a previous session, not a generic welcome.

#### Prompt 11 — The Classmate — ✅ shipped 2026-05-22

- **Goal:** the classmate as the student's externalized blind spot. Framework capability 4 — the headline moat.
- **Builds:**
  - Gap detection: after a lecturer teaching move (or at element transitions), compare the concepts just taught against the student's mastery. If a *critical* concept is low, *unaddressed by the student*, and a cooldown has elapsed → the classmate fires.
  - A generated question (Claude Sonnet, constrained prompt), spoken as a **consistent character** — same name/voice/vibe across the course. It must not repeat what the student already asked.
  - Logged to `classmate_interventions`; seeds `cached_qa` tagged **classmate-origin** (framework moat 4 — the universal-blind-spot dataset).
  - **v1 fires conservatively** — a tunable firing-rate constant, ideally ≤ 1–2 per lesson. The framework flags classmate calibration as an open question; build it tunable and iterate with real students.
- **Depends on:** Prompt 9 (gap detection is a function of the student model — it cannot be built before it).
- **Done when:** in a lesson where the student skips a critical concept, the classmate raises a hand with a question that is specific to that gap and not pre-scripted.

#### Prompt 12 — Scene Model + Lesson Player v2 — ✅ shipped 2026-05-22

- **Inserted after the OpenMAIC review** (a decision made post-roadmap). A lesson became an ordered list of typed **scenes** — `reading` / `slide` / `quiz` rendered richly, `interactive` / `pbl` defined in the contract but placeholdered.
- **Builds:** `content_library_elements.scene_type` + `scene_data`; `lib/lesson/scenes.ts` (the scene-data contract — also the content pipeline's Opus output contract); scene renderers; lesson player v2. Quiz scenes feed the knowledge model.
- **Deliberately cut:** whiteboard, multi-agent playback director, canvas renderer, PPTX export — a later bet (ADR 0016).
- **Why before the content pipeline:** Opus generation is ~$1–3k/course; the contract had to be settled first so the run targets the right shape.

### Track B — the content critical path (the launch gate)

Runs **in parallel with Prompts 9–11.** Independent of the spine — a different bottleneck (Opus cost + SME review time, not engineering).

#### Prompt 13 — Content Pipeline — ✅ shipped 2026-05-22

- **Goal:** build the pipeline that generates a real course from primary sources.
- **Built:** `lib/ai/generator/` — a staged Opus pipeline (outline → per-lesson scenes → per-module assessment) emitting the `lib/lesson/scenes.ts` contract; `scripts/generate-course.ts` (operator CLI); ADR 0017; `docs/RUNBOOK-course-generation.md`.
- **Trial-validated** for $3.52: the CAMS outline (9 modules / 40 lessons) + one lesson; written as a draft course; verified rendering.
- **Still to do (operator/content work, not engineering):** the full CAMS generation (~hours, ~$hundreds) + SME review pass, then publish. CAMS — abundant free primary sources (FATF, Basel, Wolfsberg, OFAC); never competitor study guides.
- **Cost reality:** ~$3,000–6,000 of Opus per course via OpenRouter (no Batch API), plus SME review time. Weeks, not days.
- **Why it is the launch gate:** there is no product to sell without real content. **Start this now** — do not let the engineering track finish with nothing to teach.

### Then — design polish, then monetization

#### Prompt 14 — UX/UI flow + branding pass

- **Goal:** tighten the end-to-end student journey and lock proper branding before commerce. Ripon's direction: design before payments.
- **Likely scope (confirm with Ripon before drafting):** an audit of the whole journey (marketing/landing → signup/login → /courses → /courses/[slug] → lesson player → mock-taker → results/signoff → dashboard); a real landing/marketing surface; wordmark and brand-identity polish; consistent voice and visual rhythm. The design system is locked at v1 (ADR 0007 — Geist, teal #0F3D3E / coral #E07856, light mode); "proper branding" extends it outward to the public surface.
- **Done when:** the journey is coherent and the brand is launch-ready.

#### Prompt 15 — Stripe / Payments

- **Goal:** gate enrollment behind payment. Replace dev auto-enrollment with a paid flow.
- **Builds:** Stripe checkout, `course_purchases` / `subscriptions` wiring, enrollment gated on successful payment.
- **Depends on:** at least one real course existing (Track B).
- **Done when:** a new user must pay to enroll, and payment provisions access.

### → LAUNCH (Enso Academy Global, 1–2 real courses)

---

## The launch cut

The framework's "6.0 from day one" is a *product-identity* statement — not "ship all ten capabilities before charging." The honest minimum that is *truthfully* 6.0-core and payable:

**In v1 launch:**
- Student model + lecturer memory (the spine)
- The classmate
- Mock engine + signoff (already done)
- 1–2 real Opus-generated courses
- Stripe payments

**Deferred to post-launch deepening, in this order:**
- Prompt 13 — Non-linear path generator (linear lessons are acceptable for v1)
- Prompt 14 — Evidence portfolio
- Prompt 15 — Dialogue mode + drill mode (standard + audio cover v1)

**A separate, later effort — Enso Academy Bangladesh:**
- The examiner-trained written-answer grader, BD payment integration (bKash / Nagad / SSL Wireless), the JAIBB/DAIBB courses. This is its own project. **It must not block the Global launch.**

**Cut entirely:**
- The OpenMAIC-style animated whiteboard / playback engine (see below).

**The one allowed slip:** if Track B (content) or payments becomes the bottleneck, the classmate may slip to a fast-follow weeks after launch — student model + memory + real content + mocks already deliver the brand promise ("a tutor that knows you"). But keep the classmate in launch if at all possible; it is the demo magic and the moat.

---

## Technical shape of the spine

Design notes — enough to build from; details finalize inside each prompt.

**Student model (`student_knowledge_state`)**
- One row per `(student_id, course_id, concept)`. Concept identifiers come from existing content/question tags — no new taxonomy needs inventing.
- Mastery `[0,1]`, plus an evidence/observation count and `last_updated`. (Confirm/extend columns when Prompt 9 is written.)
- Update rule (v1): bounded weighted update — recent evidence weighted higher; correct mock answer ↑, incorrect ↓, lecturer re-explain ↓, element completion small ↑. Clamp to `[0,1]`.
- Exposed to the lecturer as preamble: a short natural-language summary of strengths/weaknesses for the concepts in scope. The lecturer never starts from zero.

**Lecturer memory (`student_memory`)**
- Curated facts, not transcripts. A Sonnet job at session end writes 1–3 facts.
- Categories worth capturing: stated goal/motivation, concepts struggled with, tone/pace that worked, life context the student volunteered.
- Read as preamble at lesson start and in `askLecturer`. Periodically re-summarized so it stays small and editorial.

**Classmate (`classmates`, `classmate_interventions`)**
- `classmates`: the persistent character (name, persona) per student per course.
- Gap detection compares concepts-just-taught against mastery; fires on critical + low + unaddressed + cooldown-elapsed.
- The question is generated in the moment (Sonnet, constrained prompt), in character, never repeating the student's own questions.
- Every firing logged; classmate-origin questions tagged distinctly in `cached_qa` (the blind-spot dataset, moat 4).
- Firing rate is a tunable constant; v1 errs toward firing rarely.

---

## The lesson-experience question

The framework lists "slides, whiteboard" in Standard mode. **Recommendation: cut the whiteboard / animated-playback engine.**

- Reimplementing OpenMAIC's playback engine cleanly is a large investment in the most AGPL-entangled area.
- The audience is adults reading regulatory text. An animated whiteboard is K-12 pedagogy, not CAMS prep.
- The "it feels like just text and audio" thinness is **not** missing animation — it is the missing student model. The spine fixes the feel.
- For richer lessons, the cheap win is richer *Opus-generated content elements* (diagrams as images, worked examples, structured callouts) rendered cleanly — not a real-time engine.
- Revisit a "live whiteboard" only if, after the spine + good content, lessons still feel flat.

**Action:** update the Standard-mode description in `docs/FRAMEWORK.md` to drop the whiteboard, or explicitly mark it as a deferred v2 consideration.

---

## Risks and open questions

- **Content is the long pole** — not engineering. The spine is ~3 prompts of focused work; a real course is Opus cost + weeks of generation + SME review. Mitigation: start Track B now, in parallel.
- **Classmate calibration is unknown** — firing rate, tone, question difficulty. Mitigation: build it tunable; launch conservative; iterate with real students.
- **Anthropic Batch API funding gap** — OpenRouter has no Batch API, so course generation costs ~2× the architecture estimate. Carried from ADR 0005; unresolved.
- **Real-exam outcome capture** — signoff calibration depends on students reporting real results. Needs a low-friction nudge; design before it matters.
- **BD tier scope** — the examiner grader and BD payments are a separate project; the risk is letting them creep into the Global launch.

---

## Definition of launch-ready (Enso Academy Global)

- [ ] Student model live — lecturer answers are shaped by per-concept mastery
- [ ] Lecturer memory live — returning students are greeted with specific continuity
- [ ] Classmate live and conservatively tuned (or an explicit, dated fast-follow decision)
- [ ] Mock engine + signoff (done) verified against a real course
- [ ] At least one real Opus-generated course from primary sources, SME-reviewed
- [ ] Stripe payments gating enrollment
- [ ] Production verified end-to-end on `www.ensoacademy.ai`

---

## Maintenance

This roadmap is revised whenever the plan changes. When a prompt completes, `docs/PROGRESS.md` records what shipped and this document's roadmap section is updated to reflect the new current state. If the framework changes, this roadmap is re-derived from it. The framework is the destination; this is the route.
