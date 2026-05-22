# Enso Academy 6.0 — The Framework

**A product framework, not an architecture document.**
*Where we're going, what we're building, why it matters, and how 6.0 differs from everything that came before.*

---

**Owner:** Ripon Chowdhury
**Company:** Enso Intelligence Inc.
**Status:** Working framework — evolves with the product
**Companion document:** `docs/ARCHITECTURE.md` (the how)
**This document:** the what and the why

---

## What this document is

OpenMAIC, the Tsinghua research codebase, is what an AI classroom looks like at version 1.0. A clever proof-of-concept that validated multi-agent LLM orchestration for learning. Strong engineering, real research contribution, recognizable as the first generation of a new product category.

Enso Academy is what an AI classroom looks like at version 6.0 — five generations ahead. Not five times more features. Not the same product with TTS bolted on. A fundamentally different conception of what a learning product is, what it accountable to, what it produces, what it remembers, and what it never asks the student to tolerate.

This document is the consolidated framework for that 6.0 product. It captures the design philosophy, the architectural commitments, the user experience principles, the commercial positioning, and the strategic moats — across both the global and Bangladesh tiers — in a single readable narrative.

Read this before reading the architecture document. The architecture is the implementation; this is the intent. If something in the architecture conflicts with this framework, the architecture is wrong and needs updating, not the other way around.

---

## The five generations between OpenMAIC and Enso Academy

The version-number metaphor is approximate, but it helps locate what's different. Here's how the generations map.

**1.0 — OpenMAIC and its peers.** Multi-agent LLM orchestration. Students type a topic, the system generates a lesson on the fly. Multiple AI characters interact — teacher, TA, classmate — to simulate a classroom. Voice optional. Whiteboard rendered. Sessions are stateless. Content is novel every time. The classmate is scripted, the teacher reads from a generated lesson plan, the student watches.

This is impressive demo material. It's also unproductive for serious learning. Students don't need a fresh-generated lesson on a topic they're cramming for a real exam. They need calibrated, repeatable, deep engagement with material they're being tested on.

**2.0 — Curated content libraries.** The leap is realizing that lesson content for a bounded curriculum (a certification exam) should be generated once and reused, not generated on every session. Content becomes inventory. The platform's job shifts from "generate new lessons" to "serve curated content well." Most commercial AI tutors live here.

**3.0 — Persistent student tracking.** The platform tracks what the student has done — completed lessons, quiz scores, time spent. The dashboard reflects progress. This is what most edtech products call "personalization." It's actually just analytics with a friendly face. The AI doesn't change behavior based on it.

**4.0 — Real student model.** The platform maintains a continuously updated per-concept mastery estimate for each student. Every quiz answer updates a Bayesian estimate. The AI lecturer sees this state and adapts. Lessons are no longer linear; they're paths through the content library that branch based on mastery. This is where the lesson stops being a recording and becomes a tutor.

**5.0 — Continuity of relationship.** The lecturer remembers. Across sessions, the AI knows what the student said, what they struggled with, what they wanted to achieve. It greets them by what they said last time, not by their email address. It asks how their bank meeting went. It tracks their stamina patterns and suggests morning study when they're burning out at night.

**6.0 — Accountability and evidence.** The platform makes claims it stands behind. It tells the student when they're ready for the real exam, based on calibrated mock performance with a deliberate conservative bias. It accumulates a portfolio of analytical work — the student's actual writing, their reasoning, their case analyses — as evidence of learning beyond the certificate. Over time, the platform's signoff becomes a credential of its own, validated by statistical track record. The classmate is no longer a script; it's the externalized voice of the student's own blind spot, asking the questions the student should be asking but isn't.

Enso Academy is being built as 6.0 from day one. Not 1.0 with future plans. Not 3.0 with aspiration. The schema, the architecture, the data model, and the user surfaces are all designed to support 6.0 capabilities from the foundation.

---

## What 6.0 means in concrete capabilities

This section translates the philosophy into shippable product features. Each capability is grounded in the architecture commitments documented in `docs/ARCHITECTURE.md`.

### Capability one: the student model is real and continuously updated

Every interaction the student has with Enso Academy updates a per-concept mastery vector. Quiz answer correct? The mastery probability for that concept ticks up. Asked the lecturer to re-explain something three times? Confidence in that concept ticks down. Scored low on a mock exam in the sanctions domain? Mastery for every sanctions sub-concept gets adjusted.

The student model is not a CRM record. It's a Bayesian estimate of what the student actually knows. It lives in `student_knowledge_state` with a row per concept per student per course. It's exposed to the AI lecturer in every conversation as preamble context. The lecturer never starts from zero.

When a student opens lesson 47, the lecturer doesn't say "today we'll learn about correspondent banking." It says, with the warmth of someone who actually knows the student, "Last week you nailed the Wolfsberg principles for private banking but you were uncertain on the difference between nested and downstream correspondent relationships. Let me start there before we go further."

This is not a feature. This is the foundation. Features that bypass the student model are not built.

### Capability two: lessons are paths through a library, not fixed sequences

A lesson is not a slide deck rendered in order. It is a sequence selected from a library of pre-generated content elements — explanations, case studies, analogies, reflection prompts, knowledge checks, glossary entries — that the platform sequences in real time based on the student's state.

Two students with the same enrollment in the same course do not see the same lesson, even when they're studying the same module. One student might need three case studies before the concept clicks. Another might need only one, then a deeper analytical example. The path generator selects from the library to match.

The library is generated once per course by Claude Opus during content build (a one-time offline cost of $1,500-3,000 per course at scale). The runtime intelligence selects from it at low cost. This is the architectural shape that makes per-student personalization commercially viable.

### Capability three: the lecturer remembers, the student feels seen

The AI lecturer maintains long-term memory per student. Not "knows the student's name." Knows what they said in earlier sessions. Knows their goals. Knows what tone works for them. Knows when they're tired.

This memory is curated, summarized periodically by Claude Sonnet, stored in `student_memory`, exposed to the lecturer as preamble context. It is not a chat log; it's an editorial layer that captures relationship-meaningful facts.

"Last time we spoke you mentioned you're studying for CAMS because your bank is pushing you toward the trade finance head role. We finished by talking about FATF Recommendation 16. Want to pick up from there, or would you rather review what we covered before moving on?"

That paragraph is the difference between an AI tool and an AI relationship. Relationships create retention that tools cannot. The student doesn't churn at month three because they don't want to abandon someone who knows them.

This is technically trivial — a vector store, a summarization job, a preamble in the system prompt — and culturally untouched by any competitor. Every other AI tutor is a stranger every time.

### Capability four: the classmate is the student's externalized blind spot

There is a real classmate in every Enso Academy lesson. A consistent character — same name, same voice, same vibe across the course. Their function is to ask the question the student should be asking but isn't.

When the lecturer makes a teaching move, the gap-detection layer compares what was just taught against what the student model says the student knows. If a critical gap exists, and the student doesn't address it themselves within a window, the classmate raises their hand and asks the question that would surface the gap.

The classmate's question is not pre-written. It is generated in the moment, from the student's specific blind spot, by Claude Sonnet with a constrained prompt. It sounds like something a slightly confused real student would say. It doesn't repeat what the student already asked.

This is the pedagogical innovation that no competitor has built. Linear, CAMSprep, the paperback prep books — none of them can do this. They can copy our chat interface, our mock exam interface, even our content. They cannot copy a model-grounded classmate without rebuilding their whole stack.

Over time, the classmate's questions and their lecturer-given answers seed the content library. After six months of real students, our library contains exactly the questions students needed asked, in the actual order they tend to come up. The classmate-only questions — the ones students never asked themselves — are the most valuable data we accumulate. They are universal blind spots discovered by gap detection.

### Capability five: mock exams that mimic the real exam, calibrated to make the student fail before they fail

Every certification we support has a corresponding mock exam mode that faithfully reproduces the real exam environment: question count, time limit, question types, interface patterns, navigation behavior, flagging system, the inability to backtrack after submission where applicable.

For computer-based real exams (CAMS, CDCS, CCAS, FRM, ICA), the mock is fully online and visually echoes Pearson VUE / Prometric without trademark infringement. For paper-based exams (JAIBB, DAIBB, IBB Diplomas), the mock runs online under honor-system instructions with post-exam paper-upload capture.

The timer does not pause. Tabbing away is tracked. The exam doesn't pity the student. Most students fail the real exam not because they didn't know the content but because they couldn't manage the clock. Our mock teaches them the clock.

Mock attempts are stored with full snapshots: every question, every answer, every flag, every navigation event, every focus/blur event. This is the dataset that calibrates the signoff threshold over time.

### Capability six: the signoff makes a claim

Enso Academy doesn't sell content. It sells readiness. When a student crosses a calibrated threshold across multiple full-length mocks, the system declares them exam-ready. Not as a celebratory badge. As a claim Enso Academy stands behind.

The signoff criteria are stricter than the real exam. If CAMS's pass mark is 75%, our signoff requires an 80% average across five mocks with no individual below 70% and no domain consistently below 65%. The conservative bias is deliberate. A student who Enso Academy says is ready and fails the real exam is a brand-damaging outcome. A student who Enso Academy says isn't ready, studies more, and then passes is a brand-building outcome.

Over twelve to eighteen months, as we accumulate real-exam outcome reports from students, the signoff transitions from internal feature ("Enso Academy says you're ready") to external credential ("Enso Academy CAMS-Ready" on LinkedIn). The product capability is identical; only the marketing claim evolves with the data backing it.

This is the move that turns Enso Academy from a study tool into a credential alternative. Eventually, an Enso Academy signoff carries weight in the market because it's based on statistical performance, not just enrollment.

### Capability seven: conservative grading for written-answer questions

For Bangladesh banking exams (JAIBB, DAIBB, IBB Diplomas) that include written-answer sections, Enso Academy renders an AI grader trained on real examiner data. The grader is calibrated to score slightly harsher than a real BIBM/BAB examiner — if our grader gives 65, the real exam will likely give 68-70.

The training data comes from approximately 100 real graded papers acquired through legal disposal channels at BIBM/BAB (institutions sell graded papers by weight to disposal vendors), plus structured interviews with 2-3 experienced examiners who codify their implicit rubric.

The grader uses Sonnet with the rubric prompt and few-shot calibration examples. Quarterly review by named examiner consultants spot-checks AI grader outputs and refines the rubric. The named examiners become part of the brand: "Enso Academy's JAIBB course is reviewed by examiners from the Institute of Bankers Bangladesh."

This capability is impossible for competitors outside Bangladesh to replicate. The examiner network, the disposal-stream calibration data, and the relationships with BIBM/BAB are not things a Singapore-based competitor can build without years of investment in that specific market.

### Capability eight: multi-modality — the same content, the way the student needs it

Same lesson content, multiple presentation modes:
- **Standard mode** — visual lesson with slides, whiteboard, voice narration. The desktop experience.
- **Audio mode** — podcast-style narration. The commute experience.
- **Dialogue mode** — Socratic conversation, lecturer asks short questions, student types answers. The phone-in-bed experience.
- **Drill mode** — rapid-fire flashcards, audio-only or visual. The walking-exercise experience.

The student switches modes based on context. The system remembers preferences per context — audio mode after 9 PM, drill mode on weekends.

Content is not re-generated per modality. The same content_library_elements are re-rendered through different presentation engines. The teaching is the same; the packaging adapts.

This unlocks contexts where competitors cannot follow. Bangladeshi compliance officers studying for CDCS on the Dhaka metro at 7 AM. Singapore bankers reviewing AML concepts during morning runs. American auditors filling drive-time with sanctions case studies. The product follows the student into their life.

### Capability nine: evidence of learning beyond the credential

Every existing certification prep platform ends with a certificate and a LinkedIn post. Enso Academy continuously produces artifacts of learning throughout the student's study.

The lecturer prompts the student to write — to walk through how they'd structure an AML risk assessment, to analyze a real enforcement action, to explain a concept to a hypothetical colleague. The student writes; the lecturer probes; the conversation becomes a piece of analytical work captured in the portfolio.

By the time the student passes CAMS, they have not just a credential. They have 20+ pieces of analytical work demonstrating how they think. They show this to employers. They show it to themselves. Over time, this portfolio becomes more revealing to sophisticated employers than the certificate alone.

This is the move that gives Enso Academy an exit ramp from the certification-prep business into the credential business. The portfolio is the proof of what the student actually knows. The certificate is just a multiple-choice exam someone passed. At some point, sophisticated employers prefer the portfolio.

### Capability ten: the content is generated from primary sources, never from competitor study guides

Every lesson, every quiz, every case study is generated by Claude Opus from primary regulatory and institutional sources: FATF Recommendations, Basel Committee papers, Wolfsberg principles, UN Conventions, OFAC guidance, national regulators, public enforcement actions, BFIU circulars, RulHub.

Never from ACAMS study guides. Never from Wiley books. Never from Kaplan or ICA published study materials. The course generation prompt explicitly prohibits this.

This is the IP-defensibility commitment. Any competitor who builds an exam prep platform by paraphrasing ACAMS's published content is one cease-and-desist away from a legal problem. Enso Academy's content is paraphrased from publicly available primary sources, which is legally clean by design.

The byproduct is that our content is also better. Students don't get ACAMS's paraphrase of FATF; they get the underlying FATF reasoning. When a student asks "but why does Recommendation 10 require ongoing monitoring," our lecturer can quote the actual supervisory expectation from FATF's Methodology document. Competitors paraphrase ACAMS, who paraphrase FATF. We go to the source.

---

## What 6.0 is not

Worth being explicit about what we are deliberately not building, because the absence is part of the brand.

**Not video lectures.** No pre-recorded talking heads, no studio-produced video courses. The AI lecturer renders in real time with voice and whiteboard. Video lectures are 2010s edtech; we're not making more of them.

**Not gamification.** No streaks, no badges of accomplishment for showing up, no leaderboards, no cartoon mascots, no Duolingo-style anxiety mechanics. Compliance professionals are not children and the product respects that. The signoff is the reward; the certification is the goal.

**Not a discussion forum.** No community features in v1, probably not in v2 either. Discussion forums consume engineering attention forever and rarely produce learning outcomes. If students want a community, they can join the existing ACAMS or LIBF member networks.

**Not a general-topic learning platform.** Enso Academy teaches certifications. Bounded curricula. Not "explain anything to me" mode. Not Khan Academy. The library is curated, deep, and finite, which is what makes the personalization architecturally tractable.

**Not multi-tenant white-label.** No "deploy Enso Academy under your bank's brand" feature. Bank deals at Enso Intelligence Inc. bundle Enso Academy as a benefit, but the brand stays Enso Academy. White-label gets considered in year two if customer demand justifies the engineering tax.

**Not dark mode in v1.** Long-form regulatory text reads better in light mode. Dark mode is engineering surface area for marginal benefit. Revisit in v2.

**Not a tutor marketplace.** No marketplace for human tutors. The product is AI-first. Human SMEs review the content offline; human examiners review the AI grader outputs offline. They are never the live-session experience. The product is the AI tutor, not a chat layer over a human one.

---

## The two-product framing: Global and Bangladesh

Enso Academy is structurally two adjacent products sharing the same platform:

### Enso Academy Global

Audience: international compliance and finance professionals studying for high-stakes certifications.

Phase 1 launch certifications:
- **CAMS** — Certified Anti-Money Laundering Specialist (ACAMS)
- **CDCS** — Certified Documentary Credit Specialist (LIBF)
- **CCAS** — Certified Cryptoasset Anti-Financial Crime Specialist (ACAMS)

Phase 2 expansion targets:
- **CGSS** — Certified Global Sanctions Specialist (ACAMS)
- **FRM** — Financial Risk Manager (GARP)
- **SCR** — Sustainability and Climate Risk (GARP)
- **ICA Diplomas** — International Compliance Association certifications
- **CITF** — Certificate in International Trade and Finance (LIBF)
- **CTFP** — Certified Trade Finance Professional (ICC Academy)
- **CFE** — Certified Fraud Examiner (ACFE)
- **CTP** — Certified Treasury Professional (AFP)
- **CIFE / IFQ** — Islamic Finance Qualifications

Pricing: $199 per course (one-time, 6 months access) or $39/month all-access subscription. Premium tier ~$299 per course with priority SME review and extended access.

Distribution: organic search, RulGPT integration (1,200 existing users surface Enso Academy via in-app banner for exam-prep queries), LinkedIn content marketing, conference presence at ACAMS/IIBF/IIB events.

Moat: AI-native pedagogy with the six core capabilities (student model, classmate, mock fidelity, signoff, multi-modality, portfolio), plus the IP-defensible primary-source content discipline.

### Enso Academy Bangladesh

Audience: Bangladesh bank employees pursuing IBB certifications, primarily mid-tier private banks and select PCB/state-owned bank staff.

Phase 1 launch certifications:
- **JAIBB** — Junior Associate of the Institute of Bankers Bangladesh
- **DAIBB** — Diplomaed Associate of the Institute of Bankers Bangladesh
- **3 × IBB Specialist Diplomas** — selected based on market demand (likely Treasury Management, Risk Management, Islamic Banking)

Phase 2 expansion:
- Additional IBB Specialist Diplomas
- BIBM courses for bank staff development
- BAB compliance training

Pricing: BDT-denominated, ~50% discount vs Global tier on direct sales. Substantially discounted or bundled into Enso Intelligence Inc. bank deals (TRDR Hub, Kestrel, ICE LLM contracts include Enso Academy seats as deal-sweetener).

Distribution: existing Enso Intelligence Inc. bank relationships, Ripon's personal network at BIBM/BAB, word-of-mouth in the Dhaka banking community.

Moat: AI grader trained on real graded papers acquired through legal disposal channels at BIBM/BAB. Named examiner consultants from the Bangladesh banking institutions. Past-paper archive accumulating from student post-exam uploads, eventually surpassing what Motijheel coaching centres possess in their photocopied closets.

This is a moat foreign competitors cannot cross. The examiner relationships, the disposal-stream calibration data, the bank deal distribution channel — none of these are replicable from Singapore or Mumbai.

### Shared infrastructure

Both products run on the same platform:
- Same Next.js + Supabase + OpenRouter (Claude) + Google Cloud TTS stack
- Same lesson player, AI lecturer, content library, student model, classmate primitive
- Same mock exam engine (Global mocks mimic computer-based; Bangladesh mocks add honor-system + post-exam paper upload)
- Same dashboards, same payment infrastructure (Stripe USD for Global; bKash/Nagad/SSL Wireless for Bangladesh once BD payments are wired)

The platform engineering effort is paid once. Content effort is paid per certification. Each new certification we add is mostly a content investment, not an engineering investment, after the initial platform is built.

---

## The commercial architecture

### Unit economics

At $199 per Global course:
- LLM API cost via OpenRouter (real-time student interaction): $2-5 per student per course at scale
- TTS cost (Google Cloud Wavenet): negligible, $0.40 pre-generation per course + ~$10/month real-time across the platform
- Storage and bandwidth: negligible, well within Supabase Storage + Vercel free tiers
- Stripe processing: ~3% per transaction
- Gross margin per student: 95%+ ($188-192 retained per $199 sold)

At $39/month subscription:
- Same variable cost structure
- Customer pays $468/year if they stay full year
- Break-even on a subscription customer happens within month one given low variable cost

### One-time costs that scale with the catalog

Per-course content generation: $1,500-3,000 via Anthropic Batch API at scale, but currently $3,000-6,000 via OpenRouter (no Batch API). 8 launch courses = $24,000-48,000 one-time. SME review on top: $2,000-6,000 per course. Total per-course launch cost: $5,000-10,000 all-in.

Across the 8 launch courses, total content build cost: $40,000-80,000 one-time, against revenue potential of $200,000-800,000 in year one alone. The economics are very forgiving.

### Revenue projections (anchored to market analysis)

**Conservative year-one** (RulGPT-funnel traffic only, no marketing spend): 250 paying students × $199 average = $51,000.

**Moderate year-one** (RulGPT + LinkedIn + organic search): 1,500 students × $199 = $300,000.

**Optimistic year-one** (above plus BD bank deal bundles + early word-of-mouth from passed students): 4,000 students × $199 = $800,000.

Year-two: 3-4× year-one based on cohort retention and word-of-mouth in compliance professional networks.

Year-three: $4-8M annual revenue at the optimistic trajectory, possibly supported by an enterprise tier sold to banks for employee certification programs.

### Distribution channels in priority order

**Phase 1 (months 0-3):**
1. RulGPT in-app banner to existing 1,200 users (free first lesson, then paid)
2. Ripon's LinkedIn presence in compliance circles
3. Enso Intelligence Inc. bank meetings include Enso Academy bundle
4. ACAMS member network adjacent (no spam, just being present)

**Phase 2 (months 3-12):**
1. Content marketing — Enso Academy blog publishing real analysis of recent enforcement actions, FATF updates, sanctions developments. The blog ranks for "CAMS prep," "CDCS exam," "AML certification" searches. SEO compounds.
2. Paid acquisition — LinkedIn ads targeting compliance officers at banks. CPA target: $30-50 per signup, $80-120 per paid conversion.
3. Partner channels — affiliate program for compliance bloggers and YouTubers who already serve the audience.
4. Bank enterprise sales — direct sales to bank compliance heads who want to certify their teams. Bulk pricing.

**Phase 3 (months 12-24):**
1. International expansion — same playbook adapted for adjacent markets (UAE, Singapore, Saudi Arabia, India, Pakistan).
2. Adjacent certifications — beyond AML and trade finance into risk management (FRM/SCR) and treasury (CTP).
3. Credential equivalence campaign — once enough real-exam outcome data accumulates, market the Enso Academy signoff as a credential of its own.

---

## The strategic moats

Six moats compound over time. None are individually unbeatable. Together, they are.

### Moat one: IP-defensible content

Every course generated from primary sources. Legally clean by design. A competitor who builds a CAMS prep platform by paraphrasing ACAMS's study guide has a copyright exposure we don't have. This becomes more valuable as the catalog grows and more competitors cut corners.

### Moat two: the pedagogical architecture

The student model, the classmate gap-detection, the lecturer memory, the path generator selecting from the library — these are not features that bolt onto an existing AI tutor. They are architectural commitments that require a specific data model and a specific runtime architecture. Building them retroactively is a refactoring project larger than building them from scratch. A v1.0 competitor cannot become a v6.0 competitor without rebuilding their foundation.

### Moat three: the Q&A cache

Every student question that hits the cache without a match becomes a new cached row. The cache fills with the actual questions students ask, in the actual order they ask them, paired with vetted answers grounded in primary sources. After six months of real students, the cache is a dataset no competitor can replicate by writing better prompts. It is the accumulated curiosity of real learners, indexed and answer-paired.

### Moat four: the classmate-discovered blind spots

Within the cache, classmate-asked questions are tagged separately from student-asked questions. The classmate asks what the student should be asking but isn't. After enough students cycle through, the classmate-only-asked questions become the universal blind spots — the gaps that students reliably don't notice. This dataset, of questions students never know to ask, is uniquely valuable. It teaches us what the curriculum is missing.

### Moat five: the signoff calibration data

Every mock exam attempt is recorded with full snapshots. Every real-exam outcome reported by students is recorded. Over time, we calibrate the relationship between our mock scores and real-exam pass rates. A statement like "94% of students Enso Academy signs off pass CAMS on first attempt" is worth more than any marketing copy. That number cannot be claimed by a new entrant without years of student outcomes behind them.

### Moat six (Bangladesh-specific): the examiner network and disposal-stream data

Real graded papers from BIBM/BAB, real examiner interviews codifying their implicit rubrics, named examiners on the marketing page as paid consultants — this is a Bangladesh-specific moat impossible to build from outside the country. A foreign competitor cannot replicate it. A domestic competitor cannot replicate it without Ripon's network. As more examiners join the program, the moat deepens.

---

## The Lamppost relationship

Worth being explicit because this comes up. Lamppost is a separate product in the KhaM Labs portfolio, not part of Enso Academy. Lamppost serves Bangladeshi K-12 students learning in Bangla; Enso Academy serves adult professionals studying certifications in English.

They share intellectual lineage — both were forked conceptually from OpenMAIC's research insights — but they are separate codebases, separate brands, separate audiences, separate businesses. Lamppost is mission-driven (KhaM Labs is the non-commercial mission arm of the portfolio). Enso Academy is revenue-driven (Enso Intelligence Inc. is the commercial arm).

The architectural learnings transfer in one direction. Lessons we learn building Enso Academy's 6.0 capabilities can inform Lamppost's eventual evolution. But the two products are not feature-coupled and never should be. They are two takes on the AI classroom idea, addressing different markets with different commercial constraints.

---

## What "shipping 6.0" actually means

Six generations ahead of OpenMAIC, but practically, what does "ready to launch" look like?

A student arrives at https://ensoacademy.ai. They sign up. They land in a dashboard that recognizes them. They enter a course they've enrolled in (initially auto-enrolled, eventually paid). They open a lesson and the AI lecturer greets them by name, references what they studied last time, and proceeds based on what they know.

As they study, the system tracks every concept they engage with. Their knowledge state updates continuously. When they read a section, the lecturer is ready to answer their questions, grounded in the lesson content, with answers cached for future students. When a critical concept goes unaddressed, the classmate raises their hand and asks the question they should have asked. The lecturer answers; the gap closes.

They can listen instead of read. They can shift to dialogue mode and let the lecturer quiz them. They can practice with flashcards on their walk home.

When they want to test themselves, they take a mock. The timer doesn't pause. The interface mirrors the real exam. The submission produces a real score, a per-domain breakdown, and a per-question review with explanations. Their readiness state updates. After five mocks meeting the calibrated criteria, the system signs them off.

They sit the real exam. They report the result back to Enso Academy. Their outcome becomes part of the calibration dataset. The platform's signoff threshold gets a tiny adjustment based on their result.

A few weeks later they update their LinkedIn: "CAMS certified." Their portfolio of Enso Academy analytical work is shareable from their dashboard. They tell a colleague how they prepared. That colleague signs up. The cache fills further. The classmate's questions get sharper. The signoff calibration gets tighter.

That's 6.0.

It's not what OpenMAIC does. It's not what any AI tutor on the market today does. And once it's built, it's not what any competitor can build in less than two years of focused investment.

---

## Open questions and known risks

Worth being honest about what isn't settled.

**The Anthropic Batch API funding gap.** OpenRouter doesn't proxy Batch API, so course generation costs ~2× the architectural estimate. Resolved either by Anthropic eventually accepting BD-card billing, or by routing course generation through a US-based entity that funds Anthropic directly.

**Real-exam outcome capture.** The signoff calibration loop depends on students reporting their real-exam results. Need to design a polite, low-friction nudge for this. Maybe a small incentive ($10 credit toward another course, a portfolio polish session).

**BD payment integration.** Stripe handles Global tier. Bangladesh tier needs bKash, Nagad, possibly SSL Wireless integration. Adds complexity but is necessary for BD distribution to work.

**Voice quality for Bangla courses.** When we wire JAIBB/DAIBB, English-only TTS won't cut it. Google Cloud has bn-BD Wavenet voices but quality is uneven. May need to evaluate alternatives or commission custom voice work eventually.

**Classmate calibration.** The classmate is conceptually right but operationally unknown — we don't yet know what the right firing rate is, what tone makes the classmate feel real instead of scripted, when a classmate question is too obvious or too obscure. This will require iteration with real students.

**Mock format expansion.** v1 mocks are standalone MCQ. CDCS's real exam uses case-study format. Need to add this once Opus-generated content can support it.

**Lockdown features for mocks.** v1 mocks track focus/blur but don't prevent copy-paste, screenshot, or right-click. If signoff calibration shows widespread cheating, we add these. Otherwise, the existing tracking is sufficient.

**Enterprise tier shape.** Bank enterprise sales is a real opportunity but the product shape isn't clear. SSO? Cohort dashboards for compliance heads? Bulk pricing tiers? Custom branding? Worth exploring once Phase 1 launch validates the consumer model.

---

## Where this framework lives

This document is the canonical product vision for Enso Academy. It is committed to the repo at `docs/FRAMEWORK.md` alongside `docs/ARCHITECTURE.md`. When in doubt about a product decision, this document is the reference. When a decision conflicts with this document, the conflict requires explicit resolution — either the decision changes, or this document gets updated through deliberate revision.

This framework is itself versioned. The current state is 6.0 — the product we are building today. As capabilities ship and we learn what works, the framework will update. But the version-number metaphor stays: we are not iterating toward 6.0 from a lower number. We are shipping 6.0 from day one and refining within it.

---

## Final note

Building 6.0 is harder than building 1.0. The honest path of least resistance for an AI startup in this space is to ship a lightly-personalized AI chat over study materials and call it innovation. Many will do exactly that. They will get to market faster.

Enso Academy is built differently because the target audience is different. Compliance professionals studying for high-stakes certifications are not entertained by another chatbot. They want to pass. They want a tutor that knows them. They want a system that tells them when they're ready and is right when it does. They want evidence of what they learned that outlasts the certificate.

That's what 6.0 is for. That's the framework. The architecture document tells you how we build it; this document tells you why.

---

**End of framework.**
