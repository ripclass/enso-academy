// lib/cases/scenarios-rollout.ts
//
// The "Apply it" challenge scenarios for the rollout modules (CAMS Modules 3-8,
// 10, 11). Kept separate from scenario-bank.ts so the bank file stays readable;
// spread into SCENARIO_BANK there. Type-only import, so there is no runtime
// import cycle. Same authoring bar as the in-bank scenarios: synthetic and
// concept-true, plausible competing-control distractors, no em-dashes, and the
// adaptive selector matches on conceptTags drawn from the live lesson tags.

import type { ChallengeScenario } from './scenario-bank'

export const ROLLOUT_SCENARIOS: ChallengeScenario[] = [
  // ════════════════════════════════════════════════════════════════════════
  // Module 3: Customer Due Diligence and Beneficial Ownership
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm3-cdd-pillars-sequence',
    conceptTags: ['cdd', 'identification', 'verification'],
    mechanic: 'sequence',
    title: 'The four CDD pillars in order',
    spec: {
      kind: 'sequence',
      prompt: 'Put the four pillars of customer due diligence under FATF Recommendation 10 in the order they are performed for a new customer.',
      steps: [
        { id: 'identify', label: 'Identify the customer by collecting their identifying particulars, such as name, address, and date of birth or registration details.', why: 'You cannot verify or assess a customer until you have first captured who they say they are.' },
        { id: 'verify', label: 'Verify that identity using reliable, independent source documents, data, or information.', why: 'Verification confirms the claimed identity is real before the relationship proceeds.' },
        { id: 'purpose', label: 'Understand the purpose and intended nature of the business relationship.', why: 'Knowing expected activity gives you the baseline against which later behaviour is judged.' },
        { id: 'monitor', label: 'Conduct ongoing monitoring of the relationship and keep the CDD information current.', why: 'Monitoring runs throughout the relationship so the file and the risk view stay accurate over time.' }
      ]
    }
  },
  {
    id: 'm3-cdd-pillar-match',
    conceptTags: ['cdd', 'purpose_of_relationship', 'ongoing_monitoring'],
    mechanic: 'match',
    title: 'Match the pillar to its meaning',
    spec: {
      kind: 'match',
      prompt: 'Match each CDD pillar to what it actually requires.',
      pairs: [
        { id: 'identify', left: 'Identify the customer', right: 'Collect the customer identifying particulars at the start of the relationship.', why: 'Identification is about capturing the claimed identity details.' },
        { id: 'verify', left: 'Verify identity', right: 'Confirm those particulars against reliable, independent sources.', why: 'Verification tests the claim rather than just recording it.' },
        { id: 'purpose', left: 'Purpose and intended nature', right: 'Establish why the relationship is opened and what activity is expected.', why: 'This sets the expected profile that monitoring later relies on.' },
        { id: 'monitor', left: 'Ongoing monitoring', right: 'Scrutinise activity over time against the expected profile and keep CDD current.', why: 'Monitoring is the continuing duty that keeps CDD meaningful after onboarding.' }
      ]
    }
  },
  {
    id: 'm3-cdd-activity-sort',
    conceptTags: ['identification', 'verification', 'ongoing_monitoring'],
    mechanic: 'sort',
    title: 'Which pillar does the task belong to',
    spec: {
      kind: 'sort',
      prompt: 'Sort each task into the CDD pillar it belongs to.',
      buckets: [
        { id: 'identify', label: 'Identify and verify' },
        { id: 'purpose', label: 'Understand the purpose' },
        { id: 'monitor', label: 'Ongoing monitoring' }
      ],
      items: [
        { id: 'i1', label: 'Checking a passport against an independent identity register.', bucket: 'identify', why: 'Confirming a document against an independent source is identity verification.' },
        { id: 'p1', label: 'Recording that a new account will be used to receive monthly salary.', bucket: 'purpose', why: 'Capturing expected use establishes the purpose and intended nature of the relationship.' },
        { id: 'm1', label: 'Reviewing, a year on, whether activity still matches the expected profile.', bucket: 'monitor', why: 'Comparing later activity to the baseline is ongoing monitoring.' },
        { id: 'p2', label: 'Asking a corporate client about its expected transaction volumes.', bucket: 'purpose', why: 'Establishing expected volumes is part of understanding the relationship.' },
        { id: 'm2', label: 'Re-checking the customer file when their circumstances change.', bucket: 'monitor', why: 'Keeping the file current as things change is part of monitoring.' },
        { id: 'i2', label: 'Confirming a company registration number with the corporate registry.', bucket: 'identify', why: 'Validating registration details against the registry is identification and verification.' }
      ]
    }
  },
  {
    id: 'm3-edd-trigger-decision',
    conceptTags: ['edd', 'high_risk_customer', 'senior_approval'],
    mechanic: 'decision',
    title: 'When EDD is triggered',
    spec: {
      kind: 'decision',
      prompt: 'A relationship is being onboarded. Which situation calls for enhanced due diligence rather than standard CDD?',
      options: [
        { id: 'a', text: 'The customer is a foreign politically exposed person connected to a state body.', correct: true, why: 'A foreign PEP is automatically higher risk and triggers EDD, including source of wealth and senior approval.' },
        { id: 'b', text: 'The customer is a salaried retail client with a low-value transactional account.', correct: false, why: 'A stable, low-value salaried account is the standard lower-risk profile, so ordinary CDD applies.' },
        { id: 'c', text: 'The customer wants to add a second authorised signatory to the account.', correct: false, why: 'Adding a signatory is an administrative change and is not by itself a higher-risk trigger.' },
        { id: 'd', text: 'The customer identity documents have expired and need to be refreshed.', correct: false, why: 'Expired documents call for a CDD refresh, not the deeper measures of EDD.' }
      ]
    }
  },
  {
    id: 'm3-edd-risk-classify',
    conceptTags: ['edd', 'high_risk_customer'],
    mechanic: 'risk-classify',
    title: 'Rate the onboarding risk',
    spec: {
      kind: 'risk-classify',
      prompt: 'Classify each prospective customer by the risk tier that should drive the depth of due diligence.',
      items: [
        { id: 'low', label: 'A salaried resident opening a basic savings account funded by verifiable local wages.', tier: 'low', why: 'Local salary, a simple product, and transparent funds make this the lower-risk baseline.' },
        { id: 'med', label: 'A domestic import-export business with moderate cross-border payments and a transparent ownership chain.', tier: 'medium', why: 'Cross-border trade adds exposure, but transparent ownership keeps it out of the top tier.' },
        { id: 'high', label: 'An offshore holding company whose ultimate owner is a foreign politically exposed person.', tier: 'high', why: 'Offshore layering combined with a foreign PEP owner is a classic higher-risk profile requiring EDD.' }
      ]
    }
  },
  {
    id: 'm3-edd-sow-sof-sort',
    conceptTags: ['source_of_wealth', 'source_of_funds'],
    mechanic: 'sort',
    title: 'Wealth or funds',
    spec: {
      kind: 'sort',
      prompt: 'Sort each piece of evidence by whether it supports source of wealth or source of funds.',
      buckets: [
        { id: 'sow', label: 'Source of wealth' },
        { id: 'sof', label: 'Source of funds' }
      ],
      items: [
        { id: 'w1', label: 'Audited accounts showing years of business profits that built the customer overall fortune.', bucket: 'sow', why: 'Source of wealth explains how the customer total net worth was accumulated over time.' },
        { id: 'f1', label: 'A bank statement showing the specific transfer that funded the new account.', bucket: 'sof', why: 'Source of funds is the origin of the particular money entering the relationship.' },
        { id: 'w2', label: 'An inheritance grant explaining a large share of the customer net worth.', bucket: 'sow', why: 'An inheritance accounts for how overall wealth was built, so it evidences source of wealth.' },
        { id: 'f2', label: 'The sale contract for the property whose proceeds are being deposited now.', bucket: 'sof', why: 'It evidences the origin of the specific funds being deposited.' },
        { id: 'w3', label: 'A long employment and bonus history evidencing accumulated savings.', bucket: 'sow', why: 'A career earnings history explains the build-up of overall wealth.' },
        { id: 'f3', label: 'A loan agreement evidencing the money being deposited this month.', bucket: 'sof', why: 'It identifies where this particular tranche of money came from.' }
      ]
    }
  },
  {
    id: 'm3-bo-identify-ubo-decision',
    conceptTags: ['beneficial_ownership', 'ubo', 'ownership_test'],
    mechanic: 'decision',
    title: 'Find the beneficial owner',
    spec: {
      kind: 'decision',
      prompt: 'Northwind Trading is owned 60 percent by Alder Holdings and 40 percent by Birch Holdings. Alder is owned equally by Mr Vale and Ms Crane; Birch is wholly owned by Mr Doss. Applying a 25 percent ownership threshold, who are the beneficial owners to identify?',
      options: [
        { id: 'a', text: 'All three individuals, since each holds 25 percent or more by indirect stake.', correct: true, why: 'Vale and Crane each hold 30 percent through Alder and Doss holds 40 percent through Birch, so all clear the threshold.' },
        { id: 'b', text: 'Only Mr Doss, because he wholly owns one of the two holding companies.', correct: false, why: 'Sole ownership of Birch gives Doss 40 percent, but Vale and Crane still reach 30 percent each through Alder.' },
        { id: 'c', text: 'Only the two owners of Alder Holdings, since Alder is the majority shareholder.', correct: false, why: 'Majority ownership does not exclude Doss, whose 40 percent indirect stake also qualifies.' },
        { id: 'd', text: 'The two holding companies, Alder and Birch, as the direct registered shareholders.', correct: false, why: 'A beneficial owner must be a natural person, so you trace through the corporate layers rather than stop at them.' }
      ]
    }
  },
  {
    id: 'm3-bo-peel-sequence',
    conceptTags: ['beneficial_ownership', 'corporate_layering', 'control_test'],
    mechanic: 'sequence',
    title: 'Peel the structure',
    spec: {
      kind: 'sequence',
      prompt: 'Put the steps for working out the ultimate beneficial owner of a layered corporate customer in order.',
      steps: [
        { id: 'obtain', label: 'Obtain the customer ownership and control structure, including shareholders, directors, and any structure chart.', why: 'You need the full map of the structure before you can trace anything.' },
        { id: 'trace', label: 'Trace each shareholding layer upward, calculating direct and indirect stakes through every intervening entity.', why: 'Indirect stakes only become visible once you multiply ownership through each layer.' },
        { id: 'apply', label: 'Apply the ownership and control tests to find the natural persons who ultimately own or control the company.', why: 'Ownership percentage and other means of control together identify the real beneficial owners.' },
        { id: 'verify', label: 'Verify the identified owners and document the basis, escalating where the structure remains opaque.', why: 'An unresolved or deliberately obscured structure is a reason to escalate rather than to assume.' }
      ]
    }
  },
  {
    id: 'm3-bo-opaque-redflags',
    conceptTags: ['beneficial_ownership', 'corporate_layering'],
    mechanic: 'red-flags',
    title: 'Signs of hidden ownership',
    spec: {
      kind: 'red-flags',
      scenario: 'An analyst reviews the ownership file of a new corporate client.',
      prompt: 'Which features are genuine red flags for concealed beneficial ownership?',
      items: [
        { id: 'a', label: 'Layers of holding companies across several secrecy jurisdictions with no clear commercial rationale.', flag: true, why: 'Unexplained multi-jurisdiction layering is a common way to obscure the real owner.' },
        { id: 'b', label: 'The company publishes audited accounts and names its directors in the public registry.', flag: false, why: 'Public, audited transparency points away from concealment, not toward it.' },
        { id: 'c', label: 'A nominee shareholder holds the shares with no disclosed person behind them.', flag: true, why: 'A nominee with no identified principal can be used to mask the true beneficial owner.' },
        { id: 'd', label: 'A single, clearly identified individual owner resident in the company home country.', flag: false, why: 'A simple, identified domestic owner is a transparent structure, not a red flag.' },
        { id: 'e', label: 'Bearer shares that allow ownership to change hands without any record.', flag: true, why: 'Bearer shares break the ownership trail because they leave no record of who holds them.' }
      ]
    }
  },
  {
    id: 'm3-monitoring-trigger-sort',
    conceptTags: ['trigger_event_review', 'ongoing_monitoring'],
    mechanic: 'sort',
    title: 'Does it trigger a review',
    spec: {
      kind: 'sort',
      prompt: 'Sort each event by whether it should trigger an event-based CDD review.',
      buckets: [
        { id: 'trigger', label: 'Triggers a review' },
        { id: 'routine', label: 'Routine, no review' }
      ],
      items: [
        { id: 't1', label: 'The customer transaction activity diverges sharply from their established profile.', bucket: 'trigger', why: 'A material break from the expected profile is a core reason to revisit the CDD.' },
        { id: 't2', label: 'A change is recorded in the customer beneficial ownership or control.', bucket: 'trigger', why: 'A change of ownership or control can change the whole risk picture and must be reviewed.' },
        { id: 'r1', label: 'The customer logs in to online banking from a new personal device.', bucket: 'routine', why: 'A new device is a security or fraud signal, not by itself a CDD review trigger.' },
        { id: 't3', label: 'Adverse media links the customer to a financial crime investigation.', bucket: 'trigger', why: 'Credible negative news is a classic event prompting an out-of-cycle review.' },
        { id: 'r2', label: 'The customer updates their registered contact phone number.', bucket: 'routine', why: 'A routine contact-detail update does not change the customer risk.' },
        { id: 'r3', label: 'The customer makes a payment of a size and type consistent with their profile.', bucket: 'routine', why: 'Activity that matches the expected profile is exactly what monitoring expects to see.' }
      ]
    }
  },
  {
    id: 'm3-monitoring-cadence-decision',
    conceptTags: ['periodic_review', 'kyc_refresh'],
    mechanic: 'decision',
    title: 'Set the refresh cadence',
    spec: {
      kind: 'decision',
      prompt: 'How should a bank set the cadence for periodic CDD refresh across its customer base?',
      options: [
        { id: 'a', text: 'Set review frequency by customer risk rating, with higher-risk customers reviewed more often.', correct: true, why: 'Risk-based periodic review concentrates effort where risk is greatest and works alongside event-driven reviews.' },
        { id: 'b', text: 'Review every customer on the same fixed annual cycle, applying one uniform refresh schedule regardless of risk rating.', correct: false, why: 'A flat cycle over-services low-risk files while under-covering the highest-risk ones.' },
        { id: 'c', text: 'Refresh CDD only when the customer initiates a change to their own account.', correct: false, why: 'This misses bank-detected and external triggers and leaves the cadence in the customer hands.' },
        { id: 'd', text: 'Rely on the onboarding CDD and refresh only when a regulator requests it.', correct: false, why: 'CDD must be kept current proactively, not only in reaction to a regulator.' }
      ]
    }
  },
  {
    id: 'm3-monitoring-term-match',
    conceptTags: ['periodic_review', 'trigger_event_review', 'kyc_refresh'],
    mechanic: 'match',
    title: 'Match the monitoring term',
    spec: {
      kind: 'match',
      prompt: 'Match each ongoing-monitoring term to its meaning.',
      pairs: [
        { id: 'periodic', left: 'Periodic review', right: 'A scheduled refresh of CDD whose frequency is set by the customer risk rating.', why: 'Periodic review is calendar-driven and risk-tiered.' },
        { id: 'trigger', left: 'Trigger event review', right: 'An out-of-cycle review prompted by a specific change or event.', why: 'Trigger reviews respond to events rather than the schedule.' },
        { id: 'monitoring', left: 'Ongoing monitoring', right: 'Continuous scrutiny of transactions against the expected profile.', why: 'Ongoing monitoring is the running check that surfaces the events and divergences.' },
        { id: 'refresh', left: 'KYC refresh', right: 'Updating and re-verifying customer information so the file stays current.', why: 'A refresh is the act of bringing the CDD record back up to date.' }
      ]
    }
  },
  {
    id: 'm3-reliance-arrangement-decision',
    conceptTags: ['third_party_reliance', 'introduced_business'],
    mechanic: 'decision',
    title: 'Structuring a reliance arrangement',
    spec: {
      kind: 'decision',
      prompt: 'Your firm wants to rely on an introducing firm CDD for a shared customer under FATF Recommendation 17. Which arrangement is compliant?',
      options: [
        { id: 'a', text: 'Obtain the CDD information immediately, keep underlying documents available on request, and stay responsible.', correct: true, why: 'Recommendation 17 lets you rely while obtaining the information at once and retaining ultimate responsibility.' },
        { id: 'b', text: 'Treat the introducing firm’s checks as final and conclusive, on the basis that it is itself a regulated firm in the same sector.', correct: false, why: 'Reliance never transfers responsibility; the relying firm remains accountable for the CDD.' },
        { id: 'c', text: 'Accept the customer now and collect the CDD information at the next scheduled review.', correct: false, why: 'The information must be obtained immediately, not deferred to a later review.' },
        { id: 'd', text: 'Rely on the introducer and obtain the documents only if a regulator later asks.', correct: false, why: 'The relying firm must be able to get the underlying documents on request, not only when a regulator demands.' }
      ]
    }
  },
  {
    id: 'm3-reliance-concept-match',
    conceptTags: ['third_party_reliance', 'outsourcing', 'intra_group_reliance'],
    mechanic: 'match',
    title: 'Reliance or outsourcing',
    spec: {
      kind: 'match',
      prompt: 'Match each statement to the concept it describes.',
      pairs: [
        { id: 'reliance', left: 'Third-party reliance', right: 'Using another regulated firm completed CDD while keeping ultimate responsibility.', why: 'Reliance uses work done by another firm, but accountability stays with you.' },
        { id: 'outsourcing', left: 'Outsourcing', right: 'Engaging an agent or provider to perform CDD tasks under your instruction and control.', why: 'Outsourced work is treated as done in-house, under your direction.' },
        { id: 'intragroup', left: 'Intra-group reliance', right: 'Relying on CDD performed by another entity in the same group under group-wide policies.', why: 'Group reliance rests on shared, supervised group standards.' },
        { id: 'introduced', left: 'Introduced business', right: 'A customer brought to you by another firm that has already performed CDD.', why: 'Introduced business is the referral context in which reliance often arises.' }
      ]
    }
  },
  {
    id: 'm3-reliance-redflags',
    conceptTags: ['third_party_reliance', 'introduced_business'],
    mechanic: 'red-flags',
    title: 'Flaws in a reliance deal',
    spec: {
      kind: 'red-flags',
      scenario: 'A firm reviews a proposed arrangement to rely on a third party for CDD.',
      prompt: 'Which features are genuine problems under FATF Recommendation 17?',
      items: [
        { id: 'a', label: 'The third party will provide CDD documents only months after onboarding, not on request.', flag: true, why: 'Reliance requires documents to be available on request without undue delay.' },
        { id: 'b', label: 'The third party is a regulated firm subject to CDD requirements and supervision.', flag: false, why: 'A regulated, supervised counterparty is exactly the kind of party reliance permits.' },
        { id: 'c', label: 'The arrangement assumes the relying firm has no further responsibility once it relies.', flag: true, why: 'Ultimate responsibility cannot be transferred, so this assumption is non-compliant.' },
        { id: 'd', label: 'The relying firm obtains the CDD information immediately and keeps its own customer file.', flag: false, why: 'Getting the information at once and keeping a record is sound reliance practice.' },
        { id: 'e', label: 'The third party sits in a jurisdiction with weak AML supervision and high country risk.', flag: true, why: 'Reliance on a poorly supervised, high-risk jurisdiction undermines the basis for trusting its CDD.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 4: Suspicious Activity Monitoring and Reporting
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm4-tm-decision',
    conceptTags: ['monitoring_rules', 'false_positives', 'scenario_design'],
    mechanic: 'decision',
    title: 'Too much noise',
    spec: {
      kind: 'decision',
      prompt: 'A monitoring rule fires on almost every account it touches, and review shows the vast majority of alerts are false positives. What is the best response?',
      options: [
        { id: 'a', text: 'Analyse the false positives, then recalibrate the rule thresholds and segmentation while keeping coverage of the risk.', correct: true, why: 'Tuning thresholds and segmentation against real data cuts noise without creating a blind spot in the risk the rule covers.' },
        { id: 'b', text: 'Switch the rule off entirely so the team can clear the large alert backlog quickly.', correct: false, why: 'Disabling a rule removes coverage of the risk it was built to detect, which is a control failure, not a fix.' },
        { id: 'c', text: 'Raise the threshold sharply so the rule almost never fires, on the basis that a small, manageable alert queue is the real objective here.', correct: false, why: 'An extreme threshold trades a smaller queue for missed genuine activity, replacing false positives with false negatives.' },
        { id: 'd', text: 'Leave the rule unchanged and add more analysts to work through the alert volume faster.', correct: false, why: 'Adding capacity treats the symptom and leaves a poorly designed rule generating the same waste indefinitely.' }
      ]
    }
  },
  {
    id: 'm4-tm-redflags',
    conceptTags: ['transaction_monitoring', 'monitoring_rules'],
    mechanic: 'red-flags',
    title: 'What the scenario must catch',
    spec: {
      kind: 'red-flags',
      scenario: 'A bank is building a transaction-monitoring scenario intended to detect structuring of cash deposits.',
      prompt: 'Which account behaviours should this scenario be designed to catch?',
      items: [
        { id: 'a', label: 'Several cash deposits each just below the cash-reporting threshold over a few days.', flag: true, why: 'Repeated sub-threshold cash deposits are a classic structuring pattern the scenario must detect.' },
        { id: 'b', label: 'A recurring salary credit arriving on the same date each month.', flag: false, why: 'A predictable, documented salary credit is expected activity, not structuring.' },
        { id: 'c', label: 'One large transfer broken into many smaller transfers to the same beneficiary.', flag: true, why: 'Splitting a single sum into smaller pieces to stay under thresholds is structuring.' },
        { id: 'd', label: 'A one-off card purchase at a supermarket during business hours.', flag: false, why: 'Ordinary retail spending in line with the profile is not a structuring indicator.' },
        { id: 'e', label: 'Cash deposits spread across several branches on the same day to stay under limits.', flag: true, why: 'Spreading deposits across locations to avoid a threshold is structuring by another route.' }
      ]
    }
  },
  {
    id: 'm4-tm-sequence',
    conceptTags: ['scenario_design'],
    mechanic: 'sequence',
    title: 'Building a scenario',
    spec: {
      kind: 'sequence',
      prompt: 'Put the steps of designing and validating a new monitoring scenario in the order they are performed.',
      steps: [
        { id: 'define', label: 'Define the specific typology or risk the scenario must detect.', why: 'You start from the risk so the rule has a clear target to measure against.' },
        { id: 'logic', label: 'Translate the typology into rule logic, with thresholds and customer segmentation.', why: 'The risk has to become concrete logic before it can run on data.' },
        { id: 'test', label: 'Test the logic against historical data and tune for coverage versus false positives.', why: 'Back-testing shows whether the rule catches the risk without drowning analysts.' },
        { id: 'deploy', label: 'Deploy the scenario and review its performance on an ongoing basis.', why: 'A live rule still needs monitoring, because risk and customer behaviour shift over time.' }
      ]
    }
  },
  {
    id: 'm4-alert-sequence',
    conceptTags: ['analyst_investigation', 'alert_disposition'],
    mechanic: 'sequence',
    title: 'From alert to decision',
    spec: {
      kind: 'sequence',
      prompt: 'Order the analyst workflow from receiving an alert to reaching a disposition.',
      steps: [
        { id: 'review', label: 'Review the alert against the customer profile, expected activity, and history.', why: 'Context determines whether the flagged activity is actually out of pattern.' },
        { id: 'gather', label: 'Gather further information, including a request for information to the business line where needed.', why: 'Files rarely hold the full story, so missing context has to be sourced.' },
        { id: 'analyse', label: 'Analyse whether the activity is adequately explained or remains suspicious.', why: 'The judgment turns on whether a legitimate explanation accounts for the activity.' },
        { id: 'document', label: 'Document the rationale and either close the alert or escalate it.', why: 'Every alert needs a recorded, defensible close-or-escalate decision.' }
      ]
    }
  },
  {
    id: 'm4-alert-decision',
    conceptTags: ['alert_disposition', 'documentation'],
    mechanic: 'decision',
    title: 'Disposing of an explained alert',
    spec: {
      kind: 'decision',
      prompt: 'An analyst investigates an alert and finds a documented, verified business reason that fully explains the flagged activity. What is the best disposition?',
      options: [
        { id: 'a', text: 'Close the alert and record a rationale linking the activity to the verified explanation.', correct: true, why: 'A documented close tied to evidence is a complete, auditable disposition when suspicion is resolved.' },
        { id: 'b', text: 'Escalate it for reporting anyway, on the basis that filing is always the safer choice.', correct: false, why: 'Reporting activity you have explained floods the FIU with low-value reports and is not risk-based.' },
        { id: 'c', text: 'Close the alert quickly without notes, since the activity turned out to be explained.', correct: false, why: 'Closing without documentation leaves no audit trail showing why suspicion was resolved.' },
        { id: 'd', text: 'Hold the alert open and revisit it at the next periodic review.', correct: false, why: 'Leaving an alert open with no decision is not a disposition and delays resolution without cause.' }
      ]
    }
  },
  {
    id: 'm4-alert-match',
    conceptTags: ['rfi', 'documentation', 'analyst_investigation'],
    mechanic: 'match',
    title: 'Parts of the investigation',
    spec: {
      kind: 'match',
      prompt: 'Match each part of the investigation to what it is for.',
      pairs: [
        { id: 'rfi', left: 'Request for information (RFI)', right: 'Obtaining context from the business line that the file does not contain.', why: 'An RFI fills gaps the customer record alone cannot answer.' },
        { id: 'docs', left: 'Case documentation', right: 'Creating an auditable record of what was reviewed and the conclusion reached.', why: 'Documentation lets a reviewer reconstruct the reasoning later.' },
        { id: 'disp', left: 'Disposition decision', right: 'Recording whether the alert is closed or escalated, with the reason.', why: 'The disposition is the formal outcome that closes the workflow.' },
        { id: 'profile', left: 'Customer profile review', right: 'Benchmarking the flagged activity against the expected behaviour.', why: 'The profile is the baseline that tells you whether activity is abnormal.' }
      ]
    }
  },
  {
    id: 'm4-str-decision',
    conceptTags: ['tipping_off'],
    mechanic: 'decision',
    title: 'The customer calls',
    spec: {
      kind: 'decision',
      prompt: 'Shortly after the bank files a suspicious transaction report, the customer calls to ask why an outgoing transfer is delayed. How should the officer respond?',
      options: [
        { id: 'a', text: 'Give a neutral answer about standard processing checks without revealing that any report was filed.', correct: true, why: 'A neutral processing response answers the customer without disclosing the report, satisfying the tipping-off prohibition.' },
        { id: 'b', text: 'Explain that a suspicious transaction report was filed so the customer can clarify the activity.', correct: false, why: 'Telling the customer a report was filed is textbook tipping-off and is prohibited.' },
        { id: 'c', text: 'Confirm the account is under review but decline to share any of the underlying detail.', correct: false, why: 'Confirming an investigation still signals that a report or inquiry exists, which is a form of tipping-off.' },
        { id: 'd', text: 'Suggest the customer route the payment through another institution to avoid the delay.', correct: false, why: 'Steering the funds elsewhere both tips off the customer and helps move potentially illicit funds.' }
      ]
    }
  },
  {
    id: 'm4-str-sort',
    conceptTags: ['narrative_drafting', 'str'],
    mechanic: 'sort',
    title: 'Strong vs weak narrative',
    spec: {
      kind: 'sort',
      prompt: 'Sort each item by whether it strengthens or weakens a suspicious transaction report narrative.',
      buckets: [
        { id: 'strong', label: 'Strengthens the narrative' },
        { id: 'weak', label: 'Weakens the narrative' }
      ],
      items: [
        { id: '1', label: 'States who was involved, what happened, when, where, and the amounts.', bucket: 'strong', why: 'The core who-what-when-where-amount facts give the FIU something actionable.' },
        { id: '2', label: 'Explains specifically why the activity has no apparent lawful purpose.', bucket: 'strong', why: 'Articulating the reason for suspicion is the heart of a useful narrative.' },
        { id: '3', label: 'Includes the relevant account numbers, dates, and transaction values.', bucket: 'strong', why: 'Precise identifiers let the FIU trace and connect the activity.' },
        { id: '4', label: 'Says only that the activity looked suspicious, with no supporting detail.', bucket: 'weak', why: 'A bare conclusion gives the FIU nothing to investigate.' },
        { id: '5', label: 'Reproduces the system alert code without describing the conduct.', bucket: 'weak', why: 'An internal code is meaningless to the FIU without the underlying facts.' },
        { id: '6', label: 'Speculates about unrelated offences with no facts to support them.', bucket: 'weak', why: 'Unsupported speculation distracts from the actual suspicious activity.' }
      ]
    }
  },
  {
    id: 'm4-str-redflags',
    conceptTags: ['narrative_drafting', 'fiu_submission', 'sar'],
    mechanic: 'red-flags',
    title: 'Narrative defects',
    spec: {
      kind: 'red-flags',
      scenario: 'A reviewer is checking draft suspicious transaction report narratives before submission to the FIU.',
      prompt: 'Which of these are defects that would make a narrative less useful to the FIU?',
      items: [
        { id: 'a', label: 'The narrative omits the transaction amounts and dates.', flag: true, why: 'Without amounts and dates the FIU cannot quantify or trace the activity.' },
        { id: 'b', label: 'The narrative explains why the conduct has no apparent legitimate purpose.', flag: false, why: 'Stating the reason for suspicion is exactly what a good narrative does.' },
        { id: 'c', label: 'The narrative only restates the internal alert label.', flag: true, why: 'An alert label is not a description of conduct and carries no intelligence value.' },
        { id: 'd', label: 'The narrative identifies the parties and the accounts involved.', flag: false, why: 'Naming the parties and accounts is essential, not a defect.' },
        { id: 'e', label: 'The narrative states a conclusion with no facts behind it.', flag: true, why: 'A conclusion the FIU cannot verify from facts is not actionable.' }
      ]
    }
  },
  {
    id: 'm4-fiu-sort',
    conceptTags: ['fiu_analysis', 'financial_intelligence'],
    mechanic: 'sort',
    title: 'Who is responsible',
    spec: {
      kind: 'sort',
      prompt: 'Sort each activity by who is responsible for it.',
      buckets: [
        { id: 'fiu', label: 'Financial Intelligence Unit' },
        { id: 'institution', label: 'Reporting institution' }
      ],
      items: [
        { id: '1', label: 'Receiving and analysing suspicious transaction reports.', bucket: 'fiu', why: 'Receiving and analysing reports is the core FIU mandate.' },
        { id: '2', label: 'Filing a report when monitored activity appears suspicious.', bucket: 'institution', why: 'The duty to detect and report sits with the institution that holds the relationship.' },
        { id: '3', label: 'Disseminating analysed intelligence to law enforcement.', bucket: 'fiu', why: 'Only the FIU turns reports into intelligence and passes it to authorities.' },
        { id: '4', label: 'Conducting ongoing monitoring of customer transactions.', bucket: 'institution', why: 'Day-to-day monitoring of accounts rests with the institution.' },
        { id: '5', label: 'Exchanging information with a foreign FIU.', bucket: 'fiu', why: 'FIU-to-FIU exchange is conducted between FIUs, not by individual banks.' },
        { id: '6', label: 'Maintaining customer due diligence records and risk ratings.', bucket: 'institution', why: 'CDD records and the risk rating are maintained by the institution.' }
      ]
    }
  },
  {
    id: 'm4-fiu-match',
    conceptTags: ['fiu_analysis', 'international_information_sharing', 'financial_intelligence'],
    mechanic: 'match',
    title: 'Intelligence terms',
    spec: {
      kind: 'match',
      prompt: 'Match each term to its meaning.',
      pairs: [
        { id: 'op', left: 'Operational analysis', right: 'Examining specific transactions and subjects to support an investigation.', why: 'Operational analysis is case-focused work on identified targets.' },
        { id: 'strat', left: 'Strategic analysis', right: 'Identifying trends and typologies across many reports over time.', why: 'Strategic analysis looks at the bigger picture rather than a single case.' },
        { id: 'egmont', left: 'Egmont Group', right: 'A secure channel for FIU-to-FIU international information sharing.', why: 'The Egmont Group connects FIUs across jurisdictions to exchange information.' },
        { id: 'intel', left: 'Financial intelligence', right: 'An analytical product that guides investigations but is not itself courtroom evidence.', why: 'Intelligence points investigators in a direction, but must be independently proven.' }
      ]
    }
  },
  {
    id: 'm4-fiu-sequence',
    conceptTags: ['financial_intelligence', 'feedback_loops'],
    mechanic: 'sequence',
    title: 'Life of the product',
    spec: {
      kind: 'sequence',
      prompt: 'Order the life of a financial intelligence product, from report to feedback.',
      steps: [
        { id: 'file', label: 'A reporting institution files a suspicious transaction report with the FIU.', why: 'The product begins with the institution report.' },
        { id: 'analyse', label: 'The FIU analyses the report, enriching it with other reports and data sources.', why: 'Analysis is where a raw report becomes intelligence.' },
        { id: 'disseminate', label: 'The FIU disseminates the resulting intelligence to competent authorities.', why: 'The intelligence is only useful once it reaches those who can act on it.' },
        { id: 'feedback', label: 'The FIU provides feedback to the reporting institution where appropriate.', why: 'Feedback closes the loop and helps institutions improve future reporting.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 5: Sanctions Compliance
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm5-1-match',
    conceptTags: ['sanctions_regimes', 'un_sanctions', 'ofsi'],
    mechanic: 'match',
    title: 'Match the sanctions authority',
    spec: {
      kind: 'match',
      prompt: 'Match each body to its role in the sanctions system.',
      pairs: [
        { id: 'un', left: 'UN Security Council', right: 'Adopts binding resolutions that member states must implement through their own national law.', why: 'UN measures bind states, which then give them domestic legal effect rather than applying directly to firms.' },
        { id: 'ofac', left: 'US OFAC', right: 'Administers and enforces US sanctions programs and maintains the SDN List.', why: 'OFAC is the US Treasury office that designates parties and enforces US measures.' },
        { id: 'eu', left: 'EU Council', right: 'Adopts regulations that apply directly across member states without separate national acts.', why: 'EU sanctions regulations are directly applicable in member states once adopted.' },
        { id: 'ofsi', left: 'UK OFSI', right: 'Administers UK financial sanctions and handles civil monetary penalties.', why: 'OFSI is the UK Treasury body for financial-sanctions implementation and civil enforcement.' }
      ]
    }
  },
  {
    id: 'm5-1-sort',
    conceptTags: ['sanctions_regimes', 'un_sanctions', 'eu_sanctions'],
    mechanic: 'sort',
    title: 'Whose rule is it',
    spec: {
      kind: 'sort',
      prompt: 'Sort each statement by the regime it describes.',
      buckets: [
        { id: 'un', label: 'UN' },
        { id: 'us', label: 'US / OFAC' },
        { id: 'eu', label: 'EU' }
      ],
      items: [
        { id: '1', label: 'Measures take effect for a country only after it transposes them into domestic law.', bucket: 'un', why: 'UN designations bind states, which must enact them nationally before they reach firms.' },
        { id: '2', label: 'The SDN List and the 50 Percent Rule define who is blocked.', bucket: 'us', why: 'These are OFAC mechanisms within the US program.' },
        { id: '3', label: 'A regulation applies directly across all member states once adopted.', bucket: 'eu', why: 'EU sanctions regulations are directly applicable without separate national acts.' },
        { id: '4', label: 'Primary jurisdiction can attach where a payment clears through US dollars.', bucket: 'us', why: 'US-dollar clearing through a US bank is a recognised basis for US jurisdiction.' },
        { id: '5', label: 'Designations originate from Security Council committee listings.', bucket: 'un', why: 'UN listings flow from the Council and its sanctions committees.' },
        { id: '6', label: 'A consolidated list is maintained centrally and binds entities across the bloc.', bucket: 'eu', why: 'The EU consolidated list applies bloc-wide to in-scope persons and entities.' }
      ]
    }
  },
  {
    id: 'm5-1-decision',
    conceptTags: ['extraterritoriality', 'ofac', 'sanctions_regimes'],
    mechanic: 'decision',
    title: 'Which regime reaches it',
    spec: {
      kind: 'decision',
      prompt: 'A US-dollar payment between two non-US companies for ordinary goods clears through a US correspondent bank, and one company is on the SDN List. Which statement is correct?',
      options: [
        { id: 'a', text: 'The US-dollar clearing through a US bank creates a US nexus, so OFAC measures reach the payment though both traders are non-US.', correct: true, why: 'A US nexus such as USD clearing through a US bank can bring a transaction within OFAC jurisdiction.' },
        { id: 'b', text: 'With no US person among the trading parties, the payment must fall outside every sanctions regime, since none of the companies is American.', correct: false, why: 'This ignores the US nexus from the dollar clearing and the possibility of other regimes applying.' },
        { id: 'c', text: 'OFAC rules bind every bank in the world by default, so checking for a specific US nexus here adds nothing.', correct: false, why: 'OFAC is not globally binding on everyone; jurisdiction turns on a US nexus, which is exactly what must be checked.' },
        { id: 'd', text: 'Only EU or UK measures could ever apply, because US sanctions never reach a non-US party in any case.', correct: false, why: 'US measures can reach non-US parties where a nexus like USD clearing exists.' }
      ]
    }
  },
  {
    id: 'm5-2-screening',
    conceptTags: ['sanctions_screening', 'name_screening', 'fuzzy_matching'],
    mechanic: 'screening-match',
    title: 'Adjudicate the alerts',
    spec: {
      kind: 'screening-match',
      prompt: 'For each screening alert, clear it or escalate it.',
      alerts: [
        { id: 'a', party: { name: 'Ahmad K. Rahimi', fields: [{ label: 'DOB', value: '04 Jun 1972' }, { label: 'Country', value: 'Country X' }, { label: 'Role', value: 'Beneficiary' }] }, listEntry: { name: 'Ahmad Kamal Rahimi', list: 'Sanctions list reference', fields: [{ label: 'DOB', value: '04 Jun 1972' }, { label: 'Country', value: 'Country X' }] }, verdict: 'escalate', why: 'Name, full date of birth, and country all align, with the middle name a plausible expansion, so this is a potential true match to hold and review.' },
        { id: 'b', party: { name: 'Maria Gonzalez', fields: [{ label: 'DOB', value: '12 Aug 1988' }, { label: 'Country', value: 'Spain' }] }, listEntry: { name: 'Maria Gonzalez', list: 'Sanctions list reference', fields: [{ label: 'DOB', value: '30 Jan 1954' }, { label: 'Country', value: 'Different jurisdiction' }] }, verdict: 'clear', why: 'A common name matches but the date of birth and country plainly differ, so this is a false positive to clear with the basis recorded.' }
      ]
    }
  },
  {
    id: 'm5-2-decision',
    conceptTags: ['sanctions_screening', 'fuzzy_matching', 'name_screening'],
    mechanic: 'decision',
    title: 'Tune the matcher',
    spec: {
      kind: 'decision',
      prompt: 'Swamped by false positives, the team proposes raising the fuzzy-match threshold so only near-exact names alert. What is the right concern?',
      options: [
        { id: 'a', text: 'A higher threshold lifts precision but lowers recall, so variant-spelling true matches can be missed; test any change first.', correct: true, why: 'Calibration is a recall-versus-precision trade-off and any tightening must be risk-assessed and validated against known matches.' },
        { id: 'b', text: 'Raise the threshold to exact-match only, since a lower false-positive rate is the main measure of a strong screening program.', correct: false, why: 'False-positive volume is not the goal; missing a true match under strict-liability sanctions is the real cost.' },
        { id: 'c', text: 'Keep the threshold but stop screening transliterated name forms, because variant spellings rarely match real designated parties.', correct: false, why: 'Transliteration and spelling variants are precisely where true matches and evasion hide.' },
        { id: 'd', text: 'Move every case to manual analyst review, so people rather than the engine decide each potential hit.', correct: false, why: 'Manual-only review does not scale and leaves the underlying calibration problem unaddressed.' }
      ]
    }
  },
  {
    id: 'm5-2-sort',
    conceptTags: ['sanctions_screening', 'list_management', 'fuzzy_matching'],
    mechanic: 'sort',
    title: 'Recall or precision',
    spec: {
      kind: 'sort',
      prompt: 'Sort each tuning action by its main effect: catching more true matches (recall) or cutting false positives (precision).',
      buckets: [
        { id: 'recall', label: 'Improves recall' },
        { id: 'precision', label: 'Improves precision' }
      ],
      items: [
        { id: '1', label: 'Adding known transliteration and alias variants to the matching logic.', bucket: 'recall', why: 'Variant forms let the engine catch true matches that an exact match would miss.' },
        { id: '2', label: 'Raising the minimum match score before an alert fires.', bucket: 'precision', why: 'A higher bar filters weak matches and cuts false positives, at some cost to recall.' },
        { id: '3', label: 'Screening against the full current list rather than a stale extract.', bucket: 'recall', why: 'An out-of-date list misses recent designations, so refreshing it recovers true matches.' },
        { id: '4', label: 'Including a secondary identifier like date of birth in the match decision.', bucket: 'precision', why: 'Extra identifiers disambiguate common names and reduce false positives.' },
        { id: '5', label: 'Loosening the fuzzy threshold to catch more near-spellings.', bucket: 'recall', why: 'A looser threshold surfaces more variant true matches, though it also raises false positives.' },
        { id: '6', label: 'Documenting and suppressing a recurring benign-name false positive after review.', bucket: 'precision', why: 'Reviewed suppression of a confirmed false positive cuts repeat noise without losing true hits.' }
      ]
    }
  },
  {
    id: 'm5-3-redflags',
    conceptTags: ['sanctions_evasion', 'front_companies', 'obscuration'],
    mechanic: 'red-flags',
    title: 'Spot the evasion signals',
    spec: {
      kind: 'red-flags',
      scenario: 'You are reviewing a new trade-finance customer and its first shipment.',
      prompt: 'Select the evasion red flags.',
      items: [
        { id: '1', label: 'A recently incorporated company with no trading history and an address shared with several other shell entities.', flag: true, why: 'A new entity at a shared shell address is a classic front-company indicator.' },
        { id: '2', label: 'Payment routed through a third country unconnected to the goods, the parties, or the trade route.', flag: true, why: 'Unexplained indirect routing is used to obscure the real counterparty or origin.' },
        { id: '3', label: 'The company files audited statements and has a verifiable multi-year customer base.', flag: false, why: 'A transparent, established operating history cuts against a front-company concern.' },
        { id: '4', label: 'Ownership layered through nominee directors across jurisdictions with no clear ultimate owner.', flag: true, why: 'Ownership obscuration can hide a blocked person behind the structure.' },
        { id: '5', label: 'The shipment value and goods description match the commercial invoice and the stated route.', flag: false, why: 'Consistent, coherent documentation is not itself an evasion indicator.' }
      ]
    }
  },
  {
    id: 'm5-3-match',
    conceptTags: ['sanctions_evasion', 'ship_to_ship_transfers', 'stripping'],
    mechanic: 'match',
    title: 'Name the technique',
    spec: {
      kind: 'match',
      prompt: 'Match each evasion technique to what it does.',
      pairs: [
        { id: 'front', left: 'Front company', right: 'A newly formed business that fronts for a blocked party to obtain goods or banking access.', why: 'The front gives a blocked actor a clean-looking face to deal through.' },
        { id: 'sts', left: 'Ship-to-ship transfer', right: 'Cargo moved between vessels at sea to disguise the origin or destination of a shipment.', why: 'Transferring at sea breaks the documented chain so the real route is hidden.' },
        { id: 'strip', left: 'Payment-message stripping', right: 'Removing or altering identifying details in a payment message so screening cannot see the party.', why: 'Stripping defeats screening by hiding the sanctioned name from the message.' },
        { id: 'obscure', left: 'Ownership obscuration', right: 'Layering nominees and shells so the blocked ultimate owner stays below the visible surface.', why: 'Layered ownership keeps the real controller out of plain view.' }
      ]
    }
  },
  {
    id: 'm5-3-decision',
    conceptTags: ['sanctions_evasion', 'front_companies'],
    mechanic: 'decision',
    title: 'Below the surface',
    spec: {
      kind: 'decision',
      prompt: 'Due diligence shows a counterparty is 55 percent owned in aggregate by two individuals each on the SDN List, though no single owner holds a majority. For a US person, what is the correct treatment?',
      options: [
        { id: 'a', text: 'Aggregate ownership of 50 percent or more by blocked persons makes the company blocked under the OFAC 50 Percent Rule, so a US person must stop.', correct: true, why: 'The 50 Percent Rule aggregates ownership by one or more blocked persons, so the company is itself blocked.' },
        { id: 'b', text: 'Because no single blocked owner holds a majority stake, the company is not itself blocked and the dealing may proceed as normal.', correct: false, why: 'Ownership is counted in aggregate, not per individual, so the threshold is met here.' },
        { id: 'c', text: 'Treat the company as merely higher-risk, so enhanced due diligence and closer ongoing monitoring are enough to keep dealing.', correct: false, why: 'A true sanctions match is a hard stop, not a matter for risk-based monitoring.' },
        { id: 'd', text: 'Treat it as blocked only if the company itself is listed by name on the SDN List, because aggregate ownership through individuals does not count.', correct: false, why: 'The 50 Percent Rule blocks the entity even when it is not separately named on the list.' }
      ]
    }
  },
  {
    id: 'm5-4-match',
    conceptTags: ['scp', 'ofac_framework', 'sanctions_compliance_program'],
    mechanic: 'match',
    title: 'Components of the program',
    spec: {
      kind: 'match',
      prompt: 'Match each compliance-program component to its meaning.',
      pairs: [
        { id: 'mgmt', left: 'Management commitment', right: 'Senior leadership funds the program, sets the tone, and gives compliance authority and autonomy.', why: 'Without leadership backing and resources the other components cannot hold.' },
        { id: 'risk', left: 'Risk assessment', right: 'Identifying the sanctions exposure across customers, products, and geographies to size the controls.', why: 'Controls should be proportionate to the assessed exposure.' },
        { id: 'controls', left: 'Internal controls', right: 'Policies, procedures, and screening that turn the risk picture into day-to-day prevention.', why: 'Controls operationalise the program against the identified risks.' },
        { id: 'audit', left: 'Testing and audit', right: 'Independent review that checks whether the controls actually work and surfaces gaps.', why: 'Independent testing validates effectiveness rather than assuming it.' }
      ]
    }
  },
  {
    id: 'm5-4-decision',
    conceptTags: ['voluntary_self_disclosure', 'sanctions_compliance_program'],
    mechanic: 'decision',
    title: 'After the finding',
    spec: {
      kind: 'decision',
      prompt: 'An internal review uncovers an apparent sanctions breach that no regulator yet knows about. For a US person, which course is most defensible?',
      options: [
        { id: 'a', text: 'Investigate to scope the conduct, remediate the control gap, then make a voluntary self-disclosure to OFAC.', correct: true, why: 'A scoped investigation, remediation, and disclosure are sound governance and OFAC treats a qualifying disclosure as mitigating.' },
        { id: 'b', text: 'Wait to see whether OFAC discovers it on its own, since disclosing now only invites a penalty that staying silent might avoid.', correct: false, why: 'Waiting forfeits the mitigating credit and risks a worse outcome if found.' },
        { id: 'c', text: 'Disclose immediately before any internal investigation, so the firm reports first even without yet understanding the facts.', correct: false, why: 'Reporting before scoping the facts is premature and produces a weak, incomplete disclosure.' },
        { id: 'd', text: 'Quietly fix the control and keep no written record, treating the matter as closed once the gap has been patched.', correct: false, why: 'Concealment with no record is a governance failure and can be an aggravating factor.' }
      ]
    }
  },
  {
    id: 'm5-4-sequence',
    conceptTags: ['sanctions_compliance_program', 'scp', 'ofac_framework'],
    mechanic: 'sequence',
    title: 'Build the program in order',
    spec: {
      kind: 'sequence',
      prompt: 'Put the steps of standing up a sanctions compliance program in the correct order.',
      steps: [
        { id: '1', label: 'Secure management commitment and resourcing.', why: 'Leadership backing and funding must come first or the rest cannot stand.' },
        { id: '2', label: 'Conduct the sanctions risk assessment.', why: 'You must understand the exposure before you can size the controls.' },
        { id: '3', label: 'Design internal controls and screening to the assessed risk.', why: 'Controls follow from the risk picture, not the other way round.' },
        { id: '4', label: 'Test and audit the controls independently.', why: 'Independent review confirms the controls work and feeds back improvements.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 6: High-Risk Categories and Typologies
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm6-pep-sort',
    conceptTags: ['pep', 'foreign_pep', 'domestic_pep', 'international_organisation_pep'],
    mechanic: 'sort',
    title: 'Which PEP category?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each individual into the correct politically exposed person category.',
      buckets: [
        { id: 'foreign', label: 'Foreign PEP' },
        { id: 'domestic', label: 'Domestic PEP' },
        { id: 'io', label: 'International-organisation PEP' }
      ],
      items: [
        { id: '1', label: 'A serving finance minister of a neighbouring state.', bucket: 'foreign', why: 'A person entrusted with a prominent public function by another country is a foreign PEP.' },
        { id: '2', label: 'A sitting member of your own national parliament.', bucket: 'domestic', why: 'A senior figure in your own country is a domestic PEP.' },
        { id: '3', label: 'The secretary-general of an intergovernmental body.', bucket: 'io', why: 'A senior management figure of an international organisation falls in the IO category.' },
        { id: '4', label: 'A serving ambassador of a foreign state posted to your country.', bucket: 'foreign', why: 'A senior representative of another government is a foreign PEP regardless of where they are posted.' },
        { id: '5', label: 'The governor of your own central bank.', bucket: 'domestic', why: 'A senior official of a domestic state institution is a domestic PEP.' }
      ]
    }
  },
  {
    id: 'm6-pep-decision',
    conceptTags: ['pep', 'foreign_pep'],
    mechanic: 'decision',
    title: 'Approving a foreign PEP',
    spec: {
      kind: 'decision',
      prompt: 'A relationship manager wants to onboard a senior official of a foreign government. What does the framework require before the account opens?',
      options: [
        { id: 'a', text: 'Obtain senior management approval, establish source of wealth and source of funds, and apply enhanced ongoing monitoring.', correct: true, why: 'A foreign PEP is always higher risk and triggers this full enhanced due diligence package.' },
        { id: 'b', text: 'Treat the official as a standard customer because the salary attached to the public role is lawful and disclosed.', correct: false, why: 'A lawful public salary does not remove PEP risk, which arises from influence and access, not legitimacy of pay.' },
        { id: 'c', text: 'Decline the relationship outright, since foreign politically exposed persons cannot be banked under any rules.', correct: false, why: 'PEP status requires enhanced measures, not blanket refusal, which is unjustified de-risking.' },
        { id: 'd', text: 'Apply enhanced monitoring only, with no source-of-wealth work needed because the role is on public record.', correct: false, why: 'Source of wealth and senior approval are required for a foreign PEP, not just heightened monitoring.' }
      ]
    }
  },
  {
    id: 'm6-pep-screening',
    conceptTags: ['pep', 'rcas'],
    mechanic: 'screening-match',
    title: 'Two PEP screening alerts',
    spec: {
      kind: 'screening-match',
      prompt: 'Two onboarding alerts hit a PEP list. Decide which clears and which escalates.',
      alerts: [
        { id: 'a1', party: { name: 'Lucas Hartman', fields: [{ label: 'Date of birth', value: '1991-07-22' }, { label: 'Nationality', value: 'Cortavia' }, { label: 'Occupation', value: 'Logistics clerk' }] }, listEntry: { name: 'Lukas Hartmann', list: 'Foreign PEP list', fields: [{ label: 'Date of birth', value: '1958-01-30' }, { label: 'Nationality', value: 'Valdano' }, { label: 'Role', value: 'Former trade minister' }] }, verdict: 'clear', why: 'The names sound alike but the dates of birth, nationalities, and profiles all diverge, so this is a false positive.' },
        { id: 'a2', party: { name: 'Renata Oltz', fields: [{ label: 'Date of birth', value: '1984-11-03' }, { label: 'Nationality', value: 'Marenia' }, { label: 'Relationship', value: 'Spouse of a serving minister' }] }, listEntry: { name: 'Renata Oltz', list: 'PEP and RCA database', fields: [{ label: 'Date of birth', value: '1984-11-03' }, { label: 'Nationality', value: 'Marenia' }, { label: 'Status', value: 'Close associate of a foreign PEP' }] }, verdict: 'escalate', why: 'Identifiers match and she is a relative or close associate of a foreign PEP, so PEP-level enhanced due diligence applies.' }
      ]
    }
  },
  {
    id: 'm6-cb-redflags',
    conceptTags: ['correspondent_banking', 'respondent_due_diligence', 'nested_relationships'],
    mechanic: 'red-flags',
    title: 'Onboarding a respondent',
    spec: {
      kind: 'red-flags',
      scenario: 'A foreign bank applies for a US-dollar correspondent account at your institution.',
      prompt: 'Which features are genuine red flags in the respondent due diligence?',
      items: [
        { id: 'a', label: 'It will let downstream banks it declines to name route payments through the account.', flag: true, why: 'Unnamed nested banks mean you cannot know the customers behind your customer.' },
        { id: 'b', label: 'It is licensed and prudentially supervised by its home regulator.', flag: false, why: 'Home-country regulation is expected and reassuring, not a red flag.' },
        { id: 'c', label: 'Its projected dollar-clearing volume far exceeds its stated customer base and home market.', flag: true, why: 'Activity inconsistent with the stated business warrants explanation.' },
        { id: 'd', label: 'It publishes audited accounts and discloses its board and ownership.', flag: false, why: 'Transparency about finances and ownership is normal, sound practice.' },
        { id: 'e', label: 'It cannot describe its own AML program when your team asks about it.', flag: true, why: 'A respondent unable to explain its controls cannot be relied on to manage shared risk.' }
      ]
    }
  },
  {
    id: 'm6-cb-decision',
    conceptTags: ['correspondent_banking', 'respondent_due_diligence', 'de_risking'],
    mechanic: 'decision',
    title: 'A jump in respondent volume',
    spec: {
      kind: 'decision',
      prompt: 'A respondent bank sees its monthly dollar wires to a higher-risk corridor triple within one quarter, with no notice. What is the appropriate first response?',
      options: [
        { id: 'a', text: 'Ask the respondent to explain the change, then update the risk assessment before deciding whether any restriction is warranted.', correct: true, why: 'Seeking an explanation and re-rating the relationship is the proportionate, risk-based first step.' },
        { id: 'b', text: 'Terminate the correspondent relationship immediately to strip out the new exposure, without waiting to understand what is driving the change.', correct: false, why: 'Reflexive exit is unjustified de-risking and forgoes the chance to understand the activity.' },
        { id: 'c', text: 'Take no action and rely on its own transaction monitoring, since it is a regulated bank.', correct: false, why: 'You import that risk and cannot outsource your own monitoring duty to it.' },
        { id: 'd', text: 'File a report and keep clearing the wires without seeking any explanation for the change.', correct: false, why: 'Reporting does not replace the due diligence needed to understand and manage the relationship.' }
      ]
    }
  },
  {
    id: 'm6-cb-risk',
    conceptTags: ['correspondent_banking', 'nested_relationships', 'payable_through_accounts'],
    mechanic: 'risk-classify',
    title: 'Rate the arrangement',
    spec: {
      kind: 'risk-classify',
      prompt: 'Classify the inherent risk of each correspondent arrangement.',
      items: [
        { id: '1', label: 'A plain relationship with a well-regulated respondent in a low-risk jurisdiction with a transparent customer base.', tier: 'low', why: 'Strong regulation, low-risk geography, and visibility into customers keep inherent risk low.' },
        { id: '2', label: 'A medium-risk-jurisdiction respondent whose business you understand and which discloses the few downstream banks it serves.', tier: 'medium', why: 'Disclosed nesting in a medium-risk corridor is manageable but raises the baseline.' },
        { id: '3', label: 'A respondent offering payable-through accounts that let its own customers transact directly on your books.', tier: 'high', why: 'Payable-through accounts give unscreened third parties direct access, which is high risk.' }
      ]
    }
  },
  {
    id: 'm6-tbml-redflags',
    conceptTags: ['tbml', 'over_invoicing', 'phantom_shipments'],
    mechanic: 'red-flags',
    title: 'Reading a trade file',
    spec: {
      kind: 'red-flags',
      scenario: 'You review a trade-finance file for a commodity import.',
      prompt: 'Which features are genuine red flags for trade-based money laundering?',
      items: [
        { id: 'a', label: 'The invoice price is several times the prevailing market price for the goods.', flag: true, why: 'A price far above market value can move excess value abroad through over-invoicing.' },
        { id: 'b', label: 'Shipping and customs records show no goods actually moved.', flag: true, why: 'Financing a shipment that never occurred is a phantom-shipment pattern.' },
        { id: 'c', label: 'The goods, quantities, and price are consistent across all documents.', flag: false, why: 'Internally consistent documentation is what you expect in a legitimate trade.' },
        { id: 'd', label: 'The same shipment appears to be invoiced more than once to different financiers.', flag: true, why: 'Multiple invoicing of one shipment justifies repeated, unwarranted payments.' },
        { id: 'e', label: 'The trade is between long-standing counterparties with a documented commercial history.', flag: false, why: 'An established, evidenced trading relationship is reassuring, not suspicious.' }
      ]
    }
  },
  {
    id: 'm6-tbml-sort',
    conceptTags: ['tbml', 'over_invoicing', 'under_invoicing'],
    mechanic: 'sort',
    title: 'Over or under?',
    spec: {
      kind: 'sort',
      prompt: 'Sort each effect by the mispricing technique that produces it.',
      buckets: [
        { id: 'over', label: 'Over-invoicing' },
        { id: 'under', label: 'Under-invoicing' }
      ],
      items: [
        { id: '1', label: 'An importer overpays a related exporter, sending extra value abroad to the exporter.', bucket: 'over', why: 'Inflating the stated price shifts value to the exporting party.' },
        { id: '2', label: 'An exporter under-bills a buyer, letting value build up with the importer.', bucket: 'under', why: 'Understating the price shifts value to the importing party.' },
        { id: '3', label: 'More money than the goods justify leaves the buyer country to the seller.', bucket: 'over', why: 'A price above true value is the over-invoicing mechanism for moving value out.' },
        { id: '4', label: 'Declared value is suppressed, also reducing the customs duty paid.', bucket: 'under', why: 'A price below true value understates the goods, a hallmark of under-invoicing.' }
      ]
    }
  },
  {
    id: 'm6-tbml-match',
    conceptTags: ['tbml', 'over_invoicing', 'under_invoicing', 'phantom_shipments'],
    mechanic: 'match',
    title: 'Name the technique',
    spec: {
      kind: 'match',
      prompt: 'Match each trade-based laundering technique to its description.',
      pairs: [
        { id: 'over', left: 'Over-invoicing', right: 'Stating a price above the true value of the goods to move value to the exporter.', why: 'The buyer overpays, transferring value out to the seller.' },
        { id: 'under', left: 'Under-invoicing', right: 'Stating a price below the true value of the goods to move value to the importer.', why: 'The seller under-bills, leaving value with the buyer.' },
        { id: 'phantom', left: 'Phantom shipment', right: 'Documenting and financing a shipment of goods that never actually moves.', why: 'Value moves through trade paperwork with no underlying goods.' },
        { id: 'multiple', left: 'Multiple invoicing', right: 'Issuing several invoices for one shipment to justify repeated payments.', why: 'Repeated billing of a single trade supports unwarranted transfers.' }
      ]
    }
  },
  {
    id: 'm6-va-redflags',
    conceptTags: ['virtual_assets', 'vasp', 'mixers_and_privacy_coins', 'wallet_attribution'],
    mechanic: 'red-flags',
    title: 'Watching virtual-asset flows',
    spec: {
      kind: 'red-flags',
      scenario: 'A customer account shows frequent flows to and from virtual-asset services.',
      prompt: 'Which patterns are genuine red flags?',
      items: [
        { id: 'a', label: 'Incoming funds are routed through a mixing service before reaching the customer.', flag: true, why: 'Mixers are used to break the on-chain trail and obscure the source of funds.' },
        { id: 'b', label: 'Funds are converted into a privacy coin on receipt and then converted back.', flag: true, why: 'Switching into privacy coins to defeat traceability is a known obfuscation pattern.' },
        { id: 'c', label: 'The customer transacts through a licensed exchange that performs customer due diligence.', flag: false, why: 'Using a regulated VASP that does CDD is normal, not a red flag.' },
        { id: 'd', label: 'Deposits trace to address clusters attributed to a darknet marketplace.', flag: true, why: 'Addresses are pseudonymous, not anonymous, and attribution to illicit clusters is a strong red flag.' },
        { id: 'e', label: 'The customer holds a small long-term position bought through a registered VASP.', flag: false, why: 'A modest, transparent holding through a registered provider is unremarkable.' }
      ]
    }
  },
  {
    id: 'm6-va-decision',
    conceptTags: ['vasp', 'travel_rule'],
    mechanic: 'decision',
    title: 'Sending to another VASP',
    spec: {
      kind: 'decision',
      prompt: 'A VASP is about to send a customer transfer above the applicable threshold to another VASP. What does the Travel Rule require?',
      options: [
        { id: 'a', text: 'Transmit the required originator and beneficiary information to the receiving VASP together with the transfer.', correct: true, why: 'The Travel Rule requires originator and beneficiary information to travel with a qualifying transfer to the next VASP.' },
        { id: 'b', text: 'Send only the value, since wallet addresses are anonymous and no identity information is needed.', correct: false, why: 'Addresses are pseudonymous, not anonymous, and the rule still requires identity information.' },
        { id: 'c', text: 'Keep the originator information internally and disclose it only if law enforcement later asks.', correct: false, why: 'The information must accompany the transfer, not be withheld until requested.' },
        { id: 'd', text: 'Collect beneficiary information but omit originator information, because the sender is already known.', correct: false, why: 'Both originator and beneficiary information must travel with the transfer.' }
      ]
    }
  },
  {
    id: 'm6-va-match',
    conceptTags: ['virtual_assets', 'vasp', 'travel_rule', 'wallet_attribution', 'mixers_and_privacy_coins'],
    mechanic: 'match',
    title: 'Map the term',
    spec: {
      kind: 'match',
      prompt: 'Match each term to its meaning.',
      pairs: [
        { id: 'vasp', left: 'VASP', right: 'A business that exchanges, transfers, or safekeeps virtual assets for customers.', why: 'VASPs are the regulated intermediaries that bring AML duties to virtual assets.' },
        { id: 'travel', left: 'Travel Rule', right: 'Requirement that originator and beneficiary information accompany a qualifying VA transfer to the next VASP.', why: 'It extends payment-transparency expectations to virtual-asset transfers.' },
        { id: 'attribution', left: 'Wallet attribution', right: 'Linking a pseudonymous address to a real-world person or service.', why: 'Attribution is what makes pseudonymous, traceable activity investigable.' },
        { id: 'mixer', left: 'Mixer', right: 'A service that pools and blends funds to break the on-chain trail.', why: 'Mixing is an obfuscation tool that frustrates tracing.' }
      ]
    }
  },
  {
    id: 'm6-re-redflags',
    conceptTags: ['cash_intensive_business', 'real_estate_ml'],
    mechanic: 'red-flags',
    title: 'A cash-intensive account',
    spec: {
      kind: 'red-flags',
      scenario: 'You monitor the bank account of a customer who runs a single-site car wash.',
      prompt: 'Which patterns are genuine red flags?',
      items: [
        { id: 'a', label: 'Daily cash deposits far exceed what the site could plausibly generate from its footfall and pricing.', flag: true, why: 'Takings inconsistent with the business model suggest illicit cash being placed.' },
        { id: 'b', label: 'Cash is quickly used to buy property outright with no financing.', flag: true, why: 'Converting unexplained cash into real estate is a common integration channel.' },
        { id: 'c', label: 'Deposits rise and fall with weather and season, as expected for the trade.', flag: false, why: 'Seasonal variation consistent with the business is normal.' },
        { id: 'd', label: 'Round-number cash deposits arrive just below the reporting threshold most days.', flag: true, why: 'Repeated sub-threshold round deposits point to structuring.' },
        { id: 'e', label: 'The business files tax returns and its deposits match declared turnover.', flag: false, why: 'Deposits aligned with declared, taxed turnover are reassuring.' }
      ]
    }
  },
  {
    id: 'm6-re-risk',
    conceptTags: ['real_estate_ml', 'cash_intensive_business', 'luxury_goods'],
    mechanic: 'risk-classify',
    title: 'Rate the situation',
    spec: {
      kind: 'risk-classify',
      prompt: 'Classify the inherent money-laundering risk of each situation.',
      items: [
        { id: '1', label: 'A salaried customer buys a home with a documented mortgage and a verifiable deposit.', tier: 'low', why: 'Financed purchase with traceable, declared funds shows low inherent risk.' },
        { id: '2', label: 'A cash-intensive business whose deposits modestly exceed expectations and whose owner cooperates with queries.', tier: 'medium', why: 'A small unexplained gap with cooperation is manageable but warrants closer review.' },
        { id: '3', label: 'A customer pays cash for high-value luxury goods well above known income and resells them within days.', tier: 'high', why: 'Cash purchase beyond means plus rapid resale points to placement and layering.' }
      ]
    }
  },
  {
    id: 'm6-re-sort',
    conceptTags: ['real_estate_ml', 'cash_intensive_business', 'luxury_goods', 'dnfbps'],
    mechanic: 'sort',
    title: 'Channel and indicator',
    spec: {
      kind: 'sort',
      prompt: 'Sort each indicator by the laundering channel it points to. Gatekeepers such as estate agents and dealers should recognise these.',
      buckets: [
        { id: 'realestate', label: 'Real estate' },
        { id: 'cash', label: 'Cash-intensive business' },
        { id: 'luxury', label: 'Luxury goods' }
      ],
      items: [
        { id: '1', label: 'Property bought outright for cash through an opaque corporate vehicle.', bucket: 'realestate', why: 'Cash property purchase behind hidden ownership is a classic real-estate channel.' },
        { id: '2', label: 'Rapid resale of a recently bought property at an unusual price.', bucket: 'realestate', why: 'Quick flips at off-market prices move and disguise value through property.' },
        { id: '3', label: 'Reported takings far exceed plausible customer volume for the site.', bucket: 'cash', why: 'Inflated takings let illicit cash be blended into legitimate sales.' },
        { id: '4', label: 'Frequent sub-threshold cash deposits inconsistent with the trade.', bucket: 'cash', why: 'Structured deposits at a cash business are a placement indicator.' },
        { id: '5', label: 'A high-value item bought for cash and resold quickly at a loss.', bucket: 'luxury', why: 'Buying and dumping costly goods converts cash with little regard for value.' },
        { id: '6', label: 'A buyer pays cash for high-value goods with no interest in the features or provenance of the item.', bucket: 'luxury', why: 'Indifference to the product itself suggests the goal is moving value, not owning it.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 7: National Frameworks in Depth (role / principle level)
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm7-us-match',
    conceptTags: ['bsa', 'fincen', 'ofac', 'usa_patriot_act'],
    mechanic: 'match',
    title: 'The US AML cast',
    spec: {
      kind: 'match',
      prompt: 'Match each US statute or body to its role.',
      pairs: [
        { id: 'bsa', left: 'Bank Secrecy Act', right: 'The core US AML statute that creates recordkeeping and reporting duties.', why: 'The BSA is the foundational law from which the US AML obligations flow.' },
        { id: 'fincen', left: 'FinCEN', right: 'The US financial intelligence unit that administers the BSA.', why: 'FinCEN receives reports and administers the BSA rather than examining banks itself.' },
        { id: 'ofac', left: 'OFAC', right: 'Administers and enforces US economic sanctions.', why: 'Sanctions are a distinct programme owned by OFAC, not general AML.' },
        { id: 'patriot', left: 'USA PATRIOT Act', right: 'Expanded the regime, adding measures such as customer identification.', why: 'The PATRIOT Act layered new tools onto the BSA framework.' }
      ]
    }
  },
  {
    id: 'm7-us-sort',
    conceptTags: ['fincen', 'ofac'],
    mechanic: 'sort',
    title: 'Route the US task',
    spec: {
      kind: 'sort',
      prompt: 'Sort each task to the US authority that handles it.',
      buckets: [
        { id: 'fincen', label: 'FinCEN' },
        { id: 'ofac', label: 'OFAC' }
      ],
      items: [
        { id: '1', label: 'Receiving and analysing suspicious activity reports filed by banks.', bucket: 'fincen', why: 'Report receipt and analysis sits with the financial intelligence unit.' },
        { id: '2', label: 'Screening a payment against the sanctions list and blocking it.', bucket: 'ofac', why: 'Interdicting sanctioned transactions is the sanctions authority role.' },
        { id: '3', label: 'Administering the Bank Secrecy Act reporting framework.', bucket: 'fincen', why: 'FinCEN administers the BSA reporting regime.' },
        { id: '4', label: 'Designating a person whose property must be frozen.', bucket: 'ofac', why: 'Designations and asset freezes are a sanctions function.' },
        { id: '5', label: 'Issuing guidance to institutions on their BSA reporting obligations.', bucket: 'fincen', why: 'Guidance on the reporting regime comes from its administrator.' }
      ]
    }
  },
  {
    id: 'm7-us-decision',
    conceptTags: ['cta', 'amla_2020', 'usa_patriot_act'],
    mechanic: 'decision',
    title: 'Which US regime',
    spec: {
      kind: 'decision',
      prompt: 'A firm needs to confirm the beneficial owners behind a newly formed company customer for reporting purposes. Which regime is most directly relevant?',
      options: [
        { id: 'a', text: 'The beneficial-ownership reporting regime under the Corporate Transparency Act.', correct: true, why: 'The CTA is the regime concerned specifically with beneficial-ownership reporting.' },
        { id: 'b', text: 'The economic sanctions programs that OFAC administers against designated parties.', correct: false, why: 'OFAC handles sanctions, not company beneficial-ownership reporting.' },
        { id: 'c', text: 'The customer identification measures the USA PATRIOT Act added at onboarding.', correct: false, why: 'Customer identification verifies the customer but is not the beneficial-ownership reporting regime.' },
        { id: 'd', text: 'The broad regime modernisation introduced by the AML Act of 2020.', correct: false, why: 'AMLA 2020 modernised the regime broadly, but the specific reporting duty lives in the CTA.' }
      ]
    }
  },
  {
    id: 'm7-uk-match',
    conceptTags: ['poca', 'mlr_2017', 'fca', 'nca'],
    mechanic: 'match',
    title: 'The UK AML cast',
    spec: {
      kind: 'match',
      prompt: 'Match each UK statute or body to its role.',
      pairs: [
        { id: 'poca', left: 'Proceeds of Crime Act 2002', right: 'Contains the principal money-laundering offences and the SAR and DAML regime.', why: 'POCA carries the core offences and the disclosure machinery.' },
        { id: 'mlr', left: 'Money Laundering Regulations 2017', right: 'Set the preventive AML compliance obligations for regulated firms.', why: 'The MLR 2017 are the operational AML rules firms must meet.' },
        { id: 'fca', left: 'FCA', right: 'Supervises firms for compliance with the AML rules.', why: 'The FCA is a supervisor of regulated firms.' },
        { id: 'nca', left: 'NCA', right: 'Hosts the UK financial intelligence unit that receives SARs.', why: 'The UK FIU sits within the NCA.' }
      ]
    }
  },
  {
    id: 'm7-uk-sort',
    conceptTags: ['nca', 'ofsi', 'fca'],
    mechanic: 'sort',
    title: 'Route the UK task',
    spec: {
      kind: 'sort',
      prompt: 'Sort each task to the UK authority that owns it.',
      buckets: [
        { id: 'nca', label: 'NCA / UK FIU' },
        { id: 'ofsi', label: 'OFSI' },
        { id: 'fca', label: 'FCA' }
      ],
      items: [
        { id: '1', label: 'Receiving a suspicious activity report and a request for a defence against money laundering.', bucket: 'nca', why: 'The UK FIU within the NCA receives SARs and DAML requests.' },
        { id: '2', label: 'Administering UK financial sanctions and assessing breaches.', bucket: 'ofsi', why: 'OFSI administers the financial-sanctions regime.' },
        { id: '3', label: 'Examining a regulated firm AML systems and controls.', bucket: 'fca', why: 'Supervising firm compliance is the FCA role.' },
        { id: '4', label: 'Granting consent to proceed with a transaction that would otherwise risk an offence.', bucket: 'nca', why: 'The DAML consent mechanism sits with the UK FIU.' },
        { id: '5', label: 'Maintaining the regime that freezes designated persons funds.', bucket: 'ofsi', why: 'Implementing asset freezes is OFSI work.' }
      ]
    }
  },
  {
    id: 'm7-uk-decision',
    conceptTags: ['jmlsg', 'mlr_2017'],
    mechanic: 'decision',
    title: 'Where to find UK guidance',
    spec: {
      kind: 'decision',
      prompt: 'Your firm wants practical, sector-specific guidance on applying the UK AML requirements day to day. Where do you turn first?',
      options: [
        { id: 'a', text: 'The JMLSG industry guidance, which interprets the rules into practice.', correct: true, why: 'JMLSG issues approved industry guidance on how to apply the requirements.' },
        { id: 'b', text: 'The Proceeds of Crime Act offences read directly from the statute book.', correct: false, why: 'POCA sets the offences but is not operational how-to guidance.' },
        { id: 'c', text: 'The OFSI financial-sanctions notices listing designated persons.', correct: false, why: 'Those concern sanctions, not general AML operational guidance.' },
        { id: 'd', text: 'The FCA published enforcement decisions against comparable firms.', correct: false, why: 'Enforcement outcomes illustrate failures but are not the primary practical guidance.' }
      ]
    }
  },
  {
    id: 'm7-eu-match',
    conceptTags: ['amld_4', 'amld_6', 'aml_package_2024', 'amla', 'single_rulebook'],
    mechanic: 'match',
    title: 'The EU framework, concept by concept',
    spec: {
      kind: 'match',
      prompt: 'Match each EU AML concept to its meaning.',
      pairs: [
        { id: 'directives', left: 'The successive AML directives', right: 'Set the framework historically, each transposed into national law.', why: 'Directives bind member states to a result but run through national transposition.' },
        { id: 'package', left: 'The 2024 AML Package', right: 'Shifts the model toward a directly-applicable rulebook and a central authority.', why: 'The package is the reform that changes how the rules are delivered.' },
        { id: 'rulebook', left: 'The single rulebook', right: 'Applies uniform AML rules directly across the union.', why: 'A regulation applies directly, without separate national transposition.' },
        { id: 'amla', left: 'AMLA', right: 'Acts as the central EU authority for AML supervision and coordination.', why: 'AMLA centralises oversight that had been purely national.' }
      ]
    }
  },
  {
    id: 'm7-eu-sequence',
    conceptTags: ['aml_package_2024', 'single_rulebook', 'amla'],
    mechanic: 'sequence',
    title: 'How the EU framework evolved',
    spec: {
      kind: 'sequence',
      prompt: 'Put the evolution of the EU AML framework in order, from earlier to later.',
      steps: [
        { id: '1', label: 'Member states implement AML obligations through successive directives transposed into national law.', why: 'The directive model came first and relied on national implementation.' },
        { id: '2', label: 'Divergent national transpositions leave gaps and inconsistencies across the union.', why: 'Differing implementations were the weakness the reform set out to fix.' },
        { id: '3', label: 'The 2024 AML Package introduces a directly-applicable single rulebook.', why: 'The package harmonises core rules directly rather than via transposition.' },
        { id: '4', label: 'A central authority, AMLA, is established to coordinate supervision.', why: 'Centralised oversight completes the shift away from purely national supervision.' }
      ]
    }
  },
  {
    id: 'm7-eu-decision',
    conceptTags: ['single_rulebook', 'aml_package_2024'],
    mechanic: 'decision',
    title: 'What the single rulebook changes',
    spec: {
      kind: 'decision',
      prompt: 'Under the move to a single rulebook, what most changes about how core AML obligations reach a firm in a member state?',
      options: [
        { id: 'a', text: 'Core obligations apply directly from the EU regulation, not only via national law.', correct: true, why: 'A directly-applicable regulation reaches firms without national transposition.' },
        { id: 'b', text: 'Each member state must enact entirely new national statutes before any rule can apply at all.', correct: false, why: 'Direct applicability reduces, rather than increases, reliance on national transposition.' },
        { id: 'c', text: 'AML supervision is removed from public authorities and handed to firms themselves.', correct: false, why: 'The package centralises supervision under AMLA; it does not abolish it.' },
        { id: 'd', text: 'Sanctions screening replaces customer due diligence as the principal duty.', correct: false, why: 'The rulebook harmonises AML duties; it does not swap CDD for sanctions screening.' }
      ]
    }
  },
  {
    id: 'm7-bd-match',
    conceptTags: ['mlpa_2012', 'ata_2009', 'bfiu_circular_26', 'tbml_guidelines'],
    mechanic: 'match',
    title: 'The Bangladesh AML cast',
    spec: {
      kind: 'match',
      prompt: 'Match each Bangladesh statute or instrument to its role.',
      pairs: [
        { id: 'mlpa', left: 'Money Laundering Prevention Act 2012', right: 'The principal money-laundering statute.', why: 'The MLPA 2012 is the core money-laundering law.' },
        { id: 'ata', left: 'Anti-Terrorism Act 2009', right: 'Covers terrorist-financing offences.', why: 'The ATA 2009 addresses terrorist financing rather than general laundering.' },
        { id: 'circular', left: 'BFIU Circular 26', right: 'Operational instructions issued by the FIU for regulated institutions.', why: 'BFIU circulars are the working instrument that translates the statutes into duties.' },
        { id: 'tbml', left: 'Trade-based money-laundering guidelines', right: 'Guidance addressing laundering carried out through trade transactions.', why: 'The TBML guidelines target the trade channel specifically.' }
      ]
    }
  },
  {
    id: 'm7-bd-sort',
    conceptTags: ['ctr_str_bangladesh'],
    mechanic: 'sort',
    title: 'CTR or STR',
    spec: {
      kind: 'sort',
      prompt: 'Sort each filing to the report type it represents.',
      buckets: [
        { id: 'ctr', label: 'Cash transaction report' },
        { id: 'str', label: 'Suspicious transaction report' }
      ],
      items: [
        { id: '1', label: 'A routine, threshold-based filing made regardless of any suspicion.', bucket: 'ctr', why: 'A CTR is an objective, value-driven report.' },
        { id: '2', label: 'A transaction that appears unusual and prompts a suspicion of laundering.', bucket: 'str', why: 'An STR is driven by suspicion, not a fixed value.' },
        { id: '3', label: 'A report submitted because the transaction meets a defined cash reporting line.', bucket: 'ctr', why: 'A value-based cash filing is a CTR.' },
        { id: '4', label: 'A discretionary report triggered by red-flag indicators.', bucket: 'str', why: 'STRs rest on suspicion indicators rather than thresholds.' },
        { id: '5', label: 'A periodic cash filing that the bank makes without judging intent.', bucket: 'ctr', why: 'CTRs are filed mechanically when the cash criteria are met.' }
      ]
    }
  },
  {
    id: 'm7-bd-decision',
    conceptTags: ['bfiu_circular_26', 'mlpa_2012'],
    mechanic: 'decision',
    title: 'The working instrument in Bangladesh',
    spec: {
      kind: 'decision',
      prompt: 'A bank compliance team needs the day-to-day operational instructions for meeting its AML obligations in Bangladesh. Which source is the working instrument?',
      options: [
        { id: 'a', text: 'BFIU Circular 26, the FIU operating instructions for regulated firms.', correct: true, why: 'BFIU circulars translate the statutes into concrete operating requirements.' },
        { id: 'b', text: 'The Money Laundering Prevention Act 2012, read on its own as the statute.', correct: false, why: 'The MLPA sets the legal offences but is not the operational how-to instrument.' },
        { id: 'c', text: 'The Anti-Terrorism Act 2009 and its terrorist-financing provisions.', correct: false, why: 'The ATA addresses terrorist financing, not general AML operating procedure.' },
        { id: 'd', text: 'The trade-based money-laundering guidelines applied to every customer.', correct: false, why: 'Those guidelines address one typology, not the full operational programme.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 8: Governance, Audit, and the Compliance Function
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm8-3lod-sort',
    conceptTags: ['three_lines_of_defence', 'first_line', 'second_line', 'third_line'],
    mechanic: 'sort',
    title: 'Which line owns it',
    spec: {
      kind: 'sort',
      prompt: 'Sort each AML responsibility to the line of defence that holds it.',
      buckets: [
        { id: 'first', label: 'First line' },
        { id: 'second', label: 'Second line' },
        { id: 'third', label: 'Third line' }
      ],
      items: [
        { id: '1', label: 'A relationship manager performs CDD and monitors the accounts in their own portfolio.', bucket: 'first', why: 'The first line is the business, which owns and manages the risk it creates day to day.' },
        { id: '2', label: 'A business unit head accepts a higher-risk client within risk appetite and owns that decision.', bucket: 'first', why: 'Accepting and owning a client decision within appetite is first-line ownership of risk.' },
        { id: '3', label: 'Compliance issues the AML policy and challenges a business proposal it considers too risky.', bucket: 'second', why: 'The second line sets policy, advises, and challenges the business without owning the risk.' },
        { id: '4', label: 'Internal audit tests whether the transaction-monitoring rules are calibrated correctly.', bucket: 'third', why: 'The third line independently tests whether the controls actually work.' },
        { id: '5', label: 'Internal audit reports residual control weaknesses directly to the board audit committee.', bucket: 'third', why: 'Reporting independently to the audit committee is a hallmark of third-line assurance.' }
      ]
    }
  },
  {
    id: 'm8-3lod-match',
    conceptTags: ['three_lines_of_defence', 'first_line', 'second_line', 'third_line'],
    mechanic: 'match',
    title: 'Name the line',
    spec: {
      kind: 'match',
      prompt: 'Match each line of defence to the role it plays in the AML model.',
      pairs: [
        { id: 'first', left: 'First line', right: 'Owns and manages the money-laundering risk created by its day-to-day business.', why: 'The business that creates the risk is accountable for managing it.' },
        { id: 'second', left: 'Second line', right: 'Sets AML policy, advises the business, and independently challenges it.', why: 'Compliance and risk advise and challenge but do not own the risk.' },
        { id: 'third', left: 'Third line', right: 'Independently tests whether the controls actually work.', why: 'Internal audit provides assurance and must stay independent of the controls.' }
      ]
    }
  },
  {
    id: 'm8-3lod-decision',
    conceptTags: ['ownership_of_risk', 'first_line'],
    mechanic: 'decision',
    title: 'Who owns the control',
    spec: {
      kind: 'decision',
      prompt: 'A bank is deciding which function should own the acceptance decision and the ongoing monitoring of a new corporate client. Which allocation fits the three-lines model?',
      options: [
        { id: 'a', text: 'The business team owns acceptance and ongoing monitoring of its client, with compliance advising and audit testing.', correct: true, why: 'Under the three-lines model the business owns the risk it creates, with the other lines advising and assuring.' },
        { id: 'b', text: 'Compliance owns the acceptance and monitoring decisions, since financial-crime risk is fundamentally a compliance matter.', correct: false, why: 'Compliance advises and challenges but cannot own the control, or it loses its second-line objectivity.' },
        { id: 'c', text: 'Internal audit owns the ongoing monitoring so that an independent function is accountable for catching problems.', correct: false, why: 'If audit owned the monitoring it could no longer independently test it.' },
        { id: 'd', text: 'The board owns the day-to-day monitoring because it is ultimately accountable for risk overall.', correct: false, why: 'The board sets appetite and oversees, but it does not run day-to-day controls.' }
      ]
    }
  },
  {
    id: 'm8-mlro-match',
    conceptTags: ['mlro', 'bsa_officer', 'cco', 'compliance_function'],
    mechanic: 'match',
    title: 'Name the role',
    spec: {
      kind: 'match',
      prompt: 'Match each governance term to its meaning.',
      pairs: [
        { id: 'mlro', left: 'MLRO', right: 'The nominated officer in a UK firm who receives internal suspicion reports and decides on external reporting.', why: 'The MLRO is the designated person for suspicious-activity reporting in the UK regime.' },
        { id: 'bsa', left: 'BSA Officer', right: 'The individual a US institution designates to coordinate day-to-day BSA and AML compliance.', why: 'US institutions must designate a BSA compliance officer with defined responsibility.' },
        { id: 'cco', left: 'CCO', right: 'The senior officer accountable for the firm-wide compliance function.', why: 'The Chief Compliance Officer carries firm-wide compliance accountability.' },
        { id: 'func', left: 'Compliance function', right: 'The team that sets AML policy, advises the business, and monitors adherence.', why: 'The compliance function is the second-line team supporting and challenging the business.' }
      ]
    }
  },
  {
    id: 'm8-mlro-decision',
    conceptTags: ['compliance_function', 'personal_liability'],
    mechanic: 'decision',
    title: 'Protect the role',
    spec: {
      kind: 'decision',
      prompt: 'A newly appointed MLRO finds the role has no direct line to the board, shares staff with the sales team, and must get the head of business to approve any report before it is filed. Which change best protects both the institution and the officer?',
      options: [
        { id: 'a', text: 'Give the MLRO direct board access, dedicated staff, and sole authority over filing decisions, so the role is independent and resourced.', correct: true, why: 'Independence, board access, resources, and decision authority are what make the designated role effective.' },
        { id: 'b', text: 'Keep the reporting line through the head of business but log each disagreement, since a clear audit trail meets the independence requirement.', correct: false, why: 'Routing filing through the head of business compromises the MLRO independence, whatever the paper trail.' },
        { id: 'c', text: 'Leave the structure unchanged but raise the MLRO title and pay, since adequate seniority alone establishes independence.', correct: false, why: 'Seniority and pay help, but without resources and authority the role is not actually independent.' },
        { id: 'd', text: 'Route each filing decision to a committee of business heads so that no single person carries the personal liability.', correct: false, why: 'A committee cannot absorb the personal liability that attaches to the designated officer.' }
      ]
    }
  },
  {
    id: 'm8-mlro-sequence',
    conceptTags: ['mlro', 'compliance_function'],
    mechanic: 'sequence',
    title: 'From concern to disclosure',
    spec: {
      kind: 'sequence',
      prompt: 'Put the suspicious-activity reporting flow in the correct order, from front-line concern to external disclosure.',
      steps: [
        { id: '1', label: 'A front-line employee identifies unusual activity and submits an internal suspicion report to the MLRO.', why: 'Front-line staff raise concerns internally first.' },
        { id: '2', label: 'The MLRO evaluates the report against the wider information the bank holds and the legal threshold.', why: 'The MLRO assesses whether the suspicion meets the reporting standard.' },
        { id: '3', label: 'The MLRO decides whether to file and, if so, submits an external report to the FIU.', why: 'Only the MLRO makes the external reporting decision.' },
        { id: '4', label: 'The MLRO records the rationale, including any decision not to file, for audit and supervisory review.', why: 'Documenting the decision protects both the institution and the officer.' }
      ]
    }
  },
  {
    id: 'm8-audit-decision',
    conceptTags: ['independent_testing', 'aml_audit'],
    mechanic: 'decision',
    title: 'Preserve independence',
    spec: {
      kind: 'decision',
      prompt: 'A bank is planning its periodic AML audit. Which arrangement preserves the independence the third line requires?',
      options: [
        { id: 'a', text: 'Internal audit runs the review, tests no control it owns, and reports findings to the audit committee.', correct: true, why: 'Independence from the controls reviewed and reporting to the audit committee define third-line testing.' },
        { id: 'b', text: 'The compliance team that designed the controls runs the review, because it understands the design best of anyone.', correct: false, why: 'Compliance cannot objectively audit the very controls it designed and runs.' },
        { id: 'c', text: 'The business line under review performs the testing, with compliance signing off on the results.', correct: false, why: 'A business line testing itself has an inherent conflict and is not independent.' },
        { id: 'd', text: 'The vendor that built and maintains the monitoring system performs the review of that system.', correct: false, why: 'A vendor reviewing its own system cannot provide independent assurance.' }
      ]
    }
  },
  {
    id: 'm8-audit-sequence',
    conceptTags: ['aml_audit', 'audit_scope', 'audit_findings'],
    mechanic: 'sequence',
    title: 'Run the audit',
    spec: {
      kind: 'sequence',
      prompt: 'Order the stages of a risk-based AML audit.',
      steps: [
        { id: '1', label: 'Scope the audit from the enterprise risk assessment, concentrating effort on the higher-risk areas.', why: 'Risk-based scoping directs testing where the money-laundering risk is greatest.' },
        { id: '2', label: 'Test the design and operating effectiveness of the selected controls through sampling and walkthroughs.', why: 'Testing establishes whether the controls work in practice, not just on paper.' },
        { id: '3', label: 'Document the findings, rate their severity, and agree remediation actions and owners with management.', why: 'Findings are only useful when rated and assigned for correction.' },
        { id: '4', label: 'Track remediation to closure and report the results to the audit committee.', why: 'Independent reporting and follow-up close the loop on the audit.' }
      ]
    }
  },
  {
    id: 'm8-audit-match',
    conceptTags: ['independent_testing', 'audit_scope', 'audit_findings', 'aml_audit'],
    mechanic: 'match',
    title: 'Audit vocabulary',
    spec: {
      kind: 'match',
      prompt: 'Match each audit term to its meaning.',
      pairs: [
        { id: 'indep', left: 'Independent testing', right: 'Review by a function with no responsibility for the controls being examined.', why: 'Independence is what gives the testing its assurance value.' },
        { id: 'scope', left: 'Risk-based scope', right: 'Coverage and depth set by where money-laundering risk is greatest.', why: 'Scope follows risk so effort lands where it matters.' },
        { id: 'finding', left: 'Audit finding', right: 'An identified control weakness, rated for severity and assigned for remediation.', why: 'A finding drives corrective action, not just a record.' },
        { id: 'freq', left: 'Risk-based frequency', right: 'How often an area is audited, driven by its risk rather than a fixed calendar.', why: 'Higher-risk areas are tested more often than lower-risk ones.' }
      ]
    }
  },
  {
    id: 'm8-training-decision',
    conceptTags: ['aml_training', 'role_based_training'],
    mechanic: 'decision',
    title: 'Fix the training',
    spec: {
      kind: 'decision',
      prompt: 'A compliance team reports that all staff completed annual AML training, yet front-line staff keep missing the same red flags. What is the most effective response?',
      options: [
        { id: 'a', text: 'Tailor training to each role and test whether staff can apply it, not just that they completed it.', correct: true, why: 'Effective training is role-specific and measured by whether staff can apply it.' },
        { id: 'b', text: 'Increase the frequency of the existing course so that every member of staff takes it twice each year.', correct: false, why: 'Repeating the same generic course more often does not fix a content or relevance gap.' },
        { id: 'c', text: 'Make the completion certificate a condition of the annual bonus to raise engagement.', correct: false, why: 'Tying completion to pay drives completion, not understanding.' },
        { id: 'd', text: 'Move the same material online so that more staff are able to finish it on time.', correct: false, why: 'Changing the delivery channel addresses logistics, not whether the training works.' }
      ]
    }
  },
  {
    id: 'm8-culture-sort',
    conceptTags: ['compliance_culture', 'tone_from_the_top'],
    mechanic: 'sort',
    title: 'Strengthen or weaken',
    spec: {
      kind: 'sort',
      prompt: 'Sort each practice by whether it strengthens or weakens the compliance culture.',
      buckets: [
        { id: 'strengthens', label: 'Strengthens culture' },
        { id: 'weakens', label: 'Weakens culture' }
      ],
      items: [
        { id: '1', label: 'Senior leaders visibly back a deal that was declined on financial-crime grounds.', bucket: 'strengthens', why: 'Leadership standing behind a hard call signals that compliance is taken seriously.' },
        { id: '2', label: 'A top revenue producer is exempted from controls that bind everyone else.', bucket: 'weakens', why: 'Exempting a star producer tells staff the rules are optional when money is at stake.' },
        { id: '3', label: 'Staff who raise concerns are protected and thanked, even when a concern proves unfounded.', bucket: 'strengthens', why: 'Protecting good-faith escalation encourages people to speak up.' },
        { id: '4', label: 'Compliance findings are quietly overruled when they threaten a quarterly target.', bucket: 'weakens', why: 'Overriding findings for targets teaches staff that controls yield to revenue.' },
        { id: '5', label: 'Performance reviews weigh how well staff uphold their compliance obligations.', bucket: 'strengthens', why: 'Measuring conduct, not just results, embeds compliance in everyday work.' },
        { id: '6', label: 'Leadership frames AML as a box-ticking cost rather than part of doing business.', bucket: 'weakens', why: 'Tone from the top that dismisses AML erodes the whole control environment.' }
      ]
    }
  },
  {
    id: 'm8-culture-redflags',
    conceptTags: ['compliance_culture', 'tone_from_the_top'],
    mechanic: 'red-flags',
    title: 'Read the culture',
    spec: {
      kind: 'red-flags',
      scenario: 'You join a mid-sized bank as a financial-crime analyst. In your first month you observe how the firm actually operates day to day.',
      prompt: 'Which observations are warning signs of a weak compliance culture?',
      items: [
        { id: '1', label: 'The head of sales openly dismisses compliance as an obstacle to closing deals.', flag: true, why: 'Negative tone from a senior leader signals that controls are not valued.' },
        { id: '2', label: 'The MLRO has a standing slot to brief the board on financial-crime risk.', flag: false, why: 'Regular board engagement is a sign of a healthy governance culture.' },
        { id: '3', label: 'Staff are quietly discouraged from filing reports that could upset profitable clients.', flag: true, why: 'Suppressing reporting to protect revenue is a serious cultural warning sign.' },
        { id: '4', label: 'Employees who escalate concerns find their judgement questioned and their cases reassigned.', flag: true, why: 'Punishing escalation deters the speak-up behaviour that controls depend on.' },
        { id: '5', label: 'Leadership funds a request from the financial-crime team for additional analysts.', flag: false, why: 'Resourcing the function shows leadership backs compliance in practice.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 10: Tools and Technologies to Fight Financial Crime
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm10-landscape-decision',
    conceptTags: ['build_vs_buy', 'tool_selection', 'operational_effectiveness'],
    mechanic: 'decision',
    title: 'Build or buy the screening engine',
    spec: {
      kind: 'decision',
      prompt: 'A mid-size firm needs a sanctions screening engine within two quarters and has a small engineering team. Which choice is most defensible?',
      options: [
        { id: 'a', text: 'Buy an established screening tool, then govern its tuning and integration against firm-wide risk.', correct: true, why: 'Buying fits the short timeline and thin team while leaving the firm accountable for calibration and oversight.' },
        { id: 'b', text: 'Build a bespoke engine in-house so the logic fits the risk of the firm exactly.', correct: false, why: 'A custom build is hard to deliver and maintain in two quarters with a small team.' },
        { id: 'c', text: 'Buy the tool and run it on the vendor’s default settings out of the box, to avoid any configuration delay before go-live.', correct: false, why: 'A vendor default is not calibrated to the risk of the firm and shifts judgement to the supplier.' },
        { id: 'd', text: 'Delay screening and add more analysts to review payments manually in the interim.', correct: false, why: 'Manual review does not substitute for the real-time interdiction a screening control provides.' }
      ]
    }
  },
  {
    id: 'm10-landscape-match',
    conceptTags: ['afc_technology', 'regtech'],
    mechanic: 'match',
    title: 'Map the stack to the lifecycle',
    spec: {
      kind: 'match',
      prompt: 'Match each AFC tool to the lifecycle stage it serves.',
      pairs: [
        { id: '1', left: 'e-KYC and identity proofing', right: 'Verifies the customer at onboarding.', why: 'Identity tooling works at the entry gate before the relationship opens.' },
        { id: '2', left: 'Sanctions screening', right: 'Interdicts prohibited parties before value moves.', why: 'Screening is a real-time control that blocks rather than reviews after the fact.' },
        { id: '3', left: 'Transaction monitoring', right: 'Detects suspicious patterns across the live relationship.', why: 'Monitoring runs continuously once activity is underway.' },
        { id: '4', left: 'Perpetual KYC', right: 'Keeps the customer profile current over time.', why: 'pKYC refreshes the record as the risk picture changes.' }
      ]
    }
  },
  {
    id: 'm10-landscape-sort',
    conceptTags: ['build_vs_buy', 'tool_selection'],
    mechanic: 'sort',
    title: 'Sort the build-vs-buy factors',
    spec: {
      kind: 'sort',
      prompt: 'Sort each factor by the option it tends to favour.',
      buckets: [
        { id: 'build', label: 'Favours building in-house' },
        { id: 'buy', label: 'Favours buying a vendor tool' }
      ],
      items: [
        { id: '1', label: 'A highly specific risk profile that no off-the-shelf product fits.', bucket: 'build', why: 'A unique requirement is where bespoke control and fit pay off.' },
        { id: '2', label: 'A short delivery deadline with limited engineering capacity.', bucket: 'buy', why: 'Buying brings speed when the team cannot build in time.' },
        { id: '3', label: 'A need to keep proprietary detection logic confidential.', bucket: 'build', why: 'Owning the logic keeps it inside the firm rather than a supplier.' },
        { id: '4', label: 'A wish to avoid carrying long-term maintenance and upgrades.', bucket: 'buy', why: 'A vendor absorbs ongoing maintenance the firm would otherwise own.' },
        { id: '5', label: 'A requirement for rapid access to maintained, updated sanctions data.', bucket: 'buy', why: 'Vendors maintain list feeds the firm would struggle to source alone.' }
      ]
    }
  },
  {
    id: 'm10-onboarding-decision',
    conceptTags: ['e_kyc', 'onboarding_technology', 'digital_identity'],
    mechanic: 'decision',
    title: 'Choose the onboarding control',
    spec: {
      kind: 'decision',
      prompt: 'Remote onboarding lets applicants pass with only a document upload, and synthetic identities are getting through. What is the strongest fix?',
      options: [
        { id: 'a', text: 'Add liveness-checked biometric matching and external data validation to the document step.', correct: true, why: 'Binding a live person to a validated identity closes the gap a document-only check leaves open.' },
        { id: 'b', text: 'Buy a faster document-capture tool so applicants finish the same flow sooner.', correct: false, why: 'Speeding up a weak control does not make the verification any stronger.' },
        { id: 'c', text: 'Keep the document upload but have analysts review each file after approval.', correct: false, why: 'Post-approval review lets the risk through the gate before anyone checks it.' },
        { id: 'd', text: 'Accept the document upload and rely on later transaction monitoring to catch issues.', correct: false, why: 'Monitoring after the fact does not operationalise identity at the gate where CDD belongs.' }
      ]
    }
  },
  {
    id: 'm10-onboarding-redflags',
    conceptTags: ['onboarding_technology', 'biometrics', 'digital_identity'],
    mechanic: 'red-flags',
    title: 'Inspect the onboarding flow',
    spec: {
      kind: 'red-flags',
      scenario: 'A firm reviews its digital onboarding flow after a rise in fraudulent accounts.',
      prompt: 'Flag the items that signal a weak onboarding control.',
      items: [
        { id: '1', label: 'The document check accepts a photo of a screen showing another document.', flag: true, why: 'Accepting an image of an image means no liveness or authenticity test is in place.' },
        { id: '2', label: 'The same device and selfie pass for several different applicant identities.', flag: true, why: 'One device and face across identities points to coordinated synthetic onboarding.' },
        { id: '3', label: 'Biometric liveness is checked against the submitted identity document.', flag: false, why: 'Binding a live capture to the document is sound practice, not a weakness.' },
        { id: '4', label: 'Submitted details are validated against an independent external data source.', flag: false, why: 'External corroboration strengthens the check rather than weakening it.' },
        { id: '5', label: 'The biometric threshold is set so loose that near-misses auto-pass.', flag: true, why: 'A threshold tuned that loose lets mismatched faces through the gate.' }
      ]
    }
  },
  {
    id: 'm10-onboarding-match',
    conceptTags: ['e_kyc', 'biometrics', 'external_data', 'digital_identity'],
    mechanic: 'match',
    title: 'Match the onboarding component',
    spec: {
      kind: 'match',
      prompt: 'Match each onboarding component to what it does.',
      pairs: [
        { id: '1', left: 'Document authentication', right: 'Tests whether the identity document is genuine.', why: 'It checks the document itself before trusting its contents.' },
        { id: '2', left: 'Biometric liveness', right: 'Confirms a live person is present, not a static image.', why: 'Liveness defeats replayed photos and recordings.' },
        { id: '3', left: 'External data validation', right: 'Corroborates the claimed details against independent records.', why: 'Third-party data confirms the identity exists and matches.' },
        { id: '4', left: 'Face match', right: 'Binds the live applicant to the document photo.', why: 'Matching the selfie to the document ties the person to the identity.' }
      ]
    }
  },
  {
    id: 'm10-screening-sort',
    conceptTags: ['fuzzy_matching', 'screening_technology'],
    mechanic: 'sort',
    title: 'Recall or precision',
    spec: {
      kind: 'sort',
      prompt: 'Sort each screening adjustment by its main effect.',
      buckets: [
        { id: 'recall', label: 'Improves recall' },
        { id: 'precision', label: 'Improves precision' }
      ],
      items: [
        { id: '1', label: 'Adding alias and transliteration variants to the matching logic.', bucket: 'recall', why: 'Variant name forms catch true hits an exact match would miss.' },
        { id: '2', label: 'Raising the minimum match score before an alert is raised.', bucket: 'precision', why: 'A higher score bar filters weak partial matches and cuts noise.' },
        { id: '3', label: 'Loosening the fuzzy threshold to allow more approximate matches.', bucket: 'recall', why: 'A looser threshold surfaces more candidate matches, including marginal true ones.' },
        { id: '4', label: 'Narrowing matching to exact full-name strings only.', bucket: 'precision', why: 'Exact-only matching reduces false positives but risks missing variants.' },
        { id: '5', label: 'Screening against the current list rather than a stale extract.', bucket: 'recall', why: 'A fresh list recovers true matches a stale one would never surface.' }
      ]
    }
  },
  {
    id: 'm10-screening-decision',
    conceptTags: ['list_management', 'sanctions_screening', 'screening_technology'],
    mechanic: 'decision',
    title: 'Diagnose the missed match',
    spec: {
      kind: 'decision',
      prompt: 'A screening tool failed to flag a payment to a newly designated party. The matching logic is well tuned. What is the most likely cause?',
      options: [
        { id: 'a', text: 'The list feed was not refreshed, so the new designation never reached the engine.', correct: true, why: 'A tool can only match against the data it holds, so a stale list misses fresh designations.' },
        { id: 'b', text: 'The fuzzy-matching threshold was set too high, so a close name variant was suppressed below the alerting cut-off.', correct: false, why: 'A well-tuned threshold would still match an entry the engine actually had.' },
        { id: 'c', text: 'The tool needs more analysts assigned to clear its alert queue.', correct: false, why: 'No alert was generated, so queue capacity is not the issue here.' },
        { id: 'd', text: 'The payment value fell below the screening monetary threshold.', correct: false, why: 'Sanctions screening interdicts prohibited parties regardless of amount.' }
      ]
    }
  },
  {
    id: 'm10-screening-redflags',
    conceptTags: ['list_management', 'adverse_media', 'screening_technology'],
    mechanic: 'red-flags',
    title: 'Audit the screening setup',
    spec: {
      kind: 'red-flags',
      scenario: 'An auditor examines how a firm runs its name and customer screening.',
      prompt: 'Flag the items that indicate a screening weakness.',
      items: [
        { id: '1', label: 'Sanctions lists are loaded once a quarter from a manual export.', flag: true, why: 'Quarterly manual loads leave the engine blind to designations made in between.' },
        { id: '2', label: 'A field-mapping error means customer middle names never reach the matcher.', flag: true, why: 'If data does not reach the tool, true matches cannot be made.' },
        { id: '3', label: 'Adverse-media screening runs alongside list screening on higher-risk customers.', flag: false, why: 'Layering adverse media on risk strengthens coverage rather than weakening it.' },
        { id: '4', label: 'Fuzzy matching and current list feeds are both maintained and tested.', flag: false, why: 'Maintained matching and fresh lists are exactly what sound screening needs.' },
        { id: '5', label: 'Alerts are batch-reviewed weeks after the underlying payments settled.', flag: true, why: 'Delayed review turns an interdiction control into a retrospective one.' }
      ]
    }
  },
  {
    id: 'm10-monitoring-decision',
    conceptTags: ['scenario_coverage', 'transaction_monitoring', 'tuning'],
    mechanic: 'decision',
    title: 'Close the coverage gap',
    spec: {
      kind: 'decision',
      prompt: 'A review finds a money-laundering typology with no monitoring scenario covering it. What is the most defensible response?',
      options: [
        { id: 'a', text: 'Design and test a scenario for the typology, segmenting and tuning it before deployment.', correct: true, why: 'A documented, tested scenario directly closes the gap and is built to catch the risk.' },
        { id: 'b', text: 'Lower thresholds on existing scenarios so more activity is flagged overall.', correct: false, why: 'Generic lower thresholds add noise without targeting the uncovered typology.' },
        { id: 'c', text: 'Assign more analysts to the existing alert queue to compensate.', correct: false, why: 'More reviewers cannot find a typology no scenario is generating alerts for.' },
        { id: 'd', text: 'Accept the gap because no suspicious reports have arisen from that typology.', correct: false, why: 'Absence of reports may simply reflect that nothing is being detected.' }
      ]
    }
  },
  {
    id: 'm10-monitoring-sequence',
    conceptTags: ['model_risk', 'threshold_setting', 'transaction_monitoring'],
    mechanic: 'sequence',
    title: 'Stand up a monitoring model',
    spec: {
      kind: 'sequence',
      prompt: 'Order the steps of bringing a transaction-monitoring model into service.',
      steps: [
        { id: '1', label: 'Segment customers and define the risks the model must cover.', why: 'Segmentation gives the model clear populations and targets to work against.' },
        { id: '2', label: 'Build the scenarios and set thresholds against those segments.', why: 'The risk has to become concrete logic and limits before it can run.' },
        { id: '3', label: 'Test against historical data and tune for coverage versus noise.', why: 'Back-testing shows whether it catches risk without overwhelming analysts.' },
        { id: '4', label: 'Deploy with ongoing performance monitoring and periodic validation.', why: 'A live model still needs validation as customer behaviour shifts.' }
      ]
    }
  },
  {
    id: 'm10-monitoring-sort',
    conceptTags: ['tuning', 'threshold_setting', 'scenario_coverage'],
    mechanic: 'sort',
    title: 'Fewer false positives or fewer misses',
    spec: {
      kind: 'sort',
      prompt: 'Sort each monitoring change by its main effect on alert output.',
      buckets: [
        { id: 'fewerfp', label: 'Reduces false positives' },
        { id: 'fewermiss', label: 'Reduces missed activity' }
      ],
      items: [
        { id: '1', label: 'Raising a scenario threshold after testing shows low-value alerts dominate.', bucket: 'fewerfp', why: 'A higher, tested threshold strips out the weak alerts that add noise.' },
        { id: '2', label: 'Adding a new scenario for a typology nothing currently covers.', bucket: 'fewermiss', why: 'Fresh coverage catches activity that previously generated no alert.' },
        { id: '3', label: 'Refining segmentation so retail and corporate customers are scored apart.', bucket: 'fewerfp', why: 'Tighter segmentation stops normal corporate flows tripping retail rules.' },
        { id: '4', label: 'Lowering a threshold where testing shows true activity slips under it.', bucket: 'fewermiss', why: 'A lower, evidenced limit recovers genuine activity that was being missed.' }
      ]
    }
  },
  {
    id: 'm10-aiml-decision',
    conceptTags: ['machine_learning', 'explainability', 'investigation_tooling'],
    mechanic: 'decision',
    title: 'Deploy the ML model responsibly',
    spec: {
      kind: 'decision',
      prompt: 'A team wants to replace rules with a machine-learning model that scores customers but cannot explain why. What should govern the decision?',
      options: [
        { id: 'a', text: 'Require the model to produce explainable outputs investigators and regulators can follow.', correct: true, why: 'Decisions affecting customers must be explainable to be defensible and reviewable.' },
        { id: 'b', text: 'Deploy it as-is, on the basis that its measured detection rate already beats the current rules in testing.', correct: false, why: 'A higher hit rate does not excuse outputs no one can justify or challenge.' },
        { id: 'c', text: 'Run it silently in the background and act only on its highest scores.', correct: false, why: 'Acting on opaque scores still produces decisions that cannot be explained.' },
        { id: 'd', text: 'Keep the model unexplained but add more analysts to review its alerts.', correct: false, why: 'Reviewers cannot validate an alert when the model gives no reason for it.' }
      ]
    }
  },
  {
    id: 'm10-aiml-match',
    conceptTags: ['network_analysis', 'machine_learning', 'investigation_tooling', 'explainability'],
    mechanic: 'match',
    title: 'Match the technique to its strength',
    spec: {
      kind: 'match',
      prompt: 'Match each advanced technique to what it contributes.',
      pairs: [
        { id: '1', left: 'Network and link analysis', right: 'Surfaces relationships between parties that isolated rules miss.', why: 'Link analysis connects accounts and entities a single-transaction rule cannot see.' },
        { id: '2', left: 'Machine-learning detection', right: 'Learns patterns from data beyond fixed rule thresholds.', why: 'ML adapts to patterns rather than waiting for a hand-coded rule.' },
        { id: '3', left: 'Explainability tooling', right: 'Makes a model output reviewable and defensible.', why: 'Explainability lets investigators and regulators follow the reasoning.' },
        { id: '4', left: 'Investigation case tooling', right: 'Equips analysts to assemble and document evidence.', why: 'Case tools bring the signals together for a coherent investigation.' }
      ]
    }
  },
  {
    id: 'm10-aiml-redflags',
    conceptTags: ['data_protection', 'machine_learning', 'explainability'],
    mechanic: 'red-flags',
    title: 'Review the analytics deployment',
    spec: {
      kind: 'red-flags',
      scenario: 'A firm reviews how an analytics team uses customer data in a new ML detection project.',
      prompt: 'Flag the items that signal misuse or a governance gap.',
      items: [
        { id: '1', label: 'Customer data is copied to an ungoverned sandbox with no access controls.', flag: true, why: 'Uncontrolled copies breach data-protection limits on how data may be held and used.' },
        { id: '2', label: 'The model drives adverse decisions but cannot explain any of them.', flag: true, why: 'Unexplainable adverse decisions are indefensible to customers and regulators.' },
        { id: '3', label: 'Data use is documented against a lawful basis with retention limits.', flag: false, why: 'A documented lawful basis and retention limit is sound data governance.' },
        { id: '4', label: 'Personal data feeds the model far beyond what the purpose needs.', flag: true, why: 'Using more data than the purpose requires breaches data-minimisation principles.' },
        { id: '5', label: 'Model outputs are logged with reasons investigators can review.', flag: false, why: 'Logged, reviewable reasoning supports explainability rather than undermining it.' }
      ]
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // Module 11: The Broader Financial-Crime Landscape
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'm11-fraud-bec',
    conceptTags: ['business_email_compromise', 'app_fraud'],
    mechanic: 'red-flags',
    title: 'Spot the redirected payment',
    spec: {
      kind: 'red-flags',
      scenario: 'A payments clerk at a manufacturer receives an email asking to redirect this month payment to a new account for a long-standing supplier.',
      prompt: 'Which signs point to business email compromise or authorized push payment fraud?',
      items: [
        { id: 'a', label: 'The sender address is a near-identical look-alike of the supplier domain and the bank details change at the final hour.', flag: true, why: 'A spoofed domain combined with a last-minute change of account details is the classic BEC signature.' },
        { id: 'b', label: 'A caller claiming to be the supplier urges immediate payment and discourages any callback to verify.', flag: true, why: 'Manufactured urgency plus discouraging verification is the social-engineering core of APP fraud.' },
        { id: 'c', label: 'The clerk confirms the change by phoning the supplier on the number already held in the master vendor file.', flag: false, why: 'Independent verification on a previously held number is the correct control, not a red flag.' },
        { id: 'd', label: 'The invoice amount, reference, and purchase order all match the established order on file.', flag: false, why: 'Consistency with the existing order and reference is reassuring rather than suspicious.' },
        { id: 'e', label: 'The email arrives outside business hours and stresses secrecy so colleagues are not consulted.', flag: true, why: 'Pressure for secrecy to bypass normal review is a deliberate tactic to defeat controls.' }
      ]
    }
  },
  {
    id: 'm11-fraud-sort',
    conceptTags: ['fraud_typologies', 'app_fraud', 'business_email_compromise'],
    mechanic: 'sort',
    title: 'Name the fraud typology',
    spec: {
      kind: 'sort',
      prompt: 'Sort each scenario into the fraud typology it best illustrates.',
      buckets: [
        { id: 'app', label: 'Authorized push payment fraud' },
        { id: 'bec', label: 'Business email compromise' },
        { id: 'investment', label: 'Investment scam' },
        { id: 'identity', label: 'Identity fraud' }
      ],
      items: [
        { id: '1', label: 'A victim is persuaded by phone to move savings into a so-called safe account they transfer to themselves.', bucket: 'app', why: 'The victim is tricked into authorizing the payment personally, which defines APP fraud.' },
        { id: '2', label: 'A compromised executive mailbox is used to instruct finance to wire funds to a fraudster account.', bucket: 'bec', why: 'A hijacked internal email redirecting a payment is business email compromise.' },
        { id: '3', label: 'A promoter promises guaranteed high monthly returns and pressures rapid deposits with no real underlying asset.', bucket: 'investment', why: 'Guaranteed returns with no genuine asset and deposit pressure mark an investment scam.' },
        { id: '4', label: 'A criminal opens accounts using stolen personal details to impersonate a real individual.', bucket: 'identity', why: 'Using the stolen identity details of a real person to open accounts is identity fraud.' }
      ]
    }
  },
  {
    id: 'm11-fraud-framl',
    conceptTags: ['framl_convergence', 'fraud_as_predicate'],
    mechanic: 'decision',
    title: 'After the scam',
    spec: {
      kind: 'decision',
      prompt: 'A fraud team confirms a customer was the victim of an APP scam and reimburses them. From a FRAML perspective, what should happen next?',
      options: [
        { id: 'a', text: 'Refer the receiving mule account to AML for investigation and a suspicious activity report.', correct: true, why: 'Fraud proceeds are a money laundering predicate, so the account that received them warrants AML review and reporting.' },
        { id: 'b', text: 'Close the matter once the victim is reimbursed, because the financial loss has now been resolved internally.', correct: false, why: 'Reimbursing the victim does not address the laundering of the diverted funds still in the system.' },
        { id: 'c', text: 'Refer only the victim account for review, since they were the party that initiated the disputed payment.', correct: false, why: 'The victim account is not where the criminal proceeds landed, so this misdirects the investigation.' },
        { id: 'd', text: 'Hold off involving AML until a regulator or law enforcement specifically requests the incident details.', correct: false, why: 'FRAML convergence means fraud and AML act together at once, not only on external request.' }
      ]
    }
  },
  {
    id: 'm11-abc-facilitation',
    conceptTags: ['facilitation_payments', 'uk_bribery_act', 'fcpa'],
    mechanic: 'decision',
    title: 'The small port payment',
    spec: {
      kind: 'decision',
      prompt: 'A logistics agent proposes a small unofficial cash payment to a port official to release a lawful shipment faster. The company is subject to the UK Bribery Act. What is the correct view?',
      options: [
        { id: 'a', text: 'It is prohibited: the UK Bribery Act has no facilitation-payments exception, so the payment is a bribe.', correct: true, why: 'Unlike the narrow US FCPA facilitation exception, the UK Bribery Act does not exempt such payments.' },
        { id: 'b', text: 'It is acceptable, because the shipment is entirely lawful and the payment merely speeds an ordinary routine step.', correct: false, why: 'A lawful underlying purpose does not make an improper payment to an official lawful under the UK Act.' },
        { id: 'c', text: 'It is acceptable if the sum is recorded openly as an administrative service charge.', correct: false, why: 'Transparent bookkeeping does not convert an improper payment into a legitimate one.' },
        { id: 'd', text: 'It is permitted under a narrow facilitation-payments allowance recognized across all major regimes.', correct: false, why: 'No such universal allowance exists, and the UK Act in particular provides none.' }
      ]
    }
  },
  {
    id: 'm11-abc-match',
    conceptTags: ['fcpa', 'uk_bribery_act', 'facilitation_payments'],
    mechanic: 'match',
    title: 'FCPA or UK Bribery Act',
    spec: {
      kind: 'match',
      prompt: 'Match each item to its correct description.',
      pairs: [
        { id: 'fcpa', left: 'US FCPA', right: 'Permits a narrow facilitation-payments exception for routine governmental action.', why: 'The FCPA carves out small payments for non-discretionary routine acts.' },
        { id: 'uk', left: 'UK Bribery Act', right: 'Provides no facilitation-payments exception and also reaches private commercial bribery.', why: 'The UK Act is broader, with no facilitation carve-out and coverage beyond public officials.' },
        { id: 'adequate', left: 'Adequate procedures', right: 'A defence for a firm that maintained proportionate anti-bribery controls.', why: 'Demonstrating proportionate prevention procedures is a recognized UK defence.' },
        { id: 'common', left: 'Common ground', right: 'Both regimes reach conduct by the company and its third-party intermediaries abroad.', why: 'Liability under both can flow through agents acting for the firm.' }
      ]
    }
  },
  {
    id: 'm11-abc-thirdparty',
    conceptTags: ['bribery_corruption', 'kleptocracy_pep_link'],
    mechanic: 'red-flags',
    title: 'The consultant engagement',
    spec: {
      kind: 'red-flags',
      scenario: 'A firm is onboarding a consultant to help win a public contract in a higher-risk market.',
      prompt: 'Which features signal bribery and corruption risk in this third-party relationship?',
      items: [
        { id: 'a', label: 'The consultant requests a large success fee far above market rate, paid to an offshore account.', flag: true, why: 'An inflated, offshore success fee is a common channel for funnelling a bribe.' },
        { id: 'b', label: 'The consultant is closely connected to the official who will award the contract.', flag: true, why: 'A connection to the awarding official points to corruption and a PEP link.' },
        { id: 'c', label: 'The consultant provides a clear written scope, verifiable past work, and standard invoicing.', flag: false, why: 'Transparent scope and a verifiable track record reduce, rather than raise, concern.' },
        { id: 'd', label: 'The consultant declines to confirm beneficial ownership or how the fee will be applied.', flag: true, why: 'Refusing to disclose ownership and use of funds defeats the controls that detect bribery.' },
        { id: 'e', label: 'The engagement is documented in a contract with anti-bribery representations and audit rights.', flag: false, why: 'Contractual anti-bribery terms and audit rights are mitigating controls, not red flags.' }
      ]
    }
  },
  {
    id: 'm11-tax-sort',
    conceptTags: ['tax_evasion', 'tax_as_predicate'],
    mechanic: 'sort',
    title: 'Evasion or avoidance',
    spec: {
      kind: 'sort',
      prompt: 'Sort each as unlawful tax evasion or lawful tax avoidance.',
      buckets: [
        { id: 'evasion', label: 'Tax evasion' },
        { id: 'avoidance', label: 'Lawful avoidance' }
      ],
      items: [
        { id: '1', label: 'Concealing trading income in an undisclosed account held under a nominee name.', bucket: 'evasion', why: 'Hiding taxable income behind a nominee is illegal concealment, which is evasion.' },
        { id: '2', label: 'Deferring tax by contributing to a retirement vehicle the statute expressly permits.', bucket: 'avoidance', why: 'Using a relief the law provides is lawful avoidance, not a crime.' },
        { id: '3', label: 'Issuing false invoices to a related entity to understate reported profit.', bucket: 'evasion', why: 'Falsifying records to reduce tax owed is evasion.' },
        { id: '4', label: 'Claiming a capital allowance that the tax code clearly provides for the asset.', bucket: 'avoidance', why: 'A statutory allowance applied as intended is lawful.' },
        { id: '5', label: 'Underreporting cash takings and keeping a second set of records.', bucket: 'evasion', why: 'Suppressing income with a hidden ledger is deliberate evasion.' }
      ]
    }
  },
  {
    id: 'm11-tax-match',
    conceptTags: ['crs_fatca', 'aml_tax_nexus'],
    mechanic: 'match',
    title: 'CRS, FATCA, or the nexus',
    spec: {
      kind: 'match',
      prompt: 'Match each regime or concept to its description.',
      pairs: [
        { id: 'fatca', left: 'FATCA', right: 'A US regime targeting US persons and US-reportable accounts, enforced through withholding.', why: 'FATCA is the US-specific reporting regime backed by a withholding penalty.' },
        { id: 'crs', left: 'CRS', right: 'A multilateral exchange based on tax residence and controlling persons that the US does not join.', why: 'CRS is the global standard built on tax residence, and the US operates FATCA instead.' },
        { id: 'nexus', left: 'Tax-AML nexus', right: 'Evaded tax treated as a predicate offence, making the proceeds criminal property.', why: 'Because evasion is a predicate, the unpaid amounts become launderable criminal property.' }
      ]
    }
  },
  {
    id: 'm11-tax-offshore',
    conceptTags: ['offshore_structuring', 'tax_evasion', 'aml_tax_nexus'],
    mechanic: 'red-flags',
    title: 'The offshore chain',
    spec: {
      kind: 'red-flags',
      scenario: 'A private banking client routes income through a chain of offshore companies.',
      prompt: 'Which features suggest offshore structuring aimed at tax evasion and concealment?',
      items: [
        { id: 'a', label: 'Layered shell companies in secrecy jurisdictions with nominee directors and no genuine business activity.', flag: true, why: 'Empty layered entities behind nominees are built to obscure ownership and hide taxable income.' },
        { id: 'b', label: 'The client declares the offshore income to the relevant tax authority and provides the filings.', flag: false, why: 'Voluntary declaration and supporting filings indicate transparency, not evasion.' },
        { id: 'c', label: 'Funds are moved shortly before reporting deadlines to obscure the beneficial owner.', flag: true, why: 'Timing transfers to defeat reporting is a deliberate concealment tactic.' },
        { id: 'd', label: 'The structure has a documented commercial rationale and audited accounts.', flag: false, why: 'A genuine business reason supported by audited accounts reduces suspicion.' },
        { id: 'e', label: 'The client refuses to identify the ultimate beneficial owner behind the top company.', flag: true, why: 'Refusing to reveal the ultimate owner blocks the checks that detect tax-driven concealment.' }
      ]
    }
  },
  {
    id: 'm11-sector-insurance',
    conceptTags: ['insurance_ml_risk', 'sector_red_flags'],
    mechanic: 'red-flags',
    title: 'The single-premium policy',
    spec: {
      kind: 'red-flags',
      scenario: 'A customer buys a large single-premium life insurance policy.',
      prompt: 'Which features are money laundering red flags for a life insurance product?',
      items: [
        { id: 'a', label: 'The policy is funded with one large premium and surrendered early despite the penalty.', flag: true, why: 'Early surrender at a loss suggests the goal is moving funds, not insurance cover.' },
        { id: 'b', label: 'The customer is indifferent to performance but keen on how quickly funds can be withdrawn.', flag: true, why: 'Focus on speed of access over returns points to laundering rather than protection.' },
        { id: 'c', label: 'Premiums are paid by regular affordable instalments aligned with the stated income of the customer.', flag: false, why: 'Affordable instalments consistent with declared income fit a normal protection need.' },
        { id: 'd', label: 'A third party with no clear connection pays the premium on behalf of the policyholder.', flag: true, why: 'An unexplained third-party payer can signal funds being placed through the policy.' },
        { id: 'e', label: 'The beneficiary and term match an ordinary family protection arrangement.', flag: false, why: 'A conventional beneficiary and term are consistent with a genuine policy.' }
      ]
    }
  },
  {
    id: 'm11-sector-sort',
    conceptTags: ['casino_gaming_risk', 'msb_psp_risk', 'insurance_ml_risk', 'accountants_gatekeepers'],
    mechanic: 'sort',
    title: 'Indicator to sector',
    spec: {
      kind: 'sort',
      prompt: 'Match each indicator to the sector where it most typically arises.',
      buckets: [
        { id: 'casino', label: 'Casinos and gaming' },
        { id: 'msb', label: 'MSBs and PSPs' },
        { id: 'insurance', label: 'Life insurance' },
        { id: 'accountancy', label: 'Accountancy profession' }
      ],
      items: [
        { id: '1', label: 'A patron buys chips with cash, plays minimally, then cashes out asking for a house cheque.', bucket: 'casino', why: 'Minimal-play cash-out for a cheque is the classic chip-washing pattern in gaming.' },
        { id: '2', label: 'A customer sends many rapid transfers through agents in amounts just under reporting thresholds.', bucket: 'msb', why: 'Speed, an agent network, and threshold avoidance are the core MSB and PSP risks.' },
        { id: '3', label: 'Early surrender of a single-premium policy with no concern for the loss of value.', bucket: 'insurance', why: 'Accepting a surrender penalty to access funds is a life insurance indicator.' },
        { id: '4', label: 'A professional is asked to form complex structures and hold client funds with little commercial logic.', bucket: 'accountancy', why: 'Misusing gatekeeper services to create opaque structures is an accountancy-sector risk.' }
      ]
    }
  },
  {
    id: 'm11-sector-classify',
    conceptTags: ['sector_red_flags', 'msb_psp_risk', 'accountants_gatekeepers'],
    mechanic: 'risk-classify',
    title: 'Rate the inherent risk',
    spec: {
      kind: 'risk-classify',
      prompt: 'Classify the inherent money laundering risk each customer profile presents.',
      items: [
        { id: 'a', label: 'A salaried individual opening a basic savings account with verified local employment income.', tier: 'low', why: 'A simple product with verified, consistent income presents limited laundering exposure.' },
        { id: 'b', label: 'A small accountancy practice that occasionally forms standard companies for local clients with documented purpose.', tier: 'medium', why: 'Gatekeeper services carry real risk, but routine, documented work keeps it moderate.' },
        { id: 'c', label: 'An unregistered remitter moving high volumes of cash across borders through informal agents.', tier: 'high', why: 'Unregistered status, cash, cross-border speed, and informal agents combine into high risk.' }
      ]
    }
  }
]
