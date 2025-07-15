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
  },
});
