// Usage (project root): node scripts/fix-routes.mjs
// Fixes route files that use `uid` but never define it (e.g. upload, data/sample).
import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/route\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const HANDLER = /export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\)\s*(?::\s*[^{]+)?\{/g;
let fixed = 0;

for (const file of walk('app')) {
  let src = fs.readFileSync(file, 'utf-8');
  if (!/\buid\b/.test(src) || /const uid\s*=\s*await getUid\(\)/.test(src)) continue;

  src = src.replace(HANDLER, (m) => `${m}\n  const uid = await getUid();`);
  if (!src.includes("@/lib/user")) src = `import { getUid } from '@/lib/user';\n` + src;
  fs.writeFileSync(file, src);
  console.log('fixed:', file);
  fixed++;
}
console.log(`\n${fixed} file(s) fixed. Next: npm run build`);
