/* Shared helpers for Mines multipliers */
export const TOTAL_TILES = 25; // hard-coded 5×5 board
export const HOUSE_EDGE = 0.03; // 3 %

/* simple nCk */
function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
  return r;
}

/**
 * Multiplier for the **next** safe click (or cash-out now).
 * @param bombs   number of mines on board
 * @param kSafe   how many safe tiles are already revealed
 */
export function calcMultiplier(bombs: number, kSafe: number): number {
  if (bombs >= TOTAL_TILES) return 0;
  if (kSafe >= TOTAL_TILES - bombs) return 0;
  const num = binom(TOTAL_TILES, kSafe);
  const denom = binom(TOTAL_TILES - bombs, kSafe);
  return (1 - HOUSE_EDGE) * (num / denom);
}
