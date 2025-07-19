// src/components/games/mines/Store.ts
import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export interface AutoState {
  enabled: boolean; // user ticked “Auto Game”
  running: boolean; // first bet already placed
  roundsPlanned: number;
  currentRound: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export const useMinesStore = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,

    /* RANDOM helpers */
    randomEnabled: false,
    randomTrigger: 0,

    /* CASH-OUT helpers */
    cashoutTrigger: 0,

    /* AUTO-PLAY */
    auto: <AutoState>{
      enabled: false,
      running: false,
      roundsPlanned: 3,
      currentRound: 0,
      stopLoss: null,
      takeProfit: null,
    },
  }),

  /* ─────────────── GETTERS  (pure, side-effect–free) ──────────────── */
  getters: {
    /** board is interactable only between bet and cash-out */
    boardActive: (s) => s.status !== "betActive",

    /** red countdown indicator */
    autoActive: (s) => s.auto.running,

    /** header dropdown locked either while a round is running **or** Auto is armed */
    dropdownLocked: (s) => s.status !== "betActive" || s.auto.enabled,

    /** RANDOM button clickable if round logic enabled _or_ Auto armed  */
    randomButtonEnabled: (s) => s.randomEnabled || s.auto.enabled,

    /** central BET / CASH-OUT button visual state */
    betButtonStatus: (s): ButtonStatus | "betInactive" =>
      s.auto.enabled ? "betInactive" : s.status,
  },

  /* ─────────────── MUTATIONS / ACTIONS  (stateful) ─────────────────── */
  actions: {
    /* ---------- called by Auto-Play modal ---------- */
    setAutoConditions(cfg: {
      rounds: number;
      stopLoss?: number | null;
      takeProfit?: number | null;
    }) {
      this.auto.enabled = true;
      this.auto.running = false; // will start on 1st bet
      this.auto.currentRound = 0;
      this.auto.roundsPlanned = cfg.rounds;
      this.auto.stopLoss = cfg.stopLoss ?? null;
      this.auto.takeProfit = cfg.takeProfit ?? null;
    },

    /* ---------- main BET / CASH-OUT button ---------- */
    handleClick() {
      const wallet = useUserStore();

      /* place bet ----------------------------------------------------- */
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;
        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );

        this.status = "cashoutInactive";
        this.randomEnabled = true;

        if (this.auto.enabled) this.auto.running = true; // start countdown
        return;
      }

      /* cash-out ------------------------------------------------------ */
      if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        this.cashoutTrigger++;
        this.randomEnabled = false;
      }
    },

    /* ---------- board-delegated helpers ---------- */
    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
      this.randomEnabled = false;
    },

    /* RANDOM click */
    pickRandomTile() {
      if (this.randomButtonEnabled) this.randomTrigger++;
    },

    /* ---------- round reset ---------- */
    startNewRound() {
      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;

      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false; // wait for next bet
        if (this.auto.currentRound >= this.auto.roundsPlanned) {
          this.auto.enabled = false; // finished planned rounds
        }
      }
    },

    /* stake helpers --------------------------------------------------- */
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
