import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: "Guest",
    balance: 1000.22,
    isLoggedIn: false,
  }),
  actions: {
    updateBalance(amount: number) {
      this.balance = amount;
    },
    login(name: string) {
      this.name = name;
      this.isLoggedIn = true;
    },
    logout() {
      this.name = "Guest";
      this.balance = 1000.0;
      this.isLoggedIn = false;
    },
  },
});
