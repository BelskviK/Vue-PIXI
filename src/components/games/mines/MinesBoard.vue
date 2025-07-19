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

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let cashoutTimer: ReturnType<typeof setTimeout> | null = null;

/* stores */
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesStore();
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
  const dim = !boardActive.value;
  tiles.forEach((t) => t.setDimmed(dim));
}

/* gameplay */
let firstSafe = false;

function handleTileClick(idx: number) {
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const result = engine.reveal(idx);
  const tile = tiles.get(idx)!;

  if (result === "safe") {
    round.revealOne(); // ✅ count only safe reveals
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
  round.revealAll(); // mark finished (freezes multiplier)
  ui.forceCashoutInactive();
  clear(idleTimer);
  explodeTimer = setTimeout(makeNewGame, 5_000);
}

function finishByCashout() {
  revealAllTiles();
  round.revealAll(); // mark finished
  ui.forceCashoutInactive();

  const win =
    ui.betValue * calcMultiplier(settings.minesCount, round.revealedTiles);
  cashoutTimer = setTimeout(() => {
    wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));
    makeNewGame();
  }, 5_000);
}

/* RANDOM support */
function revealRandomTile() {
  if (!boardActive.value) return;
  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!engine.isRevealed(i)) options.push(i);
  if (options.length === 0) return;
  const idx = options[Math.floor(Math.random() * options.length)];
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
    if (n > o) revealRandomTile();
  }
);
</script>

<style scoped></style>
