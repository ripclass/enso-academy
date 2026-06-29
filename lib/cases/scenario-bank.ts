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
import { ROLLOUT_SCENARIOS } from './scenarios-rollout'

export type ChallengeMechanic =
  | 'red-flags'
  | 'screening-match'
  | 'risk-classify'
  | 'decision'
  | 'sequence'
  | 'match'
  | 'sort'

/** The single-best-call mechanic, bespoke to the challenge (mirrors Case Mode's decision step). */
export type DecisionOption = { id: string; text: string; correct: boolean; why: string }
export type DecisionSpec = { kind: 'decision'; prompt: string; options: DecisionOption[] }

export type RedFlagsSpec = { kind: 'red-flags'; prompt?: string; scenario?: string; items: RedFlagItem[] }
export type RiskClassifySpec = { kind: 'risk-classify'; prompt?: string; items: RiskClassifyItem[] }
export type ScreeningSpec = { kind: 'screening-match'; prompt?: string; alerts: ScreeningAlert[] }

// ── Conceptual mechanics (for foundational/definitional lessons) ─────────────
// These carry the lessons that have no natural "scenario": match a term to its
// role, sort items into categories, or order the stages of a process. The
// widgets shuffle for display, so the data is authored in its natural order.

/** One step in an ordered process. The `steps` array is the CORRECT order. */
export type SequenceStep = { id: string; label: string; why: string }
export type SequenceSpec = { kind: 'sequence'; prompt: string; steps: SequenceStep[] }

/** One term paired with its correct role/definition. */
export type MatchPair = { id: string; left: string; right: string; why: string }
export type MatchSpec = { kind: 'match'; prompt: string; pairs: MatchPair[] }

/** A named category, and items that each belong to exactly one. */
export type SortBucket = { id: string; label: string }
export type SortItem = { id: string; label: string; bucket: string; why: string }
export type SortSpec = { kind: 'sort'; prompt: string; buckets: SortBucket[]; items: SortItem[] }

export type ChallengeSpec =
  | RedFlagsSpec
  | RiskClassifySpec
  | ScreeningSpec
  | DecisionSpec
  | SequenceSpec
  | MatchSpec
  | SortSpec

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
          why: 'Unnamed nested banks mean you cannot know your customer’s customers, a core correspondent red flag.',
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
          why: 'Home-country regulation is expected and reassuring. It is not, by itself, a red flag.',
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
          text: 'Accept it: the respondent is a regulated bank, so its customers are its responsibility, not yours.',
          correct: false,
          why: 'A correspondent cannot outsource away its own monitoring duty; the payments still clear through you.',
        },
        {
          id: 'c',
          text: 'File a suspicious activity report on the corridor and keep clearing the payments while the financial intelligence unit reviews the relationship.',
          correct: false,
          why: 'A report does not discharge the duty to understand the activity. You cannot keep clearing unexplained high-risk volume while you wait.',
        },
        {
          id: 'd',
          text: 'Raise the monitoring threshold so fewer alerts fire on the corridor.',
          correct: false,
          why: 'Suppressing the alerts hides the risk rather than resolving it, the opposite of the required response.',
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
          text: 'Bring the book onto group monitoring to a board-approved date, running it as a time-boxed exception until then.',
          correct: true,
          why: 'Group-wide oversight must reach the branch; an explicit, time-boxed, escalated exception with direct group sampling is how you bridge to it.',
        },
        {
          id: 'b',
          text: 'Let the branch’s local compliance team self-certify each year that its controls are adequate.',
          correct: false,
          why: 'Annual local self-certification is exactly the blind spot that lets a non-resident book run unseen.',
        },
        {
          id: 'c',
          text: 'Leave the book on its own platform indefinitely, on the basis that it is already profitable and the branch is regulated by its own competent authority.',
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
          text: 'Investigate it independently of local management, escalate to group audit and the board, and protect the reporter.',
          correct: true,
          why: 'An escalation about the very unit implicated cannot be cleared by that unit; preserve the records, get independent review, and give the board visibility.',
        },
        {
          id: 'b',
          text: 'Defer to local management. They know the customers best.',
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
          text: 'Hold the report for the branch’s next scheduled internal audit, where it can be examined in context alongside the rest of the cycle’s findings.',
          correct: false,
          why: 'Parking a credible warning until a routine audit lets the activity continue and treats it as housekeeping, not a risk signal.',
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
          text: 'Do not approve until a product-specific risk assessment maps the channel’s typologies and tailored detection scenarios are built and tested for it.',
          correct: true,
          why: 'A new channel needs its own risk assessment and its own monitoring coverage before launch, not a generic assurance.',
        },
        {
          id: 'b',
          text: 'Approve: the enterprise monitoring platform already covers every product.',
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
          text: 'Approve it with a lower per-transaction limit, on the basis that small, high-frequency payments each carry too little value to present real laundering risk.',
          correct: false,
          why: 'Low value is not low risk. The channel invites structuring into many sub-threshold payments, which a tailored scenario must catch.',
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
          text: 'Apply PEP-grade enhanced due diligence, and decline if source of wealth cannot be credibly established.',
          correct: true,
          why: 'Political control of the funds pulls in PEP-grade EDD, source-of-wealth and source-of-funds work, and senior sign-off regardless of the named owner.',
        },
        {
          id: 'b',
          text: 'Onboard at standard risk, on the basis that the named beneficial owner is a private businessman and does not personally hold a prominent public function.',
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
          why: 'A vehicle linked to a PEP’s associate with state-linked funds is a genuine PEP-proximity match. Escalate for EDD and senior approval, do not clear.',
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
          why: 'Same common name but the DOB and country plainly differ, a false positive that should be cleared with the basis recorded.',
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
          why: 'Layering with nominees and no business reason obscures the beneficial owner. The structure is the risk.',
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
          why: 'The value of an enforcement action is the control question it puts to you. Turn the finding into a self-test.',
        },
        {
          id: 'b',
          text: 'Which named individuals at that bank were personally fined or barred, so we know which roles regulators hold responsible in a failure like this?',
          correct: false,
          why: 'Who was sanctioned is not the transferable control lesson. The finding tells you what to test in your own program, not whom to blame.',
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
          why: 'Understand who owns it, where the money comes from, and the risk rating before you move money, the synthesis of every prior module.',
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
          text: 'Accept the funds into a non-interest holding account while you complete due diligence, so the client relationship is not delayed during onboarding.',
          correct: false,
          why: 'Taking the money before you understand ownership and source is the failure itself. Hold the relationship, not the funds.',
        },
      ],
    },
  },
  // ════════════════════════════════════════════════════════════════════════
  // ROLLOUT: Module 1 (Foundations of ML/TF) and Module 2 (FATF / RBA).
  // These are the conceptual/definitional modules, so they lead with the
  // conceptual mechanics (sequence / match / sort). Concept tags match the live
  // lesson concept_tags so the adaptive selector targets the right round. All
  // synthetic, no real-matter facts restated.
  // ════════════════════════════════════════════════════════════════════════

  // ── M1.1 what-money-laundering-actually-is ────────────────────────────────
  {
    id: 'ml-stages-sequence',
    conceptTags: ['money_laundering_definition', 'concealment'],
    mechanic: 'sequence',
    title: 'The three-stage model',
    spec: {
      kind: 'sequence',
      prompt:
        'Put the classic three stages of money laundering in order, from how dirty cash first enters the system to how it returns looking clean.',
      steps: [
        {
          id: 'placement',
          label: 'Placement: the cash proceeds first enter the financial system, for example as structured deposits or through a cash-intensive business.',
          why: 'Placement is the entry point, where physical proceeds become bank balances, and the stage where the launderer is most exposed.',
        },
        {
          id: 'layering',
          label: 'Layering: a chain of transfers, conversions and shell entities puts distance between the money and its origin.',
          why: 'Layering buries the audit trail. Rapid movement through accounts, jurisdictions and instruments breaks the link to the crime.',
        },
        {
          id: 'integration',
          label: 'Integration: the funds re-enter the economy as apparently legitimate wealth, such as property, investments or business income.',
          why: 'Integration is the exit, where the money is spent or invested looking clean. By here the trail is hardest to follow.',
        },
      ],
    },
  },
  {
    id: 'ml-related-offences-sort',
    conceptTags: ['predicate_offences', 'money_laundering_definition'],
    mechanic: 'sort',
    title: 'Laundering, or its predicate?',
    spec: {
      kind: 'sort',
      prompt:
        'Money laundering is a separate offence from the crime that generated the money. Sort each activity.',
      buckets: [
        { id: 'predicate', label: 'Predicate offence' },
        { id: 'laundering', label: 'Money laundering' },
      ],
      items: [
        { id: 'i1', label: 'Selling narcotics for cash.', bucket: 'predicate', why: 'The drug sale is the underlying crime that generates the proceeds. It is the predicate, not the laundering.' },
        { id: 'i2', label: 'Funnelling the drug cash through a restaurant’s takings to explain it as sales.', bucket: 'laundering', why: 'Disguising the origin of criminal proceeds is the laundering offence, distinct from the drug crime itself.' },
        { id: 'i3', label: 'Wiring the proceeds through three shell companies to obscure their source.', bucket: 'laundering', why: 'Layering to conceal origin is classic laundering conduct.' },
        { id: 'i4', label: 'Embezzling funds from an employer.', bucket: 'predicate', why: 'The theft is the predicate offence. Laundering is what happens to the stolen money afterwards.' },
        { id: 'i5', label: 'Buying property with the embezzled funds to hold them as clean wealth.', bucket: 'laundering', why: 'Integrating proceeds into legitimate assets to enjoy them is the laundering stage.' },
      ],
    },
  },
  {
    id: 'ml-elements-match',
    conceptTags: ['money_laundering_definition', 'proceeds_of_crime', 'concealment'],
    mechanic: 'match',
    title: 'The elements of the offence',
    spec: {
      kind: 'match',
      prompt:
        'Across the major statutes the money-laundering offence converges on the same elements. Match each to what it means.',
      pairs: [
        { id: 'proceeds', left: 'Criminal property', right: 'The funds or assets are the proceeds of an underlying offence.', why: 'There must be property that represents the benefit of crime, whatever the predicate was.' },
        { id: 'mens_rea', left: 'Knowledge or suspicion', right: 'The person knew or suspected the property was criminal.', why: 'The mental element separates a launderer from someone who handled the funds genuinely unaware.' },
        { id: 'act', left: 'The prohibited act', right: 'Concealing, converting, transferring or using the property.', why: 'The conduct element is the dealing with the property, not merely knowing about it.' },
      ],
    },
  },

  // ── M1.2 what-terrorist-financing-actually-is ─────────────────────────────
  {
    id: 'tf-three-crimes-sort',
    conceptTags: ['terrorist_financing', 'proliferation_financing'],
    mechanic: 'sort',
    title: 'Which problem is it?',
    spec: {
      kind: 'sort',
      prompt:
        'Money laundering, terrorist financing and proliferation financing are distinct problems. Sort each description.',
      buckets: [
        { id: 'ml', label: 'Money laundering' },
        { id: 'tf', label: 'Terrorist financing' },
        { id: 'pf', label: 'Proliferation financing' },
      ],
      items: [
        { id: 't1', label: 'Disguising the criminal origin of drug-trafficking profits.', bucket: 'ml', why: 'Laundering is about hiding where dirty money came from.' },
        { id: 't2', label: 'Moving small, often legitimately-sourced sums to fund an attack.', bucket: 'tf', why: 'Terrorist financing turns on the destination and purpose, and the funds may be clean to begin with.' },
        { id: 't3', label: 'Front-company payments for dual-use goods bound for a sanctioned weapons programme.', bucket: 'pf', why: 'Proliferation financing funds weapons programmes and turns on sanctions evasion and dual-use procurement.' },
        { id: 't4', label: 'A charity diverting part of its donations to a designated group.', bucket: 'tf', why: 'Channelling funds to a terrorist group, even from a legitimate raise, is terrorist financing.' },
        { id: 't5', label: 'Layering stolen funds through shell companies to enjoy them later as clean wealth.', bucket: 'ml', why: 'Concealing criminal proceeds for later use is laundering.' },
      ],
    },
  },
  {
    id: 'tf-concepts-match',
    conceptTags: ['unscr_1373', 'small_value_flows', 'proliferation_financing'],
    mechanic: 'match',
    title: 'Terms in the CFT regime',
    spec: {
      kind: 'match',
      prompt: 'Match each term to its meaning.',
      pairs: [
        { id: 'r1373', left: 'UNSCR 1373', right: 'The post-9/11 resolution requiring every state to criminalise terrorist financing and freeze terrorist assets.', why: 'Resolution 1373 is the binding baseline obligation on all UN members, separate from the named UN sanctions lists.' },
        { id: 'smallval', left: 'Small-value flows', right: 'Why TF often slips past monitoring tuned to large, suspicious laundering amounts.', why: 'An attack can cost very little, so amount-based laundering thresholds frequently miss it.' },
        { id: 'pf', left: 'Proliferation financing', right: 'Funding the spread of weapons of mass destruction, addressed largely through targeted sanctions.', why: 'PF is a distinct regime driven by proliferation sanctions, not the laundering rulebook.' },
      ],
    },
  },
  {
    id: 'tf-detection-flags',
    conceptTags: ['small_value_flows', 'terrorist_financing'],
    mechanic: 'red-flags',
    title: 'What would actually flag TF',
    spec: {
      kind: 'red-flags',
      scenario: 'A monitoring team whose scenarios are tuned to large laundering patterns reviews a set of accounts.',
      prompt: 'Which features are genuine terrorist-financing indicators, rather than things that look suspicious only for laundering?',
      items: [
        { id: 'a', label: 'Small, regular transfers from several individuals consolidating into one account that then sends funds to a conflict-adjacent region.', flag: true, why: 'Aggregation of modest sums plus a sensitive destination matters more than transaction size for TF.' },
        { id: 'b', label: 'A customer with modest stated income making frequent low-value remittances to a high-risk corridor for vague purposes.', flag: true, why: 'Purpose and corridor, not amount, carry the TF signal.' },
        { id: 'c', label: 'Any link between the customer and a person or entity on a terrorism sanctions list.', flag: true, why: 'A sanctions-list nexus is a direct CFT indicator regardless of amount.' },
        { id: 'd', label: 'A single very large cash deposit far above the customer’s profile.', flag: false, why: 'That is a classic laundering placement flag, not a distinctive TF one. TF amounts are usually small.' },
        { id: 'e', label: 'Rapid movement of large balances through many shell companies.', flag: false, why: 'That is layering, a laundering pattern. It is not what makes TF hard to see.' },
      ],
    },
  },

  // ── M1.3 why-states-regulate-financial-institutions ───────────────────────
  {
    id: 'gk-concepts-match',
    conceptTags: ['gatekeeper_model', 'preventive_regime', 'regulated_sector'],
    mechanic: 'match',
    title: 'Why states use gatekeepers',
    spec: {
      kind: 'match',
      prompt: 'Match each idea behind the preventive regime to its meaning.',
      pairs: [
        { id: 'gatekeeper', left: 'Gatekeeper model', right: 'Requiring the firms that touch the money to detect and report, instead of relying on the police after the fact.', why: 'States deputise banks and other firms as the first line, because they sit where the money moves.' },
        { id: 'preventive', left: 'Preventive regime', right: 'Controls aimed at stopping or surfacing crime before harm, not only punishing it afterwards.', why: 'CDD, monitoring and reporting are preventive duties, distinct from criminal prosecution.' },
        { id: 'obliged', left: 'Obliged entity', right: 'A business inside the regulated perimeter that must run an AML programme.', why: 'The duties attach to defined obliged entities, which is why the scope of the perimeter matters.' },
      ],
    },
  },
  {
    id: 'gk-perimeter-sort',
    conceptTags: ['regulated_sector', 'gatekeeper_model'],
    mechanic: 'sort',
    title: 'Inside the perimeter?',
    spec: {
      kind: 'sort',
      prompt:
        'FATF extends AML duties beyond banks to certain non-financial businesses and to virtual asset service providers. Sort each.',
      buckets: [
        { id: 'in', label: 'Obliged entity' },
        { id: 'out', label: 'Outside the AML perimeter' },
      ],
      items: [
        { id: 'g1', label: 'A retail bank opening customer accounts.', bucket: 'in', why: 'Financial institutions are the core of the regulated sector.' },
        { id: 'g2', label: 'A crypto exchange converting and transferring virtual assets for customers.', bucket: 'in', why: 'Virtual asset service providers are brought in by Recommendation 15.' },
        { id: 'g3', label: 'A casino handling large cash transactions above the threshold.', bucket: 'in', why: 'Casinos are a designated non-financial business above a set threshold.' },
        { id: 'g4', label: 'A lawyer holding client funds for a property purchase.', bucket: 'in', why: 'Legal professionals are obliged entities when they handle certain transactions like real estate.' },
        { id: 'g5', label: 'A supermarket selling groceries for cash.', bucket: 'out', why: 'An ordinary retailer is not an obliged entity merely for taking cash for goods.' },
      ],
    },
  },
  {
    id: 'gk-rationale-decision',
    conceptTags: ['preventive_regime', 'compliance_burden'],
    mechanic: 'decision',
    title: 'Why prevention, not just prosecution',
    spec: {
      kind: 'decision',
      prompt:
        'A board member argues the firm should stop spending on AML and let the police catch criminals instead. What is the soundest response on why states impose the preventive regime?',
      options: [
        { id: 'a', text: 'Prosecution after the fact rarely recovers the funds or reaches the organisers, so states require the firms that move money to detect and report it as it passes through.', correct: true, why: 'The preventive model exists because enforcement alone cannot see or stop the flows in time. Gatekeepers can.' },
        { id: 'b', text: 'The firm can safely scale back its programme as long as it promises to cooperate fully with any police or regulator request that happens to arrive at a later date.', correct: false, why: 'Reactive cooperation does not satisfy the standing preventive duties to run CDD, monitoring and reporting.' },
        { id: 'c', text: 'Prosecution is enough on its own, and the AML programme is really just reputational insurance.', correct: false, why: 'This misreads the regime. The duties are legal obligations precisely because prosecution alone proved insufficient.' },
        { id: 'd', text: 'AML rules are guidance, so the cost-benefit call is the board’s to make commercially.', correct: false, why: 'They are binding obligations on obliged entities, not discretionary guidance.' },
      ],
    },
  },

  // ── M1.4 the-global-architecture-fatf-fius-supervisors ────────────────────
  {
    id: 'arch-bodies-match',
    conceptTags: ['fatf', 'fsrb', 'fiu', 'egmont_group'],
    mechanic: 'match',
    title: 'Who does what',
    spec: {
      kind: 'match',
      prompt: 'Match each body in the global AML/CFT architecture to its role.',
      pairs: [
        { id: 'fatf', left: 'FATF', right: 'Sets the global standards and runs mutual evaluations.', why: 'FATF is the standard-setter and peer-review body, not an operator or enforcer.' },
        { id: 'fsrb', left: 'FSRB', right: 'A regional body that applies and assesses the FATF standards among its members.', why: 'FATF-style regional bodies extend the peer-review network regionally, for example APG or MONEYVAL.' },
        { id: 'fiu', left: 'Financial intelligence unit', right: 'Receives suspicious-activity reports, analyses them, and disseminates intelligence.', why: 'The FIU is the national hub for reports and financial intelligence, distinct from the supervisor.' },
        { id: 'egmont', left: 'Egmont Group', right: 'The network through which FIUs securely exchange intelligence across borders.', why: 'Egmont is the channel for FIU-to-FIU cooperation, not a standard-setter.' },
      ],
    },
  },
  {
    id: 'arch-routing-sort',
    conceptTags: ['fatf', 'fiu', 'egmont_group'],
    mechanic: 'sort',
    title: 'Route the question',
    spec: {
      kind: 'sort',
      prompt: 'Each task below belongs to a different part of the architecture. Sort them.',
      buckets: [
        { id: 'fatf', label: 'FATF' },
        { id: 'fiu', label: 'FIU' },
        { id: 'supervisor', label: 'National supervisor' },
      ],
      items: [
        { id: 'r1', label: 'Decide whether a country goes on the grey list for strategic deficiencies.', bucket: 'fatf', why: 'List decisions sit with FATF through its review process.' },
        { id: 'r2', label: 'Receive and analyse a bank’s suspicious-activity report.', bucket: 'fiu', why: 'Report receipt and analysis is the FIU’s core function.' },
        { id: 'r3', label: 'Examine a bank’s AML programme and impose a penalty for failures.', bucket: 'supervisor', why: 'Supervision and enforcement of obliged entities is the supervisor’s role.' },
        { id: 'r4', label: 'Publish the global standard on beneficial-ownership transparency.', bucket: 'fatf', why: 'Standard-setting is FATF’s job.' },
        { id: 'r5', label: 'Request financial intelligence held by another country’s FIU.', bucket: 'fiu', why: 'Cross-border intelligence requests run FIU-to-FIU, through the Egmont channel.' },
      ],
    },
  },
  {
    id: 'arch-greylist-decision',
    conceptTags: ['mutual_evaluation', 'fatf'],
    mechanic: 'decision',
    title: 'A country is grey-listed',
    spec: {
      kind: 'decision',
      prompt:
        'A jurisdiction your bank deals with is placed on the FATF grey list. What does this properly mean for your risk view?',
      options: [
        { id: 'a', text: 'It signals identified strategic deficiencies under a remediation plan, a reason to weigh higher country risk in your assessment and due diligence.', correct: true, why: 'Grey-listing is increased monitoring with a fix plan. It feeds your risk-based view; it is not an automatic prohibition.' },
        { id: 'b', text: 'Every transaction with that country is now prohibited, and all existing relationships there must be exited immediately to avoid breaching sanctions.', correct: false, why: 'Grey-listing is not a sanctions regime or a ban. That badly overstates it.' },
        { id: 'c', text: 'Nothing changes, because the list is political and has no bearing on how you assess country risk.', correct: false, why: 'Dismissing it understates a recognised risk signal supervisors expect you to weigh.' },
        { id: 'd', text: 'You must file a suspicious-activity report on every customer connected to that country.', correct: false, why: 'A country listing is not, by itself, suspicion about a specific customer or transaction.' },
      ],
    },
  },

  // ── M2.1 structure-of-the-40-recommendations ──────────────────────────────
  {
    id: 'recs-groupings-sort',
    conceptTags: ['policy_groupings', 'fatf_recommendations'],
    mechanic: 'sort',
    title: 'Into the right grouping',
    spec: {
      kind: 'sort',
      prompt:
        'The 40 Recommendations are organised into thematic groupings. Sort each topic into the grouping that governs it.',
      buckets: [
        { id: 'preventive', label: 'Preventive measures' },
        { id: 'transparency', label: 'Transparency and beneficial ownership' },
        { id: 'authorities', label: 'Powers of authorities' },
        { id: 'cooperation', label: 'International cooperation' },
      ],
      items: [
        { id: 's1', label: 'Customer due diligence and record-keeping by banks.', bucket: 'preventive', why: 'CDD sits in the preventive-measures block, around Recommendations 10 to 11.' },
        { id: 's2', label: 'Identifying the beneficial owners of companies and trusts.', bucket: 'transparency', why: 'Beneficial-ownership transparency is its own grouping, Recommendations 24 to 25.' },
        { id: 's3', label: 'The powers of the financial intelligence unit.', bucket: 'authorities', why: 'FIU and supervisory powers sit in the authorities grouping, around Recommendations 26 to 31.' },
        { id: 's4', label: 'Mutual legal assistance and extradition between countries.', bucket: 'cooperation', why: 'Cross-border assistance is the international-cooperation grouping, Recommendations 36 to 40.' },
        { id: 's5', label: 'Suspicious-transaction reporting obligations.', bucket: 'preventive', why: 'Reporting duties on obliged entities are preventive measures, Recommendations 20 to 21.' },
      ],
    },
  },
  {
    id: 'recs-instruments-match',
    conceptTags: ['interpretive_notes', 'fatf_recommendations'],
    mechanic: 'match',
    title: 'Where the rule lives',
    spec: {
      kind: 'match',
      prompt: 'Match each part of the FATF text to what it does.',
      pairs: [
        { id: 'rec', left: 'A Recommendation', right: 'The high-level standard a country must meet.', why: 'The Recommendation states the obligation in principle.' },
        { id: 'inr', left: 'An Interpretive Note', right: 'The detailed, binding guidance on how to apply a Recommendation.', why: 'Much of the operative detail lives in the Interpretive Notes, not the headline Recommendation.' },
        { id: 'glossary', left: 'The Glossary', right: 'The defined meaning of key terms used across the Recommendations.', why: 'Definitions such as beneficial owner or PEP are fixed in the Glossary and carry throughout.' },
      ],
    },
  },
  {
    id: 'recs-lookup-decision',
    conceptTags: ['fatf_recommendations', 'policy_groupings'],
    mechanic: 'decision',
    title: 'Find the governing rule',
    spec: {
      kind: 'decision',
      prompt:
        'You need the global standard on how a bank should identify and verify the beneficial owner of a corporate customer. Where do you look first?',
      options: [
        { id: 'a', text: 'The customer-due-diligence Recommendation and its Interpretive Note, read with the beneficial-ownership transparency Recommendations.', correct: true, why: 'CDD carries the bank’s duty to identify the beneficial owner, supported by the transparency Recommendations.' },
        { id: 'b', text: 'The international-cooperation grouping, on the basis that beneficial ownership frequently spans borders and so must be governed by the cross-border Recommendations.', correct: false, why: 'Cross-border cooperation is a different grouping. It does not set the bank’s own CDD duty.' },
        { id: 'c', text: 'The Recommendation on terrorist financing, because hidden ownership is a terrorism risk.', correct: false, why: 'The TF Recommendations are a separate section and are not where the identification duty lives.' },
        { id: 'd', text: 'Whichever national law applies, since FATF does not address beneficial ownership.', correct: false, why: 'FATF does address it directly, in the CDD and transparency Recommendations.' },
      ],
    },
  },

  // ── M2.2 risk-based-approach-as-operating-principle ───────────────────────
  {
    id: 'rba-consistency-sort',
    conceptTags: ['risk_based_approach', 'rba', 'proportionality'],
    mechanic: 'sort',
    title: 'Is this the risk-based approach?',
    spec: {
      kind: 'sort',
      prompt:
        'The RBA means allocating effort in proportion to risk, and being able to justify it. Sort each practice.',
      buckets: [
        { id: 'rba', label: 'Consistent with the RBA' },
        { id: 'not', label: 'Not the RBA' },
      ],
      items: [
        { id: 'b1', label: 'Applying enhanced due diligence to higher-risk customers and simplified measures to lower-risk ones.', bucket: 'rba', why: 'Calibrating effort to assessed risk is the heart of the RBA.' },
        { id: 'b2', label: 'Documenting a risk assessment that justifies where controls are concentrated.', bucket: 'rba', why: 'A defensible, documented basis is what supervisors test.' },
        { id: 'b3', label: 'Exiting an entire customer category wholesale to avoid the cost of managing it.', bucket: 'not', why: 'Blanket de-risking is the opposite of assessing and managing risk case by case.' },
        { id: 'b4', label: 'Applying the same checklist to every customer regardless of risk.', bucket: 'not', why: 'Uniform treatment ignores risk. That is the rule-based posture the RBA replaces.' },
        { id: 'b5', label: 'Treating low risk as no risk and switching off monitoring entirely.', bucket: 'not', why: 'The RBA never licenses zero controls. Lower risk still requires proportionate monitoring.' },
      ],
    },
  },
  {
    id: 'rba-defensibility-decision',
    conceptTags: ['proportionality', 'risk_based_approach'],
    mechanic: 'decision',
    title: 'Defend the allocation',
    spec: {
      kind: 'decision',
      prompt:
        'A supervisor asks why your bank applies lighter monitoring to a whole product line. Which answer is defensible under the RBA?',
      options: [
        { id: 'a', text: 'A documented risk assessment rated the product lower risk on evidenced factors, and the lighter monitoring is proportionate to that rating.', correct: true, why: 'The RBA is defensible when the lower treatment follows from a documented, evidenced assessment.' },
        { id: 'b', text: 'The product is one of the bank’s most profitable lines and heavier monitoring would slow approvals and hurt the customer experience.', correct: false, why: 'Commercial convenience is not a risk rationale. This is exactly what draws enforcement.' },
        { id: 'c', text: 'No one has ever filed a report on that product, so it must be low risk.', correct: false, why: 'Absence of past reports is not an assessment. It may mean the monitoring simply is not catching anything.' },
        { id: 'd', text: 'The vendor platform applies the same settings to that product across all its bank clients.', correct: false, why: 'Inheriting a vendor default is not your own documented, risk-based judgement.' },
      ],
    },
  },
  {
    id: 'rba-terms-match',
    conceptTags: ['rba', 'risk_assessment'],
    mechanic: 'match',
    title: 'The vocabulary of the RBA',
    spec: {
      kind: 'match',
      prompt: 'Match each term to its meaning.',
      pairs: [
        { id: 'ra', left: 'Risk assessment', right: 'The documented basis that identifies and rates the firm’s ML/TF risks.', why: 'It is the foundation the whole programme is built on and judged against.' },
        { id: 'edd', left: 'Enhanced due diligence', right: 'The heavier measures applied where risk is higher.', why: 'EDD is the RBA scaling controls up for higher-risk relationships.' },
        { id: 'sdd', left: 'Simplified due diligence', right: 'The lighter measures permitted where risk is demonstrably lower.', why: 'SDD is allowed only on an evidenced low-risk basis, never as a default.' },
      ],
    },
  },

  // ── M2.3 enterprise-wide-risk-assessment ──────────────────────────────────
  {
    id: 'ewra-sequence',
    conceptTags: ['ewra', 'inherent_risk', 'residual_risk', 'control_effectiveness'],
    mechanic: 'sequence',
    title: 'From inherent to residual',
    spec: {
      kind: 'sequence',
      prompt: 'Put the steps of an enterprise-wide risk assessment in the order they are performed.',
      steps: [
        { id: 'inherent', label: 'Assess inherent risk: the ML/TF risk the business faces before any controls, across customers, products, geographies and channels.', why: 'You start from the raw exposure, so you know what the controls have to cover.' },
        { id: 'controls', label: 'Evaluate control effectiveness: how well the existing controls actually mitigate that inherent risk.', why: 'Controls are assessed on whether they work, not whether they merely exist on paper.' },
        { id: 'residual', label: 'Determine residual risk: what remains after the controls, and whether it sits within risk appetite.', why: 'Residual risk is the output that drives where to strengthen controls or formally accept risk.' },
      ],
    },
  },
  {
    id: 'ewra-sort',
    conceptTags: ['inherent_risk', 'control_effectiveness', 'residual_risk'],
    mechanic: 'sort',
    title: 'Inherent, control, or residual?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each item by where it belongs in the risk equation.',
      buckets: [
        { id: 'inherent', label: 'Inherent risk' },
        { id: 'control', label: 'Control' },
        { id: 'residual', label: 'Residual risk' },
      ],
      items: [
        { id: 'e1', label: 'A large share of customers are non-resident with complex ownership.', bucket: 'inherent', why: 'Customer mix is a driver of inherent exposure, before controls.' },
        { id: 'e2', label: 'Transaction monitoring with scenarios tuned to the bank’s products.', bucket: 'control', why: 'Monitoring is a mitigating control applied against the inherent risk.' },
        { id: 'e3', label: 'The exposure that remains after controls, judged against risk appetite.', bucket: 'residual', why: 'That is the definition of residual risk.' },
        { id: 'e4', label: 'Offering cross-border correspondent services in high-risk corridors.', bucket: 'inherent', why: 'Product and geography are inherent-risk dimensions.' },
        { id: 'e5', label: 'Sanctions screening at onboarding and at payment.', bucket: 'control', why: 'Screening is a control that reduces inherent risk.' },
      ],
    },
  },
  {
    id: 'ewra-critique-decision',
    conceptTags: ['ewra', 'control_effectiveness'],
    mechanic: 'decision',
    title: 'Critique the assessment',
    spec: {
      kind: 'decision',
      prompt:
        'A bank’s enterprise risk assessment rates every business line low residual risk but never documents how control effectiveness was tested. What is the core problem?',
      options: [
        { id: 'a', text: 'Residual risk is asserted, not derived: without testing control effectiveness, the low ratings have no defensible basis.', correct: true, why: 'Residual risk only means something once inherent risk and tested control effectiveness support it.' },
        { id: 'b', text: 'There is no real problem here, because rating every line low keeps the programme efficient and is itself a proportionate, risk-based outcome.', correct: false, why: 'Uniform low ratings are a red flag, not efficiency. They suggest the assessment was not really performed.' },
        { id: 'c', text: 'The only issue is presentation: the conclusions are sound but belong in a table.', correct: false, why: 'The defect is substantive, not formatting. The effectiveness analysis is missing.' },
        { id: 'd', text: 'It should have used an external consultant, which would make the ratings valid.', correct: false, why: 'Who performs it does not cure the missing control-effectiveness evidence.' },
      ],
    },
  },

  // ── M2.4 customer-risk-rating-models ──────────────────────────────────────
  {
    id: 'crr-classify',
    conceptTags: ['customer_risk_rating', 'high_risk_customer', 'risk_factors'],
    mechanic: 'risk-classify',
    title: 'Rate the customers',
    spec: {
      kind: 'risk-classify',
      prompt: 'Assign each customer the risk tier your model should output.',
      items: [
        { id: 'c1', label: 'A salaried local resident with a simple current account and regular salary credits.', tier: 'low', why: 'Transparent profile, low-risk product and geography.' },
        { id: 'c2', label: 'A foreign private-banking client who is a senior public official, even with a documented wealth source.', tier: 'high', why: 'PEP status drives a high rating and EDD regardless of documentation.' },
        { id: 'c3', label: 'A small import-export company trading with medium-risk jurisdictions, ownership clear.', tier: 'medium', why: 'Cross-border trade lifts it above low, but clear ownership keeps it from high.' },
      ],
    },
  },
  {
    id: 'crr-factors-sort',
    conceptTags: ['risk_factors', 'customer_risk_rating'],
    mechanic: 'sort',
    title: 'Which way does it move risk?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each attribute by its effect on a customer’s risk rating.',
      buckets: [
        { id: 'raises', label: 'Raises risk' },
        { id: 'lowers', label: 'Lowers risk' },
        { id: 'neutral', label: 'Largely neutral' },
      ],
      items: [
        { id: 'f1', label: 'Ownership through layered offshore companies with no clear rationale.', bucket: 'raises', why: 'Opaque structures obscure the beneficial owner and raise risk.' },
        { id: 'f2', label: 'A long, well-documented relationship with consistent, explained activity.', bucket: 'lowers', why: 'Transparency and a track record are mitigating factors.' },
        { id: 'f3', label: 'The customer banks online rather than in a branch.', bucket: 'neutral', why: 'Digital channel alone is a weak signal once identity is verified, not a strong driver either way.' },
        { id: 'f4', label: 'The customer is a close associate of a senior foreign political figure.', bucket: 'raises', why: 'PEP proximity is a recognised higher-risk factor.' },
        { id: 'f5', label: 'Operations concentrated in a high-risk jurisdiction.', bucket: 'raises', why: 'Geography is a core risk factor.' },
      ],
    },
  },
  {
    id: 'crr-calibration-decision',
    conceptTags: ['model_calibration', 'customer_risk_rating'],
    mechanic: 'decision',
    title: 'The model never changes',
    spec: {
      kind: 'decision',
      prompt:
        'A customer-risk-rating model has not been recalibrated in years, yet almost no customers ever score high. What is the right read?',
      options: [
        { id: 'a', text: 'The model may be miscalibrated: validate it against outcomes and known high-risk cases, then recalibrate the factors and weights.', correct: true, why: 'A model that rarely flags high risk, untested for years, likely under-rates. Validation against real outcomes is the fix.' },
        { id: 'b', text: 'It is clearly working well, and the small number of high-risk customers is simply evidence that the bank has a clean, well-chosen book.', correct: false, why: 'That assumes the output is correct. The pattern more often means the model is not detecting risk.' },
        { id: 'c', text: 'Have analysts override ratings upward case by case as they see fit, and leave the model itself unchanged.', correct: false, why: 'Ad hoc overrides without fixing the model are unauditable and do not address the root cause.' },
        { id: 'd', text: 'Lower the high-risk threshold so more customers score high, without checking whether they truly are.', correct: false, why: 'Tuning to a target count, rather than to evidence, just creates noise and false positives.' },
      ],
    },
  },
  // Rollout modules (CDD, monitoring, sanctions, typologies, frameworks,
  // governance, tools, broader landscape) live in scenarios-rollout.ts to keep
  // this file readable.
  ...ROLLOUT_SCENARIOS,
]

/** All scenarios whose concepts intersect the given lesson concepts. */
export function scenariosForConcepts(conceptTags: string[]): ChallengeScenario[] {
  const set = new Set(conceptTags)
  return SCENARIO_BANK.filter((s) => s.conceptTags.some((t) => set.has(t)))
}
