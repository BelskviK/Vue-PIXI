import { defineStore } from "pinia";

/**
 * Per-round reactive state
 */
export const useMinesRound = defineStore("minesRound", {
  state: () => ({
    totalTiles: 0,
    revealedTiles: 0,
    preselectedTiles: 0, // ← NEW
    finished: false,
  }),

  getters: {
    progressPercent: (s) =>
      s.totalTiles === 0
        ? 0
        : Math.round(
            ((s.revealedTiles + s.preselectedTiles) / s.totalTiles) * 100
          ),
  },

  actions: {
    startRound(r: number, c: number) {
      this.totalTiles = r * c;
      this.revealedTiles = 0;
      this.preselectedTiles = 0;
      this.finished = false;
    },
    revealOne() {
      this.revealedTiles++;
    },
    /** called by board while user is choosing green tiles */
    setPreselected(n: number) {
      this.preselectedTiles = n;
    },
    /** mark round ended (explosion OR manual cash-out) */
    revealAll() {
      this.revealedTiles = this.totalTiles;
      this.preselectedTiles = 0;
      this.finished = true;
    },
    reset() {
      this.totalTiles = 0;
      this.revealedTiles = 0;
      this.preselectedTiles = 0;
      this.finished = false;
    },
  },
});
