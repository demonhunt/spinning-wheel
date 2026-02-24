/**
 * Shared wheel option parser/validator used by both runtime and build-time validation.
 * Keep this file in plain JS so Node scripts can require it without a TS toolchain.
 */
export function validateAndResolveOptions(configs) {
  if (!Array.isArray(configs) || configs.length === 0) {
    throw new Error('Wheel must have at least one option.');
  }

  const explicitOptions = [];
  const nullOptions = [];

  for (const opt of configs) {
    if (!opt || typeof opt !== 'object') {
      throw new Error(`Invalid option entry: ${JSON.stringify(opt)}`);
    }
    if (!opt.label || typeof opt.label !== 'string') {
      throw new Error(`Each option must have a "label" string. Got: ${JSON.stringify(opt)}`);
    }
    if (opt.ratio != null && (typeof opt.ratio !== 'number' || opt.ratio <= 0)) {
      throw new Error(
        `Option "${opt.label}" has invalid ratio (${opt.ratio}). Ratio must be a positive number.`
      );
    }

    if (opt.chance != null) {
      if (typeof opt.chance !== 'number') {
        throw new Error(`Option "${opt.label}" has a non-numeric chance: ${opt.chance}`);
      }
      if (opt.chance < 0) {
        throw new Error(
          `Option "${opt.label}" has a negative chance (${opt.chance}%). Chance must be >= 0.`
        );
      }
      explicitOptions.push(opt);
    } else {
      nullOptions.push(opt);
    }
  }

  const explicitTotal = explicitOptions.reduce((sum, opt) => sum + opt.chance, 0);
  if (explicitTotal > 100) {
    throw new Error(`Total explicit chances add up to ${explicitTotal}%, which exceeds 100%.`);
  }

  if (nullOptions.length === 0 && Math.abs(explicitTotal - 100) > 0.001) {
    throw new Error(`Total chances add up to ${explicitTotal}%, but must equal 100%.`);
  }

  const remaining = 100 - explicitTotal;
  const autoChance = nullOptions.length > 0 ? remaining / nullOptions.length : 0;
  if (autoChance < 0) {
    throw new Error(
      `Cannot distribute remaining chance. Explicit chances total ${explicitTotal}%, leaving ${remaining}% for ${nullOptions.length} options.`
    );
  }

  return configs.map((opt) => ({
    label: opt.label,
    chance: opt.chance,
    ratio: opt.ratio == null ? 1 : opt.ratio,
    resolvedChance: opt.chance == null ? autoChance : opt.chance,
  }));
}

export function summarizeResolvedOptions(rawOptions, resolvedOptions) {
  const missingChanceCount = resolvedOptions.filter((opt) => opt.chance == null).length;
  const missingRatioCount = rawOptions.filter((opt) => opt.ratio == null).length;
  const autoChance =
    missingChanceCount > 0
      ? resolvedOptions.find((opt) => opt.chance == null)?.resolvedChance ?? 0
      : 0;
  const totalRatio = resolvedOptions.reduce((sum, opt) => sum + opt.ratio, 0);

  return {
    missingChanceCount,
    missingRatioCount,
    autoChance,
    totalRatio,
  };
}
