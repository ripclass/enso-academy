-- ============================================================================
-- DEV SEED: CDCS development course with three placeholder lessons
-- This is test data for the lesson player. NOT production content.
-- Real Opus-generated content arrives in a future prompt.
-- ============================================================================

-- The course
INSERT INTO courses (
  slug, name, short_name, description, tier, certifying_body,
  real_exam_format, price_usd_cents, status, estimated_study_hours,
  signoff_threshold, metadata
) VALUES (
  'cdcs',
  'Certified Documentary Credit Specialist',
  'CDCS',
  'Master documentary credits, UCP 600, and trade finance compliance. Built for trade finance professionals at international banks.',
  'global',
  'LIBF (London Institute of Banking and Finance)',
  '{"question_count": 90, "time_limit_minutes": 180, "format": "case_study_mcq", "interface": "LIBF online testing platform"}'::jsonb,
  19900,
  'draft',
  60,
  '{"average_score_min": 80, "individual_min": 70, "domain_min": 65}'::jsonb,
  '{"is_dev_seed": true, "notes": "Placeholder content; production content via Opus generation later"}'::jsonb
);

-- Capture the course ID for downstream inserts
DO $$
DECLARE
  v_course_id UUID;
  v_module_id UUID;
  v_lesson1_id UUID;
  v_lesson2_id UUID;
  v_lesson3_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'cdcs';

  -- Single module
  INSERT INTO modules (
    course_id, slug, name, description, sort_order, estimated_minutes,
    learning_objectives, metadata
  ) VALUES (
    v_course_id,
    'foundations',
    'Foundations of Documentary Credits',
    'The fundamental mechanics, parties, and regulatory framework of letters of credit.',
    1,
    45,
    '["Understand the parties to a documentary credit", "Identify the four key UCP 600 articles governing LC issuance", "Distinguish between commercial and standby LCs"]'::jsonb,
    '{"is_dev_seed": true}'::jsonb
  ) RETURNING id INTO v_module_id;

  -- Lesson 1
  INSERT INTO lessons (
    module_id, slug, name, description, sort_order, estimated_minutes,
    learning_objectives, concept_tags, metadata
  ) VALUES (
    v_module_id,
    'parties-to-a-credit',
    'The Parties to a Documentary Credit',
    'Who are the applicant, beneficiary, issuing bank, advising bank, and nominated bank — and what does each actually do?',
    1,
    15,
    '["Identify all parties to a documentary credit transaction", "Explain the role and obligations of each party", "Distinguish nominated banks from advising banks"]'::jsonb,
    ARRAY['documentary_credits', 'parties_to_credit', 'ucp_600_basics', 'applicant', 'beneficiary', 'issuing_bank', 'advising_bank', 'nominated_bank'],
    '{"is_dev_seed": true}'::jsonb
  ) RETURNING id INTO v_lesson1_id;

  -- Lesson 1 content elements
  INSERT INTO content_library_elements (lesson_id, module_id, course_id, element_type, title, body, body_format, estimated_seconds, concept_tags, teaches_concepts, difficulty, metadata) VALUES
  (v_lesson1_id, v_module_id, v_course_id, 'explanation',
   'Introduction: Why parties matter',
   'A documentary credit is a payment mechanism in international trade. To understand how it works, you need to understand who the players are and what each one is contractually obligated to do. Under UCP 600 — the rulebook published by the International Chamber of Commerce that governs almost every commercial letter of credit issued worldwide — there are five primary parties to a typical transaction.

   Each party has a defined role. Each has rights and obligations. And critically, each is independent of the underlying commercial contract between the buyer and seller. This independence principle is one of the core ideas in documentary credit law, and it''s the reason banks can pay against documents without ever inspecting the underlying goods. We''ll come back to this principle in later lessons.',
   'markdown', 60,
   ARRAY['documentary_credits', 'parties_to_credit', 'ucp_600_basics'],
   ARRAY['independence_principle', 'parties_overview'],
   'foundational',
   '{"order": 1}'::jsonb),

  (v_lesson1_id, v_module_id, v_course_id, 'explanation',
   'The Applicant',
   'The applicant is the buyer. They are the party who instructs their bank to issue the credit. The applicant has a contractual relationship with their bank (the issuing bank) — they reimburse the bank for any payment made under the credit, and they agree to pay fees for the issuance.

   A critical point that trips up junior compliance officers: the applicant is NOT a party to the credit itself. They are a party to the application for the credit and to the reimbursement agreement with their bank, but the credit itself is an undertaking from the issuing bank to the beneficiary. The applicant cannot sue the issuing bank for paying against compliant documents, even if the applicant believes the underlying goods are defective. That dispute is between the applicant and the beneficiary, under their commercial contract, not under the credit.',
   'markdown', 75,
   ARRAY['parties_to_credit', 'applicant', 'independence_principle'],
   ARRAY['applicant_role', 'applicant_obligations'],
   'foundational',
   '{"order": 2}'::jsonb),

  (v_lesson1_id, v_module_id, v_course_id, 'explanation',
   'The Beneficiary',
   'The beneficiary is the seller — the party in whose favour the credit is issued and who will be paid if they present compliant documents. The beneficiary has the right (but not the obligation) to draw on the credit. If they choose not to ship, or if they fail to produce compliant documents, the credit simply expires unused.

   The beneficiary''s relationship is with the issuing bank, not directly with the applicant. This is the practical expression of the independence principle: the beneficiary is paid by the bank, not by the buyer.',
   'markdown', 50,
   ARRAY['parties_to_credit', 'beneficiary', 'independence_principle'],
   ARRAY['beneficiary_role', 'beneficiary_rights'],
   'foundational',
   '{"order": 3}'::jsonb),

  (v_lesson1_id, v_module_id, v_course_id, 'explanation',
   'The Issuing Bank',
   'The issuing bank is the bank that issues the credit at the applicant''s request. Under UCP 600 Article 7, the issuing bank assumes a definite undertaking to honour a complying presentation. This is the bank''s own obligation — not a guarantee, not a contingent liability, but a direct undertaking.

   This distinction matters under sanctions, AML, and regulatory frameworks. The issuing bank''s payment obligation is its own commercial decision and carries its own compliance risk. The issuing bank cannot decline payment merely because the applicant has gone bankrupt or asked the bank not to pay. If the documents comply, the bank pays — that''s the bargain that makes documentary credits useful in international trade.',
   'markdown', 70,
   ARRAY['parties_to_credit', 'issuing_bank', 'ucp_600_article_7'],
   ARRAY['issuing_bank_role', 'definite_undertaking', 'article_7'],
   'standard',
   '{"order": 4}'::jsonb),

  (v_lesson1_id, v_module_id, v_course_id, 'explanation',
   'The Advising Bank and the Nominated Bank',
   'Two roles that are often confused but legally distinct.

   The advising bank is the bank that delivers the credit to the beneficiary. Its role is essentially administrative — it authenticates that the credit is genuine and forwards it to the beneficiary. The advising bank takes on no payment obligation under the credit by acting as advising bank alone.

   The nominated bank is a different role. A nominated bank has been authorized by the issuing bank to honour or negotiate the credit. The nominated bank MAY decide to act on that nomination — paying the beneficiary against compliant documents and then claiming reimbursement from the issuing bank — but it is not obligated to do so unless it has confirmed the credit. The distinction between nomination and confirmation is one of the most commonly tested concepts on the CDCS exam.

   In practice, a single bank can be both the advising bank and the nominated bank under the same credit. The roles are functional, not exclusive.',
   'markdown', 90,
   ARRAY['parties_to_credit', 'advising_bank', 'nominated_bank', 'confirmation'],
   ARRAY['advising_bank_role', 'nominated_bank_role', 'nomination_vs_confirmation'],
   'standard',
   '{"order": 5}'::jsonb),

  (v_lesson1_id, v_module_id, v_course_id, 'case_study',
   'Worked example: A typical sight credit',
   'Consider a transaction: a German importer (the applicant) buys industrial machinery from a Korean exporter (the beneficiary). The German importer asks their German bank to issue a sight letter of credit for EUR 2 million in favour of the Korean exporter, available at the counters of the Korean exporter''s Seoul-based bank.

   In this transaction:
   - The German importer is the applicant
   - The Korean exporter is the beneficiary
   - The German bank is the issuing bank
   - The Korean bank, when it receives the credit from the German bank, can act as both advising bank (it delivers the credit to the exporter) and nominated bank (it is authorized to pay the exporter at sight against compliant documents)
   - If the Korean bank adds its own confirmation, it becomes the confirming bank, with its own definite undertaking to the beneficiary

   Note what is NOT here: there is no direct contractual link between the German importer and the Korean exporter in the credit transaction. Their commercial contract for the sale of the machinery is separate and independent.',
   'markdown', 90,
   ARRAY['parties_to_credit', 'documentary_credits', 'case_studies'],
   ARRAY['transaction_mechanics', 'party_identification'],
   'standard',
   '{"order": 6}'::jsonb);

  -- Lesson 2
  INSERT INTO lessons (
    module_id, slug, name, description, sort_order, estimated_minutes,
    learning_objectives, concept_tags, metadata
  ) VALUES (
    v_module_id,
    'ucp-600-essentials',
    'UCP 600 Essentials',
    'The Uniform Customs and Practice for Documentary Credits, 2007 revision. The articles every CDCS candidate must know cold.',
    2,
    18,
    '["Identify the structure and authority of UCP 600", "Explain the key articles governing issuance, examination, and payment", "Apply the principle of strict compliance"]'::jsonb,
    ARRAY['ucp_600', 'icc_publications', 'strict_compliance', 'article_14', 'article_16'],
    '{"is_dev_seed": true}'::jsonb
  ) RETURNING id INTO v_lesson2_id;

  INSERT INTO content_library_elements (lesson_id, module_id, course_id, element_type, title, body, body_format, estimated_seconds, concept_tags, teaches_concepts, difficulty, metadata) VALUES
  (v_lesson2_id, v_module_id, v_course_id, 'explanation',
   'What UCP 600 is, and what it isn''t',
   'The Uniform Customs and Practice for Documentary Credits, current revision UCP 600 (2007), is a set of rules published by the International Chamber of Commerce. It governs documentary credits worldwide by incorporation — that is, parties agree that UCP 600 applies by referencing it in the credit text.

   UCP 600 is not a statute. No legislature enacted it. It is a private rulebook that banks and importers and exporters have collectively agreed to use. Its authority comes from incorporation by reference in the credit itself, which is then enforceable as a matter of contract law in whichever jurisdiction governs the credit.

   This is important for compliance professionals to understand. When a regulator or a court interprets a documentary credit, they apply UCP 600 because the parties chose it, not because they had to. Local statutory law can override UCP 600 if the two conflict — but in practice, courts almost universally defer to UCP 600 unless local law expressly contradicts it.',
   'markdown', 75,
   ARRAY['ucp_600', 'icc_publications', 'sources_of_law'],
   ARRAY['ucp_600_authority', 'incorporation_by_reference'],
   'standard',
   '{"order": 1}'::jsonb),

  (v_lesson2_id, v_module_id, v_course_id, 'explanation',
   'The independence principle (Article 4)',
   'Article 4 of UCP 600 is the rule that makes documentary credits work as a payment mechanism. It states that a credit is by its nature a separate transaction from the sale or other contract on which it may be based.

   What this means in practice: the bank is concerned only with documents, not with goods, services, or performance to which the documents may relate. If the documents conform to the credit, the bank pays. The bank does not, and must not, inspect whether the underlying goods have actually been shipped, whether they are of the contracted quality, or whether the seller has otherwise performed.

   This is why fraud is one of the few exceptions to the independence principle. If the issuing bank has clear evidence of fraud by the beneficiary, courts in most jurisdictions will allow the bank to refuse payment — but the bar is very high. Mere allegations of breach of contract are not enough. The fraud must be in the documents themselves or in the underlying transaction, and the evidence must be clear.',
   'markdown', 80,
   ARRAY['ucp_600', 'independence_principle', 'article_4', 'fraud_exception'],
   ARRAY['independence_principle_detailed', 'fraud_exception', 'article_4'],
   'standard',
   '{"order": 2}'::jsonb),

  (v_lesson2_id, v_module_id, v_course_id, 'explanation',
   'Strict compliance and Article 14',
   'Article 14 governs the examination of documents. The standard is strict compliance: documents must comply with the terms and conditions of the credit, and any discrepancy gives the bank grounds to refuse payment.

   The phrase "on their face" appears repeatedly in Article 14. This is the bank''s test. The bank looks at the documents on their face — that is, as they appear to be — and determines whether they comply with the credit. The bank does not investigate beyond the face of the documents. If a bill of lading on its face appears to be signed by the carrier, the bank treats it as such. The bank is not required to verify the carrier''s authenticity or the validity of the signature.

   Article 14 also gives the bank a maximum of five banking days following the day of presentation to determine compliance. This is one of the most heavily litigated provisions in trade finance, because the five-day clock starts on the day of presentation and bank-internal delays do not extend it.',
   'markdown', 85,
   ARRAY['ucp_600', 'article_14', 'strict_compliance', 'examination_period'],
   ARRAY['article_14', 'strict_compliance', 'five_banking_days'],
   'standard',
   '{"order": 3}'::jsonb),

  (v_lesson2_id, v_module_id, v_course_id, 'explanation',
   'Discrepancies and Article 16',
   'If the bank determines that the presentation is not compliant, Article 16 governs what happens next.

   The bank must send a single notice to the presenter stating that it is refusing to honour or negotiate, and the notice must list each discrepancy in respect of which the bank refuses. Critically, all discrepancies must be raised in this single notice. The bank cannot raise some discrepancies, then come back later and raise more. This is called the "preclusion" rule and it is strict.

   The notice must be sent by telecommunication or, if not possible, by other expeditious means, no later than the close of the fifth banking day following the day of presentation. If the bank fails to send the notice within five banking days, or if the bank later raises additional discrepancies not included in the original notice, the bank is precluded from claiming that the documents do not constitute a complying presentation. In other words: the bank must pay, even if the documents were in fact discrepant.

   The CDCS exam tests Article 16 heavily because it is the article that determines bank liability when something goes wrong.',
   'markdown', 90,
   ARRAY['ucp_600', 'article_16', 'discrepancies', 'preclusion'],
   ARRAY['article_16', 'discrepancy_notice', 'preclusion_rule'],
   'advanced',
   '{"order": 4}'::jsonb),

  (v_lesson2_id, v_module_id, v_course_id, 'case_study',
   'Worked example: The five-day clock',
   'A bank receives documents on Tuesday. Tuesday and Friday are banking days; Wednesday is a local holiday. The bank''s examination department is short-staffed that week and completes its review on the following Tuesday — six banking days after presentation.

   What is the consequence under Article 16?

   The bank has exceeded the five-banking-day examination period. Under the preclusion rule, the bank is now obligated to honour the presentation regardless of whether the documents were in fact compliant. The bank cannot raise discrepancies. The bank must pay.

   This is one of the most expensive mistakes in trade finance. Banks have paid millions on technically discrepant presentations because their examination departments missed the five-day deadline. A common reason for the failure: confusing calendar days with banking days, or failing to track local holidays in the bank''s jurisdiction.',
   'markdown', 95,
   ARRAY['article_16', 'examination_period', 'case_studies', 'preclusion'],
   ARRAY['five_day_clock_application', 'preclusion_consequences'],
   'advanced',
   '{"order": 5}'::jsonb),

  (v_lesson2_id, v_module_id, v_course_id, 'reflection_prompt',
   'Reflection: Why is the bar for fraud so high?',
   'The fraud exception to the independence principle is narrow by design. Banks are not investigators. They cannot afford to second-guess every transaction. If banks could refuse payment whenever a buyer alleged fraud, the documentary credit as a payment mechanism would collapse — sellers could never rely on being paid.

   The CDCS exam may test this conceptually. Be ready to explain: what is the policy rationale for a narrow fraud exception, and what evidence is typically required for a court to enjoin payment on fraud grounds?

   Take a moment to think about this before continuing.',
   'markdown', 30,
   ARRAY['fraud_exception', 'independence_principle', 'policy_reasoning'],
   ARRAY['fraud_exception_policy'],
   'advanced',
   '{"order": 6}'::jsonb);

  -- Lesson 3
  INSERT INTO lessons (
    module_id, slug, name, description, sort_order, estimated_minutes,
    learning_objectives, concept_tags, metadata
  ) VALUES (
    v_module_id,
    'standby-vs-commercial',
    'Standby vs. Commercial Credits',
    'The two major types of letters of credit, their differences in purpose, mechanics, and applicable rules.',
    3,
    12,
    '["Distinguish commercial from standby letters of credit", "Identify when ISP98 applies versus UCP 600", "Apply each type to common trade and financial scenarios"]'::jsonb,
    ARRAY['standby_lc', 'commercial_lc', 'isp98', 'guarantees', 'lc_types'],
    '{"is_dev_seed": true}'::jsonb
  ) RETURNING id INTO v_lesson3_id;

  INSERT INTO content_library_elements (lesson_id, module_id, course_id, element_type, title, body, body_format, estimated_seconds, concept_tags, teaches_concepts, difficulty, metadata) VALUES
  (v_lesson3_id, v_module_id, v_course_id, 'explanation',
   'Two purposes, two instruments',
   'A commercial letter of credit is a payment mechanism. It is designed to be drawn. The buyer wants the seller to be paid against shipment of goods; the seller wants assurance of payment before shipping. The commercial LC bridges that gap, and in normal course it is presented against compliant documents and the bank pays.

   A standby letter of credit is a guarantee. It is designed to NOT be drawn. The standby sits in the background as security for a primary obligation — a construction contract, a financial obligation, an indemnity. The beneficiary only calls on the standby if the underlying obligation has failed. If everything goes well, the standby expires unused.

   Both are letters of credit. Both create a definite undertaking by the issuing bank to honour a complying presentation. But the commercial expectation is opposite: one is meant to be paid; the other is meant to silently expire.',
   'markdown', 75,
   ARRAY['standby_lc', 'commercial_lc', 'lc_types'],
   ARRAY['commercial_vs_standby_purpose'],
   'foundational',
   '{"order": 1}'::jsonb),

  (v_lesson3_id, v_module_id, v_course_id, 'explanation',
   'Which rules apply: UCP 600 or ISP98?',
   'Commercial credits are almost universally governed by UCP 600. The parties to commercial trade transactions expect UCP 600 to apply, banks issue under UCP 600 by default, and the rulebook is designed for the document-against-payment workflow that commercial LCs use.

   Standby credits CAN be issued under UCP 600. They often are. But there is a second rulebook, ISP98 (International Standby Practices, also published by the ICC), specifically designed for standby letters of credit. ISP98 reflects how standbys actually work in practice — for example, ISP98 has clearer rules for partial drawings, longer examination periods, and electronic presentations.

   In the CDCS exam: if a question describes a standby credit, look at the credit text. If it says "subject to UCP 600," UCP 600 applies. If it says "subject to ISP98," ISP98 applies. If both, then both apply, and where they conflict, the more specific provision controls — generally ISP98 for standby-specific matters.',
   'markdown', 80,
   ARRAY['ucp_600', 'isp98', 'standby_lc', 'governing_rules'],
   ARRAY['ucp_vs_isp98', 'rule_selection'],
   'standard',
   '{"order": 2}'::jsonb),

  (v_lesson3_id, v_module_id, v_course_id, 'explanation',
   'Standbys vs. demand guarantees',
   'A demand guarantee is a different instrument — an undertaking by a bank or other guarantor to pay on demand, typically governed by the ICC''s Uniform Rules for Demand Guarantees (URDG 758). Demand guarantees are common in European and Middle Eastern markets; standbys are more common in the US.

   The two instruments overlap in function (both stand behind a primary obligation), but they differ in rules and in some legal characteristics. A standby is a true letter of credit, with an issuing bank''s definite undertaking; URDG demand guarantees are also independent undertakings but are governed by URDG 758, which has different mechanics around presentation and dispute.

   For CDCS purposes: know that demand guarantees exist, know that they are NOT letters of credit under UCP 600, and know that URDG 758 governs them when invoked. You will not be tested in deep detail on URDG, but you should be able to distinguish.',
   'markdown', 70,
   ARRAY['standby_lc', 'demand_guarantees', 'urdg_758'],
   ARRAY['standby_vs_demand_guarantee', 'urdg_basics'],
   'standard',
   '{"order": 3}'::jsonb),

  (v_lesson3_id, v_module_id, v_course_id, 'case_study',
   'Worked example: A construction performance standby',
   'A US construction company is awarded a $50 million contract by a Saudi Arabian government entity to build a stadium. The contract requires the construction company to post a 10% performance security — $5 million — that the Saudi entity can call on if the construction company fails to perform.

   The construction company asks its US bank to issue a $5 million standby letter of credit in favour of the Saudi entity, subject to ISP98. The standby is valid for two years.

   For two years, the standby sits in the bank''s books. The construction company performs the contract. The stadium is completed. The standby expires unused. The construction company pays issuance and standby fees, but never pays out on the standby itself.

   Compare this to the alternative: a $5 million cash performance bond. The construction company would have had to deposit $5 million in cash with the Saudi entity for two years. The standby preserves the construction company''s working capital — they only post collateral with their bank, not the full $5 million in cash.

   This is the standby''s primary commercial purpose: working capital efficiency for the applicant, with payment assurance for the beneficiary.',
   'markdown', 100,
   ARRAY['standby_lc', 'isp98', 'case_studies', 'working_capital'],
   ARRAY['standby_commercial_purpose', 'performance_standby'],
   'advanced',
   '{"order": 4}'::jsonb);

END $$;

-- Sanity check: confirm seed succeeded
DO $$
DECLARE
  v_course_count INTEGER;
  v_lesson_count INTEGER;
  v_element_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_course_count FROM courses WHERE slug = 'cdcs';
  SELECT COUNT(*) INTO v_lesson_count FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'cdcs'));
  SELECT COUNT(*) INTO v_element_count FROM content_library_elements WHERE course_id = (SELECT id FROM courses WHERE slug = 'cdcs');

  IF v_course_count <> 1 THEN RAISE EXCEPTION 'Expected 1 course, got %', v_course_count; END IF;
  IF v_lesson_count <> 3 THEN RAISE EXCEPTION 'Expected 3 lessons, got %', v_lesson_count; END IF;
  IF v_element_count < 15 THEN RAISE EXCEPTION 'Expected 15+ content elements, got %', v_element_count; END IF;
END $$;
