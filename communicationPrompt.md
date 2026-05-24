 Path 1 — Launch Quality Bar evaluation (final, post-iteration)

  Final artifacts:
  - 1.2 — what-terrorist-financing-actually-is.json — artifact_hash 41c9a9050670ab8ae3979fcb01b2ccffa0ef908936f6c9652e28a58614542ec5    
  - 1.3 — why-states-regulate-financial-institutions.json — artifact_hash
  4e72d30fb593cdbe9118adb2cb1d7249c88c88d274492c9cc0fe72dbe3fec531

  Audit trail: 18 events in generated/cams/review_events.jsonl covering both lessons end-to-end (3 generate/cross-check cycles for 1.2 →   AGREE; 6 cycles for 1.3 → AGREE).

  Final per-dimension scoring (Claude vs Codex, post-iteration)

  ┌─────────┬────────────────┬───────────────────────┬────────┬───────────────────────────────────────────────┬────────┬──────────┐     
  │    #    │   Dimension    │     Claude — 1.2      │ Codex  │                 Claude — 1.3                  │ Codex  │ Diverge? │     
  │         │                │                       │ — 1.2  │                                               │ — 1.3  │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 1       │ Scene          │ PASS                  │ PASS   │ PASS                                          │ PASS   │ —        │     
  │         │ structure      │                       │        │                                               │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 2       │ Citation       │ PASS (4.8 vs 1.1's    │ PASS   │ PASS (now 36 cites; scene 8 fully sourced)    │ PASS   │ —        │     
  │         │ density        │ 3.4 cites/reading)    │        │                                               │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │         │ Methodology    │                       │        │ PASS (FinCEN Files demoted to pointer per     │        │          │     
  │ 3       │ compliance     │ PASS                  │ PASS   │ type-5 rule; cost claims anchored in Basel    │ PASS   │ —        │     
  │         │                │                       │        │ Committee primary source)                     │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 4       │ IP cleanness   │ PASS                  │ PASS   │ PASS                                          │ PASS   │ —        │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 5       │ Deep-case      │ PASS                  │ PASS   │ PASS                                          │ PASS   │ —        │     
  │         │ scene          │                       │        │                                               │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 6       │ Quiz quality   │ PASS                  │ PASS   │ PASS                                          │ PASS   │ —        │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 7       │ Codex          │ PASS (AGREE round 3)  │ PASS   │ PASS (AGREE round 6)                          │ PASS   │ —        │     
  │         │ cross-check    │                       │        │                                               │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ 8       │ Operational    │ PASS (Ripon iter 1)   │ PASS   │ PASS (Ripon iter 1; the LQB iteration is a    │ PASS   │ —        │     
  │         │                │                       │        │ generator-quality loop, not a Ripon loop)     │        │          │     
  ├─────────┼────────────────┼───────────────────────┼────────┼───────────────────────────────────────────────┼────────┼──────────┤     
  │ Overall │ PASS           │ PASS                  │ PASS   │ PASS                                          │ —      │          │     
  └─────────┴────────────────┴───────────────────────┴────────┴───────────────────────────────────────────────┴────────┴──────────┘     

  Convergence: Claude and Codex now agree on every dimension for both lessons. No outstanding disagreement.

  What the iteration discovered (Path 1 → Path 2 signal)

  The LQB iteration caught what the per-artifact cross-check missed — three rounds of per-artifact factual-fidelity checks on 1.3       
  returned AGREE on the substance, then the LQB methodology-compliance audit caught two issues at a higher level of strictness (FinCEN  
  Files as substance; unsourceable quantitative claims). Then narrow-anchor follow-ups on scene 6 took two more rounds. The pattern:    

  ┌───────────┬─────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────┐        
  │ 1.3 round │                                     Issue type                                      │        Caught at         │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 1         │ 4 factual-fidelity errors (judge name, monitor name, Travel Rule scope, AMLA scope) │ per-artifact cross-check │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 2         │ 1 narration-propagation failure (Travel Rule scope)                                 │ per-artifact cross-check │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 3         │ (clean — per-artifact AGREE)                                                        │ —                        │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 4         │ 2 methodology-compliance issues (type-5 substance; unsourceable quantitatives)      │ LQB evaluation           │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 5         │ 2 narrow citation-anchor gaps (entity-count inference; FATF MER)                    │ per-artifact cross-check │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 6         │ 1 narration-propagation failure (same entity-count inference in narration)          │ per-artifact cross-check │        
  ├───────────┼─────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤        
  │ 7         │ (clean — per-artifact AGREE)                                                        │ —                        │        
  └───────────┴─────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘        

  The per-artifact cross-check is tuned for factual fidelity; it doesn't catch methodology-compliance until prompted at LQB strictness. 
  Path 2 should run both checks per artifact, not in series. Also: narration-propagation failures recurred twice (round 2: Travel Rule  
  fix in item but not narration; round 6: entity-count fix in item but not narration) — same pattern, same surface area. Path 2's       
  validate_gates.ts should pattern-match across item ↔ narration ↔ body redundancy.

  Codex's two preconditions for Path 2 BUILD — both met

  1. ✅  "Record the fresh revised-artifact Codex cross-check for 1.3." Done — round-6 AGREE event 4147b8a6-e6df-4d97-83fb-2724baf29bb4  
  recorded against final artifact_hash 4e72d30fb593cdbe….
  2. ✅  "Freeze the current scene 6 / scene 8 source-discipline wording so those two issues are not reintroduced." The frozen wording is
   captured in the artifact and in the revision-event notes; for Path 2, the explicit pattern is: (a) every factual claim in a slide    
  must be anchored in same-or-adjacent-reading citations; (b) news reporting (type 5) appears only as a named pointer paragraph with    
  explicit "the substance for a compliance officer is the regulatory architecture above" marker, never as the substantive base; (c)     
  post-edit, search across item ↔ narration ↔ body for residual phrasing of removed claims.

  Recommendation: BUILD Path 2

  Both lessons clear the bar against 1.1 on all 8 dimensions, with Codex and Claude converged. The generator + cross-check pipeline     
  produced launch-quality artifacts. The iteration history surfaced concrete, addressable signal for Path 2's infrastructure design —   
  most usefully: (a) methodology audit must run alongside factual-fidelity check, not after; (b) substring-bind for every factual claim,   including slide-level; (c) item ↔ narration ↔ body consistency check.

  Path 2 design notes for when you build it

  1. validate_gates.ts — port the gate vocabulary from validate.mjs (the Path-1 self-check script). Add: (a) methodology-source-type    
  compliance gate (specifically the type-5 "news as pointer not substance" rule); (b) factual-claim ↔ adjacent-citation substring bind  
  for every scene type, not only reading-scene citation count; (c) item-narration consistency check (regex over the JSON to find phrases   that occur in one but not the other when they should be aligned).
  2. citation_bind.ts — substring-verified bind step. Before the artifact reaches Codex, walk every factual claim (using a
  structured-extraction pass: dates, figures, statute citations, case citations, agency names, named individuals) and verify each is    
  present in either the same scene's citation set or an adjacent reading scene's citation set. Flag unbound claims.
  3. lesson_review_events DB table — the JSONL audit-trail shape we used migrates 1:1. The 18 events from this Path-1 run are a useful  
  test fixture.
  4. Codex cross-check orchestration — always write the brief to a file and pipe via stdin (the self-attribution failure mode happened  
  once in this session). Verify a Codex-side trace before accepting verdict. Run methodology audit and factual-fidelity check in        
  parallel per artifact, not in series.
  5. Outline source registry — current outline sources[] is a starting set, not exhaustive. Path 2 should make this explicit: either    
  auto-extend the registry as new lessons cite new primary sources, or mark the registry as advisory rather than authoritative for      
  citation-gate purposes. The current 16-of-36 outline-match rate on 1.3 reflects the underspecification, not a citation gap.
  6. Codex-iteration cap as quality signal — set explicit MAX_CODEX_ITERATIONS = 3 per lesson; exceeding it should trigger
  generator-quality review, not just "Codex doing extra work." 1.3 took 6 Codex rounds in this run; with citation_bind.ts and the       
  methodology gate in the local check, that should drop to 1–2 rounds per lesson.

  Both lessons ready for SME review

  1.2 (Lafarge) and 1.3 (HSBC) are ready to flow into the methodology's QA step 4 — substantive-accuracy review by a credentialed AML   
  practitioner. Per the methodology, that's the next QA gate before publication. Path 1's discipline produces drafts that meet the      
  structural bar; the SME pass certifies them substantively for student delivery.

  Path 1 scope complete. Hand-off for Path 2 build decision is yours.