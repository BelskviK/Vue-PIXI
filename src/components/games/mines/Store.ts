import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,
    cashOut: 0,
    /** Each manual-cashout click bumps this; board watches it. */
    cashoutTrigger: 0,
  }),

  getters: {
    /** Board works whenever a bet has been placed. */
    boardActive: (s) => s.status !== "betActive",
  },

  actions: {
    /* ─── main button click ─── */
    handleClick() {
      const user = useUserStore();

      /** BET → lock stake */
      if (this.status === "betActive") {
        if (user.balance < this.betValue) return;
        user.updateBalance(
          parseFloat((user.balance - this.betValue).toFixed(2))
        );
        this.cashOut = this.betValue;
        this.status = "cashoutInactive";
        return;
      }

      /** CASH OUT (enabled) → freeze & notify board */
      if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        this.cashoutTrigger++; // let board revealAll + payout
      }
    },

    /** Promote disabled Cash-Out once player reveals 1st safe tile. */
    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },

    /** Explosion or other events can force button to disabled state. */
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
    },

    /** Round reset */
    startNewRound() {
      this.status = "betActive";
      this.cashOut = 0;
      this.cashoutTrigger = 0;
    },

    /* ─── stake helpers (same as before) ─── */
    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },
    decreaseBet() {
      const next = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = next >= 0.1 ? next : this.betValue;
    },
    setBetValue(amount: number) {
      const cap = parseFloat(useUserStore().balance.toFixed(2));
      this.betValue = amount > cap ? cap : parseFloat(amount.toFixed(2));
    },
  },
});
