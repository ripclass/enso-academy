// Simulator-format conversion of CAMS `correspondent-banking-risk` (free
// preview, marquee-rebuilt content). Cold open, mid decision (redeployed
// nesting question), the HSBC 2012 deep case as a case-file interactive where
// the student sets the rating before seeing HSBC's, classmate rep (the
// de-risking board question), sources scene, trimmed final check. All facts
// verbatim from the cleared artifact.
const fs = require('fs');

const SRC = 'generated/cams/lessons/correspondent-banking-risk.json';
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

const sOpen = byTitle("Banking another bank's risk");
const sPlumbing = byTitle('How the plumbing works');
const sR13 = byTitle('Recommendation 13, read closely');
const sRespDD = byTitle('Respondent due diligence in practice');
const sVisibility = byTitle('What you can know, what you cannot');
const sNesting = byTitle('Nesting and payable-through');
const sHsbc = byTitle('Deep case: HSBC (2012)');
const sDerisk = byTitle('De-risking: the over-correction');
const sRedFlags = byTitle('Respondent red flags');
const sQuiz = byTitle('The onboarding decision');
const sSynth = byTitle('What to carry forward');

const hsbcCites = sHsbc.sceneData.citations;
const qs = sQuiz.sceneData.questions;
const qOnboard = qs.find((q) => q.prompt.startsWith('A mid-sized commercial bank'));
const qNestingQ = qs.find((q) => q.prompt.startsWith('Eight months into a clearing relationship'));
const qPta = qs.find((q) => q.prompt.startsWith('A long-standing respondent asks'));
const qDerisk = qs.find((q) => q.prompt.startsWith('After a peer institution receives'));
if (!qOnboard || !qNestingQ || !qPta || !qDerisk) throw new Error('quiz split failed');

// ── Cover ───────────────────────────────────────────────────────────────────
const sDesk = {
  sceneType: 'reading',
  title: 'You are on the desk',
  teachesConcepts: ['cb_imported_risk'],
  conceptTags: ['cb_imported_risk'],
  sceneData: {
    body:
      'Sit down. The file is yours.\n\nCorrespondent banking is the business of banking another bank’s risk: customers you will never meet, moving money on your rails, under controls you do not run. This lesson trains the judgment that keeps that business survivable, and it runs the way the job runs: you make each call before you see what the framework, or the enforcement record, says about it.\n\nA request is about to land. Answer it with whatever instincts you have; the lesson exists to replace them with a method.',
    citations: sOpen.sceneData.citations,
  },
};

// ── Cold open ───────────────────────────────────────────────────────────────
const sColdOpen = {
  sceneType: 'quiz',
  title: 'Cold open: the clearing request',
  teachesConcepts: ['cb_r13_architecture'],
  conceptTags: ['cb_r13_architecture'],
  sceneData: {
    intro:
      'No framework yet. A profitable request has landed and the business wants an answer this week.',
    questions: [
      {
        prompt:
          'A foreign bank, profitable and eager, applies to your institution for US dollar clearing. Your bank will never see its customers, only its instructions. The relationship manager asks what the FIRST question on the file has to be. What do you tell them?',
        options: [
          {
            id: 'a',
            text: 'Whether the fee income covers the compliance overhead, since a correspondent relationship that cannot pay for its own monitoring is unviable regardless of its risk profile.',
          },
          {
            id: 'b',
            text: 'Whether the respondent’s jurisdiction appears on the FATF lists, since a listed home country resolves the decision by policy without any file-level analysis.',
          },
          {
            id: 'c',
            text: 'Whether we can genuinely understand and assess the respondent’s business and controls, because clearing for a bank means importing the risk of every customer it has.',
          },
          {
            id: 'd',
            text: 'Whether our group has an affiliate or partner institution in that market already, since an existing group presence gives us assurance about local conditions and counterparties.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Fees, lists, and group presence all appear in the file eventually, but the first question is the one the whole framework hangs on: can you understand and assess the bank whose risk you are about to import? A correspondent never sees the underlying customers, so the respondent’s business, book, and controls are the only place the risk can be assessed. If that assessment cannot be made honestly, nothing downstream can compensate for it. Keep your answer in mind: the deep case in this lesson is what happens when an institution substitutes comfort for that assessment.',
        conceptTags: ['cb_r13_architecture', 'cb_imported_risk'],
      },
    ],
  },
};

const sOpenModified = {
  ...sOpen,
  sceneData: {
    ...sOpen.sceneData,
    body:
      'Hold on to the first question you just chose, because everything in this lesson is the discipline of answering it properly. ' +
      sOpen.sceneData.body,
  },
};

// ── Mid decision: the nesting file (redeployed) ─────────────────────────────
const sNestingDecision = {
  sceneType: 'quiz',
  title: 'Decision: the patterns in the traffic',
  teachesConcepts: ['cb_nesting_pta'],
  conceptTags: ['cb_nesting_pta'],
  sceneData: {
    intro: 'You own this respondent file. Work the live decision.',
    questions: [qNestingQ],
  },
};

// ── The HSBC file as a case-file interactive ────────────────────────────────
const sCaseFile = {
  sceneType: 'interactive',
  title: 'Work the file',
  teachesConcepts: ['cb_enforcement_failure'],
  conceptTags: ['cb_enforcement_failure'],
  sceneData: {
    title: 'Work the file',
    summary:
      'A defining failure study of the category, worked from the file owner’s chair: your calls before the record’s. The file rotates between matters, so a retake works a different case.',
    spec: {
      kind: 'case-file',
      caseTitle: 'The HSBC Mexico file',
      intro:
        'Everything in this file is from the public enforcement record: the HSBC deferred prosecution agreement of 11 December 2012 and the Wachovia resolution that preceded it. Read each evidence card, commit to your call, then see what the institution actually did.',
      steps: [
        {
          id: 'rating',
          heading: 'Evidence item 1: the relationship, and the precedent',
          evidence: {
            observed:
              'HSBC Bank USA, N.A. provides clearing and correspondent services to the group’s Mexican affiliate, HSBC Mexico (HBMX). Mexico in this period is a jurisdiction whose cash economy, cartel presence, and casa-de-cambio sector are the subject of standing public warnings. And there is a named precedent: in March 2010, Wachovia Bank, N.A. entered a deferred prosecution agreement, USD 160 million including USD 110 million forfeiture, over correspondent services to Mexican casas de cambio, with control failures spanning some USD 378.4 billion in transactions.',
            source: 'The public enforcement record: the Wachovia DPA (March 2010) and the later HSBC resolution documents.',
            inference:
              'The typology, the corridor, and the failure mode are on the public record. Precedent is notice.',
            confidence: 'High; these are resolved public matters.',
          },
          decision: {
            prompt:
              'It is 2010. You own the HBMX file at HSBC Bank USA. Wachovia has just resolved. What country-risk treatment does this respondent get?',
            options: [
              {
                id: 'a',
                text: 'A rating driven by the respondent’s actual book and jurisdiction: high risk, with monitoring, bulk-cash scrutiny, and message-layer attention calibrated to that rating.',
              },
              {
                id: 'b',
                text: 'A low-risk rating: HBMX is a group affiliate operating under group policies, and its controls are effectively our own, so the intra-group relationship is the assessment.',
              },
              {
                id: 'c',
                text: 'A medium rating pending the next group internal-audit cycle, since an affiliate should be assessed through the group’s own assurance machinery rather than the respondent framework.',
              },
              {
                id: 'd',
                text: 'Exit: after Wachovia, no US institution can defensibly clear for any Mexican respondent, affiliate or not, and the corridor itself has become unbankable.',
              },
            ],
            correctOptionId: 'a',
            explanation:
              'Affiliation is not assessment. Group membership changes who you call about a problem, not whether the problem exists, and a jurisdiction under standing public warnings with a freshly resolved, named enforcement precedent in the exact corridor is a high-risk book whatever badge the respondent wears. Exit is the over-correction; comfort is the failure. The rating has to come from the book.',
          },
          reveal:
            'HSBC Bank USA’s country-risk model rated Mexico in its lowest-risk category: an affiliate-comfort rating, not an assessment. The affiliate relationship substituted for respondent due diligence, it’s our own group, so their controls are our comfort, precisely the intra-group fallacy, here at clearing scale. And with the rating set low, the monitoring followed it down.',
        },
        {
          id: 'volumes',
          heading: 'Evidence item 2: the volumes',
          evidence: {
            observed:
              'Over the relevant period, HSBC Bank USA failed to monitor over USD 670 billion in wire transfers and over USD 9.4 billion in physical US-dollar purchases from HBMX. In 2007 to 2008, HBMX shipped USD 7 billion in bulk cash to its US affiliate, a volume larger than any other Mexican bank’s, in a market where bulk dollars were notoriously cartel-saturated.',
            source: 'The DOJ resolution record.',
            inference:
              'Volumes inconsistent with any plausible declared customer base, visible entirely from the correspondent’s own rails.',
            confidence: 'High; the figures are in the resolution documents.',
          },
          decision: {
            prompt:
              'A colleague argues: "we cannot see HBMX’s customers, so we cannot judge whether these volumes are clean; that is the respondent’s job." Whose red flag is a USD 7 billion bulk-cash year?',
            options: [
              {
                id: 'a',
                text: 'The respondent’s: customer-level knowledge sits with the bank that onboarded them, so volume anomalies can only be assessed by HBMX and escalated to the group if HBMX finds them.',
              },
              {
                id: 'b',
                text: 'The regulator’s: system-level cash flows between jurisdictions are what central banks and supervisors monitor, and an individual correspondent has neither the data nor the mandate.',
              },
              {
                id: 'c',
                text: 'Nobody’s, yet: raw volume is not an indicator without customer context, and flagging it without that context would generate noise the monitoring programme cannot absorb.',
              },
              {
                id: 'd',
                text: 'The correspondent’s own: the message layer is non-delegable, and volumes inconsistent with any plausible book are the correspondent’s red flag, requiring no visibility into the underlying customers.',
              },
            ],
            correctOptionId: 'd',
            explanation:
              'The correspondent owns the screening and monitoring of what crosses its own rails, whatever the respondent’s obligations. That is the one layer a correspondent always has. A bulk-cash volume larger than any other bank in the market, tested against any declared, plausible book, fails on its face, and no customer-level visibility is needed to see it.',
          },
          reveal:
            'With the rating set low, wire traffic from HBMX was largely excluded from scrutiny, bulk-cash volumes went unexamined against any plausible customer base, and the message-layer signals, the one layer a correspondent always has, were systematically under-read. The group’s Mexican book reality, cartel-linked flows and heavy casa-de-cambio exposure in the customer base HBMX itself had onboarded, flowed through unimpeded.',
        },
        {
          id: 'keystone',
          heading: 'Evidence item 3: the reckoning',
          evidence: {
            observed:
              'On 11 December 2012, HSBC Holdings plc and HSBC Bank USA, N.A. entered a deferred prosecution agreement with the US Department of Justice: USD 1.92 billion, including USD 1.256 billion in forfeiture, then the largest AML resolution on record. On the DOJ’s account, at least USD 881 million in drug-trafficking proceeds, including from the Sinaloa Cartel and Colombia’s Norte del Valle Cartel, moved through the US financial system via the correspondent access.',
            source: 'The HSBC deferred prosecution agreement and DOJ resolution record.',
            inference:
              'The failure was systemic, but it was not many independent failures: the controls were connected, and they failed together.',
            confidence: 'High; the resolution is the binding record.',
          },
          decision: {
            prompt:
              'Looking back across the whole file: which single field, set honestly in 2010, would have re-armed the entire control stack?',
            options: [
              {
                id: 'a',
                text: 'The transaction-monitoring rule set: more scenarios tuned to bulk cash and wire velocity would have caught the volumes regardless of how the relationship itself was rated.',
              },
              {
                id: 'b',
                text: 'The respondent risk rating: every downstream control calibrates to it, so the comfort-driven rating disarmed the monitoring, the bulk-cash scrutiny, and the message-layer reading all at once.',
              },
              {
                id: 'c',
                text: 'The beneficial-ownership refresh cycle: current UBO files on HBMX’s customer base would have exposed the casa-de-cambio concentration to the correspondent directly.',
              },
              {
                id: 'd',
                text: 'The corridor decision itself: only a policy of declining Mexican respondent relationships after Wachovia would have prevented the outcome, since in-flight controls cannot restrain an affiliate.',
              },
            ],
            correctOptionId: 'b',
            explanation:
              'The rating is the keystone. Monitoring intensity, review frequency, escalation posture, every downstream control calibrates to the respondent risk rating, so a comfort-driven rating disarms the entire stack at once. It is the most consequential single field in the correspondent file, which is why the affiliate-comfort substitution was not one error among many: it was the error that made the others invisible.',
          },
          reveal:
            'Recommendation 13, clause by clause, says what should have happened: the respondent’s business understood would have meant confronting the casa-de-cambio concentration and the bulk-cash economics; controls assessed would have meant testing HBMX’s programme against its book rather than its group badge; responsibilities documented would have placed the monitoring duty somewhere instead of nowhere. Three rules, priced: the rating is the keystone; the message layer is non-delegable; and precedent is notice. After Wachovia, the corridor’s risk was public knowledge, and the enforcement treatment of HSBC reflected an institution that had the industry’s lesson available and did not apply it.',
        },
      ],
      debrief:
        'Read the file back. You were offered the same comforts HSBC accepted: the group badge in place of an assessment, customer-blindness in place of message-layer ownership, and hindsight’s favourite, the belief that no single field could matter that much. The rating is the keystone, the message layer is yours, and precedent is notice. The de-risking scene that follows shows the industry over-correcting from exactly this moment.',
      // Alternate verified matter: the precedent itself, worked as a file.
      // Facts verbatim from this lesson's cleared deep-case text.
      alternates: [
        {
          caseTitle: 'The Wachovia file, 2010',
          intro:
            'Everything in this file is from the public enforcement record: the Wachovia deferred prosecution agreement of March 2010, the matter that put this corridor on notice two years before HSBC. Read each evidence card, commit to your call, then see what actually happened.',
          steps: [
            {
              id: 'respondents',
              heading: 'Evidence item 1: the respondent class',
              evidence: {
                observed:
                  'Wachovia Bank, N.A. provides correspondent services to Mexican casas de cambio, currency-exchange houses moving retail and bulk dollar flows. Mexico in this period is a jurisdiction whose cash economy, cartel presence, and casa-de-cambio sector are the subject of standing public warnings, in a market where bulk dollars were notoriously cartel-saturated.',
                source: 'The public record of the later Wachovia resolution.',
                inference:
                  'A respondent class whose entire business model sits inside the highest-risk corner of the corridor.',
                confidence: 'High; the relationships and the market context are in the resolution record.',
              },
              decision: {
                prompt:
                  'You own the casa-de-cambio respondent files. The business argues they are ordinary retail FX counterparties with valid local licences. How does the framework treat this book?',
                options: [
                  {
                    id: 'a',
                    text: 'As standard financial-institution respondents: a valid home-country licence is the state’s own assessment of the business, and re-assessing licensed entities duplicates the local regulator’s work.',
                  },
                  {
                    id: 'b',
                    text: 'As relationships requiring the full Recommendation 13 treatment: understand each respondent’s actual business and flows, assess its controls against that book, and calibrate monitoring to the corridor’s known risk.',
                  },
                  {
                    id: 'c',
                    text: 'As unbankable: currency-exchange houses in a cartel-saturated market cannot be risk-managed at any rating, and the only defensible posture is declining the class outright.',
                  },
                  {
                    id: 'd',
                    text: 'As the respondents’ own problem: a correspondent processes instructions between institutions, and the customer-facing risk of a casa de cambio belongs to the casa de cambio.',
                  },
                ],
                correctOptionId: 'b',
                explanation:
                  'A licence is permission to operate, not an assessment of financial-crime controls, and blanket exit is the over-correction the framework names. The respondent class is bankable only through the discipline the rulebook actually asks for: business understood, controls tested against the real book, monitoring calibrated to the corridor. Anything less is comfort wearing a process.',
              },
              reveal:
                'The controls did not hold that line. What followed was a correspondent relationship set whose monitoring never confronted what the respondents actually were, in the exact corridor the public warnings described.',
            },
            {
              id: 'span',
              heading: 'Evidence item 2: the span',
              evidence: {
                observed:
                  'The control failures ultimately spanned some 378.4 billion US dollars in transactions connected to the casa-de-cambio relationships.',
                source: 'The Wachovia deferred prosecution agreement record.',
                inference: 'A number that size is not a missed alert. It is a failure mode.',
                confidence: 'High; the figure is in the resolution documents.',
              },
              decision: {
                prompt: 'What does a 378.4 billion dollar failure span actually indicate?',
                options: [
                  {
                    id: 'a',
                    text: 'Analyst error at volume: with millions of transactions, even a strong programme leaks a constant percentage, and a big book mechanically produces a big failure number.',
                  },
                  {
                    id: 'b',
                    text: 'Regulatory framing: the figure counts every dollar that moved through the relationships, so it measures the size of the business rather than the size of any control failure.',
                  },
                  {
                    id: 'c',
                    text: 'A control-framework failure: monitoring was never calibrated to what the respondents were, so the failure is measured in the book’s entire flow rather than in missed alerts.',
                  },
                  {
                    id: 'd',
                    text: 'The respondents’ failure: the casas de cambio originated the flows, and the span belongs on their conduct record rather than the correspondent’s.',
                  },
                ],
                correctOptionId: 'c',
                explanation:
                  'When the rating and the monitoring never confront the respondent’s real business, the failure is not a leak rate; it is the whole pipe. That is why the span is quoted in hundreds of billions: nothing in the stack was set to the book, so nothing in the stack was positioned to catch any of it. The keystone logic runs here exactly as it runs in the HSBC file.',
              },
              reveal:
                'In March 2010, Wachovia Bank, N.A. entered a deferred prosecution agreement: 160 million US dollars, including 110 million in forfeiture, over correspondent services to Mexican casas de cambio, with control failures spanning some 378.4 billion US dollars in transactions.',
            },
            {
              id: 'notice',
              heading: 'Evidence item 3: the notice',
              evidence: {
                observed:
                  'The resolution is public. The typology, the corridor, and the failure mode are now on the record for every institution clearing dollars against Mexican respondents.',
                source: 'The March 2010 deferred prosecution agreement and its public record.',
                inference: 'Precedent is notice. The question is who treats it that way.',
                confidence: 'High; the matter is resolved and published.',
              },
              decision: {
                prompt:
                  'It is April 2010. You run correspondent compliance at a different US bank with Mexico-corridor respondent exposure, including a group affiliate. What does the Wachovia resolution change for your files?',
                options: [
                  {
                    id: 'a',
                    text: 'Nothing binding: a deferred prosecution agreement resolves one bank’s conduct, and treating another institution’s settlement as your own regulatory obligation confuses precedent with law.',
                  },
                  {
                    id: 'b',
                    text: 'Everything about the corridor: the defensible move is exiting Mexican respondent relationships now, before your institution becomes the next name on the same fact pattern.',
                  },
                  {
                    id: 'c',
                    text: 'A watching brief: note the matter, wait for the regulators to issue formal corridor guidance, and adjust the programme when the expectations are published.',
                  },
                  {
                    id: 'd',
                    text: 'A retest of every corridor-exposed file against the now-public typology: ratings, monitoring calibration, and bulk-cash economics, with the group affiliate held to the same test as any respondent.',
                  },
                ],
                correctOptionId: 'd',
                explanation:
                  'A public resolution in your own corridor is the industry’s lesson delivered in advance. It binds no one and warns everyone: the enforcement treatment of the next institution on the same facts will price in that the risk was public knowledge. Exit is the over-correction; waiting is the failure; the affiliate carve-out is the exact fallacy the next case would be built on.',
              },
              reveal:
                'That retest is the one the industry largely failed. Two years later, on the same corridor and the same typology, HSBC Bank USA resolved for 1.92 billion US dollars, with Mexico rated in its lowest-risk category and the group affiliate substituting for respondent due diligence. The feedback loop this course keeps returning to, translating another institution’s enforcement into your own controls, had its test case here first.',
            },
          ],
          debrief:
            'Read the file back. The respondent class demanded the framework’s full discipline; the span showed what an uncalibrated stack fails to catch; and the resolution made the corridor’s risk public knowledge. Precedent is notice. The HSBC file, when it rotates onto your desk, is what ignoring this one cost.',
        },
      ],
    },
  },
};

// ── Sources, on the record ──────────────────────────────────────────────────
const sRecord = {
  sceneType: 'reading',
  title: 'The file, on the record',
  teachesConcepts: ['cb_enforcement_failure'],
  conceptTags: ['cb_enforcement_failure'],
  sceneData: {
    body:
      'Everything you just worked is on the public enforcement record. The 11 December 2012 deferred prosecution agreement of HSBC Holdings plc and HSBC Bank USA, N.A., USD 1.92 billion including USD 1.256 billion in forfeiture, carries the correspondent core: at least USD 881 million in drug-trafficking proceeds through the US financial system, over USD 670 billion in unmonitored wires, USD 9.4 billion in physical-dollar purchases, the USD 7 billion bulk-cash year, and Mexico in the lowest country-risk category. The March 2010 Wachovia deferred prosecution agreement, USD 160 million including USD 110 million forfeiture over correspondent services to Mexican casas de cambio spanning some USD 378.4 billion in transactions, is the precedent the industry had in hand. Recommendation 13 supplies the framework the case tested. Sources below.',
    citations: hsbcCites,
  },
};

// ── Classmate rep: the de-risking board memo ────────────────────────────────
const sClassmate = {
  sceneType: 'quiz',
  title: 'Priya needs correcting',
  teachesConcepts: ['cb_derisking'],
  conceptTags: ['cb_derisking'],
  sceneData: {
    intro:
      'Priya has been drafting the board briefing beside you since the HSBC file closed. She turns her screen around: "After a penalty like that, the only defensible recommendation is exiting every respondent relationship in the region. I am putting that to the board." What do you tell her before she sends it?',
    questions: [
      {
        ...qDerisk,
        prompt:
          'Priya’s draft recommendation: exit all respondent relationships in the region after the peer institution’s nine-figure correspondent penalty. What is the professionally accurate advice?',
      },
    ],
  },
};

// ── Final check: onboarding + PTA (intro kept) ──────────────────────────────
const quizTrimmed = {
  ...sQuiz,
  sceneData: { ...sQuiz.sceneData, questions: [qOnboard, qPta] },
};

// ── Assemble ────────────────────────────────────────────────────────────────
// The reusable decision standard (external-review fix): stated once, right
// after the cold open, then explicitly reapplied by every later decision.
const sStandard = {
  sceneType: 'slide',
  title: 'The decision standard',
  teachesConcepts: ['cb_r13_architecture'],
  conceptTags: ['cb_r13_architecture'],
  sceneData: {
    template: 'callout',
    heading: 'The decision standard',
    items: [{ text: 'Understand the business. Assess controls against the real book. Document who does what. Calibrate everything to the rating.' }],
    narration:
      'Hold the standard the clearing request needed. Four steps: understand the respondent’s business, assess its controls against the book it actually runs, document who owns what, and calibrate every downstream control to the rating. Every decision in this lesson is one of these four steps under pressure.',
  },
};

const pilot = {
  lessonSlug: art.lessonSlug,
  scenes: [
    sDesk,
    sColdOpen,
    sStandard,
    sOpenModified,
    sPlumbing,
    sR13,
    sRespDD,
    sVisibility,
    sNesting,
    sNestingDecision,
    sCaseFile,
    sRecord,
    sDerisk,
    sClassmate,
    sRedFlags,
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
console.log('cbr pilot written:', pilot.scenes.length, 'scenes');
console.log(pilot.scenes.map((s, i) => `${i + 1}. [${s.sceneType}] ${s.title}`).join('\n'));
