/* Shared helpers for Mines multipliers */
export const TOTAL_TILES = 25; // fixed 5×5 board
export const HOUSE_EDGE = 0.03; // 3 %

/**
 * Cash-out multiplier after `kSafe` successful reveals.
 * Also used for preview by passing `kSafe + 1`.
 */
export function calcMultiplier(bombs: number, kSafe: number): number {
  if (bombs <= 0 || bombs >= TOTAL_TILES) return 0;
  if (kSafe <= 0) return 0;
  if (kSafe > TOTAL_TILES - bombs) return 0; // cannot go further

  let mult = 1;
  for (let i = 0; i < kSafe; i++) {
    const remaining = TOTAL_TILES - i;
    mult *= remaining / (remaining - bombs);
  }
  return mult * (1 - HOUSE_EDGE);
}

/** Round *up* to the next multiple of 500 (for last-safe preview) */
export function roundUp500(n: number): number {
  return Math.ceil(n / 500) * 500;
}
