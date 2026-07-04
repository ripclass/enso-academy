// Simulator-format conversion of CCAS `what-cryptoassets-are` (free preview).
// Recipe per the conducting-an-on-chain-investigation v2 pilot: cold-open
// decision, mid-lesson decision, the Terra/Luna worked example as a case-file
// interactive (evidence -> committed decision -> reveal), classmate rep,
// sources-on-record scene, trimmed final check. All facts verbatim from the
// cleared artifact; new text is register and decision content only.
const fs = require('fs');

const SRC = 'generated/ccas/lessons/what-cryptoassets-are.json';
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

const sOpen = byTitle('Five different things, one loose word');
const sFatf = byTitle("What FATF means by a 'virtual asset'");
const sCoins = byTitle('Coins and tokens');
const sTaxonomy = byTitle('A working taxonomy');
const sStable = byTitle('Stablecoins: the settlement layer');
const sTerra = byTitle('Worked example: the collapse of TerraUSD');
const sSort = byTitle('Sort by inherent obfuscation risk');
const sControl = byTitle('Why the category decides the control');
const sQuiz = byTitle('Check for understanding');
const sSynth = byTitle('What to carry forward');

const terraCites = sTerra.sceneData.citations;

// Pull the original quiz questions we redeploy as in-flow decisions/reps.
const qs = sQuiz.sceneData.questions;
const qCbdc = qs.find((q) => q.prompt.startsWith('A central bank announces'));
const qLabel = qs.find((q) => q.prompt.startsWith('An onboarding analyst sees'));
const qPrivacy = qs.find((q) => q.prompt.startsWith('Which description correctly captures'));
const qNft = qs.find((q) => q.prompt.startsWith('An NFT marketplace shows'));
if (!qCbdc || !qLabel || !qPrivacy || !qNft) throw new Error('quiz split failed');

// ── Cover, briefing voice ───────────────────────────────────────────────────
const sDesk = {
  sceneType: 'reading',
  title: 'You are on the desk',
  teachesConcepts: ['cryptoasset_definition'],
  conceptTags: ['cryptoasset_definition'],
  sceneData: {
    body:
      'Sit down. The file is yours.\n\nThis is the first lesson of the course, and it runs the way the job runs: you make the call first, then we take it apart. The discipline being built here is precision about what kind of asset you are looking at, because in cryptoasset compliance the asset type drives the risk and the risk drives the control.\n\nIn a moment a request lands from your manager. Answer it honestly, with whatever instincts you brought in the door. What matters is not whether you get it right; it is noticing how you decided.',
    citations: [
      {
        label: 'FATF Updated Guidance for a Risk-Based Approach to Virtual Assets and Virtual Asset Service Providers (FATF, 2021)',
        url: 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-rba-virtual-assets-2021.html',
      },
    ],
  },
};

// ── Cold open ───────────────────────────────────────────────────────────────
const sColdOpen = {
  sceneType: 'quiz',
  title: 'Cold open: one rating by end of day',
  teachesConcepts: ['asset_taxonomy'],
  conceptTags: ['asset_taxonomy'],
  sceneData: {
    intro:
      'No taxonomy yet, no method. A request has landed and your manager wants an answer today. Choose what you would actually do first.',
    questions: [
      {
        prompt:
          "A prospective customer's wealth statement lists three crypto holdings: a large bitcoin position, a token marketed as a 'stablecoin', and a portfolio of NFTs. Your manager asks for a single crypto-risk rating on the customer by end of day. What do you do first?",
        options: [
          {
            id: 'a',
            text: 'Rate the customer on the bitcoin position, since it is the largest and most liquid holding and the risk of the smaller assets will not change the overall rating materially.',
          },
          {
            id: 'b',
            text: 'Apply the firm policy that treats all cryptoasset exposure as a single high-risk class, since a conservative uniform rating protects the firm regardless of the asset mix.',
          },
          {
            id: 'c',
            text: 'Classify each holding by its category and mechanism before rating anything, because the asset type determines the risk it carries and the controls that can reach it.',
          },
          {
            id: 'd',
            text: 'Request exchange statements and wallet attestations to verify the balances first, since no rating built on unverified holdings can be defended to a reviewer later.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Verification matters and conservatism has its place, but the first move is classification. A transparent coin an investigator can trace forever, a token whose stability depends entirely on market confidence, and an NFT whose price is whatever two wallets say it is carry completely different financial-crime risk, and different controls can reach each of them. A single rating built before the categories are established is a guess wearing a number. This lesson builds the taxonomy that makes the classification reflex automatic.',
        conceptTags: ['asset_taxonomy', 'asset_risk_profile'],
      },
    ],
  },
};

// Connect the opener back to the cold open (prepend only; rest verbatim).
const sOpenModified = {
  ...sOpen,
  sceneData: {
    ...sOpen.sceneData,
    body:
      'Hold on to the decision you just made. If you reached for a rating, any rating, before asking what kinds of assets were actually on that statement, you did what most people do, and it is exactly the reflex this lesson replaces. ' +
      sOpen.sceneData.body,
  },
};

// ── Mid-lesson decision: the label test (redeployed from the final check) ───
const sLabelDecision = {
  sceneType: 'quiz',
  title: 'Decision: the label on the tin',
  teachesConcepts: ['stablecoins'],
  conceptTags: ['stablecoins'],
  sceneData: {
    intro: 'Apply what you just read about the settlement layer.',
    questions: [qLabel],
  },
};

// ── The Terra/Luna file as a case-file interactive ──────────────────────────
const sCaseFile = {
  sceneType: 'interactive',
  title: 'Work the file',
  teachesConcepts: ['asset_risk_profile', 'stablecoins'],
  conceptTags: ['asset_risk_profile', 'stablecoins'],
  sceneData: {
    title: 'Work the file',
    summary:
      'A real, verified matter, worked one evidence item at a time: your call before each reveal. The file rotates between matters, so a retake works a different case.',
    spec: {
      kind: 'case-file',
      caseTitle: 'The Terra file, May 2022',
      intro:
        'Everything in this file is from the public record of the TerraUSD collapse and the enforcement that followed. Read each evidence card, then make your move. Only after you commit do you see what actually happened.',
      steps: [
        {
          id: 'mechanism',
          heading: 'Evidence item 1: the mechanism behind the label',
          evidence: {
            observed:
              'TerraUSD (UST) was marketed as a stablecoin. Its one-dollar peg was maintained not by cash reserves but by an arbitrage relationship with a paired, free-floating token called Luna: below the peg, holders could burn one UST to mint a dollar of Luna; above it, the reverse. There was no meaningful pool of dollars standing behind UST.',
            source: 'The public design of the Terra protocol, later set out in the SEC enforcement record.',
            inference:
              'The category is algorithmic and uncollateralised: stability depended entirely on market confidence and on Luna retaining value.',
            confidence: 'High on the mechanism itself; it was public and documented.',
          },
          decision: {
            prompt:
              "An onboarding file shows a customer's wealth held largely in UST, described in every document as a 'stablecoin'. How do you classify the exposure?",
            options: [
              {
                id: 'a',
                text: 'As a stablecoin in the fiat-backed sense: the market treats the label as a category, the peg has held so far, and second-guessing an established asset class is not the analyst’s job.',
              },
              {
                id: 'b',
                text: 'As an algorithmic, confidence-dependent design that is a fundamentally different and more fragile category than a fiat-collateralised stablecoin with reserves and a freeze lever.',
              },
              {
                id: 'c',
                text: 'As equivalent to holding the dollar itself, since the peg mechanism guarantees a one-dollar redemption value through arbitrage whatever happens to the Luna token.',
              },
              {
                id: 'd',
                text: 'As unclassifiable until the customer provides audited reserve statements, since no stablecoin exposure can be risk-rated without third-party attestation of its backing.',
              },
            ],
            correctOptionId: 'b',
            explanation:
              'The label is marketing, not a risk assessment. "Stablecoin" described UST, but the mechanism underneath was an uncollateralised arbitrage loop whose stability was only as strong as confidence in Luna. An analyst who classified by name rather than by mechanism would have mis-assessed the risk completely; one who demanded audited reserves would at least have discovered there were none to audit.',
          },
          reveal:
            'The design worked exactly as long as confidence held, and not one day longer. The stability had no reserve behind it: only the assumption that Luna would always be worth enough to absorb redemptions.',
        },
        {
          id: 'depeg',
          heading: 'Evidence item 2: the de-peg',
          evidence: {
            observed:
              'In early May 2022, large redemptions and falling confidence pushed UST below its peg. The arbitrage mechanism, designed to restore the peg, instead minted enormous quantities of Luna, collapsing Luna’s price toward zero in a self-reinforcing spiral the market came to call a death spiral. UST never recovered; Luna became practically worthless; tens of billions of dollars of nominal value evaporated over days.',
            source: 'The public on-chain record and contemporaneous market data.',
            inference:
              'Everything happened on a transparent public chain and the flows were visible in real time. Visibility did not make the asset safe.',
            confidence: 'High; the collapse is fully documented on-chain.',
          },
          decision: {
            prompt:
              'It is mid-collapse. Your exchange lists both UST and Luna, and volumes are exploding. What is this moment to a compliance team?',
            options: [
              {
                id: 'a',
                text: 'A market-risk event for the trading and risk desks: prices are moving violently, but price movement alone is not a financial-crime signal and compliance has no distinct role to play in it.',
              },
              {
                id: 'b',
                text: 'A transparency windfall: because the flows are visible on a public chain in real time, monitoring can be safely relaxed while the picture develops, since nothing can be hidden on-chain.',
              },
              {
                id: 'c',
                text: 'A reputational matter for management: the exchange should quietly delist both assets to limit association with the collapse, which removes the compliance exposure with them.',
              },
              {
                id: 'd',
                text: 'A financial-crime moment demanding heightened monitoring: collapses concentrate panic selling, insider activity, fraudulent recovery schemes targeting victims, and laundering of funds extracted before the fall.',
              },
            ],
            correctOptionId: 'd',
            explanation:
              'A sudden de-peg or collapse is itself a financial-crime moment. The panic concentrates exactly the behaviours a monitoring programme exists to catch: insiders acting on what they knew, fraudsters offering fake recovery services to victims, and launderers moving value extracted before the fall. Visibility on-chain helps the investigation afterwards; it does nothing to deter the conduct in the moment.',
          },
          reveal:
            'The collapse became one of the defining compliance case studies of the cycle precisely because so much of the surrounding conduct, extraction before the fall, recovery scams after it, played out in view of anyone watching the chain.',
        },
        {
          id: 'aftermath',
          heading: 'Evidence item 3: the aftermath in the public record',
          evidence: {
            observed:
              'The collapse drew regulatory and criminal action across several jurisdictions. In the United States, the Securities and Exchange Commission brought a civil enforcement action against the project’s developer, Terraform Labs Pte. Ltd., and its founder, Do Kwon, alleging that the offering and marketing of the Terra tokens involved misrepresentations and the sale of unregistered securities; the matter proceeded in the federal courts and was widely reported through 2023 and 2024.',
            source: 'SEC v. Terraform Labs Pte. Ltd. and Do Kwon, U.S. District Court for the Southern District of New York.',
            inference:
              'The enforcement theory turned on the gap between what the asset was marketed as and what it actually was: the same gap your classification exists to close.',
            confidence: 'High on the fact and forum of the action.',
          },
          decision: {
            prompt:
              "Your firm's monitoring policy treats all stablecoins as one low-volatility class with relaxed thresholds. After this file, what do you recommend?",
            options: [
              {
                id: 'a',
                text: 'Keep the unified class: the industry uses the stablecoin label as a standard category, and fragmenting policy classes by backing mechanism adds complexity that monitoring teams cannot operate.',
              },
              {
                id: 'b',
                text: 'Prohibit all stablecoin exposure: Terra proved that any pegged asset can collapse, so the only defensible policy is to exclude the entire category from the platform.',
              },
              {
                id: 'c',
                text: 'Split the class by backing mechanism: fiat-collateralised designs with reserves and freeze levers are a different risk category from algorithmic designs whose stability is only market confidence.',
              },
              {
                id: 'd',
                text: 'Reclassify stablecoins as fiat currency for monitoring purposes, since their purpose is to track a fiat price and fiat-equivalent treatment keeps thresholds consistent across the book.',
              },
            ],
            correctOptionId: 'c',
            explanation:
              'The category drives the risk and the risk drives the controls. One policy class for "stablecoins" repeats the exact error the label invited: treating an uncollateralised confidence machine and a reserved, freezable claim on a company as the same thing. The defensible policy distinguishes by mechanism, which is what your classification discipline is for.',
          },
          reveal:
            'The durable lesson the record teaches: the label on an asset is marketing, not a risk assessment. UST was called a stablecoin; it was an algorithmic design with no reserve. The name on the token tells you almost nothing until you have asked what kind of asset it actually is.',
        },
      ],
      debrief:
        'Read the file back. The mechanism was public before the collapse; the risk was assessable before the collapse; and every downstream failure, from mispriced onboarding to missed monitoring, traces to one skipped question: what kind of asset is this, actually? Category, then risk, then control. In that order, every time.',
      // Alternate verified matter: the fiat-backed twin of the Terra lesson.
      // Facts verbatim from the cleared CCAS stablecoins worked example
      // (NYAG settlement, 23 Feb 2021; CFTC order, 15 Oct 2021).
      alternates: [
        {
          caseTitle: 'The Tether file, 2021',
          intro:
            'Everything in this file is from the public record of the two 2021 enforcement actions concerning the largest fiat-collateralised stablecoin. Read each evidence card, commit to your call, then see what the regulators established.',
          steps: [
            {
              id: 'claim',
              heading: 'Evidence item 1: the claim',
              evidence: {
                observed:
                  'The whole edifice of a fiat-collateralised stablecoin rests on one claim: that the issuer really holds the reserves it says it does. Tether, the largest such stablecoin, represented that its token was fully backed by US dollars.',
                source: 'The public representations later examined in the New York and federal enforcement records.',
                inference:
                  'The category’s safety features, a solvent issuer standing behind the token and able to freeze illicit funds, exist only if the backing claim is true.',
                confidence: 'High on what was claimed; the claim itself is the evidence here.',
              },
              decision: {
                prompt:
                  'An onboarding file shows a customer’s wealth held largely in this token, described in every document as "fully backed, dollar-equivalent". How do you treat the backing claim?',
                options: [
                  {
                    id: 'a',
                    text: 'As established fact: the token is the market’s largest and most liquid stablecoin, and a claim maintained at that scale for years is effectively audited by the market itself.',
                  },
                  {
                    id: 'b',
                    text: 'As operationally irrelevant: what matters for a compliance file is whether the token holds its dollar price in practice, and the peg’s track record answers that question directly.',
                  },
                  {
                    id: 'c',
                    text: 'As a material representation by a counterparty: something to be evidenced, monitored, and weighed against the public record, exactly like any other assertion the file depends on.',
                  },
                  {
                    id: 'd',
                    text: 'As presumptively false: reserve claims by stablecoin issuers are marketing by definition, and a defensible file treats every fiat-backed token as unbacked until proven otherwise.',
                  },
                ],
                correctOptionId: 'c',
                explanation:
                  'The market is not an auditor and the peg is not the reserves: a token can hold its price while the claim beneath it drifts from the truth. But presuming fraud is not analysis either. The discipline is the same one this lesson keeps teaching: the label is a representation, and representations get evidenced, not assumed in either direction.',
              },
              reveal:
                'Two regulators tested exactly that claim in 2021, and both found it had drifted from the truth. The next two cards are what they established.',
            },
            {
              id: 'nyag',
              heading: 'Evidence item 2: the New York record',
              evidence: {
                observed:
                  'In February 2021, the New York Attorney General announced a settlement with the operators of Tether and the affiliated exchange Bitfinex, ending an investigation into whether they had concealed the loss of commingled client and corporate funds. The Attorney General’s office stated plainly that Tether’s claim that its token was fully backed by US dollars at all times "was a lie": for extended periods the tethers in circulation were not backed one-to-one by US dollars held in a bank account, with reserves at times partly held elsewhere, including in a commingled account and as a receivable. The companies agreed to pay 18.5 million US dollars, to stop trading activity with New Yorkers, and to file periodic transparency reports.',
                source: 'The Office of the New York State Attorney General settlement, announced 23 February 2021.',
                inference:
                  'The largest issuer’s central representation failed for extended periods, and it took a regulator to establish the gap.',
                confidence: 'High; the findings are the settlement record.',
              },
              decision: {
                prompt: 'What does this record change in how you classify the asset?',
                options: [
                  {
                    id: 'a',
                    text: 'Reclassify it as an algorithmic stablecoin: without verified dollar reserves, the peg was being maintained by market mechanics, which is the algorithmic category in substance.',
                  },
                  {
                    id: 'b',
                    text: 'Nothing: the token kept its peg throughout, the settlement contains no finding that holders lost money, and classification follows market function rather than reserve accounting.',
                  },
                  {
                    id: 'c',
                    text: 'Treat it as failed: a regulator calling the backing claim a lie makes the token the equivalent of the collapsed algorithmic designs, and files holding it should be treated as loss events.',
                  },
                  {
                    id: 'd',
                    text: 'It remains fiat-collateralised by design, but its risk now visibly rests on issuer integrity: the category’s safety features are only as real as the reserves, so the issuer’s record becomes part of the asset’s risk profile.',
                  },
                ],
                correctOptionId: 'd',
                explanation:
                  'The design category did not change; what changed is the evidence about the issuer standing behind it. A fiat-collateralised stablecoin whose issuer misstated its reserves is not an algorithmic token and not a loss event; it is a fiat-backed token whose central safety assumption now carries a public enforcement record. Classification by mechanism, risk by evidence.',
              },
              reveal:
                'The settlement did not end the questions. Eight months later, a second regulator put numbers on how often the claim had actually been true.',
            },
            {
              id: 'cftc',
              heading: 'Evidence item 3: the federal record',
              evidence: {
                observed:
                  'In October 2021, the US Commodity Futures Trading Commission entered its own order, finding that Tether Holdings Limited and related entities had made untrue or misleading statements about the reserves backing the stablecoin. According to the order, over a sample period of twenty-six months from 2016 to 2018, Tether held sufficient fiat reserves to fully back the tokens in circulation on only about 27.6 percent of the days. Tether was ordered to pay a 41 million US dollar penalty.',
                source: 'The U.S. Commodity Futures Trading Commission order of 15 October 2021.',
                inference:
                  'For most of the sampled period, the stablecoin was not, in fact, fully backed in the way it represented.',
                confidence: 'High; the percentage and the penalty are in the order.',
              },
              decision: {
                prompt:
                  'You are writing your firm’s policy note on fiat-collateralised stablecoins. Based on this file, what is the durable line?',
                options: [
                  {
                    id: 'a',
                    text: 'Treat fiat-backed stablecoins as fiat-equivalent: the token operated and remained widely used throughout, which demonstrates the reserve question is academic for practical risk purposes.',
                  },
                  {
                    id: 'b',
                    text: 'Treat reserve claims as material representations with a public record of failure at the largest issuer: evidenced, monitored, and weighed against what regulators have established, never assumed.',
                  },
                  {
                    id: 'c',
                    text: 'Treat the tokens as worthless for the unbacked days: the 27.6 percent finding means holdings should be discounted to reflect the proportion of time the backing existed.',
                  },
                  {
                    id: 'd',
                    text: 'Treat the matter as resolved: two regulators have acted, transparency reports are now filed, and post-2021 reserve claims can accordingly be relied on as verified.',
                  },
                ],
                correctOptionId: 'b',
                explanation:
                  'The case is not a claim that the token was worthless, and it is not a clean bill of health either: it is a demonstration that the central representation underpinning the category was, for extended periods and for the largest issuer in the market, not true, and that it took regulators to establish the gap. Enforcement creates a record to weigh; it does not convert future claims into facts.',
              },
              reveal:
                'The teaching point of the record: the safety a fiat-backed stablecoin appears to offer, including the comfort that a solvent issuer stands behind it and could freeze illicit funds, depends on the issuer’s reserves and integrity being real. Treat reserve claims as you would any other material assertion by a counterparty.',
            },
          ],
          debrief:
            'Read the file back against the Terra file. Terra taught you that "stablecoin" can label a mechanism with no reserve at all; Tether teaches you that even the fiat-backed version of the label is a representation someone has to verify. Same discipline both times: the name on the token tells you almost nothing until you have asked what kind of asset it actually is, and whether the claim beneath it is evidenced.',
        },
      ],
    },
  },
};

// ── Sources, on the record ──────────────────────────────────────────────────
const sRecord = {
  sceneType: 'reading',
  title: 'The file, on the record',
  teachesConcepts: ['asset_risk_profile'],
  conceptTags: ['asset_risk_profile'],
  sceneData: {
    body:
      'Everything you just worked is on the public record. The mechanism, the collapse, and the death-spiral dynamics are documented on the Terra chain itself and in the contemporaneous public record. The enforcement aftermath, the SEC’s civil action against Terraform Labs Pte. Ltd. and Do Kwon alleging misrepresentations and the sale of unregistered securities, sits in the Southern District of New York’s files and was reported throughout 2023 and 2024. The FATF’s virtual-asset guidance supplies the definitional frame this lesson built. When the file on your screen was Tether rather than Terra, your record is the February 2021 New York Attorney General settlement, 18.5 million US dollars with a New York trading stop and periodic transparency reports, and the October 2021 CFTC order, 41 million US dollars with the finding that reserves fully backed the tokens on only about 27.6 percent of days in the sampled period. Sources below, as always.',
    citations: [
      ...terraCites,
      {
        label:
          'Office of the New York State Attorney General, Settlement with Bitfinex and Tether (announced 23 February 2021)',
      },
      {
        label:
          'U.S. Commodity Futures Trading Commission, Order against Tether Holdings Limited and related entities for misrepresenting reserves (15 October 2021)',
      },
    ],
  },
};

// ── Classmate rep (redeployed CBDC question) ────────────────────────────────
const sClassmate = {
  sceneType: 'quiz',
  title: 'Aisha needs correcting',
  teachesConcepts: ['cbdc_distinction'],
  conceptTags: ['cbdc_distinction'],
  sceneData: {
    intro:
      'Aisha, two seats over, has been reading about central bank digital currencies. She says, confidently: "A CBDC is just government crypto. Same FATF virtual-asset rules, same controls." She is about to put that in a briefing note. What do you tell her?',
    questions: [
      {
        ...qCbdc,
        prompt:
          "Aisha's claim: a CBDC issued and backed by a central bank falls under the FATF Glossary definition of a 'virtual asset'. Is she right?",
      },
    ],
  },
};

// ── Final check: the two remaining questions ────────────────────────────────
const quizTrimmed = {
  ...sQuiz,
  sceneData: { ...sQuiz.sceneData, questions: [qPrivacy, qNft] },
};

// ── Assemble ────────────────────────────────────────────────────────────────
// The reusable decision standard (external-review fix): stated once, right
// after the cold open, then explicitly reapplied by every later decision.
const sStandard = {
  sceneType: 'slide',
  title: 'The decision standard',
  teachesConcepts: ['asset_taxonomy'],
  conceptTags: ['asset_taxonomy'],
  sceneData: {
    template: 'callout',
    heading: 'The decision standard',
    items: [{ text: 'Category first. Then risk. Then control.' }],
    narration:
      'Keep the standard the cold open asked for. Three words in strict order: category, risk, control. Classify the asset by what it actually is and how it actually works; only then can you say what risk it carries, and only then which controls can reach it. Never rate what you have not classified, and never trust a label you have not tested.',
  },
};

const pilot = {
  lessonSlug: art.lessonSlug,
  scenes: [
    sDesk,
    sColdOpen,
    sStandard,
    sOpenModified,
    sFatf,
    sCoins,
    sTaxonomy,
    sStable,
    sLabelDecision,
    sCaseFile,
    sRecord,
    sSort,
    sControl,
    sClassmate,
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
console.log('wca pilot written:', pilot.scenes.length, 'scenes');
console.log(pilot.scenes.map((s, i) => `${i + 1}. [${s.sceneType}] ${s.title}`).join('\n'));
