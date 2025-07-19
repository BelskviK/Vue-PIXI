// src/components/games/mines/Store.ts
import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { calcMultiplier } from "@/components/games/mines/math";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export interface AutoState {
  enabled: boolean;
  running: boolean;
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
    lastWin: 0, // ← NEW — stores the last cashed-out amount

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

  /* ─────────────── GETTERS ─────────────── */
  getters: {
    boardActive: (s) => s.status !== "betActive",
    autoActive: (s) => s.auto.running,
    dropdownLocked: (s) => s.status !== "betActive" || s.auto.enabled,
    randomButtonEnabled: (s) => s.randomEnabled || s.auto.enabled,
    betButtonStatus: (s): ButtonStatus | "betInactive" =>
      s.auto.enabled ? "betInactive" : s.status,
  },

  /* ─────────────── ACTIONS ─────────────── */
  actions: {
    /* ---------- called by Auto-Play modal ---------- */
    setAutoConditions(cfg: {
      rounds: number;
      stopLoss?: number | null;
      takeProfit?: number | null;
    }) {
      this.auto.enabled = true;
      this.auto.running = false;
      this.auto.currentRound = 0;
      this.auto.roundsPlanned = cfg.rounds;
      this.auto.stopLoss = cfg.stopLoss ?? null;
      this.auto.takeProfit = cfg.takeProfit ?? null;
    },

    /* ---------- main BET / CASH-OUT button ---------- */
    handleClick() {
      const wallet = useUserStore();
      const settings = useMinesSettings();
      const round = useMinesRound();

      /* place bet --------------------------------------------------- */
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;

        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );

        this.status = "cashoutInactive";
        this.randomEnabled = true;
        this.lastWin = 0; // reset preview before the round
        if (this.auto.enabled) this.auto.running = true;
        return;
      }

      /* cash-out ---------------------------------------------------- */
      if (this.status === "cashoutActive") {
        // calculate win
        const mult = calcMultiplier(settings.minesCount, round.revealedTiles);
        const win = parseFloat((this.betValue * mult).toFixed(2));

        wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));

        this.lastWin = win; // ← store the amount for frozen display
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
      this.lastWin = 0; // clear frozen value for next round

      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false;
        if (this.auto.currentRound >= this.auto.roundsPlanned) {
          this.auto.enabled = false;
        }
      }
    },

    /* stake helpers ----------------------------------------------- */
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
