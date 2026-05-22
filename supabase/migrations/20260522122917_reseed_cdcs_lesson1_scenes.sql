-- Re-seed CDCS lesson 1 into scene format (Prompt 12 / ADR 0016).
-- The CDCS course is a throwaway dev placeholder. This rebuilds its first
-- lesson — "The Parties to a Documentary Credit" — as a mix of slide, reading
-- and quiz scenes, to exercise the scene renderers. Lessons 2 and 3 keep their
-- prose elements and render as `reading` scenes via backward compatibility.
-- This content is a dev placeholder, to be replaced by methodology-compliant
-- generated content (it still references UCP 600 by name only).

delete from content_library_elements
where lesson_id = '035a7068-5506-443a-a892-7fa439c2136d';

insert into content_library_elements
  (course_id, module_id, lesson_id, element_type, scene_type, scene_data,
   title, body, concept_tags, teaches_concepts, metadata)
values
  -- Scene 1 — slide / key-points
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'explanation', 'slide',
   $json$
   {
     "template": "key-points",
     "heading": "Who's Who in a Documentary Credit",
     "subheading": "Five parties, five distinct roles.",
     "items": [
       {"icon": "🧾", "label": "Applicant", "text": "The buyer — instructs their bank to issue the credit."},
       {"icon": "📦", "label": "Beneficiary", "text": "The seller — ships the goods and presents documents to be paid."},
       {"icon": "🏦", "label": "Issuing Bank", "text": "The applicant's bank — issues the credit and undertakes to pay."},
       {"icon": "📨", "label": "Advising Bank", "text": "Passes the credit to the beneficiary and vouches for its authenticity."},
       {"icon": "💳", "label": "Nominated Bank", "text": "Authorised by the issuing bank to pay, accept, or negotiate."}
     ],
     "narration": "Every documentary credit involves five parties, each with a defined role. The applicant is the buyer; the beneficiary is the seller; the issuing bank stands behind the payment; the advising bank delivers the credit; and the nominated bank is authorised to act on it. Keep these straight and the rest of the lesson follows."
   }
   $json$::jsonb,
   $t$Who's Who in a Documentary Credit$t$,
   $b$Every documentary credit involves five parties: the applicant (buyer), the beneficiary (seller), the issuing bank, the advising bank, and the nominated bank.$b$,
   '{parties_to_credit,applicant,beneficiary,issuing_bank,advising_bank,nominated_bank}',
   '{parties_to_credit,applicant,beneficiary,issuing_bank,advising_bank,nominated_bank}',
   '{"order": 1}'::jsonb),

  -- Scene 2 — reading
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'explanation', 'reading',
   $json$
   {
     "body": "The **applicant** is the buyer in the underlying commercial transaction. They instruct their bank to issue a documentary credit in favour of the seller. Crucially, the applicant is *not* a party to the credit itself — the credit is an undertaking by the issuing bank to the beneficiary. The applicant's relationship is with the issuing bank, governed by the reimbursement agreement they sign.\n\nThe **beneficiary** is the seller. They are the party entitled to be paid under the credit, provided they present documents that comply with its terms. The beneficiary does not rely on the buyer's willingness to pay — they rely on the issuing bank's independent undertaking.",
     "citations": [
       {"label": "UCP 600, Article 2 — Definitions (referenced by name)"},
       {"label": "ICC commentary on documentary credit practice"}
     ]
   }
   $json$::jsonb,
   $t$The Applicant and the Beneficiary$t$,
   $b$The applicant is the buyer; the beneficiary is the seller. The applicant is not a party to the credit itself — the credit is the issuing bank's undertaking to the beneficiary.$b$,
   '{applicant,beneficiary}',
   '{applicant,beneficiary}',
   '{"order": 2}'::jsonb),

  -- Scene 3 — slide / definition
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'definition', 'slide',
   $json$
   {
     "template": "definition",
     "heading": "The Independence Principle",
     "items": [
       {"text": "A documentary credit is separate from, and independent of, the underlying sale contract. Banks deal in documents alone — not in the goods, services, or performance the documents may relate to."},
       {"label": "Why it matters", "text": "The issuing bank must honour a complying presentation even if the buyer claims the goods are defective. That dispute belongs to the sale contract, not to the credit."}
     ],
     "narration": "The independence principle is the foundation of documentary credit law. The credit stands apart from the sale contract. A bank examines documents, not goods. If the documents comply, the bank pays. Any dispute about the goods themselves is a matter between buyer and seller under their commercial contract."
   }
   $json$::jsonb,
   $t$The Independence Principle$t$,
   $b$A documentary credit is independent of the underlying sale contract. Banks deal in documents, not goods. Compliant documents must be honoured regardless of disputes over the goods.$b$,
   '{independence_principle}',
   '{independence_principle}',
   '{"order": 3}'::jsonb),

  -- Scene 4 — slide / comparison
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'explanation', 'slide',
   $json$
   {
     "template": "comparison",
     "heading": "Issuing Bank vs Advising Bank",
     "items": [
       {"label": "Issuing Bank", "text": "Issues the credit at the applicant's request."},
       {"label": "Issuing Bank", "text": "Gives a definite, independent undertaking to honour."},
       {"label": "Issuing Bank", "text": "Carries the payment risk."},
       {"label": "Advising Bank", "text": "Passes the credit to the beneficiary."},
       {"label": "Advising Bank", "text": "Checks the apparent authenticity of the credit."},
       {"label": "Advising Bank", "text": "Takes on no payment undertaking — unless it also confirms."}
     ],
     "narration": "Do not confuse the issuing bank with the advising bank. The issuing bank carries the obligation to pay. The advising bank simply delivers the credit and vouches for its authenticity — it takes on no payment risk, unless it separately adds its confirmation."
   }
   $json$::jsonb,
   $t$Issuing Bank vs Advising Bank$t$,
   $b$The issuing bank gives a definite undertaking to honour and carries the payment risk. The advising bank only delivers the credit and checks its authenticity — no payment undertaking unless it confirms.$b$,
   '{issuing_bank,advising_bank}',
   '{issuing_bank,advising_bank}',
   '{"order": 4}'::jsonb),

  -- Scene 5 — quiz
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'quiz_question', 'quiz',
   $json$
   {
     "intro": "Two quick questions on the parties and the independence principle.",
     "questions": [
       {
         "prompt": "A buyer believes the delivered goods are defective and tells the issuing bank not to pay. The presented documents comply with the credit. What must the issuing bank do?",
         "options": [
           {"id": "a", "text": "Withhold payment until the goods dispute is resolved."},
           {"id": "b", "text": "Honour the credit and pay against the compliant documents."},
           {"id": "c", "text": "Refer the decision to the advising bank."},
           {"id": "d", "text": "Cancel the credit."}
         ],
         "correctOptionId": "b",
         "explanation": "Under the independence principle, the credit is separate from the sale contract. The bank deals in documents; a complying presentation must be honoured. The goods dispute is for the buyer and seller to resolve under their contract.",
         "conceptTags": ["independence_principle"],
         "points": 10
       },
       {
         "prompt": "Which party gives the definite undertaking to honour a complying presentation?",
         "options": [
           {"id": "a", "text": "The applicant"},
           {"id": "b", "text": "The advising bank"},
           {"id": "c", "text": "The issuing bank"},
           {"id": "d", "text": "The beneficiary"}
         ],
         "correctOptionId": "c",
         "explanation": "The issuing bank gives the definite undertaking to honour. The applicant is not a party to the credit; the advising bank only advises unless it adds confirmation.",
         "conceptTags": ["issuing_bank"],
         "points": 10
       }
     ]
   }
   $json$::jsonb,
   $t$Knowledge Check: The Parties$t$,
   $b$Two questions on the parties and the independence principle.$b$,
   '{independence_principle,issuing_bank}',
   '{independence_principle,issuing_bank}',
   '{"order": 5}'::jsonb),

  -- Scene 6 — slide / callout
  ('e51f763b-e65f-4447-a9fa-bb28b41c8b0e',
   (select module_id from lessons where id = '035a7068-5506-443a-a892-7fa439c2136d'),
   '035a7068-5506-443a-a892-7fa439c2136d',
   'explanation', 'slide',
   $json$
   {
     "template": "callout",
     "heading": "Key takeaway",
     "items": [
       {"text": "Banks deal in documents, not goods. Master that, and documentary credits make sense."}
     ],
     "narration": "If you remember one thing from this lesson, remember this: banks deal in documents, not goods. Every rule that follows is an expression of that single idea."
   }
   $json$::jsonb,
   $t$Key Takeaway$t$,
   $b$Banks deal in documents, not goods. Master that, and documentary credits make sense.$b$,
   '{independence_principle,parties_to_credit}',
   '{independence_principle,parties_to_credit}',
   '{"order": 6}'::jsonb);
