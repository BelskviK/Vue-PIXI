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

/* ─── props ─── */
interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* ─── PIXI bootstrap ─── */
const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

/* ─── bookkeeping ─── */
let engine: MinesEngine;
const tiles = new Map<number, Tile>();

const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* ─── stores ─── */
const settings = useMinesSettings();
const round = useMinesRound();
const uiStore = useMinesStore();

/** Board is clickable only after the bet is placed */
const boardActive = computed(() => uiStore.boardActive);

/* ─── helpers ─── */
function makeNewGame() {
  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  uiStore.startNewRound();
  drawBoard();
}

function drawBoard() {
  if (!container.value) return;
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
    }
  }

  app.renderer.resize(cssW, cssH);
  applyDimState(); // set initial contrast
}

function applyDimState() {
  /* Invert: dim when NOT active, brighten when active */
  const dim = !boardActive.value;
  tiles.forEach((t) => t.setDimmed(dim));
}

function handleTileClick(idx: number) {
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const result = engine.reveal(idx);
  const tile = tiles.get(idx)!;
  round.revealOne();

  if (result === "safe") tile.setKind(TileType.StarGold);
  else if (result === "explosion") {
    tile.setKind(TileType.Explosion);
    revealAll();
  }
}

function revealAll() {
  engine.revealAll().forEach((state, idx) => {
    const t = tiles.get(idx)!;
    if (state === "bomb" && t.kind === TileType.Hidden)
      t.revealFinal(TileType.Bomb);
    else if (state === "hidden") t.revealFinal(TileType.StarBlue);
  });
}

/* ─── lifecycle ─── */
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
});

/* ─── watchers ─── */
watch(() => settings.minesCount, makeNewGame);
watch(boardActive, applyDimState); // update contrast on state change
</script>

<style scoped></style>
