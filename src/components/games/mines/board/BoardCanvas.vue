<template>
  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "./Engine";
import { useMinesSettings } from "@/components/games/mines/store/settings";
import { useMinesRound } from "@/components/games/mines/store/round";
import { useMinesUI } from "@/components/games/mines/store/ui";
import { useUserStore } from "@/stores/user";
import { calcMultiplier } from "@/components/games/mines/math";

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
/* NEW — remove only the most-recent green tile */
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
let cashoutTimer: ReturnType<typeof setTimeout> | null = null;

/* other stores & flags */
const wallet = useUserStore();
const boardActive = computed(() => ui.boardActive);
let firstSafe = false;

/* ---------- core helpers ---------- */
function clear(t: ReturnType<typeof setTimeout> | null) {
  if (t) clearTimeout(t);
}
function clearAllTimers() {
  clear(explodeTimer);
  explodeTimer = null;
  clear(idleTimer);
  idleTimer = null;
  clear(cashoutTimer);
  cashoutTimer = null;
}
function scheduleIdleRestart() {
  clear(idleTimer);
  idleTimer = setTimeout(makeNewGame, 30_000);
}
function makeNewGame() {
  clearAllTimers();
  clearPreselection();
  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  ui.startNewRound();
  firstSafe = false;
  drawBoard();
}

/* ---------- board drawing ---------- */
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
  /* Auto-game pre-selection */
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

  /* Normal play */
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

/* RANDOM helpers */
function preselectRandomTile() {
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
function randomAction() {
  if (preselectMode.value) preselectRandomTile();
  else revealRandomTile();
}

/* round-finishing helpers */
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
  revealAllTiles();
  round.revealAll();
  ui.forceCashoutInactive();
  clear(idleTimer);
  explodeTimer = setTimeout(makeNewGame, 5_000);
}
function finishByCashout() {
  revealAllTiles();
  round.revealAll();
  ui.forceCashoutInactive();

  const win =
    ui.betValue * calcMultiplier(settings.minesCount, round.revealedTiles);
  cashoutTimer = setTimeout(() => {
    wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));
    makeNewGame();
  }, 5_000);
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
  () => ui.cashoutTrigger,
  (n, o) => {
    if (n > o) finishByCashout();
  }
);
watch(
  () => ui.randomTrigger,
  (n, o) => {
    if (n > o) randomAction();
  }
);
/* NEW — watch for single-tile undo */
watch(
  () => ui.undoPreselectTrigger,
  (n, o) => {
    if (n > o) deselectOnePreselection();
  }
);
</script>

<style scoped>
/* PIXI canvas fills the parent */
</style>
