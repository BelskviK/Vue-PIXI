<template>
  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType, FLIP_HALF_DURATION } from "./Tile";
import { MinesEngine } from "./Engine";
import { useMinesSettings } from "@/modules/games/mines/store/settings";
import { useMinesRound } from "@/modules/games/mines/store/round";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import { useUserStore } from "@/stores/user";
import {
  calcMultiplier,
  TOTAL_TILES,
  roundUp500,
} from "@/modules/games/mines/math";

/* ---------- props ---------- */
interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* ---------- PIXI ---------- */
const container = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let resizeObserver: ResizeObserver;

/* ---------- game state ---------- */
let engine: MinesEngine;
const tiles = new Map<number, Tile>();
const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* pre-selection */
const preselected = new Set<number>();
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesUI();
const preselectMode = computed(
  () => ui.auto.enabled && ui.status === "betActive"
);
function maxSelectable() {
  return props.rows * props.cols - settings.minesCount;
}
function syncPreselected() {
  round.setPreselected(preselected.size);
}
function clearPreselection() {
  preselected.forEach((idx) => {
    const t = tiles.get(idx);
    if (t && t.kind === TileType.Preselect) t.setKind(TileType.Hidden);
  });
  preselected.clear();
  syncPreselected();
}
function deselectOnePreselection() {
  if (preselected.size === 0) return;
  const idx = Array.from(preselected).pop()!;
  preselected.delete(idx);
  tiles.get(idx)?.setKind(TileType.Hidden);
  syncPreselected();
}

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

/* misc */
const wallet = useUserStore();
const boardActive = computed(() => ui.boardActive);
let firstSafe = false;
function clear(t: ReturnType<typeof setTimeout> | null) {
  if (t) clearTimeout(t);
}
function clearAllTimers() {
  [explodeTimer, idleTimer, settleTimer].forEach(clear);
  explodeTimer = idleTimer = settleTimer = null;
}

/* ---------- helper – reset animation ---------- */
const RESET_TOTAL = (FLIP_HALF_DURATION * 2 + 0.05) * 1000; // extra 50 ms safety

function animateReset() {
  /* vertical flip every tile to Hidden / Preselect */
  tiles.forEach((t, idx) => {
    const target = preselected.has(idx) ? TileType.Preselect : TileType.Hidden;
    t.resetTo(target);
  });

  /* after flip finishes, build the new board */
  setTimeout(() => makeNewGame(), RESET_TOTAL);
}

/* ---------- auto cash-out ---------- */
function scheduleAutoCashout() {
  clear(idleTimer);
  idleTimer = setTimeout(finishByCashout, 30_000);
}

/* ---------- lifecycle of a round ---------- */
function makeNewGame() {
  clearAllTimers();

  /* first chance: manual mode → wipe greens immediately */
  if (!ui.auto.enabled) clearPreselection();

  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  ui.startNewRound();

  /* second chance: just after Auto turns itself OFF */
  if (!ui.auto.enabled) clearPreselection();

  firstSafe = false;
  drawBoard();

  ui.maybeAutoBet();
}

/* ---------- drawing ---------- */
function drawBoard() {
  if (!container.value || !app) return;

  app.stage.removeChildren();
  tiles.clear();

  const cssW = container.value.clientWidth;
  const cssH = container.value.clientHeight;
  const boardW = props.cols * BASE_W + (props.cols - 1) * GAP;
  const boardH = props.rows * BASE_H + (props.rows - 1) * GAP;
  const scale = Math.min(cssW / boardW, cssH / boardH);
  const offX = (cssW - boardW * scale) / 2;
  const offY = (cssH - boardH * scale) / 2;

  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const idx = r * props.cols + c;
      const t = new Tile();
      t.scale.set(scale);
      t.position.set(
        offX + c * (BASE_W + GAP) * scale,
        offY + r * (BASE_H + GAP) * scale
      );
      t.eventMode = "static";
      t.cursor = "pointer";
      t.on("pointertap", () => handleTileClick(idx));
      tiles.set(idx, t);
      app.stage.addChild(t);

      if (preselected.has(idx)) t.setKind(TileType.Preselect);
    }
  }

  app.renderer.resize(cssW, cssH);
  applyDim();
}
function applyDim() {
  const dim = !boardActive.value && !preselectMode.value;
  tiles.forEach((t) => t.setDimmed(dim));
}

/* ---------- gameplay ---------- */
function handleTileClick(idx: number) {
  if (preselectMode.value) {
    if (preselected.has(idx)) {
      preselected.delete(idx);
      tiles.get(idx)!.setKind(TileType.Hidden);
    } else if (preselected.size < maxSelectable()) {
      preselected.add(idx);
      tiles.get(idx)!.setKind(TileType.Preselect);
    }
    syncPreselected();
    return;
  }

  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const res = engine.reveal(idx);
  const t = tiles.get(idx)!;

  if (res === "safe") {
    round.revealOne();
    t.setKind(TileType.StarGold);
    clear(idleTimer);
    scheduleAutoCashout();
    if (!firstSafe) {
      firstSafe = true;
      ui.activateCashout();
    }
  } else {
    t.setKind(TileType.Explosion);
    finishByExplosion();
  }
}

/* ---------- AUTO helpers ---------- */
function revealPreselectedLogic(): boolean {
  let exploded = false;
  preselected.forEach((idx) => {
    if (engine.isRevealed(idx)) return;
    const r = engine.reveal(idx);
    if (r === "explosion") exploded = true;
    else round.revealOne();
  });
  if (preselected.size) round.setPreselected(0);
  return exploded;
}
function runAutoRound() {
  if (!ui.auto.running) return;
  const exploded = revealPreselectedLogic();
  clear(settleTimer);
  settleTimer = setTimeout(() => {
    exploded ? finishByExplosion() : finishByCashout();
  }, 0);
}

/* ---------- reveal helpers ---------- */
function revealAllTiles() {
  engine.revealAll().forEach((st, idx) => {
    const t = tiles.get(idx)!;
    const wasPre = preselected.has(idx);

    let target: TileType | null = null;
    switch (st) {
      case "bomb":
        target = wasPre ? TileType.Explosion : TileType.Bomb;
        break;
      case "hidden":
        target = wasPre ? TileType.StarGold : TileType.StarBlue;
        break;
      case "explosion":
        target = TileType.Explosion;
        break;
      case "safe":
        target = TileType.StarGold;
        break;
    }
    if (target && t.kind !== target) t.revealFinal(target);
  });
}

/* ---------- round finish ---------- */
function hasMoreAutoRounds(): boolean {
  /* true when Auto is ON and at least one more round is queued */
  return ui.auto.enabled && ui.auto.currentRound < ui.auto.roundsPlanned;
}

function finishByExplosion() {
  clearAllTimers();
  revealAllTiles();
  round.revealAll();
  ui.forceCashoutInactive();

  explodeTimer = setTimeout(() => {
    hasMoreAutoRounds() ? animateReset() : makeNewGame();
  }, 2_000);
}

function finishByCashout() {
  clearAllTimers();

  const bombs = settings.minesCount;
  const kSafe = round.revealedTiles;
  const maxSafe = TOTAL_TILES - bombs;
  const kNext = kSafe + 1;

  const nextMult =
    kNext <= maxSafe
      ? calcMultiplier(bombs, kNext)
      : roundUp500(calcMultiplier(bombs, kSafe));

  const win = parseFloat((ui.betValue * nextMult).toFixed(2));
  ui.lastWin = win;
  ui.forceCashoutInactive();
  round.revealAll();

  revealAllTiles();
  settleTimer = setTimeout(() => {
    wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));
    hasMoreAutoRounds() ? animateReset() : makeNewGame();
  }, 2_000);
}

/* ---------- lifecycle ---------- */
onMounted(async () => {
  app = new Application();
  await app.init({
    resolution: Math.ceil(window.devicePixelRatio * 2),
    backgroundAlpha: 0,
    autoDensity: true,
    antialias: true,
  });
  container.value?.appendChild(app.canvas);
  makeNewGame();
  resizeObserver = new ResizeObserver(drawBoard);
  resizeObserver.observe(container.value!);
});
onUnmounted(() => {
  resizeObserver?.disconnect();
  app?.destroy({ removeView: true }, { children: true, texture: true });
  clearAllTimers();
});

/* ---------- watchers ---------- */
watch(
  () => settings.minesCount,
  () => {
    clearPreselection();
    makeNewGame();
  }
);
watch(boardActive, applyDim);
watch(preselectMode, (v) => {
  if (!v && !ui.auto.enabled) clearPreselection();
  applyDim();
});
watch(
  () => ui.cashoutTrigger,
  (n, o) => {
    if (n > o) finishByCashout();
  }
);
watch(
  () => ui.randomTrigger,
  (n, o) => {
    if (n > o) (preselectMode.value ? randomPreselect : revealRandomTile)();
  }
);
watch(
  () => ui.undoPreselectTrigger,
  (n, o) => {
    if (n > o) deselectOnePreselection();
  }
);
watch(
  () => ui.auto.running,
  (run) => run && runAutoRound()
);

/* ---------- random helpers ---------- */
function randomPreselect() {
  if (preselected.size >= maxSelectable()) return;
  const pool = Array.from(
    { length: props.rows * props.cols },
    (_, i) => i
  ).filter((i) => !preselected.has(i));
  if (pool.length === 0) return;
  const idx = pool[Math.floor(Math.random() * pool.length)];
  preselected.add(idx);
  tiles.get(idx)!.setKind(TileType.Preselect);
  syncPreselected();
}
function revealRandomTile() {
  const pool = Array.from(
    { length: props.rows * props.cols },
    (_, i) => i
  ).filter((i) => !engine.isRevealed(i));
  if (pool.length === 0) return;
  handleTileClick(pool[Math.floor(Math.random() * pool.length)]);
}
</script>

<style scoped>
/* PIXI fills parent */
</style>
