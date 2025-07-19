import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus = "betActive" | "cashoutInactive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,
    cashOut: 0,
  }),

  getters: {
    /** The board is clickable only when Cash-Out is showing (but disabled). */
    boardActive: (s) => s.status === "cashoutInactive",
  },

  actions: {
    /** Called by Bet button. */
    handleClick() {
      if (this.status !== "betActive") return; // ignore while disabled
      this.cashOut = this.betValue; // lock wager
      this.status = "cashoutInactive"; // show disabled Cash-Out
    },

    /** Convenience when a brand-new round begins. */
    startNewRound() {
      this.status = "betActive";
      this.cashOut = 0;
    },

    /* bet-amount helpers (unchanged) */
    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },
    decreaseBet() {
      const next = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = next >= 0.1 ? next : this.betValue;
    },
    setBetValue(amount: number) {
      const userStore = useUserStore();
      const cap = parseFloat(userStore.balance.toFixed(2));
      this.betValue = amount > cap ? cap : parseFloat(amount.toFixed(2));
    },
  },
});
