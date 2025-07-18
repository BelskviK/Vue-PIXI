import { defineStore } from "pinia";

/** Global game settings that other modules can subscribe to. */
export const useMinesSettings = defineStore("minesSettings", {
  state: () => ({
    /** Requested number of bombs (always clamped by the board size). */
    minesCount: 3,
  }),
  actions: {
    setMinesCount(n: number) {
      this.minesCount = n;
    },
  },
});
