// Simulator-format conversion of CAMS `what-money-laundering-actually-is`
// (free preview, marquee-rebuilt content). Recipe per the pilot: cold open,
// mid decision, the Danske Estonia worked example as a case-file interactive
// with a predict-the-charge step, classmate rep (the original junior-colleague
// question, scenario carried), sources scene, final check kept as the intact
// three-question applied scenario. All facts verbatim from the cleared artifact.
const fs = require('fs');

const SRC = 'generated/cams/lessons/what-money-laundering-actually-is.json';
const BAK = SRC + '.pre-pilot.bak';

const art = fs.existsSync(BAK)
  ? JSON.parse(fs.readFileSync(BAK, 'utf8'))
  : JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!fs.existsSync(BAK)) fs.writeFileSync(BAK, JSON.stringify(art, null, 2));

const orig = art.scenes;
const byTitle = (t) => {
  const s = orig.find((x) => (x.title || '').startsWith(t));
  if (!s) throw new Error('missing scene: ' + t);
  return s;
};

const sOpen = byTitle('The question every new analyst gets wrong');
const sElements = byTitle('The three converging elements');
const sUS = byTitle('The United States: 18 U.S.C.');
const sUK = byTitle('The United Kingdom: POCA 2002');
const sEU = byTitle('The European Union: 6AMLD');
const sStructure = byTitle('Three statutes, one structure');
const sStages = byTitle('The three-stage model');
const sDanske = byTitle('Worked example: the Danske Bank Estonia');
const sRelated = byTitle('Distinguishing related offences');
const sQuiz = byTitle('Check for understanding');
const sSynth = byTitle('What to carry forward');

const danskeCites = sDanske.sceneData.citations;
const quizIntro = sQuiz.sceneData.intro;
const qs = sQuiz.sceneData.questions;
const qJunior = qs.find((q) => q.prompt.startsWith('A junior colleague tells you'));
if (!qJunior || qs.length !== 4) throw new Error('quiz split failed');
const keptQuestions = qs.filter((q) => q !== qJunior);

// ── Cover ───────────────────────────────────────────────────────────────────
const sDesk = {
  sceneType: 'reading',
  title: 'You are on the desk',
  teachesConcepts: ['money_laundering_definition'],
  conceptTags: ['money_laundering_definition'],
  sceneData: {
    body:
      'Sit down. The file is yours.\n\nThis is the first lesson of the course, and it runs the way the job runs: you make the call first, then we take it apart. The discipline being built is legal precision, because a compliance officer operates inside a legal framework, not a journalistic one, and every report you file and every decision you defend rests on what money laundering actually is as a matter of law.\n\nIn a moment your MLRO stops you in the corridor with a question. Answer it honestly, with whatever you brought in the door. What matters is not whether you get it right; it is noticing how you decided.',
    citations: sOpen.sceneData.citations,
  },
};

// ── Cold open ───────────────────────────────────────────────────────────────
const sColdOpen = {
  sceneType: 'quiz',
  title: 'Cold open: the corridor question',
  teachesConcepts: ['ml_common_architecture'],
  conceptTags: ['ml_common_architecture'],
  sceneData: {
    intro: 'No statutes yet, no method. Your MLRO wants a one-sentence answer, now.',
    questions: [
      {
        prompt:
          'Your MLRO, passing in the corridor: "A customer moved about two million in cash through their accounts last month. Quick answer: is that money laundering?" What do you say?',
        options: [
          {
            id: 'a',
            text: 'Yes: moving large amounts of cash through bank accounts is the textbook description of laundering, and the volume alone makes the call, so the report should be filed today.',
          },
          {
            id: 'b',
            text: 'Not necessarily: it is a pattern that may indicate laundering, but the offence requires proceeds of a predicate crime, an act on those proceeds, and a culpable mental state.',
          },
          {
            id: 'c',
            text: 'No: money laundering requires a criminal conviction for the underlying offence first, and until a court has convicted someone, the movement of the cash is legally neutral.',
          },
          {
            id: 'd',
            text: 'It is structuring rather than laundering: large cash movement through accounts falls under the reporting-evasion offences, which are a separate regime from money laundering entirely.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Cash movement is a pattern that may indicate money laundering; it is not the offence itself. The offence, in every major jurisdiction this lesson examines, requires three converging elements: a predicate offence, funds that are the proceeds of that offence, and an act on those proceeds performed with a culpable mental state. If you answered yes on volume alone, you filed a report you could not defend; if you demanded a conviction first, you set a bar no reporting regime requires. The lesson builds the precise version of the answer you just gave.',
        conceptTags: ['money_laundering_definition', 'ml_common_architecture'],
      },
    ],
  },
};

const sOpenModified = {
  ...sOpen,
  sceneData: {
    ...sOpen.sceneData,
    body:
      'Hold the answer you just gave in the corridor; by the end of this lesson you will be able to defend it clause by clause. ' +
      sOpen.sceneData.body,
  },
};

// ── Mid decision: the element that varies most ──────────────────────────────
const sMentalState = {
  sceneType: 'quiz',
  title: 'Decision: where the three rulebooks split',
  teachesConcepts: ['ml_common_architecture'],
  conceptTags: ['ml_common_architecture'],
  sceneData: {
    intro: 'You have now read all three statutes. Test the architecture.',
    questions: [
      {
        prompt:
          'A compliance team is mapping one laundering fact pattern across the US, UK, and EU frameworks you just read. Which element of the offence varies MOST across the three, and how?',
        options: [
          {
            id: 'a',
            text: 'The predicate requirement: the US recognises predicate offences while the UK and EU criminalise the handling of any suspicious funds without reference to an underlying crime.',
          },
          {
            id: 'b',
            text: 'The prohibited acts: each jurisdiction criminalises an entirely different set of physical acts, so conduct captured in one framework is usually lawful in the other two.',
          },
          {
            id: 'c',
            text: 'The penalties: the offence definitions are textually identical across the three, and the only practical difference a compliance team needs to map is sentencing exposure.',
          },
          {
            id: 'd',
            text: 'The mental state: the UK turns on knowledge or suspicion, the US on intent or knowledge of the transaction’s design, and the EU on intentional, knowing conduct.',
          },
        ],
        correctOptionId: 'd',
        explanation:
          'The architecture is common: predicate offence, proceeds, act, mental state. The mental state is where the drafting genuinely diverges, and it is the divergence with operational teeth: UK suspicion is a lower threshold than US knowledge-of-design, which changes when an institution’s duty is triggered. Treat the architecture as common, not identical, and know exactly which mental-state standard your jurisdiction applies.',
        conceptTags: ['ml_common_architecture', 'money_laundering_definition'],
      },
    ],
  },
};

// ── The Danske file as a case-file interactive ──────────────────────────────
const sCaseFile = {
  sceneType: 'interactive',
  title: 'Work the file',
  teachesConcepts: ['three_stage_model', 'money_laundering_definition'],
  conceptTags: ['three_stage_model', 'money_laundering_definition'],
  sceneData: {
    title: 'Work the file',
    summary:
      'A real, verified matter, worked one evidence item at a time, with the charge predicted before you see it. The file rotates between matters, so a retake works a different case.',
    spec: {
      kind: 'case-file',
      caseTitle: 'The Danske Estonia file',
      intro:
        'Everything in this file is from the binding U.S. public record: the Department of Justice and SEC resolutions of 13 December 2022. Read each evidence card, commit to your call, then see what actually happened.',
      steps: [
        {
          id: 'portfolio',
          heading: 'Evidence item 1: the portfolio',
          evidence: {
            observed:
              'Over its active years, the Estonian branch’s non-resident portfolio (NRP) served large numbers of customers domiciled outside Estonia, including in Russia, moving very large volumes through shell structures with opaque ownership. No teller-window cash: the activity visible at the branch was US dollar correspondent transactions and shell-company flows.',
            source: 'The U.S. Department of Justice and SEC public records of the matter.',
            inference:
              'A relationship set moving very large volumes of opaque non-resident flow without established source of funds.',
            confidence: 'High; these are the load-bearing facts of the binding public record.',
          },
          decision: {
            prompt:
              'A colleague reviewing the same flows says: "There are no cash deposits at this branch, so the laundering concern fails at the first stage." What is the disciplined read?',
            options: [
              {
                id: 'a',
                text: 'The concern stands: placement, if it happened at all, happened before the funds reached the branch, and what the branch sees is layering decoupled from any visible placement.',
              },
              {
                id: 'b',
                text: 'The colleague is right: without an observable placement stage there is no laundering cycle to analyse, and the flows should be assessed as ordinary correspondent traffic.',
              },
              {
                id: 'c',
                text: 'The concern weakens materially: shell-company wires are traceable bank-to-bank transactions, and traceability is the opposite of the concealment laundering requires.',
              },
              {
                id: 'd',
                text: 'The analysis cannot proceed: without knowing the funds’ ultimate integration into assets, no stage of the model can be confirmed and no hypothesis can be formed.',
              },
            ],
            correctOptionId: 'a',
            explanation:
              'The three-stage model is a teaching device, not a checklist the facts owe you. A laundering operation does not have to show you its placement: converting value into deposits can happen continents upstream, and what a correspondent branch sees may be layering only. Requiring every stage before forming a hypothesis is how very large opaque flow gets rationalised as normal.',
          },
          reveal:
            'In classical placement-layering-integration terms you would expect cash at a teller, then complex transfers, then asset acquisition. The Danske NRP looked nothing like that: no classic placement at Danske, layering as the entire visible activity, and integration invisible to the bank, downstream of any account it held.',
        },
        {
          id: 'statutes',
          heading: 'Evidence item 2: the conduct against the statutes',
          evidence: {
            observed:
              'What the branch saw was inbound and outbound wires between shell companies in secrecy jurisdictions, often with vague or absent payment descriptions.',
            source: 'The DOJ and SEC public records.',
            inference:
              'Handling property through transactions that obscure its origin, with source of funds never established: a textbook laundering-risk hypothesis.',
            confidence: 'High on the flow pattern; the hypothesis is an inference and must be labelled as one.',
          },
          decision: {
            prompt:
              'If a prosecutor reached for the laundering provisions this lesson taught, which pair is this conduct pattern written for?',
            options: [
              {
                id: 'a',
                text: 'POCA section 327 (concealing) and 18 U.S.C. § 1957, since moving criminal property of any amount through a bank is spending it within the meaning of the monetary-transaction offence.',
              },
              {
                id: 'b',
                text: 'POCA section 328 (arrangements) and the concealment prong of 18 U.S.C. § 1956, which reach handling proceeds through transactions that obscure their origin.',
              },
              {
                id: 'c',
                text: 'POCA section 330 and 31 U.S.C. § 5324, because the essence of the pattern is a failure to disclose combined with the structuring of transactions below reporting thresholds.',
              },
              {
                id: 'd',
                text: 'Article 3 of 6AMLD alone, since the flows were routed through EU territory and the EU directive displaces national laundering offences for cross-border conduct.',
              },
            ],
            correctOptionId: 'b',
            explanation:
              'Handling property that is the proceeds of crime, through transactions that obscure its origin, is the conduct POCA section 328 (arrangements) and the concealment prong of 18 U.S.C. § 1956 are written to reach. Section 330 is a disclosure offence, § 5324 is structuring, and 6AMLD harmonises rather than displaces national offences.',
          },
          reveal:
            'That is the laundering-risk hypothesis the facts support: a relationship that moved very large volumes of opaque non-resident flow without establishing source. Hold that hypothesis carefully, because the next card asks you what the United States actually charged.',
        },
        {
          id: 'charge',
          heading: 'Evidence item 3: resolution day',
          evidence: {
            observed:
              'On 13 December 2022 the matter resolved in the United States. Two agencies acted the same day: the Department of Justice, criminally, and the SEC, civilly.',
            source: 'The DOJ and SEC resolutions of 13 December 2022.',
            inference:
              'The charging theory is about to be tested against your laundering-risk hypothesis.',
            confidence: 'High; the resolutions are the binding record.',
          },
          decision: {
            prompt: 'Before the reveal: what did Danske Bank actually plead guilty to in the United States?',
            options: [
              {
                id: 'a',
                text: 'Conspiracy to launder monetary instruments under the concealment prong of 18 U.S.C. § 1956, the provision the flow pattern most obviously engaged.',
              },
              {
                id: 'b',
                text: 'Engaging in monetary transactions in criminally derived property over ten thousand dollars under 18 U.S.C. § 1957, the volume-based companion offence.',
              },
              {
                id: 'c',
                text: 'Conspiracy to commit bank fraud, for false and misleading representations made to keep access to the U.S. financial system.',
              },
              {
                id: 'd',
                text: 'Violations of U.S. sanctions programmes, since a substantial share of the non-resident portfolio involved customers and counterparties in sanctioned jurisdictions.',
              },
            ],
            correctOptionId: 'c',
            explanation:
              'The wrong the United States actually prosecuted was Danske’s false and misleading representations to its U.S. correspondent banks to keep dollar-clearing access: conspiracy to commit bank fraud, not a § 1956 money-laundering plea. The pattern fit the laundering-risk hypothesis; the charge that resolved it turned on a different offence. A competent analyst keeps the risk hypothesis and the charging theory separate.',
          },
          reveal:
            'Danske Bank A/S pleaded guilty to one count of conspiracy to commit bank fraud and forfeited approximately USD 2.059 billion; the DOJ resolution records approximately USD 160 billion in non-resident-portfolio transactions processed through U.S. correspondent banks between 2008 and 2016. The same day, the SEC resolution was approximately USD 413 million, including a USD 178.6 million civil penalty.',
        },
      ],
      debrief:
        'Read the file back. The facts broke the three-stage model (no visible placement, layering as the whole picture, invisible integration), supported a concealment-and-arrangements laundering hypothesis, and resolved on a bank-fraud charge. That is the discipline in one case: the model describes, the statutes define, the charge decides, and you keep all three separate in your analysis.',
      // Alternate verified matter: the charging-theory CONTRAST to Danske.
      // Facts verbatim from the cleared CCAS BTC-e worked example (FinCEN
      // 26 July 2017 assessment; DOJ N.D. Cal. Vinnik materials).
      alternates: [
        {
          caseTitle: 'The BTC-e file, 2017 to 2024',
          intro:
            'Everything in this file is from the public record: the U.S. Financial Crimes Enforcement Network’s 26 July 2017 assessment against BTC-e and the federal prosecution of its operator. Read each evidence card, commit to your call, then see what actually happened.',
          steps: [
            {
              id: 'business',
              heading: 'Evidence item 1: the business',
              evidence: {
                observed:
                  'BTC-e, operated through an entity named Canton Business Corporation, was for years one of the world’s largest virtual-currency exchanges, handling very large volumes from around 2011. It ran with essentially no anti-money-laundering programme and no meaningful customer identification, letting users open accounts and move value with little or no verified identity.',
                source: 'The FinCEN assessment record of 26 July 2017.',
                inference:
                  'For a launderer, a high-volume, liquid exchange that did not ask who you were was not a flaw to be exploited; it was the entire product.',
                confidence: 'High; the posture is documented in the assessment.',
              },
              decision: {
                prompt:
                  'A colleague reviews the same facts and says: "an exchange that skips identity checks has a compliance problem, not a criminal one. Nobody at BTC-e stole anything." What is the disciplined read?',
                options: [
                  {
                    id: 'a',
                    text: 'The colleague is right: laundering requires an act on the proceeds of crime, and running a badly-controlled exchange is a regulatory breach unless each deposit can be tied to a predicate offence committed by the operators themselves.',
                  },
                  {
                    id: 'b',
                    text: 'Knowingly converting and cashing out criminal proceeds is itself the act the laundering statutes reach, and running the no-questions conversion point for such proceeds puts the operator inside the offence, not beside it.',
                  },
                  {
                    id: 'c',
                    text: 'The exchange is neutral infrastructure: like a road used by smugglers, it carries what its users bring, and criminal liability stays with the users whose funds were dirty.',
                  },
                  {
                    id: 'd',
                    text: 'The only viable theory is tax-based: high-volume unregistered exchanges are prosecuted through unreported revenue, because proving knowledge of customer criminality is practically impossible.',
                  },
                ],
                correctOptionId: 'b',
                explanation:
                  'Run the three elements. The proceeds are the predicate crimes’ output; the act is conversion and transfer, which is exactly what an exchange does; and on this record the mental state does not rest on weak controls alone: the no-KYC design, combined with a known criminal customer base whose cash-outs the exchange facilitated, is what supports knowledge or wilful blindness. The road metaphor fails because a road cannot choose its traffic; an exchange chooses precisely when it decides what not to ask.',
              },
              reveal:
                'BTC-e sat squarely at the layering-and-integration end of countless laundering chains: a willing off-ramp, the chokepoint that chose not to choke. Criminals brought dirty value to it precisely because it would convert and cash out without the questions a compliant exchange must ask.',
            },
            {
              id: 'elements',
              heading: 'Evidence item 2: the conduct against the elements',
              evidence: {
                observed:
                  'According to FinCEN, BTC-e received and transmitted the proceeds of a wide range of crime: computer intrusions and hacking, ransomware, identity theft, corruption, and narcotics trafficking, and was associated with laundering funds connected to the collapse of the Mt. Gox exchange.',
                source: 'The FinCEN assessment of 26 July 2017.',
                inference:
                  'The offence architecture this lesson built maps cleanly onto the facts. The question is which element each fact supplies.',
                confidence: 'High on the findings as findings.',
              },
              decision: {
                prompt:
                  'Map the file to the three converging elements. What supplies the PREDICATE element in the case against BTC-e?',
                options: [
                  {
                    id: 'a',
                    text: 'Operating an unlicensed exchange: the business itself was unlawful, so its revenue was criminal proceeds and every subsequent transfer of that revenue completed the laundering cycle on its own.',
                  },
                  {
                    id: 'b',
                    text: 'No predicate is needed on these facts: for financial institutions, the programme failures substitute for the predicate, which is exactly why regulators rather than prosecutors led the response.',
                  },
                  {
                    id: 'c',
                    text: 'The upstream crimes that generated the funds BTC-e converted: the hacking, ransomware, identity theft, corruption, and narcotics trafficking whose proceeds it received and transmitted.',
                  },
                  {
                    id: 'd',
                    text: 'The Mt. Gox collapse: as the largest single loss event connected to the exchange, it is the predicate from which the rest of the charged conduct derives.',
                  },
                ],
                correctOptionId: 'c',
                explanation:
                  'The predicate is the upstream crime whose proceeds are handled: here an entire catalogue of them. BTC-e’s own act was the conversion and transmission of those proceeds, and its mental state was the posture of a business designed not to ask. Unlicensed operation is a separate offence, not the predicate for laundering its customers’ funds, and a collapse is an event, not a crime category.',
              },
              reveal:
                'That mapping is the analytical lane the U.S. response ran in. On 26 July 2017, FinCEN assessed a 110 million US dollar civil money penalty against BTC-e for wilfully violating U.S. anti-money-laundering laws, and a separate 12 million US dollar penalty against Alexander Vinnik, one of its operators: a landmark reach to a foreign-located exchange serving U.S. persons.',
            },
            {
              id: 'charge',
              heading: 'Evidence item 3: the operator’s reckoning',
              evidence: {
                observed:
                  'Alexander Vinnik was arrested in 2017 and, after years of extradition proceedings, was ultimately prosecuted in the United States. If your file today was the Danske case, you saw a laundering-risk pattern resolve as a bank-fraud charge. This is the same question, put again.',
                source: 'The Northern District of California public materials in the Vinnik prosecution.',
                inference: 'The charging theory is about to be tested against the analysis you just ran.',
                confidence: 'High; the disposition is on the public record.',
              },
              decision: {
                prompt: 'Before the reveal: what did Vinnik ultimately plead guilty to in the United States?',
                options: [
                  {
                    id: 'a',
                    text: 'Conspiracy to commit bank fraud, the same theory that resolved Danske: misrepresentations to U.S. institutions to keep access to the financial system.',
                  },
                  {
                    id: 'b',
                    text: 'Operating an unlicensed money-transmitting business only, the registration offence that typically resolves foreign-exchange cases without a laundering count.',
                  },
                  {
                    id: 'c',
                    text: 'Nothing: the civil penalties exhausted the U.S. response, and the criminal track ended with extradition to a third country.',
                  },
                  {
                    id: 'd',
                    text: 'A money-laundering conspiracy: on these facts, the laundering charge itself was the theory that held.',
                  },
                ],
                correctOptionId: 'd',
                explanation:
                  'In 2024, Vinnik pleaded guilty to a money-laundering conspiracy. Hold this against Danske: there, a laundering-risk pattern resolved as bank fraud because the prosecutable wrong was the lie told to correspondent banks; here, the conversion of criminal proceeds WAS the business, so the laundering conspiracy itself carried. Same analytical discipline, opposite charging outcomes: that pairing is the lesson.',
              },
              reveal:
                'Vinnik pleaded guilty in 2024 to a money-laundering conspiracy. The pattern fits the hypothesis AND the charge here, where at Danske the pattern fit the hypothesis and the charge turned elsewhere. A competent analyst holds the risk hypothesis and the charging theory as separate questions, because sometimes they converge and sometimes they do not, and the facts, not the pattern, decide which.',
            },
          ],
          debrief:
            'Read the file back. The elements converged: predicate crimes upstream, conversion as the act, a built-to-not-know posture as the mental state, and this time the charge matched the laundering analysis. Work this file against the Danske file and you have the whole discipline: the model describes, the statutes define, the charge decides.',
        },
      ],
    },
  },
};

// ── Sources, on the record ──────────────────────────────────────────────────
const sRecord = {
  sceneType: 'reading',
  title: 'The file, on the record',
  teachesConcepts: ['predicate_offences'],
  conceptTags: ['predicate_offences'],
  sceneData: {
    body:
      'Everything you just worked is on the binding public record, and you should know exactly where. The guilty plea to conspiracy to commit bank fraud, the approximately USD 2.059 billion forfeiture, and the approximately USD 160 billion in non-resident-portfolio transactions through U.S. correspondent banks between 2008 and 2016 are in the Department of Justice’s 13 December 2022 resolution and the underlying plea documents. The SEC’s same-day resolution, approximately USD 413 million including a USD 178.6 million civil penalty, is in the Commission’s release. The statutory anchors for the analysis you ran, POCA section 328 and the concealment prong of 18 U.S.C. § 1956, are cited below with the rest. When the file on your screen was BTC-e rather than Danske, your record is the 26 July 2017 FinCEN assessment against BTC-e, operating as Canton Business Corporation, and its operator Alexander Vinnik, 110 million and 12 million US dollars respectively, and the Northern District of California materials carrying Vinnik’s 2024 guilty plea to a money-laundering conspiracy.',
    citations: [
      ...danskeCites,
      {
        label:
          'U.S. Department of the Treasury, Financial Crimes Enforcement Network, assessment of civil money penalty against BTC-e (a/k/a Canton Business Corporation) and Alexander Vinnik, 26 July 2017',
      },
      {
        label:
          'U.S. Department of Justice, Northern District of California, public materials in the prosecution of Alexander Vinnik (BTC-e)',
      },
    ],
  },
};

// ── Classmate rep (the junior-colleague question, scenario carried) ─────────
const sClassmate = {
  sceneType: 'quiz',
  title: 'Daniel needs correcting',
  teachesConcepts: ['three_stage_model'],
  conceptTags: ['three_stage_model'],
  sceneData: {
    intro:
      'Daniel has been working the applied file with you: ' +
      quizIntro +
      ' He looks up from it, confident: "This is a classic placement case, cash going in, then being layered through the remittances." He is about to write that in the analysis. What do you tell him?',
    questions: [
      {
        ...qJunior,
        prompt:
          'Daniel’s claim: "classic placement case, cash going in, then layered through the remittances." What is the most professionally accurate correction?',
      },
    ],
  },
};

// ── Final check: the intact applied scenario (three questions) ──────────────
const quizTrimmed = { ...sQuiz, sceneData: { ...sQuiz.sceneData, questions: keptQuestions } };

// ── Assemble ────────────────────────────────────────────────────────────────
// The reusable decision standard (external-review fix): stated once, right
// after the cold open, then explicitly reapplied by every later decision.
const sStandard = {
  sceneType: 'slide',
  title: 'The decision standard',
  teachesConcepts: ['ml_common_architecture'],
  conceptTags: ['ml_common_architecture'],
  sceneData: {
    template: 'callout',
    heading: 'The decision standard',
    items: [{ text: 'Predicate. Proceeds. An act on the proceeds. A culpable mental state.' }],
    narration:
      'Here is the standard the corridor question needed. Four elements, and the offence exists only where they converge: a predicate offence, proceeds of that offence, an act on those proceeds, and a culpable mental state. Every statute in this lesson is that sentence in different clothes, and every decision ahead asks you whether all four are present.',
  },
};

const pilot = {
  lessonSlug: art.lessonSlug,
  scenes: [
    sDesk,
    sColdOpen,
    sStandard,
    sOpenModified,
    sElements,
    sUS,
    sUK,
    sEU,
    sStructure,
    sMentalState,
    sStages,
    sCaseFile,
    sRecord,
    sClassmate,
    sRelated,
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
console.log('wml pilot written:', pilot.scenes.length, 'scenes');
console.log(pilot.scenes.map((s, i) => `${i + 1}. [${s.sceneType}] ${s.title}`).join('\n'));
