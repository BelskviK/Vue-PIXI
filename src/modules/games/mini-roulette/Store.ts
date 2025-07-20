// src/games/dice/Store.ts
import { defineStore } from "pinia";

export type ButtonStatus =
  | "betActive"
  | "betInactive"
  | "cashoutActive"
  | "cashoutInactive";

export const useMiniRouletteStore = defineStore("miniroulette", {
  state: () => ({
    status: "betActive" as ButtonStatus,
  }),
  actions: {
    handleClick() {
      if (this.status === "betActive") {
        this.status = "betInactive";
        setTimeout(() => {
          this.status = "cashoutActive";
        }, 2000);
      } else if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        setTimeout(() => {
          this.status = "betActive";
        }, 2000);
      }
    },
  },
});
