// lib/lesson/challenge-config.ts
//
// Pure config + selection logic for the Lesson Challenge ("Apply it"). Kept
// separate from challenge.ts because that file is a 'use server' module (which
// may only export async actions). The page imports the slug gate from here; the
// server action imports the selector.

import { SCENARIO_BANK, scenariosForConcepts, type ChallengeScenario } from '@/lib/cases/scenario-bank'

/**
 * Lessons that carry an end-of-lesson challenge. Expand deliberately as the
 * scenario bank grows; a lesson appears here only once its concepts are covered
 * by SCENARIO_BANK.
 *  - Module 9 ("Learning from Enforcement") was the applied-case-study pilot.
 *  - Modules 1 (Foundations) and 2 (FATF / RBA) are the conceptual rollout,
 *    led by the sequence / match / sort mechanics.
 */
export const CHALLENGE_LESSON_SLUGS = new Set<string>([
  // Module 9 — applied case studies (pilot)
  'how-to-read-an-enforcement-action',
  'case-study-correspondent-banking-failures',
  'case-study-the-danske-bank-estonia-affair',
  'case-study-westpac-and-the-litepay-channel',
  'case-study-1mdb-and-the-private-banking-failure-mode',
  'course-synthesis-and-exam-preparation',
  // Module 1 — Foundations of ML/TF (conceptual)
  'what-money-laundering-actually-is',
  'what-terrorist-financing-actually-is',
  'why-states-regulate-financial-institutions',
  'the-global-architecture-fatf-fius-supervisors',
  // Module 2 — FATF Framework and the Risk-Based Approach (conceptual)
  'structure-of-the-40-recommendations',
  'risk-based-approach-as-operating-principle',
  'enterprise-wide-risk-assessment',
  'customer-risk-rating-models',
  // Module 3: Customer Due Diligence and Beneficial Ownership
  'cdd-fundamentals-identifying-the-customer',
  'enhanced-due-diligence-when-and-how',
  'beneficial-ownership-investigation',
  'ongoing-monitoring-and-cdd-refresh',
  'reliance-on-third-parties-and-introduced-business',
  // Module 4: Suspicious Activity Monitoring and Reporting
  'transaction-monitoring-systems-and-rules',
  'from-alert-to-investigation',
  'drafting-the-suspicious-transaction-report',
  'the-life-of-a-financial-intelligence-product',
  // Module 5: Sanctions Compliance
  'the-multi-regime-landscape-of-sanctions',
  'sanctions-screening-mechanics-and-design',
  'sanctions-evasion-typologies',
  'sanctions-program-governance',
  // Module 6: High-Risk Categories and Typologies
  'politically-exposed-persons',
  'correspondent-banking-risk',
  'trade-based-money-laundering',
  'virtual-assets-and-vasps',
  'real-estate-cash-intensive-businesses-and-luxury-goods',
  // Module 7: National Frameworks in Depth
  'the-us-framework',
  'the-uk-framework',
  'the-eu-framework-and-the-aml-package',
  'the-bangladesh-framework',
  // Module 8: Governance, Audit, and the Compliance Function
  'the-three-lines-of-defence',
  'the-mlro-cco-role-and-the-compliance-function',
  'independent-audit-of-aml-cft',
  'training-and-culture',
  // Module 10: Tools and Technologies to Fight Financial Crime
  'the-afc-technology-landscape-and-the-build-buy-decision',
  'identity-and-onboarding-technology',
  'screening-systems-sanctions-watchlists-and-fuzzy-matching',
  'transaction-monitoring-systems-rules-scenarios-and-model-risk',
  'ai-ml-network-analytics-and-investigation-tooling',
  // Module 11: The Broader Financial-Crime Landscape
  'fraud-and-the-fraud-aml-nexus-framl',
  'bribery-and-corruption-abc',
  'tax-evasion-and-financial-crime',
  'sector-risk-deep-dives',

  // ── CCAS (Cryptoasset AFC) ────────────────────────────────────────────────
  // The two CCAS free-preview lessons (what-cryptoassets-are M1.1 and
  // conducting-an-on-chain-investigation M3) are intentionally excluded.
  // Module 1: Cryptoasset and Blockchain Foundations
  'how-blockchains-work',
  'keys-addresses-and-wallets',
  'how-on-chain-transactions-work',
  // Module 3: Blockchain Analytics and On-Chain Investigation (pilot)
  'transparency-pseudonymity-and-the-tracing-premise',
  'clustering-attribution-and-exposure-analysis',
  // Module 2: The Crypto Ecosystem
  'exchanges-custodians-and-the-vasp-landscape',
  'decentralized-finance-and-smart-contracts',
  'stablecoins-nfts-and-tokenization',
  'privacy-coins-mixers-and-obfuscation',
  // Module 4: Financial Crime in the Cryptoasset Sector
  'the-money-laundering-cycle-in-crypto',
  'terrorist-financing-and-proliferation-financing-in-crypto',
  'crypto-enabled-fraud-and-scams',
  'tax-evasion-and-the-crypto-afc-nexus',
  'ransomware-darknet-and-illicit-marketplaces',
  'crypto-typologies-and-red-flag-indicators',
  // Module 5: FATF, the Travel Rule, and Crypto Sanctions
  'fatf-recommendation-15-and-the-vasp-definition',
  'the-travel-rule-r16-and-inr16',
  'the-sunrise-problem-and-counterparty-vasp-due-diligence',
  'sanctions-and-cryptoassets',
  // Module 6: National and Regional Crypto Frameworks
  'the-us-crypto-framework',
  'the-eu-crypto-framework-mica-and-tfr',
  'the-uk-crypto-framework',
  'mapping-crypto-rules-to-any-jurisdiction',
  // Module 7: Building a Cryptoasset AFC Program
  'the-crypto-risk-assessment',
  'onboarding-and-kyc-for-crypto',
  'customer-risk-rating-in-crypto',
  'the-regulatory-perimeter-and-licensing',
  // Module 8: Monitoring, Screening, and Reporting
  'wallet-and-transaction-monitoring',
  'sanctions-and-watchlist-screening-for-crypto',
  'travel-rule-implementation-operationally',
  'suspicious-activity-investigation-and-reporting-in-crypto',
  // Module 9: Governance, Audit, and Emerging Risk
  'governance-roles-and-the-three-lines-in-crypto',
  'independent-testing-training-and-vendor-risk',
  'emerging-risks-defi-daos-and-the-horizon',
  'incident-response-and-program-resilience',
  // Module 10: Learning from Enforcement and Synthesis
  'how-to-read-a-crypto-enforcement-action',
  'case-tornado-cash',
  'case-binance-2023',
  'case-bitmex',
  'case-lazarus-dprk',
  'course-synthesis-and-exam-preparation',
])

export function lessonHasChallenge(slug: string): boolean {
  return CHALLENGE_LESSON_SLUGS.has(slug)
}

/** Default number of judgments in a round. */
export const CHALLENGE_SIZE = 3

/**
 * The course whose scenarios the in-code SCENARIO_BANK holds (CAMS). Other
 * courses (e.g. CCAS) are served purely from the DB-backed challenge_scenarios
 * table, so the in-code floor must NOT apply to them: poolForLesson broadens to
 * the whole (CAMS) bank when too few match, which would leak CAMS scenarios into
 * another course's lesson. getLessonChallenge gates the floor on this slug.
 */
export const IN_CODE_BANK_COURSE = 'cams'

export type ChallengeRound = {
  scenarios: ChallengeScenario[]
  /** True when the selection was weighted by a real (observed) student model. */
  adaptive: boolean
  /** The weak concepts the round leaned into — for a subtle "we focused on X" note. */
  focus: string[]
}

/**
 * Pick `n` scenarios from a pool, weighted by `weightOf(conceptTag)` (higher =
 * target it more), with a first pass for mechanic variety so a round never
 * repeats the same interaction. Deterministic given its inputs.
 */
export function selectScenarios(
  pool: ChallengeScenario[],
  weightOf: (conceptTag: string) => number,
  n: number,
): ChallengeScenario[] {
  const scored = pool
    .map((s) => ({
      s,
      score: s.conceptTags.reduce((a, t) => a + weightOf(t), 0) / Math.max(1, s.conceptTags.length),
    }))
    .sort((a, b) => b.score - a.score)

  const picked: ChallengeScenario[] = []
  const usedMechanics = new Set<string>()
  // Pass 1: the highest-scoring scenario of each distinct mechanic (variety).
  for (const { s } of scored) {
    if (picked.length >= n) break
    if (!usedMechanics.has(s.mechanic)) {
      picked.push(s)
      usedMechanics.add(s.mechanic)
    }
  }
  // Pass 2: fill any remaining slots by score.
  for (const { s } of scored) {
    if (picked.length >= n) break
    if (!picked.includes(s)) picked.push(s)
  }
  return picked.slice(0, n)
}

/**
 * Build the candidate pool for a lesson: scenarios whose concepts intersect the
 * lesson's, broadened to the rest of the bank only if there are too few (e.g.
 * the synthesis lesson, which legitimately draws across concepts).
 */
export function poolForLesson(conceptTags: string[], n: number): ChallengeScenario[] {
  let pool = scenariosForConcepts(conceptTags)
  if (pool.length < n) {
    const have = new Set(pool.map((s) => s.id))
    pool = [...pool, ...SCENARIO_BANK.filter((s) => !have.has(s.id))]
  }
  return pool
}
