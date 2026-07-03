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

  // ════════════════════════════════════════════════════════════════════════
  // Module 1: Cryptoasset and Blockchain Foundations
  // ════════════════════════════════════════════════════════════════════════
  // Lesson: how-blockchains-work
  {
    id: 'ccas-blockchain-terms-match',
    conceptTags: ['distributed_ledger', 'consensus_mechanisms', 'immutability', 'nodes'],
    mechanic: 'match',
    title: 'How a blockchain holds together',
    spec: {
      kind: 'match',
      prompt: 'Match each building block to what it does.',
      pairs: [
        { id: 'ledger', left: 'Distributed ledger', right: 'One shared record of transactions held by many participants at once.', why: 'No single copy to tamper with quietly.' },
        { id: 'consensus', left: 'Consensus mechanism', right: 'The rule by which the network agrees which new block is valid.', why: 'Consensus is how agreement is reached without a central authority.' },
        { id: 'immutability', left: 'Immutability', right: 'Once confirmed, a transaction is practically impossible to alter or remove.', why: 'History is append-only.' },
        { id: 'node', left: 'Node', right: 'A participant that stores the ledger and helps check new transactions.', why: 'Nodes enforce the rules independently.' },
      ],
    },
  },
  {
    id: 'ccas-blockchain-immutable-decision',
    conceptTags: ['immutability', 'distributed_ledger'],
    mechanic: 'decision',
    title: 'Can the admin just reverse it?',
    spec: {
      kind: 'decision',
      prompt:
        'A customer sends funds to the wrong address and asks you to have the network administrator reverse the confirmed transaction. What is the right answer?',
      options: [
        {
          id: 'a',
          text: 'There is no administrator who can reverse a confirmed transaction; the ledger is immutable, so recovery depends on the counterparty returning the funds or a legal process.',
          correct: true,
          why: 'A public blockchain has no central operator with a reversal switch; immutability is the whole point.',
        },
        {
          id: 'b',
          text: 'The network administrator can reverse any confirmed transaction on request, in the same way a bank can recall a mistaken wire transfer between two accounts that it fully controls internally.',
          correct: false,
          why: 'There is no such administrator on a public chain, and confirmed transactions are not recallable that way.',
        },
        {
          id: 'c',
          text: 'The miners or validators can simply vote to delete the transaction from the history whenever a user asks them to.',
          correct: false,
          why: 'Validators extend the chain; they do not delete confirmed history on request.',
        },
        {
          id: 'd',
          text: 'The transaction will automatically reverse itself after a set number of days if the recipient does not respond.',
          correct: false,
          why: 'There is no automatic expiry or reversal of a confirmed transfer.',
        },
      ],
    },
  },
  {
    id: 'ccas-blockchain-public-permissioned-sort',
    conceptTags: ['public_vs_permissioned', 'nodes', 'consensus_mechanisms'],
    mechanic: 'sort',
    title: 'Public, or permissioned?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each trait to the kind of chain it describes.',
      buckets: [
        { id: 'public', label: 'Public / permissionless' },
        { id: 'permissioned', label: 'Permissioned' },
      ],
      items: [
        { id: 'p1', label: 'Anyone can run a node and help validate, with no gatekeeper.', bucket: 'public', why: 'Open participation is the defining trait.' },
        { id: 'p2', label: 'Only a known, vetted set of participants may validate.', bucket: 'permissioned', why: 'Access is controlled by an operator or consortium.' },
        { id: 'p3', label: 'The full transaction history is visible to anyone.', bucket: 'public', why: 'Public chains publish the whole ledger.' },
        { id: 'p4', label: 'A central operator can decide who joins and what they see.', bucket: 'permissioned', why: 'Gatekept membership is a permissioned feature.' },
        { id: 'p5', label: 'There is no single party that can freeze the network at will.', bucket: 'public', why: 'No central control point is a public-chain property.' },
      ],
    },
  },

  // Lesson: keys-addresses-and-wallets
  {
    id: 'ccas-wallets-terms-match',
    conceptTags: ['custodial_vs_non_custodial', 'hot_vs_cold', 'multisig', 'self_hosted_wallets'],
    mechanic: 'match',
    title: 'The wallet vocabulary',
    spec: {
      kind: 'match',
      prompt: 'Match each wallet term to what it means.',
      pairs: [
        { id: 'custodial', left: 'Custodial wallet', right: 'A service holds the private keys and controls the funds on the user behalf.', why: 'The custodian is the control point.' },
        { id: 'selfhosted', left: 'Self-hosted wallet', right: 'The user holds their own private keys, with no service in between.', why: 'Non-custodial means the user has sole control.' },
        { id: 'coldhot', left: 'Cold wallet', right: 'Key storage kept offline to reduce the risk of remote theft.', why: 'Cold storage is offline; hot is connected.' },
        { id: 'multisig', left: 'Multisignature', right: 'An arrangement where several keys must approve a transaction before it can move.', why: 'Multisig spreads control across keys.' },
      ],
    },
  },
  {
    id: 'ccas-wallets-control-decision',
    conceptTags: ['private_key_control', 'custodial_vs_non_custodial', 'regulatory_attachment'],
    mechanic: 'decision',
    title: 'Who actually controls the coins?',
    spec: {
      kind: 'decision',
      prompt:
        'A customer says holding crypto in their account at an exchange is exactly the same as holding it in their own self-hosted wallet. From an AFC control view, what is the key difference?',
      options: [
        {
          id: 'a',
          text: 'With the exchange the service holds the keys and controls the funds, so it is the regulated control point; with a self-hosted wallet the customer holds the keys themselves.',
          correct: true,
          why: 'Whoever holds the private key controls the coins, which is what determines where the obliged-entity duties attach.',
        },
        {
          id: 'b',
          text: 'There is no difference at all: in both cases the customer keeps sole, direct control of the private keys, and the exchange is merely a convenient viewing window onto coins the customer already holds.',
          correct: false,
          why: 'A custodial exchange holds the keys; the customer does not have sole control.',
        },
        {
          id: 'c',
          text: 'The self-hosted wallet is the regulated control point, while the exchange balance sits entirely outside any AML framework.',
          correct: false,
          why: 'It is the reverse: the custodial exchange is the VASP where obligations attach.',
        },
        {
          id: 'd',
          text: 'Only the amount matters; who holds the keys has no bearing on where compliance responsibility sits.',
          correct: false,
          why: 'Key control, not amount, is what locates the responsible party.',
        },
      ],
    },
  },
  {
    id: 'ccas-wallets-control-point-sort',
    conceptTags: ['custodial_vs_non_custodial', 'self_hosted_wallets', 'regulatory_attachment'],
    mechanic: 'sort',
    title: 'Where does control sit?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each arrangement by who holds the keys.',
      buckets: [
        { id: 'service', label: 'A service holds the keys (custodial)' },
        { id: 'user', label: 'The user holds the keys (self-hosted)' },
      ],
      items: [
        { id: 'w1', label: 'A balance on a centralised exchange the customer logs into.', bucket: 'service', why: 'The exchange custodies the keys.' },
        { id: 'w2', label: 'A hardware wallet whose seed phrase only the customer knows.', bucket: 'user', why: 'Sole key control rests with the user.' },
        { id: 'w3', label: 'A hosted wallet app where the provider can move funds for the user.', bucket: 'service', why: 'Provider key control makes it custodial.' },
        { id: 'w4', label: 'A browser wallet where transactions are signed only on the user device.', bucket: 'user', why: 'Signing stays with the user.' },
      ],
    },
  },

  // Lesson: how-on-chain-transactions-work
  {
    id: 'ccas-txn-lifecycle-sequence',
    conceptTags: ['transaction_lifecycle', 'transaction_confirmation'],
    mechanic: 'sequence',
    title: 'The life of a transaction',
    spec: {
      kind: 'sequence',
      prompt: 'Put the stages of an on-chain transaction in order.',
      steps: [
        { id: 's1', label: 'The sender creates and signs the transaction in their wallet.', why: 'Signing happens wallet-side, before anything is public.' },
        { id: 's2', label: 'The transaction is broadcast to the network and waits in the mempool.', why: 'Broadcast is the first public step.' },
        { id: 's3', label: 'A validator includes it in a new block.', why: 'Inclusion is when it lands on the chain.' },
        { id: 's4', label: 'Further blocks build on top, confirming it.', why: 'Confirmations deepen as the chain grows.' },
      ],
    },
  },
  {
    id: 'ccas-txn-change-decision',
    conceptTags: ['change_addresses', 'pseudonymity'],
    mechanic: 'decision',
    title: 'Payment, or change?',
    spec: {
      kind: 'decision',
      prompt:
        'Tracing a transaction, an analyst sees most of the value go to a brand-new address and concludes it is a payment to a third party. Why should they be careful?',
      options: [
        {
          id: 'a',
          text: 'The new address may be a change address that returns the leftover value to the sender, so the flow could still be the sender paying themselves rather than a third party.',
          correct: true,
          why: 'Change outputs routinely go to fresh addresses the sender controls; assuming a third party misreads the graph.',
        },
        {
          id: 'b',
          text: 'A brand-new address is conclusive proof of a payment to a different person, on the reasoning that a sender never reuses an old address and never controls more than one address at any time.',
          correct: false,
          why: 'Senders frequently control many addresses, including change addresses.',
        },
        {
          id: 'c',
          text: 'The value going to a new address means the funds have left the blockchain entirely and can no longer be followed.',
          correct: false,
          why: 'Value to a new on-chain address is still on the chain and traceable.',
        },
        {
          id: 'd',
          text: 'A new address always belongs to an exchange, so the analyst can stop and treat it as a cash-out.',
          correct: false,
          why: 'A fresh address is not automatically an exchange deposit.',
        },
      ],
    },
  },
  {
    id: 'ccas-txn-model-match',
    conceptTags: ['utxo_vs_account', 'transaction_confirmation', 'on_chain_transparency'],
    mechanic: 'match',
    title: 'Transaction ideas, defined',
    spec: {
      kind: 'match',
      prompt: 'Match each idea to what it means.',
      pairs: [
        { id: 'utxo', left: 'UTXO model', right: 'Balances are unspent outputs that are consumed and recreated by each transaction.', why: 'Bitcoin-style accounting by outputs.' },
        { id: 'account', left: 'Account model', right: 'Balances are held per account and debited or credited directly.', why: 'Ethereum-style accounting by balances.' },
        { id: 'confirmation', left: 'Confirmation', right: 'A later block building on the one that included a transaction, deepening its finality.', why: 'More confirmations, more settled.' },
        { id: 'mempool', left: 'Mempool', right: 'The waiting area of broadcast transactions not yet included in a block.', why: 'Pending, not yet confirmed.' },
      ],
    },
  },
]
