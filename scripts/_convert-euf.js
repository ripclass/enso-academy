// Simulator-format conversion of CAMS `the-eu-framework-and-the-aml-package`.
// Recipe (scripts/_blueprint-euf.md): a cold open on a consultant's three
// gap-analysis assertions that is really a instrument/calendar/court diagnosis,
// a reusable "decision standard" slide, two mid-lesson applied decisions (the
// criminal-layer defence brief; the instrument-choice colleague question), the
// Danske Estonia matter rebuilt as a case-file interactive read purely for the
// SUPERVISORY-ARCHITECTURE angle (home/host split, the 2014-2019 gap, who
// priced it) -- differentiated from the money-laundering typology (Module 0)
// and the EDD-failure-at-scale (Module 2) readings of the same matter -- a
// sources scene, a classmate rep (Marcus, rotation) reusing the register-access
// question with a rewritten prompt, and the retained final check (the 2028
// three-instrument mapping question). No sanctioned text fixes are needed on
// retained content (the two 2026-06-18 soft residuals are already fixed and
// preserved verbatim per the blueprint's Pre-audit sweep). All facts verbatim
// from the cleared artifact; every new sentence is copied from
// scripts/_blueprint-euf.md.
const fs = require('fs');

const SRC = 'generated/cams/lessons/the-eu-framework-and-the-aml-package.json';
const BAK = SRC + '.pre-convert.bak';

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

const sOpener = byTitle('Twenty-seven rulebooks, one market');
const sInstrumentTimeline = byTitle('The instrument timeline');
const sDirectiveEra = byTitle("The directive era's working law");
const sFailure = byTitle('Why the directive model failed at supervision');
const sDeepCase = byTitle('Deep case: Danske Estonia, the gap between two supervisors');
const sComparison = byTitle('Directive versus regulation');
const sPackage = byTitle('The 2024 Package, instrument by instrument');
const sAmlaRoles = byTitle('What AMLA is, and is not');
const sQuiz = byTitle('Regulation versus directive');
const sSynth = byTitle('What to carry forward');

// -- Citation + item helpers -----------------------------------------------------
const findCitation = (scene, labelSubstring) => {
  const cites = scene.sceneData.citations || [];
  const c = cites.find((x) => (x.label || '').includes(labelSubstring));
  if (!c) throw new Error('citation not found: ' + labelSubstring + ' in ' + scene.title);
  return c;
};

const addUrl = (scene, labelSubstring, url) => {
  const c = findCitation(scene, labelSubstring);
  c.url = url;
  return c;
};

// Splits one bundled multi-instrument citation into several standalone
// citations, in place, at the original position (blueprint section C: "the
// usf granularity rule prefers splits for MULTI-INSTRUMENT labels"). Throws if
// the bundle is not found, mirroring findCitation's discipline.
const splitCitation = (scene, labelSubstring, replacements) => {
  const cites = scene.sceneData.citations || [];
  const idx = cites.findIndex((x) => (x.label || '').includes(labelSubstring));
  if (idx === -1) throw new Error('citation to split not found: ' + labelSubstring + ' in ' + scene.title);
  cites.splice(idx, 1, ...replacements);
};

// Structural-parity helper mirrored from _convert-ukf.js. Unused in this
// script: the blueprint's Pre-audit sweep confirms no retained-text
// substring fixes are needed for this lesson (both 2026-06-18 soft residuals
// are already fixed and are preserved verbatim), so there is nothing here to
// substring-replace. Kept for parity with the sibling conversion scripts.
const replaceOnce = (str, oldSub, newSub, label) => {
  if (!str.includes(oldSub)) throw new Error('substring not found for replace: ' + label);
  return str.split(oldSub).join(newSub);
};

// -- URL constants ----------------------------------------------------------------
const EUR_LEX = (celex) => 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A' + celex;

const AMLD4_URL = EUR_LEX('32015L0849'); // Directive (EU) 2015/849 (4th AMLD)
const AMLD5_URL = EUR_LEX('32018L0843'); // Directive (EU) 2018/843 (5th AMLD)
const AMLD6_URL = EUR_LEX('32018L1673'); // Directive (EU) 2018/1673 (6th AMLD)
const AMLR_URL = EUR_LEX('32024R1624'); // Regulation (EU) 2024/1624, the single rulebook
const AMLD_ORG_URL = EUR_LEX('32024L1640'); // Directive (EU) 2024/1640, the organisational directive
const AMLA_REG_URL = EUR_LEX('32024R1620'); // Regulation (EU) 2024/1620, establishing AMLA
const WM_SOVIM_URL = EUR_LEX('62020CJ0037'); // CJEU joined cases C-37/20 and C-601/20 (WM and Sovim)

// PENDING placeholders: the parallel verification agent fills these with live,
// verified URLs before this script can complete without throwing (see the
// PENDING guard near the end). Each stays a literal string containing
// "PENDING" until replaced, by design.
// All five verified 2026-07-07 (curl browser-UA + Wayback CDX where bot-gated; see scratchpad euf-verification.md).
const DOJ_DANSKE_URL = 'https://www.justice.gov/archives/opa/pr/danske-bank-pleads-guilty-fraud-us-banks-multi-billion-dollar-scheme-access-us-financial'; // CDX-verified; Akamai bot-gates live curl
const SEC_DANSKE_URL = 'https://www.sec.gov/news/press-release/2022-220'; // rate-limits automated clients; live via Wayback
const DFSA_URL = 'https://cdn.finanstilsynet.dk/finanstilsynet/Media/638451607769091356/Report_on_the_Danish_FSAs_supervision_of_Danske%20Bank_as_regards_the_Estonia_case%20pdf.pdf'; // the 28 Jan 2019 supervision report PDF, carrying the 3 May 2018 decision as Appendix 5 (curl-200)
const FI_EE_URL = 'https://www.fi.ee/en/news/response-report-danish-fsas-supervision-danske-bank'; // Finantsinspektsioon response documenting the two 2014 on-site inspections (Cloudflare bot-gate to curl; live)
const EBA_CLOSURE_URL = 'https://www.eba.europa.eu/publications-and-media/press-releases/eba-closes-investigation-possible-breach-union-law-danish-and-estonian-supervisory-authorities'; // curl-200
const EBA_GL_URL = 'https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-final-revised-guidelines-money-laundering-and'; // GL/2021/02 press page, curl-200

// -- Split-bundle factories (fresh objects per call; no shared references) -------
const mkAmldSplit = () => [
  {
    label: 'Directive (EU) 2015/849 (4th AMLD), the risk-based CDD foundation of the directive era',
    url: AMLD4_URL,
  },
  {
    label: 'Directive (EU) 2018/843 (5th AMLD), the perimeter, transparency and register-access amendment',
    url: AMLD5_URL,
  },
  {
    label: 'Directive (EU) 2018/1673 (6th AMLD), the criminal-law harmonisation directive',
    url: AMLD6_URL,
  },
];

const mkPackageSplit = () => [
  {
    label: 'Regulation (EU) 2024/1624, the AML Regulation establishing the single rulebook',
    url: AMLR_URL,
  },
  {
    label: 'Directive (EU) 2024/1640, the AML organisational directive',
    url: AMLD_ORG_URL,
  },
  {
    label: 'Regulation (EU) 2024/1620, the AMLA Regulation, establishing the Anti-Money Laundering Authority',
    url: AMLA_REG_URL,
  },
];

const AMLD_BUNDLE_SUBSTR =
  'Directive (EU) 2015/849 (4th AMLD), Directive (EU) 2018/843 (5th AMLD), and Directive (EU) 2018/1673 (6th AMLD)';
const PACKAGE_BUNDLE_SUBSTR =
  'EU AML Package: Regulation (EU) 2024/1624, Directive (EU) 2024/1640, and AMLA Regulation (EU) 2024/1620';

// -- Citation URL patching on retained scenes (blueprint section C) --------------

// Opener ("Twenty-seven rulebooks, one market"): directive-era bundle split
// (3-way), Package bundle split (3-way), EBA-inquiry addUrl.
splitCitation(sOpener, AMLD_BUNDLE_SUBSTR, mkAmldSplit());
splitCitation(sOpener, PACKAGE_BUNDLE_SUBSTR, mkPackageSplit());
addUrl(sOpener, 'breach-of-Union-law inquiry', EBA_CLOSURE_URL);

// Directive-era scene ("The directive era's working law"): same directive
// split; WM and Sovim addUrl.
splitCitation(sDirectiveEra, AMLD_BUNDLE_SUBSTR, mkAmldSplit());
addUrl(sDirectiveEra, 'WM and Sovim', WM_SOVIM_URL);

// Failure scene ("Why the directive model failed at supervision"): EBA
// GL/2021/02 addUrl, EBA inquiry addUrl, Package bundle split.
addUrl(sFailure, 'ML/TF Risk Factors', EBA_GL_URL);
addUrl(sFailure, 'breach-of-Union-law inquiry', EBA_CLOSURE_URL);
splitCitation(sFailure, PACKAGE_BUNDLE_SUBSTR, mkPackageSplit());

// Comparison slide ("Directive versus regulation"): no citations (slide).
// Sanctioned terminology disambiguation (codex round 1, 2026-07-07): the 2024
// organisational directive (2024/1640) is also styled "AMLD6" in Package
// materials, so the comparison table's terse "AMLD 6" / "the Sixth Directive"
// for the 2018 criminal-law directive (2018/1673) is a forward-collision. The
// naked table-entry and its narration mirror get the criminal-law qualifier;
// the remaining instances elsewhere self-disambiguate by their explicit
// criminal-harmonisation context (documented hold in the DONE block).
let comparisonItemPatched = false;
sComparison.sceneData.items = sComparison.sceneData.items.map((it) => {
  if (it.text && it.text.includes('stayed with AMLD 6.')) {
    comparisonItemPatched = true;
    return {
      ...it,
      text: replaceOnce(
        it.text,
        'stayed with AMLD 6.',
        'stayed with the 2018 criminal-law directive.',
        'comparison item AMLD6',
      ),
    };
  }
  return it;
});
if (!comparisonItemPatched) throw new Error('comparison item AMLD6 target not found');
sComparison.sceneData.narration = replaceOnce(
  sComparison.sceneData.narration,
  'the criminal offences stayed where the Sixth Directive put them',
  'the criminal offences stayed where the 2018 criminal-law directive put them',
  'comparison narration Sixth',
);

// Package scene ("The 2024 Package, instrument by instrument"): Package
// bundle split, EBA GL addUrl, WM and Sovim addUrl.
splitCitation(sPackage, PACKAGE_BUNDLE_SUBSTR, mkPackageSplit());
addUrl(sPackage, 'ML/TF Risk Factors', EBA_GL_URL);
addUrl(sPackage, 'WM and Sovim', WM_SOVIM_URL);

// -- Deep-case citations, extracted for the record scene, then the scene dropped --
const citeDOJ = findCitation(sDeepCase, 'United States v. Danske Bank A/S, guilty plea');
citeDOJ.url = DOJ_DANSKE_URL;
// Sanctioned range fix (verified 2026-07-07): the DOJ release itself states the
// NRP conduct period as "between 2008 and 2016"; the cleared label's 2007 start
// is the SEC-recorded ACQUISITION year, not the DOJ flows period.
citeDOJ.label = replaceOnce(citeDOJ.label, 'between 2007 and 2016', 'between 2008 and 2016', 'DOJ label range');

const citeSEC = findCitation(sDeepCase, 'U.S. Securities and Exchange Commission, settled charges');
citeSEC.url = SEC_DANSKE_URL;

// The cleared combined label bundles TWO authorities; one URL covering both is
// the usf-class granularity defect. Split into two honest label/URL pairs,
// keeping each half of the cleared wording verbatim.
const citeDFSACombined = findCitation(sDeepCase, 'Danish Financial Supervisory Authority (Finanstilsynet)');
const dfsaSplitAt = '; Finantsinspektsioon';
if (!citeDFSACombined.label.includes(dfsaSplitAt)) {
  throw new Error('DFSA/Finantsinspektsioon combined label did not split');
}
const [dfsaHalf, fiTail] = citeDFSACombined.label.split(dfsaSplitAt);
const citeDFSA = { label: dfsaHalf, url: DFSA_URL };
const citeFI = { label: 'Finantsinspektsioon' + fiTail, url: FI_EE_URL };

const citeEBAInquiry = findCitation(sDeepCase, 'breach-of-Union-law inquiry');
citeEBAInquiry.url = EBA_CLOSURE_URL;

const recordCitations = [citeDOJ, citeSEC, citeDFSA, citeFI, citeEBAInquiry, ...mkPackageSplit()];
if (recordCitations.length !== 8) {
  throw new Error('record scene citations count mismatch: ' + recordCitations.length);
}

// -- Quiz split -------------------------------------------------------------------
const qs = sQuiz.sceneData.questions;
if (qs.length !== 4) throw new Error('expected 4 quiz questions, got ' + qs.length);
const q1 = qs.find((q) =>
  q.prompt.startsWith("A colleague asks: 'The Fourth Directive already required customer due diligence")
);
const q2 = qs.find((q) => q.prompt.startsWith('It is 2028. Map the governing source'));
const q3 = qs.find((q) => q.prompt.startsWith('A money-laundering prosecution is brought in an EU member state'));
const q4 = qs.find((q) => q.prompt.startsWith('A compliance analyst writes in a procedure'));
if (!q1) throw new Error('q1 lookup failed');
if (!q2) throw new Error('q2 lookup failed');
if (!q3) throw new Error('q3 lookup failed');
if (!q4) throw new Error('q4 lookup failed');

// q4 prompt replace (classmate rep reuses this question; options,
// correctOptionId, explanation, conceptTags and points all stay untouched).
if (!q4.prompt.startsWith('A compliance analyst writes in a procedure')) {
  throw new Error('q4 prompt mismatch before replace');
}
q4.prompt =
  'Marcus asks what could possibly have changed since the training decks. Correct the procedure and map the access.';

// -- Retained-content edit: opener prepend ----------------------------------------
const sOpenerModified = {
  ...sOpener,
  sceneData: {
    ...sOpener.sceneData,
    body:
      'Hold the corrections you just gave the board; by the end of this lesson each one will carry an instrument number and a date. ' +
      sOpener.sceneData.body,
  },
};

// -- Cover -------------------------------------------------------------------------
const sCover = {
  sceneType: 'reading',
  title: 'You are on the desk',
  teachesConcepts: ['eu_desk_briefing'],
  conceptTags: ['amld_4', 'aml_package_2024'],
  sceneData: {
    body:
      "The euro's desk now, and it is unlike any other in this course: twenty-seven sovereign legal systems, one financial market, and a regime caught mid-transformation between the directive era that built it and the single rulebook that will replace it.\n\nThe deal is unchanged: you decide first, and the teaching arrives as feedback. But the decisions on this desk have a property the US and UK desks did not: the right answer depends on the calendar. Law that has been adopted is not yet law that applies; an authority that exists is not yet an authority that examines; a reform everyone has read about may already have been struck down by a court.\n\nYour first file is a consultant's gap analysis, and the board wants your confirmation today.",
    citations: sOpener.sceneData.citations,
  },
};

// -- Cold open -----------------------------------------------------------------------
const sColdOpen = {
  sceneType: 'quiz',
  title: "Cold open: the consultant's three assertions",
  teachesConcepts: ['eu_cold_open'],
  conceptTags: ['aml_package_2024', 'amla'],
  sceneData: {
    intro: 'No teaching yet. The board meets in an hour and wants confirmation, not caveats. Commit.',
    questions: [
      {
        prompt:
          "June 2026. You are group head of financial crime at an EU banking group with branches in three member states. A consultant's gap analysis lands on the board table with three headline assertions: first, that the 2024 AML Regulation is now the directly applicable text your policies must cite; second, that your register procedures may assume public access to beneficial-ownership registers under the Fifth Directive; third, that your Estonian branch now answers to AMLA rather than the national supervisor for its AML examination. The board asks you to confirm before approving the compliance budget. What do you tell them?",
        options: [
          {
            id: 'a',
            text:
              "Confirm the first assertion only: the single rulebook entered into force in 2024 and is a regulation, so it is already the citable law of the land, but the register and supervision assertions overstate reforms that have not yet arrived at the group's door.",
          },
          {
            id: 'b',
            text:
              "Confirm all three: the Package replaced the directive era on adoption, public register access is the Fifth Directive's standing transparency reform, and AMLA's creation moved cross-border AML supervision to Frankfurt when the authority was established.",
          },
          {
            id: 'c',
            text:
              "Confirm none of them today: the existing transpositions remain the operative law until July 2027, register access runs on a legitimate-interest standard after the 2022 Court of Justice ruling, and the branch still answers to its national host supervisor.",
          },
          {
            id: 'd',
            text:
              "Confirm the third assertion only: supervision moved to AMLA when the authority became operational, while the rulebook and register questions stay with the directives until their transposition deadlines have fully run out.",
          },
        ],
        correctOptionId: 'c',
        explanation:
          "All three assertions fail on the same discipline: the calendar. The rulebook assertion confuses entry into force with application, the trap the first distractor dresses up precisely: Regulation (EU) 2024/1624 exists and binds as an instrument, but its obligations apply in the main from 10 July 2027, and until that date the directive-era transpositions are the operative law a policy must cite. The register assertion is two reforms out of date: the Court of Justice struck the general-public-access rule in November 2022, and the 2024 organisational directive codified access on a legitimate-interest standard, so a procedure assuming public access is wrong in law, not merely stale. And the supervision assertion overstates the new authority twice over: AMLA supervises directly only from 2028, and only a selected cohort of high-risk cross-border financial-sector entities; an Estonian branch answers today, and may well answer then, to the national host supervisor. You made this call blind; the lesson ahead builds the instruments, the calendar and the architecture that make each correction obvious.",
        conceptTags: ['aml_package_2024', 'amla'],
        points: 10,
      },
    ],
  },
};

// -- Decision standard ----------------------------------------------------------------
const sStandard = {
  sceneType: 'slide',
  title: 'The decision standard',
  teachesConcepts: ['eu_decision_standard'],
  conceptTags: ['single_rulebook', 'aml_package_2024'],
  sceneData: {
    template: 'callout',
    heading: 'The decision standard',
    items: [
      {
        text:
          'The instrument follows the job, and the law follows the calendar. A directive binds results through national transposition; a regulation applies directly. Until 10 July 2027 the directive-era transpositions are the operative law; AMLA supervises directly from 2028, and only the selected few. Register access answers to the Court of Justice: legitimate interest, not the general public. And structure is risk: branch versus subsidiary allocates supervision.',
      },
    ],
    narration:
      "Here is the standard behind the correction you just delivered, and every decision in this lesson reapplies it. First, the instrument question: the EU legislates AML through two instruments with opposite propagation. A directive binds member states to a result and leaves the words to national transposition, twenty-seven renderings of every rule; a regulation is one text, directly applicable, identical everywhere. Which instrument carries which job is never accidental, and the quiz will hand you jobs and ask for instruments. Second, the calendar question: adoption is not application. The 2024 Package is adopted law, but its single rulebook applies in the main from July 2027, its organisational directive transposes on the same horizon, and the new authority examines its first directly supervised institutions from 2028. Until each date arrives, the directive-era law this course has cited all along remains the operating environment. Third, the court question: the Fifth Directive's public-register reform did not survive judicial review, and any answer about register access now runs through the legitimate-interest standard the 2022 ruling forced and the 2024 directive codified. And fourth, the architecture question, the one the deep case will price in billions: supervision follows structure. A branch splits its supervision between home and host; each authority holds half the picture; and knowing where the halves fail to meet is not EU trivia, it is the risk assessment.",
  },
};

// -- Mid-decision 1: the criminal-layer defence brief, redeployed -------------------
const sMid1 = {
  sceneType: 'quiz',
  title: 'Decision: the defence brief',
  teachesConcepts: ['eu_amld6_applied'],
  conceptTags: ['amld_6'],
  sceneData: {
    intro: 'The criminal layer you just read, tested where it lives: in a national courtroom.',
    questions: [q3],
  },
};

// -- Danske Estonia as a case-file interactive (supervisory architecture only) -----
const sCaseFile = {
  sceneType: 'interactive',
  title: 'Work the file',
  teachesConcepts: ['eu_case_supervisory'],
  conceptTags: ['amla', 'amld_4', 'single_rulebook'],
  sceneData: {
    title: 'Work the file',
    summary:
      'A real, verified enforcement matter, worked one evidence item at a time, with the resolution predicted before you see it.',
    spec: {
      kind: 'case-file',
      caseTitle: 'The Danske Estonia file, 2007-2022',
      intro:
        "This course has met Danske Bank's Estonian branch twice: as the money-laundering typology of Module 0 and as the due-diligence failure at scale of Module 2. This file reads the same record a third way, and tests none of the first two: it is the supervisory-architecture file, the question of who was supposed to be watching, what the architecture did when one watcher saw trouble, and where the price finally landed. Every evidence card and reveal is from the public record of the supervisory decisions and the resolution documents; the decision prompts are the desk you are placed at. Read each evidence card, commit to your call, then see what it cost.",
      steps: [
        {
          id: 'allocation',
          heading: 'Evidence item 1: the allocation',
          evidence: {
            observed:
              "Danske Bank A/S, Denmark's largest bank, operates in Estonia through a branch, not a subsidiary. The branch runs a non-resident portfolio: customers from Russia and other former Soviet states, banked through opaque structures, on the branch's own IT platform, outside the group's monitoring systems.",
            source: 'The public record of the supervisory decisions and the 2022 US resolution.',
            inference:
              'Before any failure, the architecture has already made a decision: the corporate form determines who supervises what.',
            confidence: 'High; the branch structure and the platform separation are documented across the supervisory record.',
          },
          decision: {
            prompt:
              "It is 2013, and you are mapping the supervision of this branch for the group risk committee. Who supervises the branch's anti-money-laundering conduct?",
            options: [
              {
                id: 'a',
                text:
                  'The Danish FSA, as home supervisor of the group: a branch has no separate legal personality, so every supervisory question, prudential and financial-crime alike, follows the legal entity home to Copenhagen.',
              },
              {
                id: 'b',
                text:
                  "Estonia's Finantsinspektsioon, as host supervisor: AML supervision of the branch's conduct falls to the state where it operates, while prudential supervision of the group stays home in Copenhagen.",
              },
              {
                id: 'c',
                text:
                  "The European Central Bank under the Single Supervisory Mechanism: a bank of Danske's significance is directly supervised from Frankfurt, and its financial-crime controls travel with its prudential file as one supervisory package.",
              },
              {
                id: 'd',
                text:
                  'Both authorities jointly, through a binding college mechanism: EU law requires the home and host supervisors of a cross-border branch to examine the branch and act on findings as a single supervisory unit.',
              },
            ],
            correctOptionId: 'b',
            explanation:
              "The branch form splits the supervision, and the split is the whole file. AML supervision of a branch's conduct follows the host state, Estonia, while prudential supervision of the group follows the home state, Denmark: each authority holds half the picture, the home seeing the group but not the branch's customers, the host seeing the conduct but not the group's governance. In 2013 that allocation was less cleanly codified than the later reforms would make it, and it was coordination-dependent by design, which is precisely why it could fail. The home-for-everything reading misses the allocation rule; it is how a group risk committee talks itself out of worrying about a profitable branch. The ECB reading imports the prudential union into financial crime: the Single Supervisory Mechanism centralised capital, and AML was expressly carved out, supervised from national capitals throughout. And the binding-college reading invents the mechanism whose absence defines the era: coordination between home and host was cooperative correspondence, not a compelled joint examination, which is exactly what the next evidence item shows failing.",
          },
          reveal:
            "The allocation on the record: prudential oversight of Danske Bank A/S with the Danish FSA as home supervisor; AML supervision of the Estonian branch's conduct with Estonia's Finantsinspektsioon as host. Two competent authorities, one branch, half a picture each. What the architecture does when one half sees trouble is the next item.",
        },
        {
          id: 'gap',
          heading: 'Evidence item 2: the gap in motion',
          evidence: {
            observed:
              "Estonia's Finantsinspektsioon examines the branch and produces a critical draft report as early as 2014. The findings reach the group's home jurisdiction through channels that generate correspondence between the authorities rather than intervention. The branch continues operating its non-resident portfolio.",
            source: 'The public record of the supervisory decisions and the 2022 US resolution.',
            inference:
              'A host supervisor has documented severe findings about a foreign group\'s branch. Whether anything compels the system to act on them is the question this step decides.',
            confidence: 'High; the 2014 examination and its handling are documented in the supervisory record.',
          },
          decision: {
            prompt:
              "You sit on a review of the EU's supervisory architecture, reading this file as it happens. What does the directive-era architecture compel to happen next?",
            options: [
              {
                id: 'a',
                text:
                  "Automatic referral to the European Banking Authority, which must open a breach-of-Union-law investigation whenever a host supervisor's examination documents failings of this severity inside a cross-border banking group.",
              },
              {
                id: 'b',
                text:
                  "Suspension of the branch's passporting rights until the home supervisor certifies remediation: serious host-state AML findings interrupt the single market's access mechanics by operation of law until they are resolved.",
              },
              {
                id: 'c',
                text:
                  'A binding obligation on the home supervisor to act: once the Estonian report is transmitted, the Danish FSA must open its own intervention into the group\'s governance within a fixed period, or record reasons for declining.',
              },
              {
                id: 'd',
                text:
                  "Nothing binding: the findings travel through cooperation channels with no mechanism compelling either authority to act beyond its own half, and escalation depends on the cross-border coordination the structure already assumed.",
              },
            ],
            correctOptionId: 'd',
            explanation:
              "The honest answer is the uncomfortable one: the architecture compelled nothing. There was no automatic EBA referral; the breach-of-Union-law procedure existed but was discretionary machinery, and, as the record would later show, it was governed by a board composed of the national supervisors themselves. There was no passporting suspension by operation of law; market access did not answer to AML findings. And there was no binding home-must-act rule with a clock; the invented fixed-period obligation is what a well-designed system would have had, which is precisely the point. Findings crossed the border as correspondence, each authority remained within its half, and the escalation the moment demanded depended on voluntary coordination between two institutions that each could reasonably regard the decisive half of the picture as the other's jurisdiction.",
          },
          reveal:
            "The Danish FSA's public reckoning came in 2018, its decision on the bank's management and governance in the Estonia matter, followed by its explanatory supervision report in 2019. The European Banking Authority opened a breach-of-Union-law inquiry into both supervisors, and in April 2019 the EBA's board of supervisors, composed of the national supervisors themselves, voted the staff recommendation down and closed the inquiry without a finding. The institution designed to police national supervision was governed by it.",
        },
        {
          id: 'reckoning',
          heading: 'Evidence item 3: the reckoning',
          evidence: {
            observed:
              "By 2018 the branch's non-resident portfolio is the largest money-laundering scandal in European banking: on the later public record, approximately USD 160 billion processed through US banks for non-resident-portfolio customers. The supervisory inquiries have run their course in Copenhagen, Tallinn and at the EBA.",
            source: 'The public record of the supervisory decisions and the 2022 US resolution.',
            inference:
              'A European branch, two European supervisors, one European single market. Where the price actually lands is the prediction this step asks for.',
            confidence: 'High; the resolution documents are the binding public record.',
          },
          decision: {
            prompt: 'Before the reveal: who ultimately priced the case, and on what hook?',
            options: [
              {
                id: 'a',
                text:
                  'United States authorities: the flows cleared through US correspondent banks, the criminal and securities reckonings ran on US rails, and the European supervisory track produced findings and reports but nothing on that scale.',
              },
              {
                id: 'b',
                text:
                  "The European Banking Authority: the breach-of-Union-law inquiry ended in the first EU-level fine against both national supervisors, the precedent that later anchored the case for giving AMLA its own fining powers.",
              },
              {
                id: 'c',
                text:
                  "The Danish criminal courts: as home jurisdiction of the group, Denmark carried the criminal prosecution, and the group's conviction in Copenhagen remains the largest European money-laundering sentence on the public record.",
              },
              {
                id: 'd',
                text:
                  "A joint European supervisory penalty: the Danish and Estonian authorities, acting through their supervisory college, imposed a coordinated administrative fine calibrated to the branch's non-resident-portfolio revenues.",
              },
            ],
            correctOptionId: 'a',
            explanation:
              "Follow the dollars, not the flags. The non-resident portfolio's flows cleared through correspondent accounts at US banks, and that hook, the same correspondent-banking jurisdiction this course has met since the sanctions module, is what carried the criminal and securities reckonings to Washington. The EBA fine never happened and could not have: the authority had no fining power over national supervisors, and its inquiry closed without a finding by its own members' vote. The joint-college penalty imagines coordination machinery the era did not have; its absence is the file's second evidence item. And Denmark's track, supervisory decisions and national investigation, produced consequences, but nothing at the scale the prediction asks about; the nine-figure pricing of Europe's largest laundering scandal was, pointedly, not European.",
          },
          reveal:
            "On 13 December 2022, Danske Bank A/S pleaded guilty in United States v. Danske Bank A/S to a conspiracy charge concerning its conduct toward the US banks that cleared the flows, in a resolution of approximately USD 2 billion; the parallel SEC matter settled the same day with a civil penalty of USD 178.6 million within a total of approximately USD 413 million. The largest European laundering scandal of its era was priced principally by American authorities.",
        },
      ],
      debrief:
        "Read the file back as the architecture's autopsy, because the 2024 Package is its response, failure by failure. Transposition variance and uneven national rules: answered by Regulation (EU) 2024/1624, one directly applicable rulebook for every obliged entity. The home/host gap this file walked: answered by AMLA's direct supervision of selected high-risk cross-border institutions, with the Danske-profile entity as the type specimen, and by oversight powers across national supervisors for everyone else. The toothless centre the April 2019 vote exposed: answered by giving the new authority its own board structure, powers and fining instruments, deliberately outside the national supervisors' collective veto. And carry the three practitioner rules: structure is risk, because branch-versus-subsidiary allocates supervision and the allocation can be the vulnerability; scandals build architecture, because the EU framework cannot be understood without its failure cases; and the gap years are the practitioner's problem, because until the rulebook applies and AMLA's supervision matures, the fragmentation this file documents remains the operating environment.",
    },
  },
};

// -- Sources, on the record ----------------------------------------------------------
const sRecord = {
  sceneType: 'reading',
  title: 'The file, on the record',
  teachesConcepts: ['eu_case_record'],
  conceptTags: ['amla', 'aml_package_2024'],
  sceneData: {
    body:
      "Everything you just worked is on the public record, and you should know exactly where. The United States resolution is the criminal anchor: Danske Bank A/S pleaded guilty on 13 December 2022 in United States v. Danske Bank A/S to a conspiracy charge concerning its conduct toward the US banks that cleared its Estonian branch's flows, in a resolution of approximately USD 2 billion, with the plea documents recording approximately USD 160 billion processed through US banks for non-resident-portfolio customers between 2008 and 2016. The securities reckoning ran in parallel: the SEC's settled charges of the same day carry a civil penalty of USD 178.6 million within a total settlement of approximately USD 413 million. The European supervisory record is the architecture's own file: the Danish Financial Supervisory Authority's 2018 decision on the bank's management and governance in the Estonia matter and its 2019 supervision report; Estonia's Finantsinspektsioon and its critical draft report of 2014, the finding that crossed the border as correspondence; and the European Banking Authority's breach-of-Union-law inquiry into both supervisors, closed in April 2019 without a finding by the vote of a board the national supervisors themselves composed. And the response is on the record too, in the Official Journal: Regulation (EU) 2024/1624, the single rulebook; Directive (EU) 2024/1640, the organisational layer; and Regulation (EU) 2024/1620, establishing AMLA in Frankfurt, the authority whose selection criteria describe, almost clause by clause, the institution this file just walked.",
    citations: recordCitations,
  },
};

if (sRecord.sceneData.body.length < 1500) {
  throw new Error('sRecord body under 1500 chars: ' + sRecord.sceneData.body.length);
}
if (!sRecord.sceneData.body.includes('Danske Bank A/S')) {
  throw new Error('sRecord body missing required "Danske Bank A/S" anchor');
}

// -- Mid-decision 2: the instrument-choice colleague question, redeployed -----------
const sMid2 = {
  sceneType: 'quiz',
  title: 'Decision: why move the rules at all',
  teachesConcepts: ['eu_instrument_applied'],
  conceptTags: ['single_rulebook', 'aml_package_2024'],
  sceneData: {
    intro: 'The instrument mechanics you just read, asked the way a colleague actually asks.',
    questions: [q1],
  },
};

// -- Classmate rep (the register-access question, redeployed) -----------------------
const sClassmate = {
  sceneType: 'quiz',
  title: 'Marcus needs correcting',
  teachesConcepts: ['eu_register_access_applied'],
  conceptTags: ['amld_5', 'aml_package_2024'],
  sceneData: {
    intro:
      "A procedure lands on your desk for sign-off with the line: 'EU beneficial-ownership registers are open to the general public, per the Fifth Directive.' Marcus drafted it, and he defends it: 'That was the Fifth Directive's whole point, transparency. It was in every training deck I have ever seen.' Meanwhile three access requests are pending against a member state's register: a journalist investigating a laundering network, an obliged entity performing customer due diligence, and a curious member of the public.",
    questions: [q4],
  },
};

// -- Final check: the intact 2028 three-instrument mapping question -----------------
const sFinalCheck = {
  ...sQuiz,
  sceneData: {
    ...sQuiz.sceneData,
    intro:
      'The last file before the desk closes, and the most exam-like: it is 2028, and one question runs across all three instruments. Map it precisely.',
    questions: [q2],
  },
};

// -- Assemble --------------------------------------------------------------------
const pilot = {
  lessonSlug: art.lessonSlug,
  scenes: [
    sCover,
    sColdOpen,
    sStandard,
    sOpenerModified,
    sInstrumentTimeline,
    sDirectiveEra,
    sMid1,
    sFailure,
    sCaseFile,
    sRecord,
    sComparison,
    sMid2,
    sPackage,
    sAmlaRoles,
    sClassmate,
    sFinalCheck,
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

for (const s of pilot.scenes) {
  if (s.sceneType === 'quiz') {
    for (const q of s.sceneData.questions) {
      if (!Array.isArray(q.conceptTags) || !q.conceptTags.length) {
        throw new Error('quiz question missing conceptTags: ' + q.prompt.slice(0, 40));
      }
      if (typeof q.points !== 'number') {
        throw new Error('quiz question missing points: ' + q.prompt.slice(0, 40));
      }
    }
  }
}

for (const s of pilot.scenes) {
  if (s.sceneType === 'interactive') {
    const spec = s.sceneData.spec;
    if (!spec || spec.kind !== 'case-file') throw new Error('interactive scene missing case-file spec: ' + s.title);
    if (!spec.caseTitle) throw new Error('case-file missing caseTitle: ' + s.title);
    if (!spec.debrief) throw new Error('case-file missing debrief: ' + s.title);
    if (!Array.isArray(spec.steps) || spec.steps.length < 2) {
      throw new Error('case-file needs at least 2 steps: ' + s.title);
    }
    for (const step of spec.steps) {
      if (!step.heading) throw new Error('case-file step missing heading: ' + (step.id || '?'));
      const ev = step.evidence;
      if (!ev || !ev.observed || !ev.source || !ev.inference || !ev.confidence) {
        throw new Error('case-file step missing evidence fields: ' + step.id);
      }
      const dec = step.decision;
      if (!dec || !dec.prompt || !Array.isArray(dec.options) || dec.options.length !== 4 || !dec.explanation) {
        throw new Error('case-file step missing decision fields: ' + step.id);
      }
      if (!dec.options.some((o) => o.id === dec.correctOptionId)) {
        throw new Error('case-file step correctOptionId invalid: ' + step.id);
      }
      if (!step.reveal) throw new Error('case-file step missing reveal: ' + step.id);
    }
  }
}

if (pilot.scenes.length !== 17) {
  throw new Error('expected 17 scenes, got ' + pilot.scenes.length);
}

if (JSON.stringify(pilot).includes('PENDING')) {
  throw new Error('unpatched PENDING URL constants');
}

fs.writeFileSync(SRC, JSON.stringify(pilot, null, 2));
console.log('euf conversion written:', pilot.scenes.length, 'scenes');
console.log(pilot.scenes.map((s, i) => `${i + 1}. [${s.sceneType}] ${s.title}`).join('\n'));

// -- Parity report: keyed-option length vs longest distractor, per decision --------
function parityLine(label, options, correctId) {
  const correct = options.find((o) => o.id === correctId);
  const distractors = options.filter((o) => o.id !== correctId);
  const maxDistractor = Math.max(...distractors.map((o) => o.text.length));
  const flag = correct.text.length > maxDistractor ? '  [KEYED LONGER]' : '';
  console.log(`${label}: keyed=${correct.text.length} chars, longest distractor=${maxDistractor} chars${flag}`);
}

console.log('\n-- Parity report --');
{
  const q0 = sColdOpen.sceneData.questions[0];
  parityLine('Cold open (scene 2)', q0.options, q0.correctOptionId);
}
parityLine('Mid 1 - defence brief (scene 7, Q3)', q3.options, q3.correctOptionId);
parityLine('Mid 2 - why move the rules (scene 12, Q1)', q1.options, q1.correctOptionId);
{
  const steps = sCaseFile.sceneData.spec.steps;
  parityLine('Case step 1 - allocation', steps[0].decision.options, steps[0].decision.correctOptionId);
  parityLine('Case step 2 - gap', steps[1].decision.options, steps[1].decision.correctOptionId);
  parityLine('Case step 3 - reckoning', steps[2].decision.options, steps[2].decision.correctOptionId);
}
parityLine('Classmate - Marcus (scene 15, Q4)', q4.options, q4.correctOptionId);
parityLine('Final check (scene 16, Q2)', q2.options, q2.correctOptionId);
