import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,

    /* RANDOM helpers */
    randomEnabled: false,
    randomTrigger: 0,

    /* CASH-OUT helpers */
    cashoutTrigger: 0,
  }),

  getters: { boardActive: (s) => s.status !== "betActive" },

  actions: {
    handleClick() {
      const wallet = useUserStore();

      /* place bet */
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;
        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );
        this.status = "cashoutInactive";
        this.randomEnabled = true;
        return;
      }

      /* cash-out */
      if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        this.cashoutTrigger++;
        this.randomEnabled = false;
      }
    },

    /* board delegates */
    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
      this.randomEnabled = false;
    },

    /* RANDOM click */
    pickRandomTile() {
      if (this.randomEnabled) this.randomTrigger++;
    },

    /* round reset */
    startNewRound() {
      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;
    },

    /* bet adjust */
    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },
    decreaseBet() {
      const nxt = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = nxt >= 0.1 ? nxt : this.betValue;
    },
    setBetValue(v: number) {
      const cap = parseFloat(useUserStore().balance.toFixed(2));
      this.betValue = v > cap ? cap : parseFloat(v.toFixed(2));
    },
  },
});
