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
    cashOut: 0.8, // new cashOut value
  }),
  actions: {
    handleClick() {
      console.log("[Store] handleClick – old status =", this.status);
      if (this.status === "betActive") {
        this.status = "betInactive";
        setTimeout(() => {
          // switch to cashout and record current bet value
          this.cashOut = this.betValue;
          this.status = "cashoutActive";
          console.log(
            "[Store] switched to cashoutActive, cashOut =",
            this.cashOut
          );
        }, 2000);
      } else if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        setTimeout(() => {
          // reset cashOut when going back to bet
          this.cashOut = 0;
          this.status = "betActive";
          console.log(
            "[Store] switched to betActive, cashOut reset to",
            this.cashOut
          );
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
