import { WheelOption } from '../../shared/types/wheel';

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
