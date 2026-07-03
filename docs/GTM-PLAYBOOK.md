# Enso Academy Go-To-Market Playbook

**Written:** 3 July 2026. Grounded in: (a) a funnel/trust audit of the codebase, (b) a content-state audit (CAMS live, CCAS complete-on-disk), (c) fresh market research on the CAMS/CCAS prep landscape (sources inline). Owner: Ripon. This document is the durable version of the strategy; execute top to bottom.

---

## 1. The verdict: yes, there is a definitive market

**CAMS is a real, paying, underserved market.**

- ACAMS claims 115,000+ members and **65,000+ CAMS-certified professionals to date** (acams.org, July 2026). Growth from ~50k certified in Jan 2022 to 65k+ in 2026 implies roughly **4,000 to 5,000 net new CAMS holders per year**; gross exam attempts are higher (community consensus is ~60% first-attempt pass, so retakes add volume).
- The official package costs **US$2,095 to $2,495** (private sector, 2026) plus $295/yr membership. Candidates frequently pay out of pocket to get past resume screens.
- The market is **barbell-shaped**: $13 to $99 Udemy courses and question dumps that candidates openly distrust ("I memorized 479 questions for nothing," r/moneylaundering, 61 upvotes) versus the $2,095+ official package. **Nobody credible sells a premium independent course between $199 and $2,000. The $299 slot is empty.**
- Buyer pain, verified in their own words: the real exam is *reasoning-based* and harder than every practice source; official practice scores don't predict real scores ("100% on practice, 82 on the real thing"; "nailed the practice exam, got a 58"); pass anxiety is the dominant emotion; candidates are already self-hacking with ChatGPT to summarize the study guide.
- **Enso's product is aimed at exactly that pain**: scenario-based original questions, a faithful 120q/3.5h simulation, a conservative readiness signoff, an adaptive AI classroom. The product-market thesis is sound. What is missing is not product; it is **trust and distribution**.

**CCAS is a positioning weapon, not a revenue engine.** Launched Oct 2022, official package $1,995/$1,495, community still small (Reddit threads get 2 to 11 comments). But prep competition is literally **zero quality options** (only $59 dumps and Quizlet decks). Being "the only real CCAS course on the internet" is a cheap, true, defensible claim, and the course is already built.

**Honest ceiling:** this is a niche. A realistic solo trajectory is first revenue in weeks, $3k to $8k/month within 2 quarters if the content engine runs, $10k to $30k/month at maturity as the catalog grows (CDCS, FCCS, more). It is not a rocket; it is a durable cash business that compounds with each course and each video.

---

## 2. Where the product actually stands (ground truth, 2 July 2026)

- **CAMS: LIVE and sellable.** 11 modules / 49 lessons / 502 questions / 311 glossary, faithful 120q mock + free 25q practice mock, $299 (Stripe live). Quality: catalog-wide quiz-integrity and em-dash fixes are live; 7 marquee lessons rebuilt to 8 to 9/10 are live; 4 more rebuilt lessons await re-promote; ~39 lessons not yet deep-swept (they are accurate, just not at the marquee bar).
- **CCAS: DONE on disk, not published.** 43/43 lessons cleared, ~505-question validated bank, blueprint-faithful mock templates (100q/175min/75%/30·35·35). Needs: `generate-course.ts write` → `seed-ccas-mock.ts` → publish.
- **Commerce plumbing: solid.** Server-side prices, clean checkout, consistent refund terms, real Terms/Privacy pages, correct ACAMS non-affiliation language on sales page/guide/terms.
- **Go-to-market plumbing: absent.** Zero analytics, zero email capture, zero social proof, no sitemap/robots, no OG image, no demo video, no founder identity, free-taste paths gated behind signup, and the homepage has shipped-vs-copy contradictions.

---

## 3. The gap list, ranked by revenue impact

### Blockers (fix before spending any effort on traffic)

1. **Homepage contradiction.** The live homepage course lineup shows CAMS as "coming soon" while the FAQ and /courses/cams sell it. Instant credibility kill for every visitor. Fix the lineup card, make CAMS the hero product.
2. **No analytics.** No way to see funnel drop-off, which CTA converts, or whether a video drove a sale. Install Vercel Analytics + PostHog (or Plausible) with events: `landing_view`, `sales_page_view`, `signup`, `free_mock_start`, `checkout_start`, `purchase`.
3. **No email capture or nurture.** Signups who don't buy are unreachable. Wire Resend, add marketing consent at signup, build one 7-day "CAMS crash course" sequence (outline in appendix). For a $299 considered purchase, email is where most conversions will actually happen.
4. **Stripe operator items.** Rotate the transcript-exposed `sk_live_` key; run one real-card purchase + refund. (Already on HANDOFF; do it before driving traffic.)
5. **The fake $399 anchor + "limited" badge.** $399 was never a real price and "limited" has no expiry. This is the classic fictitious-former-price pattern (FTC/EU deceptive-pricing risk) and sophisticated compliance buyers will smell it. Either make $399 the real list price with a dated, genuine launch discount, or drop the anchor entirely. Recommendation: replace with "Founding cohort price $299 (first 100 students), then $399" and make that TRUE by enforcing it.

### High (the trust layer)

6. **No social proof.** No testimonials, no student counts, no reviews. Plan: founding cohort (Section 5) generates the first 10 to 20 testimonials within 30 to 45 days; add Trustpilot/Senja capture from day one; show "X candidates enrolled" once the number isn't embarrassing.
7. **No human face.** Compliance buyers trust people, not brands. Founder identity block on landing + sales page ("Built by Enso Intelligence; here's why and how it's verified") and the founder on camera in every video.
8. **No demo footage.** The product's wow (a classroom that plays like a video, with voice and classmates) is invisible as text. A 90-second product film is the single highest-leverage marketing asset you can produce, and it's squarely your skill.
9. **Free taste is gated.** The only zero-signup taste (Case Mode) isn't linked from the landing page. Surface it on the homepage ("Work a real laundering case, no signup"). Keep mock/lessons behind signup (that's the email capture), but the first taste should be frictionless.
10. **Landing page lacks the ACAMS disclaimer.** The marks appear on the most-trafficked page with no non-affiliation footer. Add the one-line disclaimer to the global footer.

### Medium

11. No sitemap.ts / robots.ts; no OG/Twitter image; no JSON-LD (Course/FAQPage/Organization). Cheap fixes, compounding SEO/share value.
12. No blog/content surface. The per-course study guide is a genuinely good SEO asset; nothing links to it. Add a /resources index and link guides from the homepage; publish video transcripts as articles later.
13. CCAS not published (it's finished; publishing it doubles the catalog and unlocks the "only real CCAS course" story).
14. CAMS A/B domain-weight confirmation vs the official handbook (open item in HANDOFF); the 4 rebuilt lessons need re-promote.
15. No error tracking (Sentry env var exists, SDK not installed).

---

## 4. Positioning and messaging

**Do NOT sell "more practice questions."** ACAMS's July 2025 "Enhanced CAMS" revamp bundled a 1,000+ question official simulator into the package; question volume is now a dead wedge. Sell what they can't copy and what buyer voice validates:

> **"Know you're ready before exam day."**
> The exam is reasoning-based and harder than the practice materials. Enso trains judgment on original scenarios, simulates the real exam under real conditions, and tells you (conservatively) when you'd pass, before you pay ACAMS $2,000+ to find out.

Message pillars, each mapped to a verified buyer pain:

| Buyer pain (their words) | Enso answer |
|---|---|
| "Practice was easy, the real exam wasn't" | Original reasoning-based scenarios; a readiness bar stricter than the real exam |
| "I memorized 479 dump questions for nothing" | Zero dumps. Original questions from primary sources, with a published verification methodology |
| "Trying not to freak out" (pass anxiety) | The signoff: 5 simulations + a conservative readiness verdict with domain breakdown |
| "AI helped me study" (already using ChatGPT) | A purpose-built AI lecturer that knows the blueprint, remembers you, and adapts |
| $2,395 all-in official cost | $299, 14-day refund, first simulation free |

**Compliance-grade honesty is the brand.** This audience audits claims for a living. Publish the methodology page (primary sources, verification passes, non-affiliation), never claim a pass rate you can't prove, keep the "Auditable" design language. Honesty here is not just ethics; it is the differentiator dumps sites cannot copy.

---

## 5. The trust plan (zero to credible in 60 days)

1. **Founding cohort (start immediately).** Recruit 25 to 50 candidates sitting CAMS in the next 1 to 3 months. Offer: $149 to $199 founding price (or free for the first 10 in exchange for a recorded interview), direct WhatsApp/Discord access to you, in exchange for honest feedback + a testimonial + permission to share their result. Recruit via r/moneylaundering (23k members) and r/AMLCompliance (13.7k), LinkedIn AML groups, and your BD banking network (CAMS is prestigious in BD banks; your network is an unfair advantage). One genuine "I passed, here's my readiness graph vs my real score" story is worth more than any ad.
2. **Guarantee (category standard, cheap to offer).** Every serious player has one (Kaplan money-back, camsexam "free until you pass," Firebrand free retrain). Recommendation: **"Pass or we keep working with you free"**: fail after Enso said you were ready → free access extension + 5 more simulations + $0 until you pass. Access-extension guarantees cost almost nothing and convert like refunds. Keep the existing 14-day refund as-is.
3. **Face + product film.** 90-second cinematic product demo (the classroom playing, a simulation, the readiness verdict). Founder intro video ("why I built an AI that teaches CAMS"). Both on the landing page.
4. **Review capture loop.** Trustpilot (or Senja for lightweight capture) from day one; ask at the moment of a pass report; display on sales page once ≥5 reviews.
5. **Radical transparency page.** /methodology: how content is generated, verified against primary sources, audited, and what Enso is not (not dumps, not affiliated with ACAMS). Nobody else in this market can publish their QA trail; you literally have one.
6. **Proof-of-work in public.** Your marquee-rebuild logs, blueprint verification, primary-source citations: turn these into content ("We found 3 errors in our own course and here's how"). Compliance people love this.

---

## 6. The content engine (your filmmaking edge)

**The single biggest finding of the market research:** YouTube CAMS content is a wasteland. The biggest CAMS video ever is 38K views; no CAMS-focused channel exceeds ~3.4K subscribers; production is uniformly slideware. **CCAS video content is near zero.** A filmmaker can own this category's search intent in months. And your raw material is already written: every rebuilt lesson contains a verified, primary-sourced enforcement case study. Those are scripts.

### Three content tiers

**Tier 1: Documentary case breakdowns (the moat).** 10 to 18 minutes, cinematic, true-crime pacing, primary documents on screen. These pull a broad fincrime-curious audience (Coffeezilla proved the appetite) AND rank for cert-relevant searches. Your verified deep cases are the backlog:
- How Danske Bank moved €200B through one Estonian branch (and the 4 controls that failed)
- 1MDB: the same money walked into six banks; only some said no
- Westpac: 19.5 million transactions, one missing scenario
- BitMEX: the exchange that chose not to know its customers
- Tornado Cash: can you sanction a smart contract? (designation → Van Loon → delisting)
- Lazarus and the Ronin bridge: theft as statecraft
- The Bitfinex billions: how 119,754 BTC got traced for six years
- Colonial Pipeline: how the FBI clawed back a ransom
- QuadrigaCX: the exchange keys that "died" with the founder
- HSBC 2012, Standard Chartered, Binance 2023, FTX, Silk Road/James Zhong, Helix, SUEX/Chatex... (20+ episodes already verified in your lessons)

End-card CTA every time: "This case is a full lesson in our CAMS/CCAS course. First exam simulation free."

**Tier 2: Exam-utility videos (the converters).** Lower production, higher intent, rank for search:
- "CAMS exam 2026: exactly what's changed (Enhanced CAMS, V7)"
- "Why you scored 100% on practice and failed the real CAMS"
- "The 4 CAMS domains, weighted: where your 120 questions come from"
- "5 hardest CAMS question types, solved live"
- "CAMS in 60 days: the study plan I'd follow"
- "CCAS: is the crypto AML cert worth it in 2026?"
- "Dumps almost cost me my CAMS: what the exam actually tests"

**Tier 3: Shorts/Reels/LinkedIn clips.** 45 to 60 second hooks cut from Tier 1 ("This bank moved $200B through a branch with 0.5% of its assets..."). 3 per pillar video.

### Channel strategy

- **YouTube = the engine** (search + suggested). Optimize titles for search intent, not cleverness.
- **LinkedIn = the buyers.** AML professionals live there. 2 to 3 native posts/week: case micro-lessons (text + clip), founder build-in-public, exam tips. Comment genuinely on AML posts.
- **Reddit = credibility, not ads.** Be a genuinely helpful named presence in r/moneylaundering and r/AMLCompliance. Answer prep questions. Mention the free simulation only where rules allow and it's genuinely relevant. One good "I'm building this, founding cohort open, tear it apart" post can seed the entire cohort.
- **SEO = the compounder.** Publish each video's researched transcript as an article; the free study guides already exist; add sitemap + JSON-LD. Target: "CAMS exam questions", "CAMS pass rate", "CAMS study plan", "is CAMS worth it", "CCAS exam", "CAMS vs CCAS".

### Cadence (sustainable solo, with your production speed)

- 1 Tier-1 documentary OR 2 Tier-2 utility videos per week (alternate)
- 3 Shorts per week (cut from the pillar)
- 2 to 3 LinkedIn posts per week
- 1 transcript-article per week
- Reddit: 15 min/day of genuine answers

Ruthless rule: every asset points at ONE call to action: the **free full exam simulation** (that's the lead magnet; it captures the email; the readiness result creates the "I'm not ready" moment that sells the course).

---

## 7. Offer architecture

- **CAMS course $299** (includes 5 simulations, unlimited practice mock, AI classroom). Founding cohort $149 to $199 with a hard cap and real expiry; after that, list honestly at $299 (or raise to $399 later and make the anchor real).
- **Free tier:** Case Mode (no signup) → free full simulation (signup = email captured) → 2 free preview lessons.
- **$14.99 per extra simulation** stays (tripwire + revenue from non-course buyers).
- **CCAS course $299**, positioned as "the only real CCAS course on the internet." Bundle: CAMS + CCAS $449 (crypto is the growth wing of AML careers; the cross-sell is natural).
- **Guarantee:** 14-day refund (existing) + "ready means ready" access-extension guarantee (Section 5).
- **Later, don't build now:** team/B2B seats for banks (your BD network makes this real: BD banks pay for CAMS training cohorts); accept manual invoicing when it shows up.

---

## 8. 30 / 60 / 90 day plan

### Days 0 to 4 (while Fable access lasts, through 7 July)
Engineering (half a day each, most are small):
1. Fix homepage CAMS "coming soon" contradiction; surface Case Mode on landing; footer ACAMS disclaimer.
2. Install analytics (Vercel Analytics + PostHog) with the 6 funnel events.
3. Wire Resend + marketing consent + a basic welcome email; store leads.
4. Fix the price anchor (founding-cohort framing, real cap/expiry).
5. sitemap.ts, robots.ts, OG image, JSON-LD (Course + FAQPage + Organization).
6. Promote CCAS (write → seed mocks → publish) and re-promote the 4 rebuilt CAMS lessons.
7. Operator: rotate `sk_live_`, real-card test + refund.
Content prep with AI help: pull the 10 best deep-case lesson scripts into video treatment docs; write the 7-day email sequence; draft the founding-cohort Reddit/LinkedIn posts; write the /methodology page copy.

### Days 5 to 30 (solo)
- Produce and publish: product film (90s), founder intro, first 2 documentary episodes, first 2 utility videos, 6 shorts.
- Launch founding cohort (Reddit + LinkedIn + BD network). Target: 25 members, 10 testimonials in pipeline.
- Ship the email sequence; start weekly cadence.
- CCAS launch post: "The only real CCAS course on the internet" (Reddit/LinkedIn/YouTube utility video).

### Days 31 to 60
- Cadence holds (4+ pillar videos, 12 shorts, 10 LinkedIn posts, 4 articles).
- First testimonials go on the sales page; Trustpilot live; "X enrolled" counter when honest.
- First pass stories → dedicated video ("She passed CAMS using an AI classroom: here's her readiness graph").
- Evaluate funnel data; fix the worst drop-off; consider $50 to $100/week retargeting-style spend only if organic shows conversion.

### Days 61 to 90
- Double down on what the data says (probably: utility videos convert, documentaries grow reach).
- Raise price to real list ($399) if cohort sold out; keep the guarantee.
- Begin CDCS or FCCS generation (the pipeline is proven; each new cert is a new SEO/YouTube lane at near-zero marginal content cost).
- First B2B conversation with a BD bank training department.

**Success metrics:** Week 4: 500 email leads, 25 founding members ($3.7k to $5k). Week 8: first organic sales attributable to video, ≥5 public testimonials. Week 12: $5k+/month run rate, 1,000+ YouTube subs, ranking top-3 for at least two "CAMS prep" queries.

---

## 9. Risks and guardrails

1. **Trademark.** Keep nominative use only: "CAMS® exam prep (unofficial)". Non-affiliation disclaimer on EVERY surface including video descriptions and thumbnails ("Independent. Not affiliated with or endorsed by ACAMS."). Never use ACAMS logos. Current in-product language is already best-practice; extend it to marketing.
2. **Claims discipline.** No pass-rate claims until you have real data (then publish methodology with it). "Stricter than the real exam" must stay a design claim, not an outcome claim. The Terms already disclaim outcomes; marketing must not contradict them.
3. **Quality debt.** ~39 CAMS lessons un-swept at the marquee bar. Don't block launch on it; sweep 2 to 3 lessons/week in the background, prioritizing the free-preview lessons and whatever videos point at. Refund rate is the metric that tells you if quality is actually hurting revenue (watch it weekly).
4. **Exam currency.** "Updated for Enhanced CAMS 2026" is a selling point competitors use; it is also a liability if stale. The facts-pack discipline already exists; schedule a quarterly currency pass and confirm the A/B domain weights against the official handbook (open item).
5. **Solo bandwidth.** The cadence above is deliberately below your production capacity. Consistency beats volume; a missed week is fine, a dead channel is not.
6. **Payouts paused** until the US bank opens; funds accrue in Stripe. Fine, but track it.

---

## Appendix A: 7-day email sequence (post free-simulation signup)

1. **Day 0, instant:** Your simulation result + what it means (readiness band explained). CTA: course.
2. **Day 1:** "Why practice scores lie" (the 100%-practice/58-real story). CTA: how Enso trains reasoning.
3. **Day 2:** One deep case in 5 minutes (Danske). Show a real lesson excerpt. CTA: 2 free lessons.
4. **Day 3:** The 4 domains, weighted; where candidates actually lose points. CTA: course.
5. **Day 4:** "Dumps are a trap" (the 479-questions story + ethics/currency). CTA: methodology page.
6. **Day 5:** The signoff explained: what "ready" means, the guarantee. CTA: course.
7. **Day 6:** Founding cohort case study / testimonial + price honesty (cohort cap). CTA: course.

## Appendix B: founding-cohort recruit post (skeleton)

"I spent 6 months building an AI classroom for the CAMS exam because the gap between practice materials and the real exam is brutal [1-2 lines of the reasoning-based pain]. It's live, it's $299, and I need 25 people sitting CAMS in the next 90 days to break it: founding price $149, direct access to me, and I'll publish your feedback verbatim, good or bad. First full exam simulation is free either way. Not affiliated with ACAMS. [link]"

## Appendix C: video backlog (first 12)

1. Product film (90s) 2. Founder: why I built this (3m) 3. Danske documentary 4. "Why you failed CAMS after acing practice" 5. 1MDB documentary 6. "CAMS 2026: what Enhanced CAMS changed" 7. Tornado Cash documentary 8. "The 4 domains, weighted" 9. Lazarus/Ronin documentary 10. "CCAS: worth it in 2026?" 11. Westpac documentary 12. "CAMS in 60 days study plan"
