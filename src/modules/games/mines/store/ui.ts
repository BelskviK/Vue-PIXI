// src/modules/games/mines/store/ui.ts
import { defineStore } from "pinia";
import { useUserStore } from "@/stores/user";
import {
  calcMultiplier,
  roundUp500,
  TOTAL_TILES,
} from "@/modules/games/mines/math";
import { useMinesSettings } from "@/modules/games/mines/store/settings";
import { useMinesRound } from "@/modules/games/mines/store/round";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export interface AutoState {
  process: boolean;
  enabled: boolean;
  running: boolean;
  roundsPlanned: number;
  currentRound: number;
  stopLoss: number | null;
  takeProfit: number | null;
  stopRequested: boolean;
}

export const useMinesUI = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,

    /* RANDOM */
    randomEnabled: false,
    randomTrigger: 0,

    /* CASH-OUT */
    cashoutTrigger: 0,
    lastWin: 0,

    /* one-step undo (Auto) */
    undoPreselectTrigger: 0,

    /* AUTO */
    auto: <AutoState>{
      process: false,
      enabled: false,
      running: false,
      roundsPlanned: 3,
      currentRound: 0,
      stopLoss: null,
      takeProfit: null,
      stopRequested: false,
    },

    /** frozen next-multiplier at Auto start */
    frozenNextMultiplier: null as number | null,
  }),

  getters: {
    autoGameInProgress: (s) => s.auto.process,
    boardActive: (s) => s.status !== "betActive",
    autoActive: (s) => s.auto.running,
    dropdownLocked: (s) => s.status !== "betActive" || s.auto.enabled,

    randomButtonEnabled: (s) =>
      !s.auto.process &&
      ((s.auto.enabled && s.status === "betActive" && !s.auto.running) ||
        (!s.auto.enabled &&
          (s.status === "cashoutInactive" || s.status === "cashoutActive") &&
          s.randomEnabled)),

    betButtonStatus: (s): ButtonStatus | "betInactive" =>
      s.auto.enabled ? "betInactive" : s.status,

    /**
     * Next multiplier: once auto-process has begun, return the frozen value;
     * otherwise compute dynamically.
     */
    nextMultiplier(): number {
      const settings = useMinesSettings();
      const round = useMinesRound();

      // freeze override
      if (this.auto.process && this.frozenNextMultiplier !== null) {
        return this.frozenNextMultiplier;
      }

      if (round.finished || round.totalTiles === 0) {
        return 0;
      }

      const bombs = settings.minesCount;
      const safeRevealed =
        this.auto.enabled && this.status === "betActive"
          ? round.preselectedTiles
          : round.revealedTiles;

      const maxSafe = TOTAL_TILES - bombs;
      const kNext = safeRevealed + 1;

      if (kNext <= maxSafe) {
        return calcMultiplier(bombs, kNext);
      } else {
        const current = calcMultiplier(bombs, safeRevealed);
        return roundUp500(current);
      }
    },

    /**
     * Bet button opacity: 1 when auto running or manual, 0.5 when auto recently stopped
     */
    betButtonOpacity(): number {
      return this.auto.process || this.auto.enabled ? 1 : 0.5;
    },
  },

  actions: {
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
      this.auto.stopRequested = false;
    },

    /**
     * Called by BetAuto button click: defer stopping until end of round
     */
    requestStopAutoGame() {
      if (this.auto.process) {
        this.auto.stopRequested = true;
      }
    },

    /**
     * Internal: immediately halt auto-play
     */
    stopAutoGame() {
      this.auto.process = false;
      this.auto.running = false;
      this.auto.enabled = false;
      this.auto.stopRequested = false;
    },

    handleClick() {
      const wallet = useUserStore();

      // ---- place bet ----
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;
        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );
        this.status = "cashoutInactive";
        if (!this.auto.enabled) {
          this.randomEnabled = true;
        }
        this.lastWin = 0;

        // Freeze preview when Auto actually starts
        if (this.auto.enabled) {
          this.auto.running = true;
          this.auto.process = true;
          this.frozenNextMultiplier = this.nextMultiplier;
        }
        return;
      }

      // ---- cash-out ----
      if (this.status === "cashoutActive") {
        this.status = "cashoutInactive";
        this.randomEnabled = false;
        this.cashoutTrigger++;
      }
    },

    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
      this.randomEnabled = false;
    },

    pickRandomTile() {
      this.randomTrigger++;
    },

    undoPreselectedTile() {
      if (this.auto.enabled && this.status === "betActive") {
        this.undoPreselectTrigger++;
      }
    },

    startNewRound() {
      // clear frozen multiplier
      this.frozenNextMultiplier = null;

      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;
      this.undoPreselectTrigger = 0;
      this.lastWin = 0;

      // advance rounds if auto
      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false;
      }

      // after board reset, handle stop request or completion
      if (
        this.auto.stopRequested ||
        this.auto.currentRound >= this.auto.roundsPlanned
      ) {
        this.stopAutoGame();
      }
    },

    maybeAutoBet() {
      if (
        this.auto.enabled &&
        !this.auto.running &&
        this.status === "betActive"
      ) {
        setTimeout(() => this.handleClick(), 150);
      }
    },

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
