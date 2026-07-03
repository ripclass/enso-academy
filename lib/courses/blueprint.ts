// The CAMS exam blueprint, mapped to Enso Academy's lessons.
//
// This is the "we cover the whole exam" trust map: every knowledge domain the
// CAMS exam tests, shown against the modules (built from primary sources) that
// teach it. It answers the candidate's first, anxious question, "does this
// cover everything I'm tested on?", by mapping to the exam authority's own
// blueprint rather than to a third-party study guide.
//
// VERIFY before relying on weights: confirm the domain names and the percentage
// weighting against the CURRENT ACAMS CAMS candidate handbook, then set `weight`
// on each domain. It is left undefined until confirmed, so no unverified number
// ships; the map still reads as full coverage without weights.

export type BlueprintModule = { name: string; lessons: number }

export type BlueprintDomain = {
  /** 'A' | 'B' | 'C' | 'D' — the exam's knowledge-domain letter. */
  id: string
  name: string
  /** Exam weight, e.g. "25%". Leave undefined until confirmed vs the handbook. */
  weight?: string
  summary: string
  modules: BlueprintModule[]
}

export const CAMS_BLUEPRINT: BlueprintDomain[] = [
  {
    id: 'A',
    name: 'Risks and Methods of Money Laundering and Terrorist Financing',
    summary:
      'What money laundering and terrorist financing are, the methods and typologies criminals use, the customers, products, and sectors most exposed, and the wider financial-crime landscape of fraud, bribery, and tax evasion.',
    modules: [
      { name: 'Foundations of Money Laundering and Terrorist Financing', lessons: 4 },
      { name: 'High-Risk Categories and Typologies', lessons: 5 },
      { name: 'The Broader Financial-Crime Landscape', lessons: 4 },
      { name: 'Learning from Enforcement', lessons: 6 },
    ],
  },
  {
    id: 'B',
    name: 'Compliance Standards for AML/CFT',
    summary:
      'The FATF Recommendations and the risk-based approach, the major sanctions regimes, and the national frameworks (US, UK, EU, and beyond) that turn the global standard into enforceable law.',
    modules: [
      { name: 'The FATF Framework and the Risk-Based Approach', lessons: 4 },
      { name: 'Sanctions Compliance', lessons: 4 },
      { name: 'National Frameworks in Depth', lessons: 4 },
    ],
  },
  {
    id: 'C',
    name: 'The AML/CFT Compliance Program',
    summary:
      'The working program: customer due diligence and beneficial ownership, suspicious-activity monitoring and reporting, and the governance, audit, training, and compliance-function structure that holds it together.',
    modules: [
      { name: 'Customer Due Diligence and Beneficial Ownership', lessons: 5 },
      { name: 'Suspicious Activity Monitoring and Reporting', lessons: 4 },
      { name: 'Governance, Audit, and the Compliance Function', lessons: 4 },
    ],
  },
  {
    id: 'D',
    name: 'Tools and Technologies to Fight Financial Crime',
    summary:
      'How the controls are operationalised in technology across the customer lifecycle: identity and onboarding, screening, transaction monitoring, AI/ML and network analytics, and the build-versus-buy judgment.',
    modules: [{ name: 'Tools and Technologies to Fight Financial Crime', lessons: 5 }],
  },
]

export const BLUEPRINT_TOTALS = {
  domains: CAMS_BLUEPRINT.length,
  modules: CAMS_BLUEPRINT.reduce((n, d) => n + d.modules.length, 0),
  lessons: CAMS_BLUEPRINT.reduce(
    (n, d) => n + d.modules.reduce((m, x) => m + x.lessons, 0),
    0,
  ),
}

export const BLUEPRINT_NOTE =
  'Domain structure follows the CAMS exam blueprint; confirm exam weighting against the current ACAMS candidate handbook. Enso Academy is independent and is not affiliated with, authorised by, or endorsed by ACAMS.'

// The CCAS (Certified Cryptoasset Anti-Financial Crime Specialist) exam
// blueprint. Weights are the confirmed 30 / 35 / 35 domain split.
export const CCAS_BLUEPRINT: BlueprintDomain[] = [
  {
    id: '1',
    name: 'Cryptoassets and Blockchain',
    weight: '30%',
    summary:
      'How cryptoassets and blockchains actually work: what cryptoassets are, how ledgers, keys, and transactions function, the ecosystem of exchanges, custodians, DeFi, and token types, and how blockchain analytics traces value on-chain.',
    modules: [
      { name: 'Cryptoasset and Blockchain Foundations', lessons: 4 },
      { name: 'The Crypto Ecosystem: VASPs, DeFi, and Token Types', lessons: 4 },
      { name: 'Blockchain Analytics and On-Chain Investigation', lessons: 3 },
    ],
  },
  {
    id: '2',
    name: 'AML Foundations for Cryptoassets and Blockchain',
    weight: '35%',
    summary:
      'The AML foundations for crypto: the money-laundering cycle, terrorist and proliferation financing, fraud and typologies, the FATF standards, the Travel Rule and crypto sanctions, and the US, EU, and UK regulatory frameworks.',
    modules: [
      { name: 'Financial Crime in the Cryptoasset Sector', lessons: 6 },
      { name: 'FATF, the Travel Rule, and Crypto Sanctions', lessons: 4 },
      { name: 'National and Regional Crypto Frameworks', lessons: 4 },
    ],
  },
  {
    id: '3',
    name: 'Risk Management Programs for Cryptoassets and Blockchain',
    weight: '35%',
    summary:
      'Building and running a cryptoasset anti-financial-crime programme: risk assessment, onboarding and KYC, customer risk rating, monitoring, screening and reporting, governance and audit, emerging risk, and lessons from enforcement.',
    modules: [
      { name: 'Building a Cryptoasset AFC Program', lessons: 4 },
      { name: 'Monitoring, Screening, and Reporting', lessons: 4 },
      { name: 'Governance, Audit, and Emerging Risk', lessons: 4 },
      { name: 'Learning from Enforcement and Synthesis', lessons: 6 },
    ],
  },
]

export type CourseBlueprint = {
  examName: string
  domains: BlueprintDomain[]
  totals: { domains: number; modules: number; lessons: number }
  note: string
}

function totalsFor(domains: BlueprintDomain[]) {
  return {
    domains: domains.length,
    modules: domains.reduce((n, d) => n + d.modules.length, 0),
    lessons: domains.reduce((n, d) => n + d.modules.reduce((m, x) => m + x.lessons, 0), 0),
  }
}

const CCAS_NOTE =
  'Domain structure and weighting follow the ACAMS CCAS exam blueprint (30 / 35 / 35). Enso Academy is independent and is not affiliated with, authorised by, or endorsed by ACAMS.'

/** The exam blueprint for a course slug, or null if the course has none defined. */
export function getBlueprint(slug: string): CourseBlueprint | null {
  if (slug === 'cams')
    return { examName: 'CAMS', domains: CAMS_BLUEPRINT, totals: BLUEPRINT_TOTALS, note: BLUEPRINT_NOTE }
  if (slug === 'ccas')
    return { examName: 'CCAS', domains: CCAS_BLUEPRINT, totals: totalsFor(CCAS_BLUEPRINT), note: CCAS_NOTE }
  return null
}
