<template>
  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "@/components/games/mines/Engine";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { useMinesStore } from "@/components/games/mines/Store";
import { useUserStore } from "@/stores/user";

/* props */
interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* pixi */
const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

/* engine & tiles */
let engine: MinesEngine;
const tiles = new Map<number, Tile>();
const BASE_W = props.tileWidth ?? 64,
  BASE_H = props.tileHeight ?? 48,
  GAP = props.padding ?? 10;

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let cashoutTimer: ReturnType<typeof setTimeout> | null = null;

/* stores */
const settings = useMinesSettings(),
  round = useMinesRound(),
  ui = useMinesStore(),
  user = useUserStore();
const boardActive = computed(() => ui.boardActive);

/* helpers */
function clearTimer(t: ReturnType<typeof setTimeout> | null) {
  if (t) clearTimeout(t);
}
function clearAllTimers() {
  clearTimer(explodeTimer);
  explodeTimer = null;
  clearTimer(idleTimer);
  idleTimer = null;
  clearTimer(cashoutTimer);
  cashoutTimer = null;
}
function scheduleIdleRestart() {
  clearTimer(idleTimer);
  idleTimer = setTimeout(makeNewGame, 30_000);
}

function makeNewGame() {
  clearAllTimers();
  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  ui.startNewRound();
  firstSafe = false;
  drawBoard();
}
function drawBoard() {
  if (!container.value) return;
  app.stage.removeChildren();
  tiles.clear();
  const cssW = container.value.clientWidth,
    cssH = container.value.clientHeight;
  const boardW = props.cols * BASE_W + (props.cols - 1) * GAP,
    boardH = props.rows * BASE_H + (props.rows - 1) * GAP;
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
  const dim = !boardActive.value;
  tiles.forEach((t) => t.setDimmed(dim));
}

/* gameplay */
let firstSafe = false;
function handleTileClick(idx: number) {
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;
  const res = engine.reveal(idx);
  const tile = tiles.get(idx)!;
  round.revealOne();
  if (res === "safe") {
    tile.setKind(TileType.StarGold);
    if (!firstSafe) {
      firstSafe = true;
      ui.activateCashout();
      clearTimer(idleTimer);
    }
  } else {
    tile.setKind(TileType.Explosion);
    finishByExplosion();
  }
}
function revealAllTiles() {
  engine.revealAll().forEach((st, idx) => {
    const t = tiles.get(idx)!;
    if (st === "bomb" && t.kind === TileType.Hidden)
      t.revealFinal(TileType.Bomb);
    else if (st === "hidden") t.revealFinal(TileType.StarBlue);
  });
}
function finishByExplosion() {
  revealAllTiles();
  ui.forceCashoutInactive();
  clearTimer(idleTimer);
  explodeTimer = setTimeout(makeNewGame, 5_000);
}
function finishByCashout() {
  revealAllTiles();
  ui.forceCashoutInactive();
  cashoutTimer = setTimeout(() => {
    user.updateBalance(parseFloat((user.balance + ui.cashOut).toFixed(2)));
    makeNewGame();
  }, 5_000);
}
/* RANDOM support */
function revealRandomTile() {
  if (!boardActive.value) return;
  const candidates: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!engine.isRevealed(i)) candidates.push(i);
  if (candidates.length === 0) return;
  const idx = candidates[Math.floor(Math.random() * candidates.length)];
  handleTileClick(idx);
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

/* watchers */
watch(() => settings.minesCount, makeNewGame);
watch(boardActive, applyDim);
watch(
  () => ui.status,
  (s) => {
    if (s === "cashoutInactive" && !firstSafe) scheduleIdleRestart();
    else clearTimer(idleTimer);
  }
);
/* cash-out trigger */
watch(
  () => ui.cashoutTrigger,
  (n, o) => {
    if (n > o) finishByCashout();
  }
);
/* random trigger */
watch(
  () => ui.randomTrigger,
  (n, o) => {
    if (n > o) revealRandomTile();
  }
);
</script>

<style scoped></style>
