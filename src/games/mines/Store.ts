import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus =
  | "betActive"
  | "betInactive"
  | "cashoutActive"
  | "cashoutInactive";

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1, // default starting bet value
  }),
  actions: {
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

    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },
    decreaseBet() {
      const next = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = next >= 0.1 ? next : this.betValue;
    },
    setBetValue(amount: number) {
      // ensure we never exceed user balance
      const userStore = useUserStore();
      const cap = parseFloat(userStore.balance.toFixed(2));
      this.betValue = amount > cap ? cap : parseFloat(amount.toFixed(2));
    },
  },
});
