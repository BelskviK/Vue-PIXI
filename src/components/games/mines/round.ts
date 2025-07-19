import { defineStore } from "pinia";

/**
 * Per-round reactive state (revealed count, finished flag, …)
 */
export const useMinesRound = defineStore("minesRound", {
  state: () => ({
    totalTiles: 0,
    revealedTiles: 0,
    finished: false, // ⬅️  new
  }),

  getters: {
    progressPercent: (s) =>
      s.totalTiles === 0
        ? 0
        : Math.round((s.revealedTiles / s.totalTiles) * 100),
  },

  actions: {
    startRound(r: number, c: number) {
      this.totalTiles = r * c;
      this.revealedTiles = 0;
      this.finished = false;
    },
    revealOne() {
      this.revealedTiles++;
    },
    /** mark round ended (called on explosion *or* manual cash-out) */
    revealAll() {
      this.revealedTiles = this.totalTiles;
      this.finished = true;
    },
    reset() {
      this.totalTiles = 0;
      this.revealedTiles = 0;
      this.finished = false;
    },
  },
});
