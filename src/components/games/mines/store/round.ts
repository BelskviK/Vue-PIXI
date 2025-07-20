import { defineStore } from "pinia";

/**
 * Per-round reactive state
 */
export const useMinesRound = defineStore("minesRound", {
  state: () => ({
    totalTiles: 0,
    revealedTiles: 0,
    preselectedTiles: 0,

    /* multipliers kept in-store so the whole app sees the same values */
    currentMultiplier: 0, // for cash-out
    nextMultiplier: 0, // preview shown in UI

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
      this.currentMultiplier = 0;
      this.nextMultiplier = 0;
      this.finished = false;
    },
    revealOne() {
      this.revealedTiles++;
    },
    /** while user is selecting green tiles (Auto mode before betting) */
    setPreselected(n: number) {
      this.preselectedTiles = n;
    },
    /** board sends both multipliers */
    setMultipliers(cur: number, nxt: number) {
      this.currentMultiplier = cur;
      this.nextMultiplier = nxt;
    },
    revealAll() {
      this.revealedTiles = this.totalTiles;
      this.preselectedTiles = 0;
      this.finished = true;
    },
    reset() {
      this.totalTiles = 0;
      this.revealedTiles = 0;
      this.preselectedTiles = 0;
      this.currentMultiplier = 0;
      this.nextMultiplier = 0;
      this.finished = false;
    },
  },
});
