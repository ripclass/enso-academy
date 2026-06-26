// Measure inline lesson-quiz integrity across the whole catalog.
// Reads every generated lesson JSON, inspects each quiz question, and reports:
//  - position distribution (array index of the correct option = what the student sees)
//  - correctOptionId distribution
//  - length tell: how often the correct option is the LONGEST option
//  - whether any explanation references an option letter/position (reorder-safety check)
const fs = require('fs');
const path = require('path');

const courses = ['cams', 'ccas'];
const ROOT = process.argv[2] || '.';

const posCount = {};      // 1-based array position of correct option
const idCount = {};       // correctOptionId letter
let qTotal = 0, qWith4 = 0;
let correctIsLongest = 0;
let correctLenSum = 0, distractorLenSum = 0, distractorN = 0;
const letterRefExplanations = [];
const perLesson = [];

const LETTER_REF = [
  /\boption\s+[a-eA-E]\b/, /\boptions?\s*\([a-eA-E]\)/, /\(([a-eA-E])\)\s/,
  /\bthe (first|second|third|fourth|fifth|last) option\b/i,
  /\banswer\s+[a-eA-E]\b/i,
];

for (const c of courses) {
  const dir = path.join(ROOT, 'generated', c, 'lessons');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json') || file.endsWith('.validation.json')) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); } catch { continue; }
    const scenes = j.scenes || [];
    let lessonQ = 0, lessonBias = {};
    for (const s of scenes) {
      if ((s.sceneType || s.scene_type) !== 'quiz') continue;
      const data = s.sceneData || s.scene_data || s.data || {};
      for (const q of (data.questions || [])) {
        const opts = q.options || [];
        if (!opts.length) continue;
        qTotal++; lessonQ++;
        if (opts.length === 4) qWith4++;
        const idx = opts.findIndex(o => o.id === q.correctOptionId);
        const pos = idx + 1;
        posCount[pos] = (posCount[pos] || 0) + 1;
        lessonBias[pos] = (lessonBias[pos] || 0) + 1;
        idCount[q.correctOptionId] = (idCount[q.correctOptionId] || 0) + 1;
        const lens = opts.map(o => (o.text || '').length);
        const correctLen = lens[idx];
        const maxLen = Math.max(...lens);
        if (correctLen === maxLen) correctIsLongest++;
        correctLenSum += correctLen;
        lens.forEach((L, i) => { if (i !== idx) { distractorLenSum += L; distractorN++; } });
        if ((q.explanation || '') && LETTER_REF.some(re => re.test(q.explanation))) {
          letterRefExplanations.push(`${c}/${file}: "${(q.explanation||'').slice(0,80)}..."`);
        }
      }
    }
    if (lessonQ) perLesson.push({ course: c, file: file.replace('.json',''), n: lessonQ, bias: lessonBias });
  }
}

const pct = (n) => qTotal ? (100*n/qTotal).toFixed(1)+'%' : '0%';
console.log('========== CATALOG-WIDE LESSON-QUIZ MEASUREMENT ==========');
console.log('Total quiz questions:', qTotal, '| 4-option:', qWith4, `(${pct(qWith4)})`);
console.log('\n-- POSITION of correct option (array index the student sees) --');
for (const p of Object.keys(posCount).sort()) console.log(`  position ${p}: ${posCount[p]}  (${pct(posCount[p])})`);
console.log('\n-- correctOptionId letter --');
for (const k of Object.keys(idCount).sort()) console.log(`  id "${k}": ${idCount[k]}  (${pct(idCount[k])})`);
console.log('\n-- LENGTH TELL --');
console.log(`  correct option is the LONGEST: ${correctIsLongest}/${qTotal} (${pct(correctIsLongest)})`);
console.log(`  avg correct-option length: ${(correctLenSum/qTotal).toFixed(0)} chars`);
console.log(`  avg distractor length:     ${(distractorLenSum/distractorN).toFixed(0)} chars`);
console.log('\n-- REORDER SAFETY: explanations referencing an option letter/position --');
console.log(`  count: ${letterRefExplanations.length}`);
letterRefExplanations.slice(0,12).forEach(e => console.log('   ', e));
console.log('\n-- WORST per-lesson position skew (correct on one position >=70% of its qs, n>=3) --');
perLesson.filter(L => {
  const tot = Object.values(L.bias).reduce((a,b)=>a+b,0);
  const mx = Math.max(...Object.values(L.bias));
  return tot >= 3 && mx/tot >= 0.7;
}).forEach(L => {
  const tot = Object.values(L.bias).reduce((a,b)=>a+b,0);
  console.log(`   ${L.course}/${L.file}: n=${L.n} bias=${JSON.stringify(L.bias)}`);
});
console.log('\nLessons with quizzes:', perLesson.length);
