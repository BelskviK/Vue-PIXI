// src/games/mines/Store.ts
import { defineStore } from "pinia";

export type ButtonStatus =
  | "betActive"
  | "betInactive"
  | "cashoutActive"
  | "cashoutInactive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1, // 🎯 New default bet
  }),
  actions: {
    // existing click flow
    handleClick() {
      console.log("[Store] handleClick – old status =", this.status);
      if (this.status === "betActive") {
        this.status = "betInactive";
        setTimeout(() => {
          this.status = "cashoutActive";
          console.log("[Store] switched to cashoutActive");
        }, 2000);
      } else if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        setTimeout(() => {
          this.status = "betActive";
          console.log("[Store] switched to betActive");
        }, 2000);
      }
    },

    // 🆕 Increase bet by 0.10
    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },

    // 🆕 Decrease bet by 0.10 (clamp at 0.10)
    decreaseBet() {
      const next = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = next >= 0.1 ? next : this.betValue;
    },

    // 🆕 Set to a specific amount (e.g. from dropdown)
    setBetValue(amount: number) {
      this.betValue = parseFloat(amount.toFixed(2));
    },
  },
});
