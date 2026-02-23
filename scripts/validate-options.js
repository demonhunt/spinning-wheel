/**
 * Build-time validation for wheel-options.json.
 * Reuses the same parser as the React app to avoid validation drift.
 */
const fs = require('fs');
const path = require('path');
const {
  validateAndResolveOptions,
  summarizeResolvedOptions,
} = require('../src/features/wheel/options-core');

const filePath = path.join(
  __dirname,
  '..',
  'src',
  'features',
  'wheel',
  'config',
  'wheel-options.json'
);

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const options = JSON.parse(raw);
  const resolved = validateAndResolveOptions(options);
  const summary = summarizeResolvedOptions(options, resolved);

  console.log('✅ wheel-options.json is valid.');
  if (summary.missingChanceCount > 0) {
    console.log(
      `   ${summary.missingChanceCount} option(s) will auto-fill with ${summary.autoChance.toFixed(2)}% each.`
    );
  }
  if (summary.missingRatioCount > 0) {
    console.log(
      `   ${summary.missingRatioCount} option(s) missing ratio will default to 1 (equal proportion baseline).`
    );
  }

  console.log('   Chances breakdown:');
  for (const opt of resolved) {
    console.log(`   - ${opt.label}: ${opt.resolvedChance}%`);
  }

  console.log('   Ratio breakdown (visual slice size):');
  for (const opt of resolved) {
    const portion = ((opt.ratio / summary.totalRatio) * 100).toFixed(2);
    console.log(`   - ${opt.label}: ratio ${opt.ratio} (${portion}%)`);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ wheel-options.json validation failed:\n   ${message}`);
  process.exit(1);
}
