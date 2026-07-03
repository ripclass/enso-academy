// lib/cases/ccas-scenario-bank.ts
//
// The CCAS "Apply it" scenario bank. SEED SOURCE ONLY: these are published into
// the DB-backed challenge_scenarios table (course_id = ccas) by
// scripts/seed-ccas-challenge-scenarios.ts, and getLessonChallenge serves CCAS
// purely from that table. They are deliberately NOT added to the in-code
// SCENARIO_BANK (which is CAMS-only, and is the in-code floor for CAMS): keeping
// CCAS out of it is what stops CAMS scenarios leaking into CCAS lessons and vice
// versa (see IN_CODE_BANK_COURSE in lib/lesson/challenge-config.ts).
//
// PILOT SCOPE: Module 3 (Blockchain Analytics and On-Chain Investigation), two
// lessons only. The module's third lesson, conducting-an-on-chain-investigation,
// is a FREE PREVIEW lesson, so it is intentionally excluded from the pilot.
// Scenarios are synthetic and concept-true: they exercise the tracing / analytics
// concepts without restating any real matter's facts.

import type { ChallengeScenario } from './scenario-bank'

export const CCAS_SCENARIO_BANK: ChallengeScenario[] = [
  // ── Lesson: transparency-pseudonymity-and-the-tracing-premise ──────────────
  {
    id: 'ccas-tracing-anonymous-decision',
    conceptTags: ['pseudonymity', 'tracing_premise', 'on_chain_transparency'],
    mechanic: 'decision',
    title: 'Anonymous, or pseudonymous?',
    spec: {
      kind: 'decision',
      prompt:
        'A new analyst says a public blockchain is anonymous, so tracing stolen funds is a waste of time. What is the right correction?',
      options: [
        {
          id: 'a',
          text: 'It is pseudonymous, not anonymous: transactions are public and can be followed address to address, and identifying who controls an address is a separate off-chain step.',
          correct: true,
          why: 'Public chains expose the whole transaction graph; pseudonymity means addresses are not names, so attribution is a distinct off-chain task.',
        },
        {
          id: 'b',
          text: 'It is fully anonymous, so on-chain tracing cannot follow the funds at all, and the analyst is right that there is nothing to be gained by trying.',
          correct: false,
          why: 'Anonymity and pseudonymity are different; the public ledger makes the flow of value followable.',
        },
        {
          id: 'c',
          text: 'It is fully transparent right down to the legal identity behind every address, so a careful trace on its own will reliably name the thief without needing any other data at all.',
          correct: false,
          why: 'The chain shows the route and amounts, never the real-world identity on its own.',
        },
        {
          id: 'd',
          text: 'Only private or permissioned chains can be traced; on a public chain the ledger is hidden from outside investigators.',
          correct: false,
          why: 'Public blockchains are the transparent case; the open ledger is exactly what makes tracing possible.',
        },
      ],
    },
  },
  {
    id: 'ccas-tracing-terms-match',
    conceptTags: ['on_chain_transparency', 'pseudonymity', 'tracing_premise', 'off_chain_attribution'],
    mechanic: 'match',
    title: 'The tracing vocabulary',
    spec: {
      kind: 'match',
      prompt: 'Match each idea to what it means.',
      pairs: [
        {
          id: 'transparency',
          left: 'Transparency',
          right: 'Every transaction on a public chain is visible to anyone in one shared ledger.',
          why: 'The openness of the ledger is what a trace relies on.',
        },
        {
          id: 'pseudonymity',
          left: 'Pseudonymity',
          right: 'Addresses are not linked to real-world identities by the chain itself.',
          why: 'An address is a pseudonym, not a name.',
        },
        {
          id: 'premise',
          left: 'Tracing premise',
          right: 'Value can be followed hop to hop, but the chain proves the route, not the identity.',
          why: 'The premise and its limit in one line.',
        },
        {
          id: 'offchain',
          left: 'Off-chain attribution',
          right: 'Linking an address to a person or business using data from outside the chain, such as exchange KYC.',
          why: 'Identity comes from off-chain sources.',
        },
      ],
    },
  },
  {
    id: 'ccas-tracing-onchain-offchain-sort',
    conceptTags: ['on_chain_transparency', 'off_chain_attribution'],
    mechanic: 'sort',
    title: 'On the chain, or off it?',
    spec: {
      kind: 'sort',
      prompt:
        'Which of these can the public ledger show on its own, and which need data from off the chain?',
      buckets: [
        { id: 'onchain', label: 'On-chain, visible to anyone' },
        { id: 'offchain', label: 'Needs off-chain data' },
      ],
      items: [
        {
          id: 'i1',
          label: 'The amount of value moved in a transaction',
          bucket: 'onchain',
          why: 'Amounts are recorded on the public ledger.',
        },
        {
          id: 'i2',
          label: 'The flow of funds from one address to the next',
          bucket: 'onchain',
          why: 'The transaction graph is public.',
        },
        {
          id: 'i3',
          label: 'The legal name of the person controlling an address',
          bucket: 'offchain',
          why: 'Identity is never written on the chain itself.',
        },
        {
          id: 'i4',
          label: 'Which exchange account a deposit finally landed in',
          bucket: 'offchain',
          why: 'That comes from the exchange KYC records, off the chain.',
        },
        {
          id: 'i5',
          label: 'The time a transaction was confirmed',
          bucket: 'onchain',
          why: 'Block timestamps are on the ledger.',
        },
      ],
    },
  },

  // ── Lesson: clustering-attribution-and-exposure-analysis ───────────────────
  {
    id: 'ccas-exposure-indirect-decision',
    conceptTags: ['exposure_scoring', 'entity_attribution'],
    mechanic: 'decision',
    title: 'Two hops from a sanctioned cluster',
    spec: {
      kind: 'decision',
      prompt:
        'A customer deposit traces back, two hops through a large licensed exchange, to a cluster attributed to a sanctioned actor. How should you read this exposure?',
      options: [
        {
          id: 'a',
          text: 'Indirect exposure: weight it by the hops and the intermediary, investigate the source, but do not treat it as if the customer received sanctioned funds directly.',
          correct: true,
          why: 'Indirect exposure through an intermediary is a real but weaker signal than a direct hit; it warrants investigation, not an automatic direct-sanctions conclusion.',
        },
        {
          id: 'b',
          text: 'Direct sanctioned exposure: freeze and report at once as though the funds came straight from the sanctioned wallet, with no further tracing or analysis required.',
          correct: false,
          why: 'Two hops through a licensed exchange is not the same as a direct transfer from the sanctioned address.',
        },
        {
          id: 'c',
          text: 'No exposure at all: because a licensed exchange sits in between, the trail is broken and the earlier sanctioned hop can be ignored entirely.',
          correct: false,
          why: 'An intermediary does not erase exposure; indirect exposure is still assessed, just weighted.',
        },
        {
          id: 'd',
          text: 'It only matters if the amount is large; a small deposit two hops away carries no risk worth assessing.',
          correct: false,
          why: 'Exposure to a sanctioned cluster is a risk signal regardless of amount; value affects severity, not whether you assess it.',
        },
      ],
    },
  },
  {
    id: 'ccas-exposure-redflags',
    conceptTags: ['exposure_scoring', 'address_clustering'],
    mechanic: 'red-flags',
    title: 'Reading a wallet exposure',
    spec: {
      kind: 'red-flags',
      scenario: 'You run exposure analysis on a customer wallet before approving a large withdrawal.',
      prompt: 'Which findings are genuine red flags on the wallet?',
      items: [
        {
          id: 'a',
          label: 'A large share of its funds trace directly to a cluster attributed to a darknet market.',
          flag: true,
          why: 'Direct exposure to a darknet market is a strong illicit-source signal.',
        },
        {
          id: 'b',
          label: 'A meaningful portion of value arrived directly from a mixer, with no other explanation.',
          flag: true,
          why: 'Direct mixer exposure is a classic obfuscation red flag.',
        },
        {
          id: 'c',
          label: 'Most of its history is deposits from and withdrawals to a licensed, KYC exchange.',
          flag: false,
          why: 'Activity with a regulated exchange is expected and reassuring, not a flag.',
        },
        {
          id: 'd',
          label: 'A small share traces, many hops away, to a mainstream exchange that serves millions of ordinary users.',
          flag: false,
          why: 'Distant, indirect exposure through a mainstream exchange is weak on its own.',
        },
        {
          id: 'e',
          label: 'A portion traces to an address cluster already attributed to a sanctioned entity.',
          flag: true,
          why: 'Exposure to a sanctioned cluster is a hard risk signal.',
        },
      ],
    },
  },
  {
    id: 'ccas-clustering-terms-match',
    conceptTags: ['address_clustering', 'entity_attribution', 'exposure_scoring', 'analytics_limits'],
    mechanic: 'match',
    title: 'Analytics, defined',
    spec: {
      kind: 'match',
      prompt: 'Match each analytics term to what it means.',
      pairs: [
        {
          id: 'clustering',
          left: 'Address clustering',
          right: 'Grouping addresses that appear to be controlled by the same entity.',
          why: 'Clustering infers common control.',
        },
        {
          id: 'attribution',
          left: 'Entity attribution',
          right: 'Labelling a cluster as a known service or actor, such as an exchange or a mixer.',
          why: 'Attribution puts a name on a cluster.',
        },
        {
          id: 'exposure',
          left: 'Exposure analysis',
          right: 'Measuring how much of a wallet value traces to or from illicit or risky sources.',
          why: 'Exposure quantifies the risky share.',
        },
        {
          id: 'limits',
          left: 'Analytics limits',
          right: 'The reality that heuristics can over-merge, mislabel, or rely on stale data.',
          why: 'Analytics are evidence, not proof.',
        },
      ],
    },
  },
]
