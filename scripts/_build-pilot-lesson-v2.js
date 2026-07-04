// v2 of the "training simulator" pilot for `conducting-an-on-chain-investigation`:
// the full format. Cold-open decision, briefing-voice method scenes, the
// Bitfinex case as a `case-file` INTERACTIVE (evidence card -> committed
// decision -> reveal, three steps), a correct-your-classmate rep, an on-the-
// record sources scene, and a trimmed final check. The runtime adds a
// student-model warm-up after the cover (lib/lesson/warmup.ts).
// All case facts verbatim from the cleared artifact; new text is register and
// decision content only. Builds from the .pre-pilot.bak original.
const fs = require('fs');

const SRC = 'generated/ccas/lessons/conducting-an-on-chain-investigation.json';
const BAK = 'generated/ccas/lessons/conducting-an-on-chain-investigation.json.pre-pilot.bak';

const art = JSON.parse(fs.readFileSync(BAK, 'utf8'));
const orig = art.scenes;
const byTitle = (t) => {
  const s = orig.find((x) => (x.title || '').startsWith(t));
  if (!s) throw new Error('missing scene: ' + t);
  return s;
};

const sShape = byTitle('The shape of an on-chain investigation');
const sTracingSlide = byTitle('Forward, backward, and through the breaks');
const sBridge = byTitle('The identity bridge');
const sBridgeSlide = byTitle('How hard is the identity bridge');
const sAction = byTitle('From trace to action');
const sBitfinex = byTitle('Worked example: the Bitfinex bitcoin');
const sQuiz = byTitle('Check for understanding');
const sSynth = byTitle('What to carry forward');

const cites = sBitfinex.sceneData.citations;
const CITE_DOJ_2022 = cites.find((c) => c.label.includes('Two Arrested'));
const CITE_DOJ_2024 = cites.find((c) => c.label.includes('Sentenced'));
const CITE_FATF_VASP = cites.find((c) => c.label.includes('FATF'));
const CITE_MORGAN = cites.find((c) => c.label.includes('Morgan'));
if (!CITE_DOJ_2022 || !CITE_DOJ_2024 || !CITE_FATF_VASP || !CITE_MORGAN) throw new Error('citation split failed');

// ── 1. Cover, briefing voice ────────────────────────────────────────────────
const sDesk = {
  sceneType: 'reading',
  title: 'You are on the desk',
  teachesConcepts: ['investigation_workflow'],
  conceptTags: ['investigation_workflow'],
  sceneData: {
    body:
      'Sit down. The file is yours.\n\nThis is not a lecture about on-chain investigation; it is a shift on the desk, and I am the colleague across from you. You will make every important call in this lesson before you see what the investigators actually did. That is the deal, and it is the same deal the exam offers you: judgment first, hindsight never.\n\nIf a warm-up met you before this scene, that was your own record talking: the concepts your past answers say are slipping. From here, it goes like practice goes. An alert lands. Someone senior wants an answer today. You decide first, blind. Make the call honestly; what matters is not whether you get it right, it is noticing how you decide.',
    citations: [
      {
        label: 'FATF Virtual Assets: Red Flag Indicators of Money Laundering and Terrorist Financing (FATF, 2020)',
        url: 'https://www.fatf-gafi.org/en/publications/Methodsandtrends/Virtual-assets-red-flag-indicators.html',
      },
    ],
  },
};

// ── 2. Cold open (unchanged from v1) ────────────────────────────────────────
const sColdOpen = {
  sceneType: 'quiz',
  title: 'Cold open: the alert on your desk',
  teachesConcepts: ['off_chain_attribution'],
  conceptTags: ['off_chain_attribution'],
  sceneData: {
    intro:
      'No method yet, no safety net. An alert has landed and your manager wants a decision today. Choose what you would actually do first.',
    questions: [
      {
        prompt:
          "A customer's incoming deposit of 4.1 BTC traces back, two hops, to a cluster your analytics tool labels as proceeds of an exchange theft, confidence unstated. Asked informally, the customer says the funds came from a decentralised yield platform. What do you do first?",
        options: [
          {
            id: 'a',
            text: 'File a suspicious-activity report today: the tool has linked the funds to a theft, the customer story contradicts it, and speed of reporting matters more than certainty of attribution.',
          },
          {
            id: 'b',
            text: 'Freeze the deposit and begin exiting the relationship: contact with stolen funds is a strict-liability event, and every hour the firm holds them increases its own exposure.',
          },
          {
            id: 'c',
            text: 'Reproduce the trace yourself: confirm the two hops, test whether the cluster attribution survives scrutiny, and record the confidence of each link before deciding on any action.',
          },
          {
            id: 'd',
            text: 'Request source-of-funds documentation from the customer and accept the deposit if the paperwork is internally consistent, escalating only if the documents contradict each other.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'If you chose an action, a report, a freeze, a document request, you did what most professionals do under pressure: reached for the response before the evidence. The disciplined first move is to verify the trace and the attribution, because every action you could take is only as defensible as the chain of inference behind it. A vendor label is an inference, not a fact; a customer story is a claim, not a source. The rest of this lesson builds the method that makes the evidence-first reflex automatic.',
        conceptTags: ['investigation_workflow', 'off_chain_attribution'],
      },
    ],
  },
};

// ── 3. The method, rewritten in briefing register (same facts, same citations)
const sMethod = {
  sceneType: 'reading',
  title: 'Debrief: the method you just needed',
  teachesConcepts: ['investigation_workflow'],
  conceptTags: ['investigation_workflow'],
  sceneData: {
    body:
      'Whatever you chose back there, here is the method that should have chosen it for you. I am giving it to you the way I would before handing you a live file, because you will run it under pressure, not in a seminar.\n\nEvery investigation you will ever run follows one pattern. It starts with an **indicator**: a victim’s report of a theft or scam, a monitoring alert, a sanctioned address published by an authority, a ransomware wallet, a tip from law enforcement. The indicator is a single thread. What you do with it is the job.\n\nFirst, you **trace in both directions**. Forward: where did the value go after this address? That chases proceeds toward their destination and eventual cash-out. Backward: where did it come from? That establishes source of funds, and it can connect a suspect address to a known illicit origin. A real file moves both ways from the starting thread.\n\nAs you trace, you **cluster and attribute**, continuously. Raw addresses collapse into entities; entities get matched, with recorded confidence, to real-world actors: exchanges, mixers, markets, named suspects. This is not a phase you schedule. It is the lens you read every hop through, until a confusing spray of addresses resolves into a short story about a few actors.\n\nThen you read the flow toward the **off-ramps**. To become useful, illicit value commonly has to pass through a regulated intermediary: an exchange, a custodian, a payment processor, a place where identity can often be obtained. Those are your chokepoints. A competent investigator is always reading the flow toward them.\n\nAnd at every step, you **document the chain of inference**: every link, every attribution, every confidence level. The rule that decided your cold open decides everything here. An investigation that cannot be explained cannot be acted on.\n\nIndicator, trace, cluster and attribute, find the off-ramps, document. That is the whole method. Now we drill each move, and then you run a real file with it.',
    citations: sShape.sceneData.citations,
  },
};

// ── 5. Branch decision (unchanged from v1) ──────────────────────────────────
const sBranches = {
  sceneType: 'quiz',
  title: 'Decision: three branches, one afternoon',
  teachesConcepts: ['fund_tracing'],
  conceptTags: ['fund_tracing'],
  sceneData: {
    intro: 'Apply the tracing directions you just learned. You have one afternoon and one analyst: you.',
    questions: [
      {
        prompt:
          'Your traced theft funds split three ways: one branch entered a mixer, one sits unmoved in a self-hosted wallet, and one is moving hop by hop toward a large regulated exchange. Which branch gets your afternoon, and why?',
        options: [
          {
            id: 'a',
            text: 'The mixer branch, because obfuscation is where the launderer has concentrated effort, and defeating the hardest technique first unlocks the rest of the trace.',
          },
          {
            id: 'b',
            text: 'The exchange-bound branch, because it is moving toward a regulated intermediary where identity can be obtained and funds can be frozen; the other two get alerts, not your afternoon.',
          },
          {
            id: 'c',
            text: 'The dormant branch, because unmoving funds are the easiest target: value that sits still can be seized at leisure before the holder has a chance to move it.',
          },
          {
            id: 'd',
            text: 'All three equally, splitting your time across them, because prioritising one branch risks missing developments on the others and no branch can be safely ignored.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'A skilled investigator is not following the money for its own sake; they are following it toward a place where identity can be compelled and value can be stopped. The exchange-bound branch is approaching exactly such a place, and it is time-critical: once the funds pass through, continuity breaks. The dormant branch cannot be seized without keys or a custodian, so it needs a movement alert, not an afternoon. The mixer branch needs re-anchoring on the far side, which alerts also serve. Priority follows actionability, not difficulty.',
        conceptTags: ['fund_tracing', 'investigation_workflow'],
      },
    ],
  },
};

// ── 8. The Bitfinex file as a case-file interactive ─────────────────────────
const sCaseFile = {
  sceneType: 'interactive',
  title: 'Work the file',
  teachesConcepts: ['investigation_workflow', 'asset_seizure'],
  conceptTags: ['investigation_workflow', 'asset_seizure'],
  sceneData: {
    title: 'Work the file',
    summary:
      'A real, verified matter, worked the way it arrived: one evidence item at a time, your call before the reveal. The file rotates between matters, so a retake works a different case.',
    spec: {
      kind: 'case-file',
      caseTitle: 'The Bitfinex file, 2016 to 2022',
      intro:
        'Everything in this file is from the public record of the 2016 Bitfinex hack and the 2022 U.S. seizure. Read each evidence card in the examiner’s discipline, observed, source, inference, confidence, then make your move. Only after you commit do you see what the investigators actually did.',
      steps: [
        {
          id: 'theft',
          heading: 'Evidence item 1: the theft',
          evidence: {
            observed:
              'About 119,754 bitcoin left the cryptocurrency exchange Bitfinex in August 2016, across more than 2,000 unauthorised transactions, into one external wallet. Then, almost nothing: the coins sit in the destination wallet and barely move, for months that become years.',
            source:
              'The breach was public and the destination wallet was visible on-chain; both were later set out in the U.S. Department of Justice filings.',
            inference: 'A known theft with a known starting cluster, and a thief in no hurry.',
            confidence:
              'High. The movement sits on the public ledger and is corroborated by the exchange and the later filings.',
          },
          decision: {
            prompt:
              'Resources are finite and other cases are live. What do you do with a wallet that will not move?',
            options: [
              {
                id: 'a',
                text: 'Instrument the cluster: label every address, set movement alerts, and share the addresses with exchange compliance teams so any future deposit from the cluster flags the moment it arrives.',
              },
              {
                id: 'b',
                text: 'Suspend the investigation until the funds move, since analysis of a static wallet produces nothing actionable and the watching cost is not justified against live cases.',
              },
              {
                id: 'c',
                text: 'Push for immediate public attribution of the theft to a named actor, because publicity pressures the thief into abandoning the funds and deters the onward laundering before it starts.',
              },
              {
                id: 'd',
                text: 'Work the on-chain data alone until it yields the holder, since sustained analysis of a static cluster will eventually produce the identity without any off-chain evidence.',
              },
            ],
            correctOptionId: 'a',
            explanation:
              'Dormancy is not dead time; it is preparation time. The trap in the last option is the boundary this module keeps drawing: the chain proves the route, never the identity, and no amount of staring at a static cluster changes that. What dormancy buys you is instrumentation, so that when the funds finally move, every deposit into a regulated service flags on arrival.',
          },
          reveal:
            'The watchers did exactly this: the theft cluster was labelled and monitored, and the wallet’s eventual awakening did not go unnoticed. Years after the theft, the funds began to move, and every move landed on instrumented ground.',
        },
        {
          id: 'layering',
          heading: 'Evidence item 2: the layering years',
          evidence: {
            observed:
              'Over the following years the funds were split and moved, deposited into and withdrawn from virtual-currency exchanges and darknet markets, converted into other coins including privacy-enhanced coins, and partly routed through United States business accounts. Each deposit into a service snapped the visible trail: withdrawals emerged from omnibus wallets, unlinked to what went in.',
            source: 'The DOJ statement of facts.',
            inference:
              'A deliberate, multi-year layering operation using every technique this module has named. The on-chain movements are fact; the purpose of obfuscation is an inference, well supported here, but the kind of claim that must be stated as inference, not fact.',
            confidence:
              'High on the movements themselves; lower at each deliberate break, until an off-chain anchor restores it.',
          },
          decision: {
            prompt:
              'A tranche deposits into a regulated virtual-currency exchange and withdraws to fresh addresses, breaking your continuity. In your file, what is that deposit?',
            options: [
              {
                id: 'a',
                text: 'A dead end: the internal ledger of the service is invisible to you, so route around the exchange and pick the trail up again from behavioural patterns on the far side alone.',
              },
              {
                id: 'b',
                text: 'Evidence of complicity: an exchange that accepted deposits from a theft cluster has demonstrated wilful blindness, so redirect the investigation against the institution itself.',
              },
              {
                id: 'c',
                text: 'A reason to raise confidence: regulated exchanges screen their customers, so funds that have passed through one have effectively been cleaned and can be re-attributed to the new holder.',
              },
              {
                id: 'd',
                text: 'An identity anchor: verify the deposit genuinely belongs to your traced flow, then use lawful process to request the account records the service holds behind that specific deposit.',
              },
            ],
            correctOptionId: 'd',
            explanation:
              'The launderer sees the exchange as a break in the trail; the investigator sees the strongest evidence source in the case. A regulated service holds account records behind every deposit address. The discipline lives in the word verify: a deposit tied to your flow only by a clustering heuristic must be confirmed before you treat it as the target’s, and only then is a lawful request justified.',
          },
          reveal:
            'The investigators treated the off-ramps as exactly that. In the United States a convertible-virtual-currency exchanger is a money-services business under the Bank Secrecy Act, with recordkeeping and suspicious-activity-reporting duties; FATF-aligned VASP regimes supply the equivalent customer-due-diligence duties elsewhere. The confirmed deposits, and the records behind them, pointed toward suspects. Then the case broke somewhere no trace could reach.',
        },
        {
          id: 'keys',
          heading: 'Evidence item 3: the key file',
          evidence: {
            observed:
              'Investigators accessed an online cloud-storage account controlled by a suspect and found a file containing the private keys to the wallet holding the bulk of the stolen funds.',
            source: 'The DOJ filings.',
            inference:
              'Control of the wallet, and the practical means to seize. Note the sequence: on-chain tracing led to the suspects and the off-ramps; ordinary investigative work produced the key file. Neither half would have closed the case alone.',
            confidence: 'High. Possession of the keys is decisive in a way no on-chain inference is.',
          },
          decision: {
            prompt: 'The key file is in evidence. What has actually changed in your case?',
            options: [
              {
                id: 'a',
                text: 'Corroboration only: the keys strengthen the attribution story, but the case still turns on completing the trace, so the right move is to keep following the remaining branches.',
              },
              {
                id: 'b',
                text: 'Attribution has become control: the keys are both proof of who holds the wallet and the practical means to take it, so the action moves from tracing to seizure.',
              },
              {
                id: 'c',
                text: 'Very little: private keys found off-chain are weaker evidence than the on-chain record, because possession of a file does not connect a person to the historical movements.',
              },
              {
                id: 'd',
                text: 'The identity is solved but the funds remain out of reach, since seizing cryptoassets requires the cooperation of a custodian and this wallet is self-hosted.',
              },
            ],
            correctOptionId: 'b',
            explanation:
              'The keys collapse the distance between knowing and acting. For a self-hosted wallet there is no custodian to compel, which is exactly why key material is the decisive artefact: whoever holds the keys holds the coins, so lawful possession of the keys IS the means of seizure. The trace told you where the money was and who to look at; the keys turned that knowledge into recovery.',
          },
          reveal:
            'On 8 February 2022 the DOJ announced the seizure of about 94,000 of the stolen bitcoin, then valued at over 3.6 billion US dollars, and the arrest of Ilya Lichtenstein and Heather Morgan; it was the Department’s largest financial seizure at the time. Both pleaded guilty in August 2023 to conspiracy to commit money laundering, with Lichtenstein admitting the 2016 hack. On 14 November 2024 he was sentenced to five years; Morgan was sentenced to 18 months days later, on 18 November 2024.',
        },
      ],
      debrief:
        'Read your own file the way a court would. The high-confidence links are the on-chain movements and the key file. The medium-confidence links are the off-ramp attributions, each one medium until the service confirmed it. And at every step the action followed the evidence, never the other way around, which is exactly what a regulator or a court will test. That is the reflex the cold open asked of you, run across a six-year case.',
      // Alternate verified matter: a retake works a DIFFERENT real case. Facts
      // verbatim from the cleared `how-on-chain-transactions-work` deep case
      // (DOJ 7 June 2021 Colonial Pipeline seizure record).
      alternates: [
        {
          caseTitle: 'The Colonial Pipeline file, 2021',
          intro:
            'Everything in this file is from the public record of the Colonial Pipeline ransomware matter and the U.S. seizure that followed. Read each evidence card, commit to your call, then see what the investigators actually did.',
          steps: [
            {
              id: 'ransom',
              heading: 'Evidence item 1: the ransom leaves',
              evidence: {
                observed:
                  'On 7 May 2021, a ransomware attack shut down Colonial Pipeline, one of the largest fuel pipelines in the United States, triggering fuel shortages across the eastern seaboard. The attack was attributed to a ransomware group known as DarkSide. Under pressure to restore operations, the company paid a ransom of 75 bitcoin, worth roughly 4.4 million US dollars at the time, within hours.',
                source:
                  'The U.S. Department of Justice public record of the matter, including the later seizure announcement and warrant materials.',
                inference:
                  'A known payment, in a known amount, leaving from a known transaction on a public ledger. The attackers are pseudonymous; the payment is not.',
                confidence: 'High; the payment transaction is permanently visible on-chain.',
              },
              decision: {
                prompt:
                  'The ransom is paid and the attackers are pseudonymous. What is your first investigative move?',
                options: [
                  {
                    id: 'a',
                    text: 'Open a channel to the DarkSide operators to negotiate a partial return, since ransomware groups protecting their reputation have returned funds before and negotiation preserves goodwill.',
                  },
                  {
                    id: 'b',
                    text: 'Trace the 75 bitcoin forward from the ransom transaction, hop by hop across transfers, since every movement of the payment is permanently recorded on the public ledger.',
                  },
                  {
                    id: 'c',
                    text: 'Treat the funds as gone: professional ransomware crews launder through mixers within hours, and resources are better spent hardening the victim against reinfection.',
                  },
                  {
                    id: 'd',
                    text: 'Subpoena the victim company’s bank for the fiat trail, since the corporate payment that funded the bitcoin purchase is the strongest evidence connection to the attackers.',
                  },
                ],
                correctOptionId: 'b',
                explanation:
                  'The criminal’s assumption is that an address is a cloak. It is not: the ransom payment was, like every on-chain transaction, permanently visible, and the investigative move is to read the ledger. The fiat trail identifies the victim, not the attacker; negotiation is not investigation; and writing the funds off surrenders exactly the advantage the public ledger hands you.',
              },
              reveal:
                'Investigators did not need the attackers to make a mistake. They simply read the public ledger: law enforcement followed the funds across multiple transfers as they moved from address to address, and identified a specific address into which a large part of the proceeds had flowed.',
            },
            {
              id: 'resting',
              heading: 'Evidence item 2: the resting address',
              evidence: {
                observed:
                  'The trace identified a specific address into which a large part of the ransom proceeds had flowed. The address is self-hosted: no exchange, no custodian, no institution behind it.',
                source: 'The DOJ seizure announcement and the warrant application in the Northern District of California.',
                inference:
                  'The location of the funds is known with high confidence. Control of the funds is a separate question entirely.',
                confidence: 'High on location; the trace sits on the public ledger.',
              },
              decision: {
                prompt:
                  'The funds sit at a self-hosted address you can see but no institution controls. What does seizure actually require?',
                options: [
                  {
                    id: 'a',
                    text: 'A freeze order served on the blockchain’s operators, compelling the network to lock the address the way a bank locks an account under a court order.',
                  },
                  {
                    id: 'b',
                    text: 'An OFAC designation of the address, since listing it as sanctioned property legally transfers control of the funds to the government.',
                  },
                  {
                    id: 'c',
                    text: 'The private key to the address, obtained by lawful means, because for a self-hosted wallet control of the key is control of the coins.',
                  },
                  {
                    id: 'd',
                    text: 'Nothing further: a completed, documented trace to a specific address is itself the legal basis on which the funds can be recovered.',
                  },
                ],
                correctOptionId: 'c',
                explanation:
                  'There is no operator to serve and no custodian to compel: a public blockchain has no freeze lever, and a designation blocks dealings but moves nothing. For a self-hosted wallet, the decisive artefact is the key. Whoever holds the key holds the coins, so lawful possession of the key IS the practical means of seizure.',
              },
              reveal:
                'The authorities were able to seize the funds because they had obtained the private key to the address holding them. Law enforcement declined to explain exactly how it had obtained that key, citing the need to protect its methods.',
            },
            {
              id: 'seizure',
              heading: 'Evidence item 3: the seizure',
              evidence: {
                observed:
                  'On 7 June 2021, barely a month after the attack, the U.S. Department of Justice announced that it had seized approximately 63.7 of the 75 bitcoins paid, the bulk of the ransom. The recovered amount was worth around 2.3 million US dollars rather than the original 4.4 million, because the price of bitcoin had fallen in the interim.',
                source: 'The DOJ announcement of 7 June 2021 and the seizure warrant issued in the Northern District of California.',
                inference:
                  'The trace held end to end; the dollar gap is market movement, not investigative failure.',
                confidence: 'High; the seizure is the binding public record.',
              },
              decision: {
                prompt:
                  'A colleague reads the result as vindication for the attackers: "they kept some coins, and the recovered value dropped anyway, so crypto extortion basically works." What is the disciplined read?',
                options: [
                  {
                    id: 'a',
                    text: 'The colleague is right on the numbers: an incomplete recovery at a lower dollar value shows tracing is a partial remedy at best, and prevention budgets should reflect that.',
                  },
                  {
                    id: 'b',
                    text: 'Within a month, the bulk of the ransom was clawed back by reading a public ledger: pseudonymity is not anonymity, and the value drop was market movement, separate from traceability.',
                  },
                  {
                    id: 'c',
                    text: 'The case proves nothing either way, because the undisclosed method of obtaining the key means the result cannot be attributed to on-chain tracing at all.',
                  },
                  {
                    id: 'd',
                    text: 'The recovery succeeded only because DarkSide was careless; against a sophisticated actor using a shifting set of addresses, the same trace would have gone nowhere.',
                  },
                ],
                correctOptionId: 'b',
                explanation:
                  'The permanent, public record of the transactions let investigators follow the money and claw most of it back within weeks. The dollar difference was bitcoin’s price falling, a reminder the asset is volatile even when the trace is clean. And the same property defeats far more sophisticated actors: laundering by state-linked groups such as the Lazarus Group is reconstructed in extensive public detail precisely because the underlying transactions never disappear from the ledger.',
              },
              reveal:
                'Colonial Pipeline is the cleanest possible demonstration that on-chain pseudonymity is not anonymity. The attackers transacted under addresses, not names, and yet the public record of those transactions let investigators follow the money and recover the bulk of it within weeks. The cloak is made of glass; what it lacks, until an investigator supplies it, is only the label that says whose face is behind it.',
            },
          ],
          debrief:
            'Read the file back. The trace required no mistake from the attackers, only the ledger; the seizure required the key, because for a self-hosted wallet the key is control; and the one number that fell, the dollar value, fell for market reasons that had nothing to do with the investigation. Indicator, trace, off-ramp or key, action: the same workflow, closed in a month.',
        },
      ],
    },
  },
};

// ── 9. Sources, on the record ───────────────────────────────────────────────
const sRecord = {
  sceneType: 'reading',
  title: 'The file, on the record',
  teachesConcepts: ['asset_seizure'],
  conceptTags: ['asset_seizure'],
  sceneData: {
    body:
      'Everything you just worked is on the public record, and you should know exactly where, because an investigator’s conclusions are only as strong as the sources they can point to. The file rotates between verified matters, so your sources are one of two sets. For the Bitfinex file: the theft, the layering techniques, the cloud-stored key file, and the seizure of about 94,000 bitcoin are set out in the Department of Justice’s 8 February 2022 announcement and its accompanying statement of facts, and the sentences, five years for Ilya Lichtenstein, who admitted the 2016 hack, and 18 months for Heather Morgan, are in the November 2024 records. For the Colonial Pipeline file: the 7 June 2021 Department of Justice announcement and the seizure warrant issued in the Northern District of California carry the trace and the recovery of approximately 63.7 of the 75 bitcoins paid. The duties that made the off-ramps identity anchors, money-services-business recordkeeping in the United States and FATF-aligned VASP due diligence elsewhere, are in the FATF’s 2021 virtual-asset guidance. Sources below, as always.',
    citations: [
      CITE_DOJ_2022,
      CITE_DOJ_2024,
      CITE_MORGAN,
      {
        label:
          'U.S. Department of Justice, press release on the seizure of ransom proceeds in the Colonial Pipeline / DarkSide ransomware matter (7 June 2021)',
      },
      {
        label:
          'U.S. Department of Justice, application and affidavit for a warrant to seize approximately 63.7 bitcoins (Colonial Pipeline ransom proceeds), United States District Court for the Northern District of California (2021)',
      },
      CITE_FATF_VASP,
    ],
  },
};

// ── 10. Correct your classmate (reframed from the original check) ───────────
const origColleagueQ = sQuiz.sceneData.questions.find((q) => q.prompt.startsWith('A colleague summarises'));
if (!origColleagueQ) throw new Error('colleague question not found');
const sClassmate = {
  sceneType: 'quiz',
  title: 'Marcus needs correcting',
  teachesConcepts: ['on_chain_off_chain_linking'],
  conceptTags: ['on_chain_off_chain_linking'],
  sceneData: {
    intro:
      'Marcus, next to you, has been watching you work the file. He leans over, confident: "So the lesson is: all crypto is traceable on a permanent public ledger, and identity is always obtainable at an off-ramp." He is about to repeat that in the team meeting. What do you tell him?',
    questions: [
      {
        ...origColleagueQ,
        prompt:
          'Marcus’s claim: "all crypto is traceable on a permanent public ledger, so identity is always obtainable at an off-ramp." How do you correct him before the meeting?',
      },
    ],
  },
};

// ── 11. Final check: the three remaining questions ──────────────────────────
const keptQuestions = sQuiz.sceneData.questions.filter(
  (q) =>
    !q.prompt.startsWith('You trace the stolen funds forward and a clustering heuristic') &&
    !q.prompt.startsWith('In the Bitfinex matter the launderers deposited') &&
    !q.prompt.startsWith('A colleague summarises'),
);
if (keptQuestions.length !== 3) throw new Error('expected 3 kept questions, got ' + keptQuestions.length);
const quizTrimmed = { ...sQuiz, sceneData: { ...sQuiz.sceneData, questions: keptQuestions } };

// ── Assemble ────────────────────────────────────────────────────────────────
// The reusable decision standard (external-review fix): stated once, right
// after the cold open, then explicitly reapplied by every later decision.
const sStandard = {
  sceneType: 'slide',
  title: 'The decision standard',
  teachesConcepts: ['investigation_workflow'],
  conceptTags: ['investigation_workflow'],
  sceneData: {
    template: 'callout',
    heading: 'The decision standard',
    items: [{ text: 'Verify the trace. Test the attribution. Record your confidence. Only then act.' }],
    narration:
      'Before we go further, take the standard you just needed and keep it where you can reach it. Four moves, always in order: verify the trace yourself, test whether the attribution survives scrutiny, record how confident each link leaves you, and only then choose an action. Every decision in this lesson, and on the exam, is one of these four moves under pressure.',
  },
};

const pilot = {
  lessonSlug: art.lessonSlug,
  scenes: [
    sDesk,
    sColdOpen,
    sStandard,
    sMethod,
    sTracingSlide,
    sBranches,
    sBridge,
    sBridgeSlide,
    sCaseFile,
    sRecord,
    sClassmate,
    sAction,
    quizTrimmed,
    sSynth,
  ],
};

for (const s of pilot.scenes) {
  if (!Array.isArray(s.conceptTags)) s.conceptTags = [...(s.teachesConcepts ?? [])];
}

const flat = JSON.stringify(pilot);
const emd = flat.match(/[—–]/g);
if (emd) throw new Error('em/en-dashes present: ' + emd.length);
for (const s of pilot.scenes) {
  if (s.sceneType === 'reading' && !(s.sceneData.citations || []).length) {
    throw new Error('reading without citations: ' + s.title);
  }
}

fs.writeFileSync(SRC, JSON.stringify(pilot, null, 2));
console.log('pilot v2 written:', pilot.scenes.length, 'scenes');
console.log(pilot.scenes.map((s, i) => `${i + 1}. [${s.sceneType}] ${s.title}`).join('\n'));
