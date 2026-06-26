// Deterministic em-dash / en-dash strip across all lesson text.
// Rules: numeric/statute ranges (digit–digit) -> hyphen; a spaced em-dash that
// introduces an independent clause (next word capitalised, not a known proper
// noun) -> ". " ; otherwise -> ", " ; then cleanup. Ripon's #1 AI-tell.
// Usage:
//   node strip-emdashes.js preview <course> <slug>   # show before/after, no write
//   node strip-emdashes.js apply <course>            # apply to every lesson, write
const fs = require('fs');
const path = require('path');

// Proper nouns / acronyms that often follow a dash mid-sentence; keep these as comma.
const PROPER = /^(the|a|an|and|or|but|so|its|their|his|her|this|that|these|those|each|both|with|for|in|on|at|by|to|from|as|not|no|only|because|which|where|when|who|FATF|FinCEN|OFAC|SEC|DOJ|EU|US|UK|UN|POCA|MLR|MLRO|VASP|CDD|EDD|EWRA|STR|SAR|R\.?\d|Recommendation|Article|Section)\b/;

function strip(s) {
  if (typeof s !== 'string' || !/[—–]/.test(s)) return s;
  // Comma for every em/en dash (never a fragment); numeric/statute ranges -> hyphen.
  let out = s
    .replace(/(\d)\s*[—–]\s*(\d)/g, '$1-$2')  // ranges -> hyphen
    .replace(/\s*[—–]\s*/g, ', ')             // all dashes -> comma
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*([.;:!?])/g, '$1')
    .replace(/^[,\s]+/, '')
    .replace(/\s{2,}/g, ' ');
  return out;
}

// deep-walk every string in an object, applying strip
let changed = 0;
function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) node[k] = walk(node[k]);
    return node;
  }
  if (typeof node === 'string') {
    const s2 = strip(node);
    if (s2 !== node) changed++;
    return s2;
  }
  return node;
}

const mode = process.argv[2];
if (mode === 'preview') {
  const course = process.argv[3], slug = process.argv[4];
  const j = JSON.parse(fs.readFileSync(`generated/${course}/lessons/${slug}.json`, 'utf8'));
  const before = [];
  (function collect(n){ if(Array.isArray(n))n.forEach(collect); else if(n&&typeof n==='object')Object.values(n).forEach(collect); else if(typeof n==='string'&&/[—–]/.test(n))before.push(n);} )(j);
  let shown=0;
  for (const b of before) {
    const a = strip(b);
    // print a window around each dash in the original
    let idx = b.search(/[—–]/);
    while (idx>=0 && shown<14) {
      const ctxB = b.slice(Math.max(0,idx-45), idx+45);
      console.log('BEFORE: ...'+ctxB.replace(/\n/g,' ')+'...');
      shown++;
      const rest = b.slice(idx+1); const ni = rest.search(/[—–]/); idx = ni<0?-1:idx+1+ni;
    }
    if (shown>=14) break;
  }
  console.log('\n--- full first 3 changed strings, after strip ---');
  let c=0;
  for (const b of before){ const a=strip(b); if(a!==b){ console.log('\nAFTER: '+a.slice(0,400)); if(++c>=3)break; } }
} else if (mode === 'apply') {
  const course = process.argv[3];
  const dir = `generated/${course}/lessons`;
  let files=0, strings=0;
  for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json')&&!x.endsWith('.validation.json'))) {
    const fp = path.join(dir,f);
    const raw = fs.readFileSync(fp,'utf8');
    if (!/[—–]/.test(raw)) continue;
    changed = 0;
    const j = walk(JSON.parse(raw));
    fs.writeFileSync(fp, JSON.stringify(j,null,2)+'\n');
    files++; strings += changed;
  }
  console.log(`${course}: stripped em/en-dashes in ${strings} strings across ${files} files`);
} else {
  console.log('usage: preview <course> <slug> | apply <course>');
}
