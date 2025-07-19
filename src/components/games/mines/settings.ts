import { defineStore } from "pinia";

/** Global game settings that other modules can subscribe to. */
export const useMinesSettings = defineStore("minesSettings", {
  state: () => ({
    /** Bombs on the board (clamped 1-20). */
    minesCount: 3,
  }),
  actions: {
    setMinesCount(n: number) {
      /* clamp to the allowed range 1-20 */
      this.minesCount = Math.min(20, Math.max(1, Math.floor(n)));
    },
  },
});
