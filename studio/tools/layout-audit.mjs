#!/usr/bin/env bun
// layout-audit.mjs — validates the 64-layout registry across every supported
// aspect ratio (regions inside the safe rect, no unknown regions) and prints
// the scene→layout records. Exit 1 on any failure.
import { validateAll, LAYOUTS, SCENE_LAYOUTS, FORMATS, resolveLayout, safeRect } from '../engine/layouts.mjs';

const { layouts, problems } = validateAll();
console.log(`layouts: ${layouts} · formats: ${FORMATS.join(', ')}`);

for (const f of FORMATS) {
  const safe = safeRect(f);
  console.log(`  ${f}: safe rect ${safe.w}×${safe.h} @ ${safe.x},${safe.y}`);
}

let failed = false;
for (const p of problems) {
  failed = true;
  console.log(`FAIL ${p.id} @ ${p.format}: ${p.issues.join('; ')}`);
}

console.log('\nscene layout records:');
for (const [scene, id] of Object.entries(SCENE_LAYOUTS)) {
  const r = resolveLayout(id, '16:9');
  console.log(`  ${scene} → ${id}${r.ok ? '' : '  [FAIL]'}`);
  if (!r.ok) failed = true;
}

const cats = LAYOUTS.reduce((m, l) => ((m[l.cat] = (m[l.cat] || 0) + 1), m), {});
console.log('\nby category:', JSON.stringify(cats));

if (failed) {
  console.log('LAYOUT AUDIT FAILED');
  process.exit(1);
}
console.log(`LAYOUT AUDIT OK — ${layouts} layouts × ${FORMATS.length} formats, all regions safe`);
