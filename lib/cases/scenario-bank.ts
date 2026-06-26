// lib/cases/scenario-bank.ts
//
// The Lesson Challenge scenario bank (the "Apply it" round) — see
// docs/SPEC-lesson-challenge.md. A curated, concept-tagged set of short applied
// judgments. getLessonChallenge (lib/lesson/challenge.ts) picks from it,
// weighted toward the concepts a given student is weak on for the lesson.
//
// PILOT SCOPE: Module 9 ("Learning from Enforcement"). Each scenario is
// SYNTHETIC — it exercises the CONCEPT a case study teaches (group oversight,
// correspondent KYCC, product-risk gating, beneficial-ownership, enforcement
// literacy) without restating any real matter's facts, so it carries the low
// fidelity risk the spec reserves for generic/conceptual scenarios, not the
// review burden of real-case content.
//
// Reuses the existing interactive specs from the scene contract (red-flags /
// screening-match / risk-classify) plus a lightweight `decision` (the single
// best call), so the round renders with the widgets the player already ships.

import type { RedFlagItem, RiskClassifyItem, ScreeningAlert } from '@/lib/lesson/scenes'

export type ChallengeMechanic = 'red-flags' | 'screening-match' | 'risk-classify' | 'decision'

/** The single-best-call mechanic — bespoke to the challenge (mirrors Case Mode's decision step). */
export type DecisionOption = { id: string; text: string; correct: boolean; why: string }
export type DecisionSpec = { kind: 'decision'; prompt: string; options: DecisionOption[] }

export type RedFlagsSpec = { kind: 'red-flags'; prompt?: string; scenario?: string; items: RedFlagItem[] }
export type RiskClassifySpec = { kind: 'risk-classify'; prompt?: string; items: RiskClassifyItem[] }
export type ScreeningSpec = { kind: 'screening-match'; prompt?: string; alerts: ScreeningAlert[] }

export type ChallengeSpec = RedFlagsSpec | RiskClassifySpec | ScreeningSpec | DecisionSpec

export type ChallengeScenario = {
  id: string
  /** The concepts this scenario exercises — matched against the lesson + the student model. */
  conceptTags: string[]
  mechanic: ChallengeMechanic
  /** Short label shown on the step rail. */
  title: string
  spec: ChallengeSpec
}

// ── The bank ────────────────────────────────────────────────────────────────
// Decision scenarios also carry `scenario_judgment` so they qualify for the
// course-synthesis lesson, which is itself a cross-module judgment exercise.

export const SCENARIO_BANK: ChallengeScenario[] = [
  // ── Correspondent banking ────────────────────────────────────────────────
  {
    id: 'cb-respondent-flags',
    conceptTags: ['correspondent_banking', 'correspondent_failures'],
    mechanic: 'red-flags',
    title: 'Onboarding a respondent',
    spec: {
      kind: 'red-flags',
      scenario:
        'A foreign bank applies to open a US-dollar correspondent account with you. You review its application pack.',
      prompt: 'Which of these are genuine red flags on the relationship?',
      items: [
        {
          id: 'a',
          label: 'It serves downstream banks it will not name, whose payments would clear through your account.',
          flag: true,
          why: 'Unnamed nested banks mean you cannot know your customer’s customers — a core correspondent red flag.',
        },
        {
          id: 'b',
          label: 'Its dollar-wire volume to a high-risk corridor is several times what its stated customer base would generate.',
          flag: true,
          why: 'Activity inconsistent with the stated business is a classic indicator that warrants explanation before onboarding.',
        },
        {
          id: 'c',
          label: 'It declines to share its own AML policy or customer-due-diligence program.',
          flag: true,
          why: 'You rely on the respondent’s own controls; refusing to evidence them is disqualifying, not a formality.',
        },
        {
          id: 'd',
          label: 'It is licensed and prudentially regulated in its home country.',
          flag: false,
          why: 'Home-country regulation is expected and reassuring — it is not, by itself, a red flag.',
        },
        {
          id: 'e',
          label: 'It settles through SWIFT using standard message types.',
          flag: false,
          why: 'Standard settlement rails are normal correspondent practice, not an indicator.',
        },
      ],
    },
  },
  {
    id: 'cb-kycc-decision',
    conceptTags: ['correspondent_banking', 'correspondent_failures', 'scenario_judgment'],
    mechanic: 'decision',
    title: 'The volume spike',
    spec: {
      kind: 'decision',
      prompt:
        'A respondent’s wire volume to a high-risk corridor runs at roughly five times its stated business, much of it for customers you cannot see. What is the right next step?',
      options: [
        {
          id: 'a',
          text: 'Request the underlying customer information and the respondent’s own CDD program; restrict or exit the relationship if it will not provide them.',
          correct: true,
          why: 'Know-your-customer’s-customer: you must understand the activity flowing through your account or stop carrying it.',
        },
        {
          id: 'b',
          text: 'Accept it — the respondent is a regulated bank, so its customers are its responsibility, not yours.',
          correct: false,
          why: 'A correspondent cannot outsource away its own monitoring duty; the payments still clear through you.',
        },
        {
          id: 'c',
          text: 'Close the account immediately with no inquiry.',
          correct: false,
          why: 'Reflexive de-risking forgoes the inquiry that distinguishes real risk from explained activity, and can itself cause harm.',
        },
        {
          id: 'd',
          text: 'Raise the monitoring threshold so fewer alerts fire on the corridor.',
          correct: false,
          why: 'Suppressing the alerts hides the risk rather than resolving it — the opposite of the required response.',
        },
      ],
    },
  },
  {
    id: 'cb-rate-relationships',
    conceptTags: ['correspondent_banking', 'correspondent_failures'],
    mechanic: 'risk-classify',
    title: 'Rate the relationships',
    spec: {
      kind: 'risk-classify',
      prompt: 'Sort each correspondent relationship into the risk tier you would assign at onboarding.',
      items: [
        {
          id: 'a',
          label: 'A domestic respondent with a fully transparent, documented customer base in a low-risk market.',
          tier: 'low',
          why: 'Transparency plus a low-risk footprint is the lower-risk profile.',
        },
        {
          id: 'b',
          label: 'A foreign respondent in a medium-risk jurisdiction, full DD provided, no nested banks.',
          tier: 'medium',
          why: 'Foreign exposure raises it above low, but full DD and no nesting keep it from high.',
        },
        {
          id: 'c',
          label: 'A respondent that permits nested downstream banks and clears heavily through a high-risk corridor.',
          tier: 'high',
          why: 'Nesting plus a high-risk corridor is the higher-risk profile that demands enhanced DD or refusal.',
        },
      ],
    },
  },
  {
    id: 'cb-stripping-flags',
    conceptTags: ['wire_stripping', 'correspondent_failures'],
    mechanic: 'red-flags',
    title: 'Reading the payment messages',
    spec: {
      kind: 'red-flags',
      scenario: 'You review a batch of outbound payment instructions and the notes attached to them.',
      prompt: 'Which of these indicate payment-message manipulation (stripping)?',
      items: [
        {
          id: 'a',
          label: 'Originator and beneficiary fields were edited to remove a reference to a sanctioned jurisdiction before sending.',
          flag: true,
          why: 'Altering the message to hide a party from the receiving bank’s screening is the definition of stripping.',
        },
        {
          id: 'b',
          label: 'An internal note instructs staff to “not mention” a particular party in the wire details.',
          flag: true,
          why: 'Deliberate omission of a party to defeat downstream screening is a stripping indicator.',
        },
        {
          id: 'c',
          label: 'A cover payment is used with the full ordering-party information present per normal practice.',
          flag: false,
          why: 'Cover payments are routine correspondent practice when the required fields are complete.',
        },
        {
          id: 'd',
          label: 'A field uses a standard country abbreviation.',
          flag: false,
          why: 'Standard abbreviations are normal formatting, not concealment.',
        },
      ],
    },
  },

  // ── Governance / group oversight ─────────────────────────────────────────
  {
    id: 'gov-integration-decision',
    conceptTags: ['governance_failure', 'non_resident_portfolio', 'scenario_judgment'],
    mechanic: 'decision',
    title: 'The acquired branch',
    spec: {
      kind: 'decision',
      prompt:
        'Your group acquires a foreign branch with a profitable non-resident book running on its own IT platform that group monitoring and screening cannot see. What is the sound design?',
      options: [
        {
          id: 'a',
          text: 'Onboard the book to group monitoring and screening on a board-approved timeline; until then run it as a named, time-boxed exception under direct group sampling, with escalation if the date slips.',
          correct: true,
          why: 'Group-wide oversight must reach the branch; an explicit, time-boxed, escalated exception is how you bridge to it.',
        },
        {
          id: 'b',
          text: 'Let the branch’s local compliance team self-certify each year that its controls are adequate.',
          correct: false,
          why: 'Annual local self-certification is exactly the blind spot that lets a non-resident book run unseen.',
        },
        {
          id: 'c',
          text: 'Leave it on its own platform indefinitely — it is profitable and locally regulated.',
          correct: false,
          why: 'Profitability and local regulation do not substitute for group-wide AML oversight.',
        },
        {
          id: 'd',
          text: 'Have the branch send the group a monthly summary report and treat that as oversight.',
          correct: false,
          why: 'A summary report is not monitoring; the group still cannot see or test the underlying activity.',
        },
      ],
    },
  },
  {
    id: 'gov-nrp-flags',
    conceptTags: ['non_resident_portfolio', 'governance_failure', 'layering'],
    mechanic: 'red-flags',
    title: 'The non-resident book',
    spec: {
      kind: 'red-flags',
      scenario:
        'A small branch holds a large, fast-growing book of non-resident customers. You sample the portfolio.',
      prompt: 'Which features are genuine red flags?',
      items: [
        {
          id: 'a',
          label: 'Most customers have no commercial or personal connection to the branch’s country.',
          flag: true,
          why: 'A non-resident base with no nexus to the branch is a hallmark higher-risk pattern requiring strong controls.',
        },
        {
          id: 'b',
          label: 'Turnover through the accounts is far larger than the customers’ stated activity would explain.',
          flag: true,
          why: 'Volume disproportionate to the customer profile is a core monitoring indicator.',
        },
        {
          id: 'c',
          label: 'Ownership of many corporate customers runs through layered offshore vehicles with no clear rationale.',
          flag: true,
          why: 'Unexplained layered ownership obscures the beneficial owner and the source of funds.',
        },
        {
          id: 'd',
          label: 'The portfolio is profitable for the branch.',
          flag: false,
          why: 'Profitability is a commercial fact, not a risk indicator.',
        },
        {
          id: 'e',
          label: 'Customers are non-resident but each is fully identified with consistent, documented activity.',
          flag: false,
          why: 'Non-residence with full documentation and consistent activity is manageable, not itself a red flag.',
        },
      ],
    },
  },
  {
    id: 'gov-whistleblower-decision',
    conceptTags: ['whistleblower', 'governance_failure'],
    mechanic: 'decision',
    title: 'The internal report',
    spec: {
      kind: 'decision',
      prompt:
        'An internal whistleblower reports that a foreign branch’s non-resident customers may be laundering funds. Local management reviews it and dismisses the concern. What should the group do?',
      options: [
        {
          id: 'a',
          text: 'Treat the report as a risk signal: investigate independently of local management, preserve the records, escalate to group audit and the board, and protect the reporter.',
          correct: true,
          why: 'An escalation about the very unit implicated cannot be cleared by that unit; it needs independent review and board visibility.',
        },
        {
          id: 'b',
          text: 'Defer to local management — they know the customers best.',
          correct: false,
          why: 'Deferring to the implicated unit is how substantiated warnings get buried for years.',
        },
        {
          id: 'c',
          text: 'Consider the matter closed once local management has responded.',
          correct: false,
          why: 'A response from the implicated unit is not an independent resolution of the concern.',
        },
        {
          id: 'd',
          text: 'Act on it only if a regulator raises it first.',
          correct: false,
          why: 'Waiting for a regulator abdicates the institution’s own duty to investigate credible internal warnings.',
        },
      ],
    },
  },

  // ── Product-risk gating ──────────────────────────────────────────────────
  {
    id: 'prod-launch-decision',
    conceptTags: ['product_risk_assessment', 'scenario_judgment'],
    mechanic: 'decision',
    title: 'The product gate',
    spec: {
      kind: 'decision',
      prompt:
        'A product team proposes a low-value, high-volume cross-border payment channel. Their pack covers market sizing, pricing and UX, ending with one line: “Compliance: standard monitoring applies.” You chair the financial-crime gate. What is the right decision?',
      options: [
        {
          id: 'a',
          text: 'Do not approve until a product-specific risk assessment identifies the channel’s typologies and the detection scenarios that would catch them are built and tested for it.',
          correct: true,
          why: 'A new channel needs its own risk assessment and its own monitoring coverage before launch, not a generic assurance.',
        },
        {
          id: 'b',
          text: 'Approve — the enterprise monitoring platform already covers every product.',
          correct: false,
          why: 'Enterprise monitoring rarely has scenarios tuned to a new channel’s specific typology; “standard monitoring” is the gap.',
        },
        {
          id: 'c',
          text: 'Approve, with a plan to add tailored monitoring within the first year.',
          correct: false,
          why: 'Launching first and monitoring later leaves the channel uncovered exactly when it is newest and least understood.',
        },
        {
          id: 'd',
          text: 'Reject the product outright as inherently too risky.',
          correct: false,
          why: 'The control answer is to assess and cover the risk, not to refuse all innovation.',
        },
      ],
    },
  },
  {
    id: 'prod-channel-flags',
    conceptTags: ['product_risk_assessment'],
    mechanic: 'red-flags',
    title: 'New-channel risk',
    spec: {
      kind: 'red-flags',
      scenario: 'You assess a proposed low-value, app-based payment channel before launch.',
      prompt: 'Which are genuine risk indicators that the design must address?',
      items: [
        {
          id: 'a',
          label: 'Low-value, high-frequency payments that can be split to aggregate below reporting and review thresholds.',
          flag: true,
          why: 'Structuring below thresholds is a known exploitation pattern the monitoring must be designed to catch.',
        },
        {
          id: 'b',
          label: 'The corridor and customer profile match a known serious-harm typology, but no detection scenario is mapped to it.',
          flag: true,
          why: 'A known typology with no scenario built for it is precisely where risk runs undetected.',
        },
        {
          id: 'c',
          label: 'The product is expected to be popular and grow quickly.',
          flag: false,
          why: 'Popularity raises volume but is not itself a financial-crime indicator.',
        },
        {
          id: 'd',
          label: 'It is delivered through a mobile app.',
          flag: false,
          why: 'The delivery channel alone is neutral; the risk is in the typology coverage, not the app.',
        },
      ],
    },
  },

  // ── Beneficial ownership / PEP / private banking ─────────────────────────
  {
    id: 'pep-vehicle-decision',
    conceptTags: ['pep_failures', 'private_banking_failures', 'complex_structures', 'scenario_judgment'],
    mechanic: 'decision',
    title: 'The private-bank applicant',
    spec: {
      kind: 'decision',
      prompt:
        'A newly formed offshore company applies for a private-banking account. Its stated beneficial owner is a businessman, but the funding and the account instructions trace back to a politically controlled sovereign fund. What is the right call?',
      options: [
        {
          id: 'a',
          text: 'Apply enhanced due diligence: establish source of wealth and source of funds, treat the connected persons as politically exposed, require senior-management approval, and decline if source of wealth cannot be established.',
          correct: true,
          why: 'Political control of the funds pulls in PEP-grade EDD and senior sign-off regardless of the named owner.',
        },
        {
          id: 'b',
          text: 'Onboard normally — the named beneficial owner is not personally a PEP.',
          correct: false,
          why: 'The named owner is not the whole picture; the political control of the money is what drives the risk.',
        },
        {
          id: 'c',
          text: 'Onboard now and flag the file for review at the next annual cycle.',
          correct: false,
          why: 'Deferring the EDD to a later cycle processes the high-risk relationship before understanding it.',
        },
        {
          id: 'd',
          text: 'Rely on the introducing intermediary’s KYC and proceed.',
          correct: false,
          why: 'Reliance does not transfer the obligation; you remain responsible for establishing source of wealth and ownership.',
        },
      ],
    },
  },
  {
    id: 'pep-screening',
    conceptTags: ['pep_failures', 'private_banking_failures'],
    mechanic: 'screening-match',
    title: 'Adjudicate the alerts',
    spec: {
      kind: 'screening-match',
      prompt: 'Two screening alerts fired during onboarding. For each, clear it or escalate it.',
      alerts: [
        {
          id: 'a',
          party: {
            name: 'Crestline Strategic Holdings Ltd',
            fields: [
              { label: 'Type', value: 'Offshore holding co.' },
              { label: 'Connected', value: 'Adviser to a foreign deputy minister' },
              { label: 'Funds', value: 'From a state-linked fund' },
            ],
          },
          listEntry: {
            name: 'Deputy Minister (and close associates)',
            list: 'PEP / RCA reference',
            fields: [
              { label: 'Role', value: 'Senior government official' },
              { label: 'Category', value: 'Foreign PEP + relatives/associates' },
            ],
          },
          verdict: 'escalate',
          why: 'A vehicle linked to a PEP’s associate with state-linked funds is a genuine PEP-proximity match — escalate for EDD and senior approval, do not clear.',
        },
        {
          id: 'b',
          party: {
            name: 'John A. Smith',
            fields: [
              { label: 'DOB', value: '14 Mar 1991' },
              { label: 'Country', value: 'Canada' },
              { label: 'Role', value: 'Retail customer, salaried' },
            ],
          },
          listEntry: {
            name: 'John Smith',
            list: 'Sanctions list',
            fields: [
              { label: 'DOB', value: '02 Sep 1957' },
              { label: 'Country', value: 'Different jurisdiction' },
            ],
          },
          verdict: 'clear',
          why: 'Same common name but the DOB and country plainly differ — a false positive that should be cleared with the basis recorded.',
        },
      ],
    },
  },
  {
    id: 'shell-ownership-flags',
    conceptTags: ['shell_companies', 'complex_structures', 'layering'],
    mechanic: 'red-flags',
    title: 'Opaque ownership',
    spec: {
      kind: 'red-flags',
      scenario: 'You review the ownership structure behind a corporate account applicant.',
      prompt: 'Which features are genuine red flags?',
      items: [
        {
          id: 'a',
          label: 'Ownership runs through three or more layered offshore companies with nominee directors and no clear commercial rationale.',
          flag: true,
          why: 'Layering with nominees and no business reason obscures the beneficial owner — the structure is the risk.',
        },
        {
          id: 'b',
          label: 'Account activity is inconsistent with the stated business of the operating company.',
          flag: true,
          why: 'Activity that does not fit the stated business is a core indicator of misuse.',
        },
        {
          id: 'c',
          label: 'Nominee or bearer-style arrangements are used to hold the shares.',
          flag: true,
          why: 'Nominee/bearer holdings are designed to break the link to the real owner.',
        },
        {
          id: 'd',
          label: 'A multinational group uses a documented holding structure with audited accounts and a clear commercial purpose.',
          flag: false,
          why: 'A transparent, commercially-rational group structure is normal corporate practice.',
        },
      ],
    },
  },

  // ── Enforcement literacy (reading an action as case law) ──────────────────
  {
    id: 'enf-transfer-decision',
    conceptTags: ['enforcement_analysis', 'control_failures', 'root_cause', 'lessons_learned'],
    mechanic: 'decision',
    title: 'Reading the notice',
    spec: {
      kind: 'decision',
      prompt:
        'An enforcement notice finds a bank’s transaction-monitoring tool ran un-tuned scenarios and carried a large, ageing alert backlog. Read as case law, what is the transferable question for your own institution?',
      options: [
        {
          id: 'a',
          text: 'When did we last validate our monitoring scenarios against current typologies, and is our alert backlog inside tolerance?',
          correct: true,
          why: 'The value of an enforcement action is the control question it puts to you — turn the finding into a self-test.',
        },
        {
          id: 'b',
          text: 'Which individuals at that bank were personally fined?',
          correct: false,
          why: 'Who was fined is not the transferable control lesson for your own program.',
        },
        {
          id: 'c',
          text: 'Does my bank happen to use the same software vendor?',
          correct: false,
          why: 'The failure was un-tuned scenarios and an unmanaged backlog, not the choice of vendor.',
        },
        {
          id: 'd',
          text: 'What was the exact penalty figure?',
          correct: false,
          why: 'The headline number is not the control question; the finding is.',
        },
      ],
    },
  },
  {
    id: 'enf-finding-classify',
    conceptTags: ['enforcement_analysis', 'final_notice', 'consent_order', 'dpa'],
    mechanic: 'risk-classify',
    title: 'What is the finding doing?',
    spec: {
      kind: 'risk-classify',
      prompt:
        'Reading an enforcement notice, sort each element by how much weight it carries for your own program. (Lower = background, Higher = act on it.)',
      items: [
        {
          id: 'a',
          label: 'The agreed statement of facts describing the specific control that failed and how.',
          tier: 'high',
          why: 'The factual control failure is the part you map directly onto your own controls.',
        },
        {
          id: 'b',
          label: 'The remediation the firm was ordered to undertake.',
          tier: 'medium',
          why: 'The required fix is a useful benchmark for adequacy, a step below the root-cause finding itself.',
        },
        {
          id: 'c',
          label: 'The procedural recitals and boilerplate about the resolution mechanism.',
          tier: 'low',
          why: 'The procedural framing is background; it is not where the transferable lesson lives.',
        },
      ],
    },
  },

  // ── Synthesis ────────────────────────────────────────────────────────────
  {
    id: 'syn-first-action',
    conceptTags: ['synthesis', 'scenario_judgment', 'pep_failures', 'beneficial_ownership'],
    mechanic: 'decision',
    title: 'The synthesis call',
    spec: {
      kind: 'decision',
      prompt:
        'A private bank receives an account application from an offshore vehicle, introduced by a correspondent, whose funds trace to a politically controlled entity. Of these, what is the right FIRST action?',
      options: [
        {
          id: 'a',
          text: 'Establish beneficial ownership and source of wealth, and treat the relationship as high-risk requiring EDD and senior approval, before processing any funds.',
          correct: true,
          why: 'Understand who owns it, where the money comes from, and the risk rating before you move money — the synthesis of every prior module.',
        },
        {
          id: 'b',
          text: 'Process the first transaction, since the correspondent already did KYC on the vehicle.',
          correct: false,
          why: 'Reliance does not move the obligation; processing first defeats the point of the controls.',
        },
        {
          id: 'c',
          text: 'Open the account at standard risk and revisit if monitoring later alerts.',
          correct: false,
          why: 'The political and ownership flags are known now; waiting for an alert is too late.',
        },
        {
          id: 'd',
          text: 'Decline without inquiry to avoid the risk entirely.',
          correct: false,
          why: 'Blanket refusal forgoes the assessment that distinguishes manageable from unacceptable risk.',
        },
      ],
    },
  },
]

/** All scenarios whose concepts intersect the given lesson concepts. */
export function scenariosForConcepts(conceptTags: string[]): ChallengeScenario[] {
  const set = new Set(conceptTags)
  return SCENARIO_BANK.filter((s) => s.conceptTags.some((t) => set.has(t)))
}
