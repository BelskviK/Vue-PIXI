import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,

    betValue: 0.1,
    cashOut: 0,

    /* RANDOM helpers */
    randomEnabled: false,
    randomTrigger: 0, // board watches increments

    /* CASH-OUT helpers */
    cashoutTrigger: 0, // board watches increments
  }),

  getters: {
    boardActive: (s) => s.status !== "betActive",
  },

  actions: {
    /* ───────── main button ───────── */
    handleClick() {
      const user = useUserStore();

      if (this.status === "betActive") {
        if (user.balance < this.betValue) return;
        user.updateBalance(
          parseFloat((user.balance - this.betValue).toFixed(2))
        );

        this.cashOut = this.betValue;
        this.status = "cashoutInactive";
        this.randomEnabled = true; // 🟢 enable RANDOM
        return;
      }

      if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        this.cashoutTrigger++; // let board handle cash-out flow
        this.randomEnabled = false; // disable RANDOM while settling
      }
    },

    /* ───────── board callbacks ───────── */
    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
      this.randomEnabled = false; // 🔴 disable RANDOM on explosion
    },

    /* ───────── RANDOM button ───────── */
    pickRandomTile() {
      if (!this.randomEnabled) return;
      this.randomTrigger++; // board will reveal 1 tile
    },

    /* ───────── round lifecycle ───────── */
    startNewRound() {
      this.status = "betActive";
      this.cashOut = 0;

      this.randomEnabled = false;
      this.randomTrigger = 0;

      this.cashoutTrigger = 0;
    },

    /* ───────── stake helpers (unchanged) ───────── */
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
