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
