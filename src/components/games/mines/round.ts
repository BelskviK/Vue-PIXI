import { defineStore } from "pinia";

/**
 * Per-round reactive state (number of tiles revealed, etc.).
 * Other modules (multiplier, auto-bet, cash-out) can subscribe
 * without coupling to board internals.
 */
export const useMinesRound = defineStore("minesRound", {
  state: () => ({
    /** Total tiles on the board for the current round.        */
    totalTiles: 0,
    /** How many tiles the player has revealed so far.         */
    revealedTiles: 0,
  }),

  getters: {
    /** Progress percentage [0-100] for the header bar. */
    progressPercent: (s) =>
      s.totalTiles === 0
        ? 0
        : Math.round((s.revealedTiles / s.totalTiles) * 100),
  },

  actions: {
    /** Call once when a new board is generated. */
    startRound(rows: number, cols: number) {
      this.totalTiles = rows * cols;
      this.revealedTiles = 0;
    },
    /** Call after every successful tile click (safe or bomb). */
    revealOne() {
      this.revealedTiles++;
    },
    /** Call when the engine reveals everything at round-end. */
    revealAll() {
      this.revealedTiles = this.totalTiles;
    },
    /** Optional helper for a hard reset (e.g., leaving game). */
    reset() {
      this.totalTiles = 0;
      this.revealedTiles = 0;
    },
  },
});
