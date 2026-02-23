import { WheelOptionConfig, WheelOption } from './types';

/**
 * Validates and resolves chances for wheel options.
 *
 * - Options with a `chance` value use that as their win percentage.
 * - Options with `null`/`undefined` chance split the remaining percentage equally.
 * - Throws if any chance is negative, total explicit chances exceed 100%,
 *   or the resolved total does not equal 100%.
 */
export function resolveChances(configs: WheelOptionConfig[]): WheelOption[] {
  if (configs.length === 0) {
    throw new Error('Wheel must have at least one option.');
  }

  const explicitOptions: WheelOptionConfig[] = [];
  const nullOptions: WheelOptionConfig[] = [];

  for (const opt of configs) {
    if (opt.chance != null) {
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

  const explicitTotal = explicitOptions.reduce((sum, o) => sum + (o.chance as number), 0);

  if (explicitTotal > 100) {
    throw new Error(
      `Total explicit chances add up to ${explicitTotal}%, which exceeds 100%.`
    );
  }

  const remaining = 100 - explicitTotal;

  if (nullOptions.length === 0 && Math.abs(explicitTotal - 100) > 0.001) {
    throw new Error(
      `Total chances add up to ${explicitTotal}%, but must equal 100%.`
    );
  }

  const autoChance = nullOptions.length > 0 ? remaining / nullOptions.length : 0;

  if (autoChance < 0) {
    throw new Error(
      `Cannot distribute remaining chance. Explicit chances total ${explicitTotal}%, leaving ${remaining}% for ${nullOptions.length} options.`
    );
  }

  return configs.map((opt) => ({
    ...opt,
    resolvedChance: opt.chance != null ? opt.chance : autoChance,
  }));
}

/**
 * Pick a winner based on resolved chances (weighted random).
 * Returns the index of the winning option.
 */
export function pickWinnerIndex(options: WheelOption[]): number {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (let i = 0; i < options.length; i++) {
    cumulative += options[i].resolvedChance;
    if (roll <= cumulative) return i;
  }

  return options.length - 1;
}

/**
 * Calculate the target rotation angle to land on a specific option index.
 * Uses ratio for visual slice sizing (same as the wheel drawing).
 */
export function getTargetAngleForIndex(options: WheelOption[], winnerIndex: number): number {
  const totalRatio = options.reduce((sum, o) => sum + o.ratio, 0);

  // Calculate the start and end angle of the winning slice
  let startAngle = 0;
  for (let i = 0; i < winnerIndex; i++) {
    startAngle += (options[i].ratio / totalRatio) * 2 * Math.PI;
  }
  const sliceAngle = (options[winnerIndex].ratio / totalRatio) * 2 * Math.PI;

  // Land somewhere in the middle of the slice (with some randomness)
  const landAngle = startAngle + sliceAngle * (0.2 + Math.random() * 0.6);

  // The pointer is at the top (-π/2 = 3π/2). We need to rotate the wheel
  // so that `landAngle` aligns with the pointer.
  // Final rotation = (3π/2 - landAngle) + full spins for visual effect
  const fullSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
  return fullSpins + (Math.PI * 1.5 - landAngle);
}
