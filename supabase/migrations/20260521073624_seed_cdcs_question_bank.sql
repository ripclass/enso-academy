-- ============================================================================
-- DEV SEED: CDCS question bank — 32 hand-drafted MCQ questions, 4 domains.
-- Placeholder content for the mock exam engine. NOT production content;
-- Opus generation will augment/replace these later.
-- Domains: parties_to_credit (8), ucp_600_articles (14),
--          standby_vs_commercial (5), trade_finance_compliance (5).
-- correct_answer stores the full option text as a JSON string.
-- wrong_answer_rationales maps each wrong option text -> reason.
-- Dollar-quoting ($q$...$q$) is used so apostrophes need no escaping.
-- ============================================================================

DO $do$
DECLARE
  v_course_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'cdcs';
  IF v_course_id IS NULL THEN RAISE EXCEPTION 'CDCS course not found'; END IF;

  INSERT INTO question_bank (
    course_id, question_type, question_text, options, correct_answer,
    explanation, wrong_answer_rationales, concept_tags, difficulty,
    domain, estimated_seconds, eligible_for_mock, eligible_for_quiz, metadata
  ) VALUES

  -- ---- domain: parties_to_credit (8) ----------------------------------------
  (v_course_id, 'single_choice',
   $q$In a documentary credit, which party instructs its bank to issue the credit and undertakes to reimburse the bank for any payment made?$q$,
   $q$["The beneficiary", "The applicant", "The advising bank", "The nominated bank"]$q$::jsonb,
   $q$"The applicant"$q$::jsonb,
   $q$The applicant is the buyer — the party on whose request the credit is issued. The applicant has a reimbursement agreement with the issuing bank but is not itself a party to the credit.$q$,
   $q${"The beneficiary": "The beneficiary is the seller, in whose favour the credit is issued.", "The advising bank": "The advising bank only authenticates and forwards the credit.", "The nominated bank": "A nominated bank is authorised to honour or negotiate, not to instruct issuance."}$q$::jsonb,
   ARRAY['parties_to_credit','applicant'], 'foundational', 'parties_to_credit', 60, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Which party is entitled to be paid under a documentary credit upon presenting complying documents?$q$,
   $q$["The applicant", "The issuing bank", "The beneficiary", "The advising bank"]$q$::jsonb,
   $q$"The beneficiary"$q$::jsonb,
   $q$The beneficiary — the seller — is the party in whose favour the credit is issued and who is paid against a complying presentation.$q$,
   $q${"The applicant": "The applicant is the buyer, who reimburses the bank, not the party paid under the credit.", "The issuing bank": "The issuing bank pays the beneficiary; it is not itself paid under the credit.", "The advising bank": "The advising bank takes on no payment entitlement merely by advising."}$q$::jsonb,
   ARRAY['parties_to_credit','beneficiary'], 'foundational', 'parties_to_credit', 60, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A bank receives a credit from the issuing bank and forwards it to the seller after checking its apparent authenticity, but takes on no obligation to pay. What is this bank's role?$q$,
   $q$["Confirming bank", "Advising bank", "Issuing bank", "Reimbursing bank"]$q$::jsonb,
   $q$"Advising bank"$q$::jsonb,
   $q$An advising bank authenticates and forwards the credit to the beneficiary. Advising alone creates no undertaking to honour or negotiate.$q$,
   $q${"Confirming bank": "A confirming bank adds its own definite undertaking to honour.", "Issuing bank": "The issuing bank issues the credit at the applicant's request.", "Reimbursing bank": "A reimbursing bank settles claims between banks; it does not advise the credit to the beneficiary."}$q$::jsonb,
   ARRAY['parties_to_credit','advising_bank'], 'standard', 'parties_to_credit', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600, a nominated bank that has not confirmed the credit is:$q$,
   $q$["Obliged to honour a complying presentation", "Authorised but not obliged to honour or negotiate", "Prohibited from paying the beneficiary", "Liable to the applicant for any payment"]$q$::jsonb,
   $q$"Authorised but not obliged to honour or negotiate"$q$::jsonb,
   $q$Nomination is an authorisation, not an obligation. A nominated bank may act on its nomination, but unless it has confirmed the credit it is under no duty to honour or negotiate.$q$,
   $q${"Obliged to honour a complying presentation": "Only the issuing bank and any confirming bank are obliged to honour; a bare nominated bank is not.", "Prohibited from paying the beneficiary": "It is authorised to pay; it is simply not compelled to.", "Liable to the applicant for any payment": "The nominated bank has no liability relationship to the applicant."}$q$::jsonb,
   ARRAY['parties_to_credit','nominated_bank'], 'standard', 'parties_to_credit', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600 Article 7, the issuing bank's obligation to honour a complying presentation is best described as:$q$,
   $q$["A contingent guarantee triggered by the applicant's default", "A definite undertaking, independent of the applicant's solvency", "A discretionary payment subject to the applicant's approval", "An obligation owed jointly to the applicant and beneficiary"]$q$::jsonb,
   $q$"A definite undertaking, independent of the applicant's solvency"$q$::jsonb,
   $q$Article 7 makes the issuing bank's obligation a definite undertaking to honour. It is the bank's own primary obligation and is not affected by the applicant's bankruptcy or instructions to withhold payment.$q$,
   $q${"A contingent guarantee triggered by the applicant's default": "A credit is a primary undertaking, not a contingent guarantee.", "A discretionary payment subject to the applicant's approval": "The bank must pay against complying documents regardless of the applicant's wishes.", "An obligation owed jointly to the applicant and beneficiary": "The undertaking runs to the beneficiary; the applicant is not a party to the credit."}$q$::jsonb,
   ARRAY['parties_to_credit','issuing_bank','article_7'], 'standard', 'parties_to_credit', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$An applicant believes the goods shipped are defective and asks the issuing bank not to pay the beneficiary, who has presented complying documents. The issuing bank should:$q$,
   $q$["Refuse payment, since the applicant funds the credit", "Honour the presentation; the goods dispute is outside the credit", "Delay payment until the applicant and beneficiary settle", "Pay only 50% pending resolution of the dispute"]$q$::jsonb,
   $q$"Honour the presentation; the goods dispute is outside the credit"$q$::jsonb,
   $q$By the independence principle the bank deals in documents, not goods. If the documents comply, the bank must honour. A defective-goods dispute belongs to the underlying sale contract between applicant and beneficiary.$q$,
   $q${"Refuse payment, since the applicant funds the credit": "Funding the credit does not give the applicant a veto over a complying presentation.", "Delay payment until the applicant and beneficiary settle": "The bank has no right to delay honour of a complying presentation.", "Pay only 50% pending resolution of the dispute": "Partial honour on these grounds has no basis in UCP 600."}$q$::jsonb,
   ARRAY['parties_to_credit','independence_principle'], 'advanced', 'parties_to_credit', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Can a single bank act as both the advising bank and the nominated bank under the same credit?$q$,
   $q$["No — the roles are mutually exclusive under UCP 600", "Yes — the roles are functional and one bank may hold both", "Only if the applicant expressly authorises it", "Only if the bank also confirms the credit"]$q$::jsonb,
   $q$"Yes — the roles are functional and one bank may hold both"$q$::jsonb,
   $q$The roles are defined by function, not exclusivity. The same bank commonly advises the credit to the beneficiary and is also nominated to honour or negotiate it.$q$,
   $q${"No — the roles are mutually exclusive under UCP 600": "UCP 600 does not make the roles exclusive.", "Only if the applicant expressly authorises it": "No applicant authorisation is needed for one bank to hold both functional roles.", "Only if the bank also confirms the credit": "Confirmation is a separate, additional undertaking and is not required to hold both roles."}$q$::jsonb,
   ARRAY['parties_to_credit','advising_bank','nominated_bank'], 'advanced', 'parties_to_credit', 85, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A confirming bank's addition of its confirmation to a credit means it:$q$,
   $q$["Replaces the issuing bank's obligation with its own", "Adds its own definite undertaking to honour, alongside the issuing bank's", "Merely advises the credit with greater care", "Guarantees the applicant's reimbursement to the issuing bank"]$q$::jsonb,
   $q$"Adds its own definite undertaking to honour, alongside the issuing bank's"$q$::jsonb,
   $q$Confirmation adds a second definite undertaking. The beneficiary then has the undertakings of both the issuing bank and the confirming bank for a complying presentation.$q$,
   $q${"Replaces the issuing bank's obligation with its own": "The issuing bank's undertaking remains; the confirming bank's is additional.", "Merely advises the credit with greater care": "Advising and confirming are different; confirmation is a payment undertaking.", "Guarantees the applicant's reimbursement to the issuing bank": "Confirmation runs to the beneficiary, not to the issuing bank's reimbursement."}$q$::jsonb,
   ARRAY['parties_to_credit','confirmation'], 'standard', 'parties_to_credit', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  -- ---- domain: ucp_600_articles (12) ----------------------------------------
  (v_course_id, 'single_choice',
   $q$UCP 600 applies to a documentary credit because:$q$,
   $q$["It is international legislation binding on all banks", "The credit expressly states it is subject to UCP 600", "The ICC enforces it on member banks", "The beneficiary's country has adopted it as law"]$q$::jsonb,
   $q$"The credit expressly states it is subject to UCP 600"$q$::jsonb,
   $q$UCP 600 is a set of ICC rules, not a statute. It governs a credit only because the parties incorporate it by reference in the credit text.$q$,
   $q${"It is international legislation binding on all banks": "UCP 600 is not legislation; no legislature enacted it.", "The ICC enforces it on member banks": "The ICC publishes the rules but does not enforce them as law.", "The beneficiary's country has adopted it as law": "UCP 600 applies by incorporation, not by national adoption."}$q$::jsonb,
   ARRAY['ucp_600','incorporation_by_reference'], 'foundational', 'ucp_600_articles', 60, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$UCP 600 Article 4 states that a credit is, by its nature, a transaction separate from the sale contract. The practical effect is that banks:$q$,
   $q$["Must verify the goods before honouring", "Deal with documents and not with goods or performance", "May refuse payment if the sale contract is breached", "Must obtain the applicant's consent before each payment"]$q$::jsonb,
   $q$"Deal with documents and not with goods or performance"$q$::jsonb,
   $q$Article 4 establishes the independence principle. Banks examine documents only; the existence, quality, or delivery of the goods is not their concern.$q$,
   $q${"Must verify the goods before honouring": "UCP 600 makes clear banks deal in documents, not goods.", "May refuse payment if the sale contract is breached": "A breach of the sale contract does not entitle the bank to refuse a complying presentation.", "Must obtain the applicant's consent before each payment": "The bank honours independently of the applicant once documents comply."}$q$::jsonb,
   ARRAY['ucp_600','article_4','independence_principle'], 'standard', 'ucp_600_articles', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600 Article 14, a bank examines a presentation to determine whether the documents:$q$,
   $q$["Are genuine and legally valid in every respect", "Appear on their face to constitute a complying presentation", "Prove the goods were actually shipped", "Have been certified by a chamber of commerce"]$q$::jsonb,
   $q$"Appear on their face to constitute a complying presentation"$q$::jsonb,
   $q$Article 14(a) sets the "on their face" standard. The bank checks apparent compliance from the face of the documents; it does not investigate genuineness or underlying facts.$q$,
   $q${"Are genuine and legally valid in every respect": "Banks are not required to verify genuineness or legal validity.", "Prove the goods were actually shipped": "The bank examines documents, not the shipment itself.", "Have been certified by a chamber of commerce": "No such certification requirement exists in Article 14."}$q$::jsonb,
   ARRAY['ucp_600','article_14','strict_compliance'], 'standard', 'ucp_600_articles', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600 Article 14(b), the maximum period a nominated bank, confirming bank, or issuing bank has to determine if a presentation complies is:$q$,
   $q$["Five calendar days after presentation", "Five banking days following the day of presentation", "Seven banking days following the day of presentation", "A reasonable time, not exceeding 21 days"]$q$::jsonb,
   $q$"Five banking days following the day of presentation"$q$::jsonb,
   $q$Article 14(b) gives each bank a maximum of five banking days following the day of presentation. The "reasonable time" standard of earlier UCP versions was removed in UCP 600.$q$,
   $q${"Five calendar days after presentation": "The period is counted in banking days, not calendar days.", "Seven banking days following the day of presentation": "The limit is five banking days, not seven.", "A reasonable time, not exceeding 21 days": "The reasonable-time test was replaced by the fixed five-banking-day limit."}$q$::jsonb,
   ARRAY['ucp_600','article_14','examination_period'], 'standard', 'ucp_600_articles', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Documents are presented on a Tuesday. The examining bank's banking days are Monday to Friday, but the immediately following Wednesday is a public holiday. On which day does the five-banking-day examination period under Article 14(b) expire?$q$,
   $q$["The following Monday", "The following Tuesday", "The following Wednesday", "The following Thursday"]$q$::jsonb,
   $q$"The following Wednesday"$q$::jsonb,
   $q$The five banking days are counted following the day of presentation, skipping weekends and the holiday: Thursday (1), Friday (2), Monday (3), Tuesday (4), Wednesday (5). The holiday Wednesday in the first week is not a banking day and is not counted.$q$,
   $q${"The following Monday": "This counts only three banking days; weekends and the holiday must be skipped, extending the count.", "The following Tuesday": "This stops at the fourth banking day; a fifth is still available.", "The following Thursday": "This counts a sixth banking day; the limit is five."}$q$::jsonb,
   ARRAY['ucp_600','article_14','examination_period','banking_days'], 'advanced', 'ucp_600_articles', 95, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$An issuing bank decides a presentation is discrepant. Under UCP 600 Article 16, its notice of refusal must:$q$,
   $q$["List one principal discrepancy and reserve the right to add others", "State each discrepancy for which it refuses, in a single notice", "Be given orally within five banking days", "Be copied to the applicant before being sent to the presenter"]$q$::jsonb,
   $q$"State each discrepancy for which it refuses, in a single notice"$q$::jsonb,
   $q$Article 16(c) requires a single notice stating every discrepancy relied on. The bank cannot raise discrepancies piecemeal across multiple notices.$q$,
   $q${"List one principal discrepancy and reserve the right to add others": "All discrepancies must be in the one notice; none can be reserved for later.", "Be given orally within five banking days": "The notice must be by telecommunication or other expeditious means — a recorded communication, not merely oral.", "Be copied to the applicant before being sent to the presenter": "The refusal notice is given to the presenter; no prior copy to the applicant is required."}$q$::jsonb,
   ARRAY['ucp_600','article_16','discrepancies'], 'advanced', 'ucp_600_articles', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$An issuing bank fails to send its notice of refusal within five banking days. Under UCP 600 Article 16(f), the consequence is that the bank:$q$,
   $q$["May still refuse if the discrepancies are serious", "Is precluded from claiming the documents do not comply, and must honour", "Must refer the matter to ICC arbitration", "May refuse but loses its examination fee"]$q$::jsonb,
   $q$"Is precluded from claiming the documents do not comply, and must honour"$q$::jsonb,
   $q$Article 16(f) is the preclusion rule: a bank that does not act within the five-banking-day limit, or fails to give a conforming notice, is precluded from asserting non-compliance and must honour the presentation.$q$,
   $q${"May still refuse if the discrepancies are serious": "Preclusion applies regardless of how serious the discrepancies are.", "Must refer the matter to ICC arbitration": "There is no automatic arbitration; preclusion simply forces honour.", "May refuse but loses its examination fee": "The consequence is the obligation to honour in full, not a fee penalty."}$q$::jsonb,
   ARRAY['ucp_600','article_16','preclusion'], 'advanced', 'ucp_600_articles', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$The ICC's International Standard Banking Practice (ISBP) publication is best described as:$q$,
   $q$["A binding treaty supplementing UCP 600", "Guidance on how the UCP 600 examination standard is applied in practice", "A replacement for UCP 600 for standby credits", "A national-law override of UCP 600"]$q$::jsonb,
   $q$"Guidance on how the UCP 600 examination standard is applied in practice"$q$::jsonb,
   $q$ISBP does not amend UCP 600. It explains how the document-examination practices implied by UCP 600 are applied, promoting consistent treatment of common document issues.$q$,
   $q${"A binding treaty supplementing UCP 600": "ISBP is ICC practice guidance, not a treaty.", "A replacement for UCP 600 for standby credits": "Standby-specific rules are in ISP98, not ISBP.", "A national-law override of UCP 600": "ISBP has no statutory force and overrides nothing."}$q$::jsonb,
   ARRAY['ucp_600','isbp','strict_compliance'], 'standard', 'ucp_600_articles', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600 Article 14(d), data in a document:$q$,
   $q$["Must be identical to data in the credit and other documents", "Need not be identical, but must not conflict with the credit or other documents", "Is examined only if the applicant requests it", "Is ignored if the document is a transport document"]$q$::jsonb,
   $q$"Need not be identical, but must not conflict with the credit or other documents"$q$::jsonb,
   $q$Article 14(d) requires that data need not be identical, but must not conflict, when read in context with the credit, the document itself, and international standard banking practice.$q$,
   $q${"Must be identical to data in the credit and other documents": "UCP 600 deliberately rejects a mirror-image identity test in favour of a no-conflict test.", "Is examined only if the applicant requests it": "Examination is the bank's duty under the credit, not applicant-triggered.", "Is ignored if the document is a transport document": "Transport documents are examined like other stipulated documents."}$q$::jsonb,
   ARRAY['ucp_600','article_14','data_consistency'], 'standard', 'ucp_600_articles', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$The "fraud exception" to the independence principle generally allows a bank or court to:$q$,
   $q$["Refuse a complying presentation where there is clear evidence of fraud", "Refuse payment whenever the applicant alleges a contract breach", "Re-examine the goods before honouring", "Extend the examination period beyond five banking days"]$q$::jsonb,
   $q$"Refuse a complying presentation where there is clear evidence of fraud"$q$::jsonb,
   $q$Fraud is a narrow, court-recognised exception to independence. The evidentiary bar is high — clear evidence of fraud — and mere allegations of breach are not enough.$q$,
   $q${"Refuse payment whenever the applicant alleges a contract breach": "A contract-breach allegation is not fraud and does not justify refusal.", "Re-examine the goods before honouring": "Banks never examine goods; the fraud exception does not change that.", "Extend the examination period beyond five banking days": "The fraud exception concerns honour, not the examination timetable."}$q$::jsonb,
   ARRAY['ucp_600','fraud_exception','independence_principle'], 'foundational', 'ucp_600_articles', 70, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$If a mandatory provision of the governing national law conflicts with a UCP 600 rule incorporated into a credit:$q$,
   $q$["UCP 600 always prevails as the parties' chosen rules", "The mandatory national law prevails over the conflicting UCP 600 rule", "The credit is automatically void", "The ICC decides which prevails"]$q$::jsonb,
   $q$"The mandatory national law prevails over the conflicting UCP 600 rule"$q$::jsonb,
   $q$UCP 600 applies as contractual terms. Where mandatory local law conflicts with those terms, the law overrides; in practice such conflicts are rare and courts otherwise defer to UCP 600.$q$,
   $q${"UCP 600 always prevails as the parties' chosen rules": "Contractual rules cannot override mandatory statutory law.", "The credit is automatically void": "A conflict on one point does not void the whole credit.", "The ICC decides which prevails": "The ICC has no adjudicative authority over national law."}$q$::jsonb,
   ARRAY['ucp_600','governing_law'], 'standard', 'ucp_600_articles', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$When an issuing bank gives a conforming notice of refusal under UCP 600 Article 16, it may, in that notice, state that it:$q$,
   $q$["Will destroy the documents after five days", "Is holding the documents pending the presenter's further instructions", "Has already debited the applicant's account", "Will pay 50% and hold the documents"]$q$::jsonb,
   $q$"Is holding the documents pending the presenter's further instructions"$q$::jsonb,
   $q$Article 16(c) lists the permitted statements about disposition of documents — including that the bank is holding the documents pending further instructions from the presenter.$q$,
   $q${"Will destroy the documents after five days": "Destroying documents is not a permitted disposition statement.", "Has already debited the applicant's account": "A refusal notice means the bank is not honouring; debiting the applicant would contradict it.", "Will pay 50% and hold the documents": "Partial payment is not a permitted Article 16 disposition option."}$q$::jsonb,
   ARRAY['ucp_600','article_16'], 'advanced', 'ucp_600_articles', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A negotiation credit available with a nominated bank means that the nominated bank is authorised to:$q$,
   $q$["Issue a fresh credit to the beneficiary", "Purchase drafts and/or documents from the beneficiary by advancing funds before reimbursement", "Confirm the credit automatically", "Amend the credit terms on the applicant's behalf"]$q$::jsonb,
   $q$"Purchase drafts and/or documents from the beneficiary by advancing funds before reimbursement"$q$::jsonb,
   $q$Under UCP 600, negotiation means the nominated bank purchasing drafts and/or documents of a complying presentation by advancing or agreeing to advance funds to the beneficiary on or before the banking day on which it is to be reimbursed.$q$,
   $q${"Issue a fresh credit to the beneficiary": "Negotiation does not involve issuing a new credit.", "Confirm the credit automatically": "Nomination to negotiate is not the same as confirmation.", "Amend the credit terms on the applicant's behalf": "Amendments require the issuing bank, beneficiary, and any confirming bank — not a nominated bank acting alone."}$q$::jsonb,
   ARRAY['ucp_600','negotiation','nominated_bank'], 'standard', 'ucp_600_articles', 85, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Under UCP 600, an amendment to an irrevocable credit becomes binding on the beneficiary when:$q$,
   $q$["The issuing bank sends the amendment", "The applicant signs the amendment request", "The beneficiary accepts the amendment, expressly or by acting on it", "The advising bank forwards the amendment"]$q$::jsonb,
   $q$"The beneficiary accepts the amendment, expressly or by acting on it"$q$::jsonb,
   $q$Under Article 10, an amendment does not bind the beneficiary until the beneficiary accepts it. Until then the original credit terms remain in force for the beneficiary; partial acceptance of an amendment is not allowed.$q$,
   $q${"The issuing bank sends the amendment": "Sending an amendment does not bind the beneficiary, who must still accept it.", "The applicant signs the amendment request": "The applicant cannot unilaterally change the beneficiary's rights under the credit.", "The advising bank forwards the amendment": "Forwarding is administrative; it does not constitute the beneficiary's acceptance."}$q$::jsonb,
   ARRAY['ucp_600','article_10','amendments'], 'advanced', 'ucp_600_articles', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  -- ---- domain: standby_vs_commercial (5) ------------------------------------
  (v_course_id, 'single_choice',
   $q$The key commercial difference between a commercial letter of credit and a standby letter of credit is that:$q$,
   $q$["A commercial LC is designed to be drawn; a standby is designed not to be drawn", "A standby LC is always for a larger amount", "A commercial LC cannot be confirmed", "A standby LC is not a letter of credit"]$q$::jsonb,
   $q$"A commercial LC is designed to be drawn; a standby is designed not to be drawn"$q$::jsonb,
   $q$A commercial LC is a payment mechanism, presented in the normal course against shipping documents. A standby is a back-up security drawn only if the underlying obligation fails.$q$,
   $q${"A standby LC is always for a larger amount": "Amount is not what distinguishes the two instruments.", "A commercial LC cannot be confirmed": "Commercial LCs are routinely confirmed.", "A standby LC is not a letter of credit": "A standby is a true letter of credit with a definite undertaking."}$q$::jsonb,
   ARRAY['standby_lc','commercial_lc','lc_types'], 'foundational', 'standby_vs_commercial', 60, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$ISP98 (International Standby Practices) is a set of ICC rules designed specifically for:$q$,
   $q$["Commercial documentary credits", "Standby letters of credit", "Documentary collections", "Bank-to-bank reimbursements"]$q$::jsonb,
   $q$"Standby letters of credit"$q$::jsonb,
   $q$ISP98 was published to reflect standby practice — partial drawings, examination periods, electronic presentation — better than the commercial-credit-oriented UCP 600. A standby may be made subject to ISP98 or to UCP 600.$q$,
   $q${"Commercial documentary credits": "Commercial credits are governed by UCP 600.", "Documentary collections": "Documentary collections are governed by URC 522.", "Bank-to-bank reimbursements": "Bank reimbursements are addressed by URR 725."}$q$::jsonb,
   ARRAY['standby_lc','isp98','governing_rules'], 'standard', 'standby_vs_commercial', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A standby letter of credit states it is "subject to ISP98". Which rules govern its operation?$q$,
   $q$["UCP 600, because all credits default to UCP 600", "ISP98, as expressly incorporated", "Both equally, with UCP 600 prevailing on conflict", "URDG 758"]$q$::jsonb,
   $q$"ISP98, as expressly incorporated"$q$::jsonb,
   $q$A credit is governed by the rules it incorporates by reference. A standby expressly made subject to ISP98 is governed by ISP98.$q$,
   $q${"UCP 600, because all credits default to UCP 600": "There is no automatic default; the incorporated rules govern.", "Both equally, with UCP 600 prevailing on conflict": "UCP 600 is not incorporated here, so it does not apply.", "URDG 758": "URDG 758 governs demand guarantees, not a standby subject to ISP98."}$q$::jsonb,
   ARRAY['standby_lc','isp98','governing_rules'], 'standard', 'standby_vs_commercial', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A contractor posts a performance standby letter of credit in favour of a project owner instead of a cash performance bond. The contractor's main advantage is:$q$,
   $q$["It removes the need to perform the contract", "It preserves working capital, since cash is not tied up with the owner", "It makes the obligation unconditional for the owner", "It transfers the construction risk to the issuing bank"]$q$::jsonb,
   $q$"It preserves working capital, since cash is not tied up with the owner"$q$::jsonb,
   $q$A standby lets the contractor provide payment assurance to the owner while only posting collateral with its bank, rather than depositing the full sum in cash — preserving working capital.$q$,
   $q${"It removes the need to perform the contract": "The contractor must still perform; the standby is only security.", "It makes the obligation unconditional for the owner": "The owner still has to make a complying demand to draw.", "It transfers the construction risk to the issuing bank": "The bank takes payment risk on a complying demand, not the construction performance risk."}$q$::jsonb,
   ARRAY['standby_lc','performance_standby','working_capital'], 'advanced', 'standby_vs_commercial', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$A demand guarantee governed by URDG 758 differs from a standby letter of credit principally in that:$q$,
   $q$["A demand guarantee is not an independent undertaking", "A demand guarantee is governed by URDG 758, while a standby is a letter of credit governed by ISP98 or UCP 600", "A demand guarantee can never be called", "A standby is governed by national contract law only"]$q$::jsonb,
   $q$"A demand guarantee is governed by URDG 758, while a standby is a letter of credit governed by ISP98 or UCP 600"$q$::jsonb,
   $q$Both are independent undertakings that stand behind a primary obligation, but they differ in the rule sets that govern them: URDG 758 for demand guarantees, ISP98 or UCP 600 for standby letters of credit.$q$,
   $q${"A demand guarantee is not an independent undertaking": "A URDG demand guarantee is an independent undertaking, like a standby.", "A demand guarantee can never be called": "It is called by a complying demand, like a standby.", "A standby is governed by national contract law only": "A standby is governed by its incorporated rules — ISP98 or UCP 600."}$q$::jsonb,
   ARRAY['standby_lc','demand_guarantees','urdg_758'], 'advanced', 'standby_vs_commercial', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  -- ---- domain: trade_finance_compliance (5) ---------------------------------
  (v_course_id, 'single_choice',
   $q$When processing a documentary credit, a bank screens the parties and vessels named in the documents primarily to:$q$,
   $q$["Confirm the goods meet quality specifications", "Detect involvement of sanctioned persons, entities, or vessels", "Calculate the correct examination fee", "Verify the applicant's credit rating"]$q$::jsonb,
   $q$"Detect involvement of sanctioned persons, entities, or vessels"$q$::jsonb,
   $q$Sanctions screening checks names, entities, vessels, ports, and goods against sanctions lists (such as the OFAC SDN list) to avoid processing a transaction touching a sanctioned party.$q$,
   $q${"Confirm the goods meet quality specifications": "Goods quality is never the bank's concern under a credit.", "Calculate the correct examination fee": "Fees are unrelated to sanctions screening.", "Verify the applicant's credit rating": "Credit assessment is a separate underwriting activity, not sanctions screening."}$q$::jsonb,
   ARRAY['trade_finance_compliance','sanctions_screening'], 'standard', 'trade_finance_compliance', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Trade-based money laundering through "over-invoicing" typically involves:$q$,
   $q$["Invoicing goods above their true value to move value to the exporter", "Shipping goods faster than the contract requires", "Using a confirmed credit instead of an unconfirmed one", "Presenting documents one day late"]$q$::jsonb,
   $q$"Invoicing goods above their true value to move value to the exporter"$q$::jsonb,
   $q$Over-invoicing states a price higher than the true value of the goods, transferring excess value to the exporter under cover of an apparently legitimate trade payment — a core trade-based money laundering technique.$q$,
   $q${"Shipping goods faster than the contract requires": "Shipment speed is not a money-laundering mechanism.", "Using a confirmed credit instead of an unconfirmed one": "Confirmation is a payment-assurance choice, not laundering.", "Presenting documents one day late": "Late presentation is a discrepancy issue, not money laundering."}$q$::jsonb,
   ARRAY['trade_finance_compliance','tbml','mis_invoicing'], 'advanced', 'trade_finance_compliance', 90, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$In trade finance, "Know Your Customer" (KYC) due diligence is primarily concerned with:$q$,
   $q$["Verifying the identity and risk profile of the bank's customer", "Examining the transport documents for discrepancies", "Confirming the credit is subject to UCP 600", "Setting the credit's expiry date"]$q$::jsonb,
   $q$"Verifying the identity and risk profile of the bank's customer"$q$::jsonb,
   $q$KYC requires the bank to identify and verify its customer, understand the nature of their business, and assess money-laundering and sanctions risk before and during the relationship.$q$,
   $q${"Examining the transport documents for discrepancies": "Document examination is a UCP 600 task, separate from KYC.", "Confirming the credit is subject to UCP 600": "Rule incorporation is unrelated to customer due diligence.", "Setting the credit's expiry date": "Expiry is a credit term, not a KYC matter."}$q$::jsonb,
   ARRAY['trade_finance_compliance','kyc'], 'standard', 'trade_finance_compliance', 75, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$An issuing bank notices a bill of lading names a vessel that appears on the OFAC SDN list. The bank should:$q$,
   $q$["Honour the presentation if the documents otherwise comply", "Treat it as a sanctions red flag and not process the transaction pending escalation", "Disregard the vessel name as a non-documentary condition", "Ask the beneficiary to amend the bill of lading"]$q$::jsonb,
   $q$"Treat it as a sanctions red flag and not process the transaction pending escalation"$q$::jsonb,
   $q$A vessel on the OFAC SDN list is a serious sanctions hit. Sanctions compliance overrides the duty to honour; the bank must halt and escalate, regardless of documentary compliance.$q$,
   $q${"Honour the presentation if the documents otherwise comply": "Sanctions obligations override UCP 600's honour duty.", "Disregard the vessel name as a non-documentary condition": "A sanctioned vessel is a compliance hit, not a non-documentary condition to ignore.", "Ask the beneficiary to amend the bill of lading": "Amending the document would not change the underlying sanctions exposure."}$q$::jsonb,
   ARRAY['trade_finance_compliance','sanctions_screening','ofac'], 'advanced', 'trade_finance_compliance', 95, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb),

  (v_course_id, 'single_choice',
   $q$Which of the following is the strongest trade-finance money-laundering red flag in a documentary credit transaction?$q$,
   $q$["The credit is confirmed by a second bank", "Goods described are wholly inconsistent with the buyer's or seller's known business", "The credit allows partial shipments", "The credit expires at the counters of the nominated bank"]$q$::jsonb,
   $q$"Goods described are wholly inconsistent with the buyer's or seller's known business"$q$::jsonb,
   $q$Goods that make no commercial sense for the parties — a known electronics importer suddenly trading bulk scrap metal — are a classic trade-based money laundering red flag warranting enhanced scrutiny.$q$,
   $q${"The credit is confirmed by a second bank": "Confirmation is a normal risk-management feature, not a red flag.", "The credit allows partial shipments": "Partial shipments are a routine, permitted credit term.", "The credit expires at the counters of the nominated bank": "Place of expiry is a standard structural term."}$q$::jsonb,
   ARRAY['trade_finance_compliance','tbml','red_flags'], 'standard', 'trade_finance_compliance', 80, TRUE, TRUE,
   $q${"is_dev_seed": true}$q$::jsonb);

  RAISE NOTICE 'CDCS question bank seeded.';
END $do$;

-- Sanity check: confirm 30 questions inserted for CDCS.
DO $check$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM question_bank
    WHERE course_id = (SELECT id FROM courses WHERE slug = 'cdcs');
  IF v_count <> 32 THEN
    RAISE EXCEPTION 'Expected 32 CDCS questions, got %', v_count;
  END IF;
END $check$;
