#!/usr/bin/env node
/*
 * scripts/rebalance-lesson-quiz-positions.js
 *
 * Deterministically rebalances the on-screen POSITION of the correct option in
 * every inline lesson `quiz` scene, so a student cannot game the knowledge check
 * by always picking the same position.
 *
 * Why this is safe / how the quiz renders:
 *   components/lesson/scenes/quiz-scene.tsx renders option.text in ARRAY ORDER,
 *   shows NO A/B/C/D letter, does NOT shuffle per attempt, and keys correctness
 *   off (opt.id === correctOptionId). So the only position a student can memorise
 *   is the array index. Reordering the options array changes the on-screen
 *   position; ids travel with their text so correctness is preserved. Verified
 *   that 0/273 explanations reference an option by letter/position, so re-lettering
 *   ids a/b/c/d to the new order is also safe.
 *
 * What it does NOT do: it does not touch option TEXT or the explanation. The
 * "correct answer is the longest option" length-tell is a separate content pass.
 *
 * Operates in place on gitignored generated/<course>/lessons/*.json.
 * Usage: node scripts/rebalance-lesson-quiz-positions.js [cams|ccas|all] [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const arg = (process.argv[2] || 'all').toLowerCase();
const DRY = process.argv.includes('--dry-run');
const courses = arg === 'all' ? ['cams', 'ccas'] : [arg];

// Balanced, locally-mixed target-position sequence (16 entries, four of each 1..4).
const SEQ = [2, 4, 1, 3, 3, 1, 4, 2, 4, 2, 3, 1, 1, 3, 2, 4];
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

let counter = 0;
const before = {}, after = {};
let filesChanged = 0, questionsTouched = 0;

function bump(map, k) { map[k] = (map[k] || 0) + 1; }

for (const course of courses) {
  const dir = path.join('generated', course, 'lessons');
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.endsWith('.validation.json')).sort();
  for (const file of files) {
    const fp = path.join(dir, file);
    let j;
    try { j = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { continue; }
    let changed = false;
    for (const s of (j.scenes || [])) {
      if ((s.sceneType || s.scene_type) !== 'quiz') continue;
      const data = s.sceneData || s.scene_data;
      if (!data || !Array.isArray(data.questions)) continue;
      for (const q of data.questions) {
        const opts = q.options || [];
        const n = opts.length;
        if (n < 2) continue;
        const correctIdx = opts.findIndex(o => o.id === q.correctOptionId);
        if (correctIdx < 0) continue; // malformed; leave untouched
        bump(before, correctIdx + 1);

        // target 1-based position for the correct option (clamped to n)
        let target = SEQ[counter % SEQ.length];
        counter++;
        if (target > n) target = ((counter) % n) + 1;
        const targetIdx = target - 1;

        const correctOpt = opts[correctIdx];
        const distractors = opts.filter((_, i) => i !== correctIdx);
        const newOrder = [...distractors];
        newOrder.splice(targetIdx, 0, correctOpt);

        // relabel ids sequentially by new position; keep text + explanation intact
        newOrder.forEach((o, i) => { o.id = LETTERS[i]; });
        q.options = newOrder;
        q.correctOptionId = LETTERS[targetIdx];

        bump(after, targetIdx + 1);
        questionsTouched++;
        changed = true;
      }
    }
    if (changed) {
      filesChanged++;
      if (!DRY) fs.writeFileSync(fp, JSON.stringify(j, null, 2) + '\n');
    }
  }
}

const tot = Object.values(after).reduce((a, b) => a + b, 0) || 1;
const fmt = (m) => [1, 2, 3, 4].map(p => `pos${p}:${((100 * (m[p] || 0)) / tot).toFixed(1)}%`).join('  ');
console.log(`${DRY ? '[DRY RUN] ' : ''}rebalanced ${questionsTouched} questions across ${filesChanged} files (${courses.join(', ')})`);
console.log('BEFORE  ', fmt(before));
console.log('AFTER   ', fmt(after));
