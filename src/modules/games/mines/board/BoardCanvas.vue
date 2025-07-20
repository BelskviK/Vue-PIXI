<template>
  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "./Engine";
import { useMinesSettings } from "@/modules/games/mines/store/settings";
import { useMinesRound } from "@/modules/games/mines/store/round";
import { useMinesUI } from "@/modules/games/mines/store/ui";
import { useUserStore } from "@/stores/user";
import { calcMultiplier } from "@/modules/games/mines/math";

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
let app: Application;
let resizeObserver: ResizeObserver;

/* ---------- state & helpers ---------- */
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
  const t = tiles.get(idx);
  if (t && t.kind === TileType.Preselect) t.setKind(TileType.Hidden);
  syncPreselected();
}

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

/* other flags */
const wallet = useUserStore();
const boardActive = computed(() => ui.boardActive);
let firstSafe = false;

/* ---------- generic helpers ---------- */
function clear(t: ReturnType<typeof setTimeout> | null) {
  if (t) clearTimeout(t);
}
function clearAllTimers() {
  clear(explodeTimer);
  clear(idleTimer);
  clear(settleTimer);
  explodeTimer = idleTimer = settleTimer = null;
}
function scheduleIdleRestart() {
  clear(idleTimer);
  idleTimer = setTimeout(makeNewGame, 30_000);
}

/* ---------- board (re)construction ---------- */
function makeNewGame() {
  clearAllTimers();
  if (!ui.auto.enabled) clearPreselection();

  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  ui.startNewRound();
  firstSafe = false;
  drawBoard();

  ui.maybeAutoBet();
}

/* ---------- drawing ---------- */
function drawBoard() {
  if (!container.value) return;
  app.stage.removeChildren();
  tiles.clear();

  const cssW = container.value.clientWidth,
    cssH = container.value.clientHeight;
  const boardW = props.cols * BASE_W + (props.cols - 1) * GAP;
  const boardH = props.rows * BASE_H + (props.rows - 1) * GAP;
  const scale = Math.min(cssW / boardW, cssH / boardH);
  const offX = (cssW - boardW * scale) / 2,
    offY = (cssH - boardH * scale) / 2;

  for (let r = 0; r < props.rows; r++)
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

      /* keep green tiles visible between rounds */
      if (preselected.has(idx)) t.setKind(TileType.Preselect);
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
  /* Auto-mode green-tile selection */
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

  /* Manual / auto reveal */
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const result = engine.reveal(idx);
  const tile = tiles.get(idx)!;

  if (result === "safe") {
    round.revealOne();
    tile.setKind(TileType.StarGold);

    if (!firstSafe) {
      firstSafe = true;
      ui.activateCashout();
      clear(idleTimer);
    }
  } else {
    tile.setKind(TileType.Explosion);
    finishByExplosion();
  }
}

/* ---------- auto-round helper ---------- */
function runAutoRound() {
  if (!ui.auto.running) return;

  /* 1) reveal every pre-selected tile immediately */
  for (const idx of preselected) {
    if (!engine.isRevealed(idx)) handleTileClick(idx);
    if (engine.exploded) break;
  }

  /* 2) show whole board so the player sees bombs/stars */
  revealAllTiles();

  /* 3) settle the outcome after a short pause */
  clear(settleTimer);
  settleTimer = setTimeout(() => {
    if (engine.exploded) finishByExplosion();
    else finishByCashout();
  }, 250); // just enough for flip animation
}

/* ---------- finishing helpers ---------- */
function revealAllTiles() {
  engine.revealAll().forEach((st, idx) => {
    const t = tiles.get(idx)!;
    if (
      st === "bomb" &&
      (t.kind === TileType.Hidden || t.kind === TileType.Preselect)
    )
      t.revealFinal(TileType.Bomb);
    else if (st === "hidden") t.revealFinal(TileType.StarBlue);
  });
}
function finishByExplosion() {
  round.revealAll();
  ui.forceCashoutInactive();
  clear(idleTimer);

  /* 🚀 give the board 2 s so all tiles finish flipping */
  explodeTimer = setTimeout(makeNewGame, 2_000);
}
function finishByCashout() {
  /* multiplier uses how many SAFE picks the player made */
  const win =
    ui.betValue * calcMultiplier(settings.minesCount, round.revealedTiles);

  ui.forceCashoutInactive();
  round.revealAll();

  settleTimer = setTimeout(() => {
    wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));
    makeNewGame();
  }, 1_000);
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
  app.destroy({ removeView: true }, { children: true, texture: true });
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
  if (!v) clearPreselection();
  applyDim();
});
watch(
  () => ui.status,
  (s) => {
    if (s !== "betActive") clearPreselection();
    if (s === "cashoutInactive" && !firstSafe) scheduleIdleRestart();
    else clear(idleTimer);
  }
);
watch(
  () => ui.randomTrigger,
  (n, o) => {
    if (n > o) {
      if (preselectMode.value) randomPreselect();
      else revealRandomTile();
    }
  }
);
watch(
  () => ui.undoPreselectTrigger,
  (n, o) => {
    if (n > o) deselectOnePreselection();
  }
);
/* === when a new bet is placed in auto mode === */
watch(
  () => ui.auto.running,
  (run) => {
    if (run) runAutoRound();
  }
);

/* fallback helpers for Random button */
function randomPreselect() {
  if (preselected.size >= maxSelectable()) return;
  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!preselected.has(i)) options.push(i);
  if (options.length === 0) return;
  const idx = options[Math.floor(Math.random() * options.length)];
  preselected.add(idx);
  tiles.get(idx)!.setKind(TileType.Preselect);
  syncPreselected();
}
function revealRandomTile() {
  if (!boardActive.value) return;
  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!engine.isRevealed(i)) options.push(i);
  if (options.length === 0) return;
  const idx = options[Math.floor(Math.random() * options.length)];
  handleTileClick(idx);
}
</script>

<style scoped>
/* PIXI fills parent */
</style>
