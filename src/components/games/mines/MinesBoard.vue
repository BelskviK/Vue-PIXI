<template>
  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "@/components/games/mines/Engine";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { useMinesStore } from "@/components/games/mines/Store";
import { useUserStore } from "@/stores/user";
import { calcMultiplier } from "@/components/games/mines/math";

/* props */
interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* PIXI */
const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

/* engine & tiles */
let engine: MinesEngine;
const tiles = new Map<number, Tile>();
const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* pre-selection (auto-game) */
const preselected = new Set<number>();
const settings = useMinesSettings();
const ui = useMinesStore();
const preselectMode = computed(
  () => ui.auto.enabled && ui.status === "betActive"
);
function clearPreselection() {
  preselected.forEach((idx) => {
    const t = tiles.get(idx);
    if (t && t.kind === TileType.Preselect) t.setKind(TileType.Hidden);
  });
  preselected.clear();
}
function maxSelectable() {
  return props.rows * props.cols - settings.minesCount;
}

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let cashoutTimer: ReturnType<typeof setTimeout> | null = null;

/* stores */
const round = useMinesRound();
const wallet = useUserStore();
const boardActive = computed(() => ui.boardActive);

/* helpers */
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

/* board drawing */
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

/* gameplay */
let firstSafe = false;

/* ────── CLICK HANDLER ─────────────────────────────────────────────── */
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
    return;
  }

  /* Normal play */
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const result = engine.reveal(idx);
  const tile = tiles.get(idx)!;

  if (result === "safe") {
    round.revealOne(); // count only safe reveals
    tile.setKind(TileType.StarGold);

    if (!firstSafe) {
      firstSafe = true;
      ui.activateCashout();
      clear(idleTimer);
    }
  } else {
    // bomb
    tile.setKind(TileType.Explosion);
    finishByExplosion();
  }
}

/* ────── RANDOM ACTIONS ────────────────────────────────────────────── */
function preselectRandomTile() {
  // choose any hidden (non-preselected) tile, respect cap
  if (preselected.size >= maxSelectable()) return;

  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++) {
    if (!preselected.has(i)) options.push(i);
  }
  if (options.length === 0) return;

  const idx = options[Math.floor(Math.random() * options.length)];
  preselected.add(idx);
  tiles.get(idx)!.setKind(TileType.Preselect);
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

/* ────── FINISH ROUND HELPERS ─────────────────────────────────────── */
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

/* lifecycle */
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

/* ────── WATCHERS ─────────────────────────────────────────────────── */
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
</script>

<style scoped>
/* PIXI canvas fills parent */
</style>
