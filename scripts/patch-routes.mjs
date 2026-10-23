// Usage (from project root): node scripts/patch-routes.mjs
// Adds `const uid = await getUid();` and passes uid into lib/db calls in app/**/route.ts
import fs from 'fs';
import path from 'path';

const FNS = ['getSalesRows','getSalesSummary','getKPIs','getSalesPreview','getDatasetMeta',
             'databaseExists','deleteDataset','saveSalesData'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/route\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

let patched = 0;
const review = [];
for (const file of walk('app')) {
  let src = fs.readFileSync(file, 'utf-8');
  const usesDb = /hydrate\(/.test(src) || FNS.some((f) => src.includes(f + '('));
  if (!usesDb) continue;
  if (src.includes('getUid')) { console.log('skip (already patched):', file); continue; }

  // hydrate
  src = src.replace(/await\s+hydrate\(\s*\)\s*;?/g, 'const uid = await getUid();\n  await hydrate(uid);');
  // db fns
  for (const fn of FNS) {
    src = src.replace(new RegExp(`\\b${fn}\\(\\s*\\)`, 'g'), `${fn}(uid)`);
    src = src.replace(new RegExp(`\\b${fn}\\((?!uid\\b)(?!\\s*\\))`, 'g'), `${fn}(uid, `);
  }
  // import
  const lines = src.split('\n');
  let idx = -1;
  lines.forEach((l, i) => { if (/^import .*lib\/db['"]/.test(l)) idx = i; });
  const imp = "import { getUid } from '@/lib/user';";
  if (idx >= 0) lines.splice(idx + 1, 0, imp); else lines.unshift(imp);
  src = lines.join('\n');

  if (!/await hydrate\(uid\)/.test(src)) review.push(file + '  (no hydrate call found, check manually)');
  fs.writeFileSync(file, src);
  console.log('patched:', file);
  patched++;
}
console.log(`\n${patched} route file(s) patched.`);
if (review.length) console.log('\nCheck manually:\n' + review.join('\n'));
console.log('\nNext: npm run build  (TypeScript flags anything missed)');
