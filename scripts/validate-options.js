/**
 * Build-time validation for wheel-options.json.
 * Runs before the app build to catch configuration errors early.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'wheel-options.json');

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const options = JSON.parse(raw);

  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('wheel-options.json must be a non-empty array.');
  }

  const explicitChances = [];
  let nullCount = 0;

  for (const opt of options) {
    if (!opt.label || typeof opt.label !== 'string') {
      throw new Error(`Each option must have a "label" string. Got: ${JSON.stringify(opt)}`);
    }
    if (typeof opt.ratio !== 'number' || opt.ratio <= 0) {
      throw new Error(`Option "${opt.label}" must have a positive "ratio". Got: ${opt.ratio}`);
    }
    if (!opt.color || typeof opt.color !== 'string') {
      throw new Error(`Option "${opt.label}" must have a "color" string.`);
    }

    if (opt.chance != null) {
      if (typeof opt.chance !== 'number') {
        throw new Error(`Option "${opt.label}" has a non-numeric chance: ${opt.chance}`);
      }
      if (opt.chance < 0) {
        throw new Error(`Option "${opt.label}" has a negative chance (${opt.chance}%). Chance must be >= 0.`);
      }
      explicitChances.push(opt.chance);
    } else {
      nullCount++;
    }
  }

  const explicitTotal = explicitChances.reduce((a, b) => a + b, 0);

  if (explicitTotal > 100) {
    throw new Error(`Total explicit chances add up to ${explicitTotal}%, which exceeds 100%.`);
  }

  if (nullCount === 0 && Math.abs(explicitTotal - 100) > 0.001) {
    throw new Error(`All options have explicit chances but they total ${explicitTotal}%, not 100%.`);
  }

  const remaining = 100 - explicitTotal;
  if (nullCount > 0 && remaining < 0) {
    throw new Error(`Explicit chances total ${explicitTotal}%, leaving no room for ${nullCount} auto-fill options.`);
  }

  const autoChance = nullCount > 0 ? remaining / nullCount : 0;
  console.log('✅ wheel-options.json is valid.');
  if (nullCount > 0) {
    console.log(`   ${nullCount} option(s) will auto-fill with ${autoChance.toFixed(2)}% each.`);
  }
  console.log('   Chances breakdown:');
  for (const opt of options) {
    const chance = opt.chance != null ? opt.chance : autoChance;
    console.log(`   - ${opt.label}: ${chance}%`);
  }
} catch (err) {
  console.error(`❌ wheel-options.json validation failed:\n   ${err.message}`);
  process.exit(1);
}
