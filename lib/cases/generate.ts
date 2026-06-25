// Case Mode — the synthetic-case generator.
//
// Each play hands the analyst a fresh, randomized financial-crime case to work:
// spot the red flags, adjudicate a screening alert, then make the call. Cases
// are assembled client-side from authored, AML-correct templates with light
// parameterization (names, jurisdictions, amounts, option order), so they feel
// fresh and never run out without an LLM call per play. Real-case and
// LLM-generated cases are a later expansion; this is the v1 loop.
//
// No em-dashes in player-facing strings (house style). No real-country
// "high-risk" labels — generic risk descriptors keep it durable and fair.

import type { RedFlagItem, ScreeningAlert } from '@/lib/lesson/scenes'

export type DecisionOption = { id: string; text: string; correct: boolean; why: string }

export type GeneratedCase = {
  id: string
  domain: string
  /** True for the real-case packs (1MDB, Danske, ...), gated to the course. */
  real?: boolean
  title: string
  subjectName: string
  subjectLine: string
  brief: string
  redFlagScenario: string
  redFlags: RedFlagItem[]
  alert: ScreeningAlert
  decision: { prompt: string; options: DecisionOption[] }
}

// ---- helpers ---------------------------------------------------------------

// Swappable RNG: Math.random by default, a seeded PRNG during daily generation
// (so the daily case is identical for everyone). The swap/restore is synchronous
// — no await between — so it is safe even server-side.
let _rng: () => number = Math.random
const rnd = () => _rng()

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)]
}
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function money(minK: number, maxK: number): string {
  const v = Math.round((minK + rnd() * (maxK - minK)) / 5) * 5 // round to 5k
  return v >= 1000 ? `$${(v / 1000).toFixed(1).replace(/\.0$/, '')}m` : `$${v}k`
}
function uid(prefix: string): string {
  return `${prefix}-${Math.floor(rnd() * 1e9).toString(36)}`
}

const HIGHER_RISK = [
  'a jurisdiction on the FATF increased-monitoring list',
  'a higher-risk jurisdiction with known AML weaknesses',
  'an offshore secrecy jurisdiction',
  'a jurisdiction with limited beneficial-ownership transparency',
] as const
const LOWER_RISK = [
  'a major financial centre',
  'a well-regulated jurisdiction',
  'a jurisdiction with a strong supervisory record',
] as const
const COMPANY = [
  'Meridian Commodities Ltd',
  'Polaris Trading Co',
  'Halcyon Exports SA',
  'Crestline Holdings',
  'Northwind Resources',
  'Sable & Vance Ltd',
  'Anyon Global Trading',
  'Westmark Imports',
] as const
const PERSON = [
  'Adrian Velez',
  'Lena Torres',
  'Marcus Quint',
  'Dana Whitfield',
  'Omar Castellano',
  'Priya Anand',
  'Felix Brandt',
] as const

// ---- the screening alert (shared shapes) -----------------------------------

function falsePositiveAlert(name: string): ScreeningAlert {
  const list = pick(['OFAC SDN List', 'EU Consolidated List', 'UN Consolidated List'])
  return {
    id: uid('alert'),
    party: {
      name,
      fields: [
        { label: 'DOB', value: '14 Mar 1979' },
        { label: 'Country', value: 'a major financial centre' },
        { label: 'ID', value: `Passport ${Math.floor(rnd() * 9e7 + 1e7)}` },
      ],
    },
    listEntry: {
      name: name.split(' ')[0] + ' ' + pick(['Ahmadi', 'Petrov', 'Nasser', 'Volkov']),
      list,
      fields: [
        { label: 'DOB', value: '2 Sep 1961' },
        { label: 'Country', value: 'a sanctioned jurisdiction' },
        { label: 'Basis', value: 'Asset freeze' },
      ],
    },
    verdict: 'clear',
    why: 'Only the first name is a loose match. The date of birth, nationality, and identifiers all differ, so this is a false positive. Document the disposition and clear it; do not let a weak name match drive the outcome.',
  }
}

function trueMatchAlert(name: string): ScreeningAlert {
  const list = pick(['OFAC SDN List', 'EU Consolidated List', 'UN Consolidated List'])
  return {
    id: uid('alert'),
    party: {
      name,
      fields: [
        { label: 'DOB', value: '8 Jul 1972' },
        { label: 'Country', value: 'a sanctioned jurisdiction' },
        { label: 'ID', value: 'Passport E4471920' },
      ],
    },
    listEntry: {
      name,
      list,
      fields: [
        { label: 'DOB', value: '8 Jul 1972' },
        { label: 'Country', value: 'a sanctioned jurisdiction' },
        { label: 'Basis', value: 'Asset freeze; transactions prohibited' },
      ],
    },
    verdict: 'escalate',
    why: 'Name, date of birth, nationality, and the identifier all align with a designated party. Treat it as a true match: freeze, do not process, and escalate. Sanctions are strict liability, so intent does not matter.',
  }
}

// ---- case templates --------------------------------------------------------

type Template = () => GeneratedCase

const tradeFinance: Template = () => {
  const co = pick(COMPANY)
  const dir = pick(PERSON)
  const route = pick(HIGHER_RISK)
  const x = (3 + Math.floor(rnd() * 3)) // 3x-5x
  return {
    id: uid('case'),
    domain: 'Trade finance',
    title: 'New trade-finance relationship review',
    subjectName: co,
    subjectLine: `Import/export company, banking the trade-finance desk`,
    brief: `${co} is a relatively new trade-finance customer. A review of its recent letters of credit has been escalated to you. The company moves commodities across several jurisdictions, and a handful of the deals do not sit right. Work the file and make the call.`,
    redFlagScenario: `${co}'s last few shipments, side by side. Select the genuine red flags.`,
    redFlags: shuffle<RedFlagItem>([
      { id: 'tf1', label: `An invoice prices the goods at roughly ${x} times the prevailing market rate.`, flag: true, why: 'Over-invoicing moves value across borders disguised as trade. A large price gap from the market rate is a classic trade-based laundering indicator.' },
      { id: 'tf2', label: `Goods are shipped through ${route} with no commercial reason for the detour.`, flag: true, why: 'Illogical routing through an unrelated or higher-risk jurisdiction, with no business rationale, is a core trade-based laundering red flag.' },
      { id: 'tf3', label: 'Payment for one shipment is routed through an unrelated third party in a different country.', flag: true, why: 'Third-party payments break the link between buyer and seller and are a recognised trade-based laundering indicator.' },
      { id: 'tf4', label: 'The bill of lading describes the cargo only as "general goods" with no specification.', flag: true, why: 'Vague or generic goods descriptions frustrate any check that price matches the actual cargo. It is a documentary red flag.' },
      { id: 'tf5', label: 'The company has traded the same commodity with consistent counterparties for several years.', flag: false, why: 'A stable trading history with consistent counterparties is normal commercial behaviour, not a red flag on its own.' },
      { id: 'tf6', label: 'The customer provided audited financial statements and ownership documents at onboarding.', flag: false, why: 'Providing audited accounts and ownership information is good practice. It supports due diligence rather than undermining it.' },
    ]),
    alert: falsePositiveAlert(dir),
    decision: {
      prompt: 'You have confirmed over-invoicing and illogical routing, and cleared the screening alert as a false positive. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'File a suspicious activity report and put the relationship through enhanced review, considering exit.', correct: true, why: 'The pattern meets the suspicion threshold. You report it, you do not need to prove the crime, and you escalate the relationship for a risk decision.' },
        { id: 'd2', text: 'Clear it. Trade finance is complex and pricing often looks unusual.', correct: false, why: 'Complexity is not an excuse to ignore a concrete over-invoicing and routing pattern. Clearing it would be a failure to report.' },
        { id: 'd3', text: 'Ask the customer for a few more invoices and take no further action for now.', correct: false, why: 'Gathering more documents is reasonable, but doing nothing else once you already hold a reasonable suspicion is a reporting failure.' },
      ]),
    },
  }
}

const correspondent: Template = () => {
  const bank = `${pick(['Aurora', 'Caspian', 'Trans-Atlas', 'Verdant', 'Orient Star'])} Bank`
  const dir = pick(PERSON)
  const place = pick(HIGHER_RISK)
  return {
    id: uid('case'),
    domain: 'Correspondent banking',
    title: 'Correspondent relationship and nested activity',
    subjectName: bank,
    subjectLine: 'Foreign respondent bank requesting USD clearing',
    brief: `${bank}, a respondent based in ${place}, holds a correspondent account with your institution. A monitoring alert has flagged its recent clearing activity. Correspondent banking imports the respondent's risk, and the risk of its customers you cannot see. Work it.`,
    redFlagScenario: `What the review of ${bank}'s account turned up. Select the genuine red flags.`,
    redFlags: shuffle<RedFlagItem>([
      { id: 'cb1', label: 'The account is being used to clear payments for downstream banks you cannot see or assess (nested activity).', flag: true, why: 'Nested correspondent banking hides the true originators and beneficiaries. You are exposed to customers you never onboarded.' },
      { id: 'cb2', label: `The respondent is based in ${place} and its own AML programme is weak.`, flag: true, why: 'A respondent in a higher-risk jurisdiction with weak controls is a recognised correspondent-banking risk that calls for enhanced due diligence.' },
      { id: 'cb3', label: 'USD clearing volume tripled in a month with no business explanation.', flag: true, why: 'A sudden, unexplained spike in clearing volume is a monitoring red flag that warrants a request for rationale and possible escalation.' },
      { id: 'cb4', label: 'The account shows payable-through features, with the respondent’s customers transacting directly.', flag: true, why: 'Payable-through arrangements let the respondent’s customers use your institution directly, a high-risk structure requiring specific controls.' },
      { id: 'cb5', label: 'The respondent completed a full Wolfsberg correspondent banking questionnaire.', flag: false, why: 'A completed Wolfsberg questionnaire supports due diligence. It is part of good practice, not a red flag.' },
      { id: 'cb6', label: 'The respondent is a long-established, well-supervised bank in its home market.', flag: false, why: 'A strong regulatory standing is mitigating context, not an indicator of risk by itself.' },
    ]),
    alert: trueMatchAlert(dir),
    decision: {
      prompt: 'You found nested activity and an unexplained volume spike, and the payment screening returned a true sanctions match. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Freeze the matched payment, restrict the relationship pending review, and report as required.', correct: true, why: 'A true sanctions match is strict liability: you stop the payment. The nested activity and volume spike justify restricting and reviewing the whole relationship.' },
        { id: 'd2', text: 'Process the payment but send the respondent a warning letter about nesting.', correct: false, why: 'Processing a payment that matches a designated party is a sanctions breach regardless of any warning letter.' },
        { id: 'd3', text: 'Close the account immediately and tell the respondent it is due to the sanctions hit.', correct: false, why: 'Abrupt closure with a reason that effectively discloses the report risks tipping off and de-risking. Restrict, review, and follow process.' },
      ]),
    },
  }
}

const privateBanking: Template = () => {
  const client = pick(PERSON)
  const amt = money(2000, 8000)
  return {
    id: uid('case'),
    domain: 'PEP / private banking',
    title: 'Private-banking onboarding: a politically connected client',
    subjectName: client,
    subjectLine: 'Prospective private-banking client, family of a senior official',
    brief: `${client} wants to open a private-banking relationship and has placed an initial ${amt}. ${client} is the close family member of a serving senior government official, which makes this a politically exposed relationship by association. The relationship is not prohibited, but it carries specific obligations. Work the file.`,
    redFlagScenario: `What onboarding turned up about ${client}. Select the genuine red flags.`,
    redFlags: shuffle<RedFlagItem>([
      { id: 'pb1', label: 'The stated source of wealth does not match any known income or business activity.', flag: true, why: 'For a politically exposed relationship, wealth that cannot be explained by a legitimate source is the central red flag and the reason enhanced due diligence exists.' },
      { id: 'pb2', label: 'Funds are held through shell companies in secrecy jurisdictions with no clear purpose.', flag: true, why: 'Layered shell structures in secrecy jurisdictions obscure beneficial ownership and are a recognised grand-corruption indicator.' },
      { id: 'pb3', label: 'Large round-number inflows arrive from a state-owned entity the official oversees.', flag: true, why: 'Round-number flows from an entity within the official’s remit point to the abuse of public office, the core corruption typology.' },
      { id: 'pb4', label: 'The client is reluctant to provide source-of-funds documentation.', flag: true, why: 'Reluctance to evidence source of funds, especially for a PEP-by-association, is a significant red flag.' },
      { id: 'pb5', label: 'The client has a long, documented career as a salaried professional.', flag: false, why: 'A clear, documented income history is supporting evidence of legitimate wealth, not a red flag.' },
      { id: 'pb6', label: 'The relationship was correctly identified as politically exposed at onboarding.', flag: false, why: 'Correctly flagging the PEP connection is the control working as intended. The status itself is not a red flag; unexplained wealth is.' },
    ]),
    alert: falsePositiveAlert(client),
    decision: {
      prompt: 'The wealth cannot be explained, funds run through shell companies, and the sanctions screen was a false positive. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Do not onboard on these terms; report the suspicion and escalate. Onboarding would require senior approval, full source-of-wealth evidence, and enhanced ongoing monitoring.', correct: true, why: 'Unexplained wealth plus concealment for a politically exposed client meets the suspicion threshold. A PEP relationship requires senior sign-off, source-of-wealth evidence, and enhanced monitoring, none of which is satisfied here.' },
        { id: 'd2', text: 'Decline outright, because PEPs are prohibited customers.', correct: false, why: 'PEPs are not prohibited. They require enhanced due diligence, not blanket refusal. Blanket de-risking is itself a supervisory concern.' },
        { id: 'd3', text: 'Onboard as a normal client; the sanctions screen was clear.', correct: false, why: 'A clear sanctions screen says nothing about the corruption risk. Onboarding without addressing the unexplained wealth would be a serious failure.' },
      ]),
    },
  }
}

const msbCrypto: Template = () => {
  const co = pick(['Swiftway Pay', 'Nodal Exchange', 'Remit Bridge', 'Cointide', 'Paystream MSB'])
  const dir = pick(PERSON)
  const amt = money(50, 400)
  return {
    id: uid('case'),
    domain: 'MSB / virtual assets',
    title: 'Rapid pass-through activity at a money-services customer',
    subjectName: co,
    subjectLine: 'Money-services / virtual-asset business customer',
    brief: `${co} is a money-services and virtual-asset business that banks with you. Monitoring has flagged its account for rapid in-and-out movement. Each cycle is around ${amt}. Money-services and crypto flows are fast, so the typology here is volume and velocity, not size. Work it.`,
    redFlagScenario: `The pattern monitoring surfaced on ${co}'s account. Select the genuine red flags.`,
    redFlags: shuffle<RedFlagItem>([
      { id: 'mc1', label: 'Funds arrive and leave the same day with no apparent economic purpose (pass-through).', flag: true, why: 'Same-day in-and-out movement with no economic rationale is the classic layering pattern: the account is a conduit, not a destination.' },
      { id: 'mc2', label: 'Deposits are repeatedly structured just under the cash reporting threshold.', flag: true, why: 'Deliberately keeping transactions below a reporting threshold is structuring, a reportable offence in its own right.' },
      { id: 'mc3', label: 'Counterparties include exchanges and mixing services known for obfuscation.', flag: true, why: 'Exposure to mixers and high-risk exchanges is a recognised virtual-asset laundering indicator.' },
      { id: 'mc4', label: 'The same funds are moved through several accounts controlled by the customer.', flag: true, why: 'Moving the same value through multiple controlled accounts is layering designed to break the audit trail.' },
      { id: 'mc5', label: 'The business is registered as a money-services business with its regulator.', flag: false, why: 'Proper registration is a compliance positive, not a red flag.' },
      { id: 'mc6', label: 'The account also receives consistent, documented payroll for the firm’s staff.', flag: false, why: 'Regular, documented payroll is ordinary business activity and is not suspicious.' },
    ]),
    alert: trueMatchAlert(dir),
    decision: {
      prompt: 'You confirmed pass-through layering and structuring, and a counterparty screen returned a true sanctions match. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Stop the matched transaction, file a suspicious activity report, and escalate the relationship.', correct: true, why: 'A true sanctions match must be stopped. The layering and structuring meet the suspicion threshold and require a report and escalation.' },
        { id: 'd2', text: 'Let it run a bit longer to gather more evidence before doing anything.', correct: false, why: 'Allowing a sanctioned transaction to proceed is a breach, and sitting on a formed suspicion is a reporting failure.' },
        { id: 'd3', text: 'Clear it. Money-services and crypto flows are always fast and noisy.', correct: false, why: 'Speed is the nature of the sector, not an excuse to ignore a concrete layering pattern and a sanctions hit.' },
      ]),
    },
  }
}

const cashIntensive: Template = () => {
  const co = pick(['Brightwash Auto Spa', 'Cornerstone Parking', 'Gala Event Hire', 'Riverside Diner Group'])
  const owner = pick(PERSON)
  const amt = money(80, 300)
  return {
    id: uid('case'),
    domain: 'Cash-intensive business',
    title: 'Cash deposits beyond a business’s plausible capacity',
    subjectName: co,
    subjectLine: 'Cash-intensive business banking customer',
    brief: `${co} is a cash-intensive business banking with you. Its cash deposits have grown to about ${amt} a month, well beyond what a business of its size and footfall could plausibly take. Cash-intensive businesses are a classic vehicle for mixing illicit cash with legitimate takings. Work it.`,
    redFlagScenario: `What the review of ${co}'s deposits found. Select the genuine red flags.`,
    redFlags: shuffle<RedFlagItem>([
      { id: 'ci1', label: 'Cash deposits far exceed what the business’s size and customer footfall could realistically generate.', flag: true, why: 'Deposits inconsistent with the apparent scale of the business is the core indicator that illicit cash is being mixed with legitimate takings.' },
      { id: 'ci2', label: 'Deposits are broken into amounts kept just below the cash reporting threshold.', flag: true, why: 'Structuring deposits to avoid a reporting trigger is itself a reportable offence.' },
      { id: 'ci3', label: 'Business takings are commingled with the owner’s personal accounts.', flag: true, why: 'Commingling business and personal funds frustrates any reconciliation of takings to deposits and is a recognised red flag.' },
      { id: 'ci4', label: 'Deposits are spread across several branches, seemingly to avoid attention.', flag: true, why: 'Spreading deposits across locations to stay under the radar is a structuring and layering indicator.' },
      { id: 'ci5', label: 'Revenue varies seasonally in a way that fits the type of business.', flag: false, why: 'Seasonality consistent with the business model is expected and not suspicious.' },
      { id: 'ci6', label: 'The business has filed tax returns consistent with its declared turnover.', flag: false, why: 'Tax filings that line up with declared turnover are supporting evidence, not a red flag.' },
    ]),
    alert: falsePositiveAlert(owner),
    decision: {
      prompt: 'Deposits exceed plausible capacity, they are structured and commingled, and the sanctions screen was a false positive. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'File a suspicious activity report and place the customer under enhanced monitoring.', correct: true, why: 'The deposit pattern meets the suspicion threshold. You report and you tighten monitoring; you do not need to prove where the cash came from.' },
        { id: 'd2', text: 'Do nothing; cash businesses naturally deposit a lot of cash.', correct: false, why: 'Cash volume that exceeds plausible capacity, structured to avoid reporting, is exactly what you must escalate, not wave through.' },
        { id: 'd3', text: 'Quietly close the account without filing anything.', correct: false, why: 'Closing without reporting abandons the obligation and can amount to de-risking. The suspicion still has to be reported.' },
      ]),
    },
  }
}

const SYNTHETIC: readonly Template[] = [
  tradeFinance,
  correspondent,
  privateBanking,
  msbCrypto,
  cashIntensive,
]

// ---- real-case packs (gated to enrolled students) --------------------------
// Grounded in the public record and framed at the judgment level (no contested
// specifics, generic invented counterparties for the screening step). The title
// names the matter; the steps are what a practitioner would actually do. These
// mirror the deep cases taught in the course.

function caseOneMDB(): GeneratedCase {
  return {
    id: uid('case'),
    domain: 'PEP / complex structures',
    real: true,
    title: 'Deep case: 1MDB and the fund that was looted',
    subjectName: 'A sovereign development fund',
    subjectLine: 'State investment fund, banking your private-banking desk',
    brief: 'A government-owned development fund holds accounts with your private bank. A young, well-connected businessman with no official role keeps appearing between the fund and large outbound transfers, and money is moving to entities whose names echo, but are not, legitimate counterparties. This is the 1MDB pattern. Work it.',
    redFlagScenario: 'What the review of the fund’s outbound flows turned up. Select the genuine red flags.',
    redFlags: shuffle<RedFlagItem>([
      { id: 'mdb1', label: 'Large sums move out of a sovereign development fund into private accounts with no investment rationale.', flag: true, why: 'Diversion of public money into private hands with no legitimate purpose is the heart of grand corruption.' },
      { id: 'mdb2', label: 'A politically connected intermediary with no official role is directing the fund’s transactions.', flag: true, why: 'An unofficial intermediary steering sovereign money is a classic kleptocracy indicator and a reason for enhanced due diligence.' },
      { id: 'mdb3', label: 'Payments are routed to a shell company whose name closely mimics a legitimate state-linked entity.', flag: true, why: 'A near-identical name designed to be mistaken for a real counterparty is deliberate concealment, a strong red flag.' },
      { id: 'mdb4', label: 'The intermediary’s personal spending on property and luxury assets dwarfs any known income.', flag: true, why: 'Lifestyle wildly inconsistent with known income points to the proceeds of corruption.' },
      { id: 'mdb5', label: 'The fund is government-owned and backed by sovereign guarantees.', flag: false, why: 'State ownership is context, not a red flag in itself. The diversion of the money is the problem.' },
      { id: 'mdb6', label: 'The underlying bond deals were arranged by a major global investment bank.', flag: false, why: 'The identity of the arranger is not, by itself, a red flag. The unexplained flows and mimicking shell are.' },
    ]),
    alert: trueMatchAlert('Tarek Mansour'),
    decision: {
      prompt: 'Money is leaving a sovereign fund through a connected intermediary into mimicking shell companies, and a counterparty screen returned a true match. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Stop the matched payment, file a report, and escalate. This is grand corruption, and the relationship requires senior review and likely exit.', correct: true, why: 'A true sanctions match must be stopped, and the diversion through mimicking shells meets the suspicion threshold. You report and escalate; you do not need to prove the theft.' },
        { id: 'd2', text: 'Process the payments; the fund is government-backed and the deals were arranged by a major bank.', correct: false, why: 'Neither government ownership nor a reputable arranger explains money leaving the fund into mimicking shells. Processing would be a serious failure.' },
        { id: 'd3', text: 'Ask the intermediary to clarify his role and keep the relationship running.', correct: false, why: 'Gathering more information is fine, but continuing to process while holding a formed suspicion is a reporting failure.' },
      ]),
    },
  }
}

function caseDanske(): GeneratedCase {
  return {
    id: uid('case'),
    domain: 'Correspondent banking',
    real: true,
    title: 'Deep case: Danske Estonia and the non-resident portfolio',
    subjectName: 'A foreign branch’s non-resident portfolio',
    subjectLine: 'Non-resident customers clearing through your correspondent account',
    brief: 'A small foreign branch of a reputable banking group clears an enormous volume of US dollars through your correspondent account. Its customers are overwhelmingly non-resident shell companies with no connection to the branch’s own country, and the branch runs its own systems with little oversight from the group. This is the Danske Estonia pattern. Work it.',
    redFlagScenario: 'What the correspondent review of the branch found. Select the genuine red flags.',
    redFlags: shuffle<RedFlagItem>([
      { id: 'dk1', label: 'A small branch clears volumes wildly out of proportion to its size, vast sums over several years.', flag: true, why: 'Clearing volume that cannot be explained by the size of the customer or branch is the core correspondent-banking red flag.' },
      { id: 'dk2', label: 'The customers are mostly non-resident shell companies with no business nexus to the branch’s country.', flag: true, why: 'A portfolio of non-resident shells with no local connection is exactly the exposure correspondent due diligence exists to catch.' },
      { id: 'dk3', label: 'The branch runs a separate IT and AML platform with limited oversight from the group.', flag: true, why: 'A control environment cut off from group oversight is a structural weakness that lets risk run unchecked.' },
      { id: 'dk4', label: 'Concerns about the activity were raised internally and by counterparties and were not acted on.', flag: true, why: 'Warnings that are received and ignored turn a control gap into a governance failure.' },
      { id: 'dk5', label: 'The branch belongs to a large, reputable banking group.', flag: false, why: 'Group reputation is mitigating context, not an indicator of risk by itself.' },
      { id: 'dk6', label: 'Some customers provided standard account-opening documentation.', flag: false, why: 'Holding documents is not the same as understanding the customer. The documents do not clear the volume pattern.' },
    ]),
    alert: trueMatchAlert('Viktor Sorokin'),
    decision: {
      prompt: 'You found non-resident volumes far beyond the branch’s scale through a weakly-controlled platform, and a payment screen returned a true match. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Freeze the matched payment, restrict the correspondent relationship pending review, and report.', correct: true, why: 'A true sanctions match must be stopped. The non-resident volumes through a weakly-controlled branch justify restricting and reviewing the whole relationship.' },
        { id: 'd2', text: 'Keep clearing; the branch is part of a reputable group and provides documents.', correct: false, why: 'Group reputation and paperwork do not explain the volumes. Continuing to clear would be the exact failure this case is known for.' },
        { id: 'd3', text: 'Send the branch a questionnaire and take no other action for now.', correct: false, why: 'A questionnaire is fine, but doing nothing else while a sanctions match and a clear pattern sit in front of you is a breach and a reporting failure.' },
      ]),
    },
  }
}

function caseWestpac(): GeneratedCase {
  return {
    id: uid('case'),
    domain: 'Transaction monitoring',
    real: true,
    title: 'Deep case: Westpac and the channel without the right scenario',
    subjectName: 'A low-value international payments channel',
    subjectLine: 'High-volume small cross-border payments product',
    brief: 'A low-value international payments product moves large numbers of small cross-border payments. Some of the activity matches a known, serious exploitation typology, frequent small transfers to higher-risk corridors, but the monitoring scenario for that typology was never deployed on this channel, and many of the required international-transfer reports were not filed on time. This is the Westpac pattern. Work it.',
    redFlagScenario: 'What the review of the payments channel found. Select the genuine red flags.',
    redFlags: shuffle<RedFlagItem>([
      { id: 'wp1', label: 'Frequent small payments to higher-risk corridors match a known serious-harm typology.', flag: true, why: 'A pattern that fits a recognised typology is a red flag regardless of the size of each payment.' },
      { id: 'wp2', label: 'No appropriate monitoring scenario for that typology is deployed on this channel.', flag: true, why: 'A known typology with no scenario to detect it on the channel where the risk runs is the central control failure here.' },
      { id: 'wp3', label: 'A large number of international-transfer reports were not filed within the required time.', flag: true, why: 'Late or missing regulatory reports are a reportable failure in their own right.' },
      { id: 'wp4', label: 'Product risk was not reassessed when the channel was launched.', flag: true, why: 'Launching a channel without assessing its specific risk is how a coverage gap opens in the first place.' },
      { id: 'wp5', label: 'The payments are individually small in value.', flag: false, why: 'Small value is the nature of the typology, not a defence. The pattern, not the size, is what matters.' },
      { id: 'wp6', label: 'The product is a registered, lawful payments service.', flag: false, why: 'Being a lawful product says nothing about whether the channel is monitored for the risk it carries.' },
    ]),
    alert: falsePositiveAlert('Daniel Hughes'),
    decision: {
      prompt: 'The channel matches a known typology with no scenario deployed, reports are outstanding, and the sanctions screen was a false positive. What is the right call?',
      options: shuffle<DecisionOption>([
        { id: 'd1', text: 'Deploy the missing scenario, file the outstanding reports, and escalate the control gap.', correct: true, why: 'The failure is the missing monitoring on a known typology and the late reports. You fix the coverage, report, and escalate. The size of the payments is not the point.' },
        { id: 'd2', text: 'Do nothing; the payments are too small to be a concern.', correct: false, why: 'Small value is exactly the typology. Treating it as harmless is the mistake at the centre of this case.' },
        { id: 'd3', text: 'Quietly shut the product down without filing the outstanding reports.', correct: false, why: 'Closing the channel does not discharge the obligation to file the reports already due, and abandons the suspicion.' },
      ]),
    },
  }
}

export type RealCaseMeta = { id: string; title: string; tag: string }

const REAL_CASES: { meta: RealCaseMeta; build: () => GeneratedCase }[] = [
  { meta: { id: '1mdb', title: '1MDB', tag: 'Grand corruption' }, build: caseOneMDB },
  { meta: { id: 'danske', title: 'Danske Estonia', tag: 'Correspondent banking' }, build: caseDanske },
  { meta: { id: 'westpac', title: 'Westpac / LitePay', tag: 'Monitoring failure' }, build: caseWestpac },
]

export const REAL_CASE_META: RealCaseMeta[] = REAL_CASES.map((r) => r.meta)

/** Deep-case lesson slug -> real-case id, for the "work this case" lesson CTA. */
export const LESSON_CASE_MAP: Record<string, string> = {
  'case-study-1mdb-and-the-private-banking-failure-mode': '1mdb',
  'case-study-the-danske-bank-estonia-affair': 'danske',
  'case-study-westpac-and-the-litepay-channel': 'westpac',
}

/** Build a specific real case by id (for the picker and lesson deep-links). */
export function buildCaseById(id: string): GeneratedCase | null {
  const r = REAL_CASES.find((x) => x.meta.id === id)
  return r ? r.build() : null
}

/**
 * Generate a random case. `includeReal` mixes the real-case packs into the pool
 * (enrolled students); without it, only the synthetic taster cases are dealt.
 */
export function generateCase(opts?: { avoidDomain?: string; includeReal?: boolean }): GeneratedCase {
  const pool: Array<() => GeneratedCase> = [
    ...SYNTHETIC,
    ...(opts?.includeReal ? REAL_CASES.map((r) => r.build) : []),
  ]
  let c = pick(pool)()
  let guard = 0
  while (opts?.avoidDomain && c.domain === opts.avoidDomain && guard++ < 6) {
    c = pick(pool)()
  }
  return c
}

/** Today's seed (UTC date), so the daily case is the same for everyone. */
export function todaysSeed(): number {
  const d = new Date()
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate()
}

/**
 * The daily case: deterministic from the seed, so every player gets the exact
 * same case (and the same red-flag set, screening, and decision) on a given
 * day. Drawn from the synthetic pool so it is playable by everyone, free too.
 */
export function generateDailyCase(seed: number): GeneratedCase {
  const prev = _rng
  _rng = mulberry32(seed)
  try {
    return SYNTHETIC[Math.floor(_rng() * SYNTHETIC.length)]()
  } finally {
    _rng = prev
  }
}
