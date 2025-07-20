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
    },
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
     * Preview of the *next* multiplier, used by the header.
     * Respects preselection count in Auto mode.
     */
    nextMultiplier(): number {
      const settings = useMinesSettings();
      const round = useMinesRound();

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
        // beyond safe limit, round up the *current* multiplier
        const current = calcMultiplier(bombs, safeRevealed);
        return roundUp500(current);
      }
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
        if (this.auto.enabled) {
          this.auto.running = true;
          this.auto.process = true;
        }
        return;
      }

      // ---- request cash-out ----
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
      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;
      this.undoPreselectTrigger = 0;
      this.lastWin = 0;

      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false;
        if (this.auto.currentRound >= this.auto.roundsPlanned) {
          this.auto.enabled = false;
          this.auto.process = false;
        }
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
