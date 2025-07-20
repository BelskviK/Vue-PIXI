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
  startBalance: number;
}

export const useMinesUI = defineStore("mines", {
  state: () => ({
    status: "betActive" as ButtonStatus,
    betValue: 0.1,
    randomEnabled: false,
    randomTrigger: 0,
    cashoutTrigger: 0,
    lastWin: 0,
    undoPreselectTrigger: 0,
    auto: <AutoState>{
      process: false,
      enabled: false,
      running: false,
      roundsPlanned: 3,
      currentRound: 0,
      stopLoss: null,
      takeProfit: null,
      stopRequested: false,
      startBalance: 0,
    },
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
    nextMultiplier(): number {
      const settings = useMinesSettings();
      const round = useMinesRound();
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
      const wallet = useUserStore();
      this.auto.startBalance = wallet.balance;
      this.auto.enabled = true;
      this.auto.running = false;
      this.auto.currentRound = 0;
      this.auto.roundsPlanned = cfg.rounds;
      this.auto.stopLoss = cfg.stopLoss ?? null;
      this.auto.takeProfit = cfg.takeProfit ?? null;
      this.auto.stopRequested = false;
    },

    requestStopAutoGame() {
      if (this.auto.process) this.auto.stopRequested = true;
    },

    stopAutoGame() {
      this.auto.process = false;
      this.auto.running = false;
      this.auto.enabled = false;
      this.auto.stopRequested = false;
    },

    handleClick() {
      const wallet = useUserStore();

      // ── place bet ──
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;
        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );
        this.status = "cashoutInactive";
        this.lastWin = 0; // clear any old win

        if (this.auto.enabled) {
          this.auto.running = true;
          this.auto.process = true;
          this.frozenNextMultiplier = this.nextMultiplier;
        }
        return;
      }

      // ── cash-out ──
      if (this.status === "cashoutActive") {
        const payout = this.betValue * this.nextMultiplier;
        wallet.updateBalance(parseFloat(payout.toFixed(2)));
        // NET profit:
        this.lastWin = parseFloat((payout - this.betValue).toFixed(2));
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
      if (this.auto.enabled && this.status === "betActive")
        this.undoPreselectTrigger++;
    },

    startNewRound() {
      this.frozenNextMultiplier = null;
      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;
      this.undoPreselectTrigger = 0;

      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false;

        // ── Stop-Loss check ──
        if (this.auto.stopLoss !== null) {
          const wallet = useUserStore();
          const loss = this.auto.startBalance - wallet.balance;
          if (loss >= this.auto.stopLoss) {
            this.auto.stopRequested = true;
          }
        }

        // ── Take-Profit check (NET profit only) ──
        if (
          this.auto.takeProfit !== null &&
          this.lastWin >= this.auto.takeProfit
        ) {
          this.auto.stopRequested = true;
        }
      }

      if (
        this.auto.stopRequested ||
        this.auto.currentRound >= this.auto.roundsPlanned
      ) {
        this.stopAutoGame();
      }

      // clear lastWin for next round
      this.lastWin = 0;
    },

    maybeAutoBet() {
      if (
        !this.auto.enabled ||
        this.auto.running ||
        this.status !== "betActive"
      )
        return;

      // stop-loss
      if (this.auto.stopLoss !== null) {
        const wallet = useUserStore();
        const loss = this.auto.startBalance - wallet.balance;
        if (loss >= this.auto.stopLoss) {
          this.auto.stopRequested = true;
          return;
        }
      }

      // take-profit (NET profit only)
      if (
        this.auto.takeProfit !== null &&
        this.lastWin >= this.auto.takeProfit
      ) {
        this.auto.stopRequested = true;
        return;
      }

      setTimeout(() => this.handleClick(), 150);
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
