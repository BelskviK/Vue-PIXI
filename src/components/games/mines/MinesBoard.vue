<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "@/components/games/mines/Engine";
import { useMinesSettings } from "@/components/games/mines/settings";

interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* ------------------------------------------------------------------ */
/*  PIXI application bootstrap                                        */
/* ------------------------------------------------------------------ */
const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

/* Tile bookkeeping */
let engine: MinesEngine;
const tiles = new Map<number, Tile>(); // index → Tile reference

/* constants */
const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* ------------------------------------------------------------------ */
/*  Game creation / recreation                                        */
/* ------------------------------------------------------------------ */
const settings = useMinesSettings();
function makeNewGame() {
  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  drawBoard(); // fresh board
}

/* ------------------------------------------------------------------ */
/*  PIXI rendering                                                    */
/* ------------------------------------------------------------------ */
function drawBoard() {
  if (!container.value) return;

  /* === 1. clear stage & bookkeeping === */
  app.stage.removeChildren();
  tiles.clear();

  /* === 2. compute scale to fit parent === */
  const cssW = container.value.clientWidth;
  const cssH = container.value.clientHeight;
  const boardW = props.cols * BASE_W + (props.cols - 1) * GAP;
  const boardH = props.rows * BASE_H + (props.rows - 1) * GAP;
  const scale = Math.min(cssW / boardW, cssH / boardH);
  const offX = (cssW - boardW * scale) / 2;
  const offY = (cssH - boardH * scale) / 2;

  /* === 3. build tiles === */
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const index = r * props.cols + c;
      const t = new Tile();
      t.scale.set(scale);
      t.x = offX + c * (BASE_W + GAP) * scale;
      t.y = offY + r * (BASE_H + GAP) * scale;

      t.eventMode = "static";
      t.cursor = "pointer";
      t.on("pointertap", () => handleTileClick(index));

      tiles.set(index, t);
      app.stage.addChild(t);
    }
  }
  app.renderer.resize(cssW, cssH);
}

/* ------------------------------------------------------------------ */
/*  Interaction & rules                                               */
/* ------------------------------------------------------------------ */
function handleTileClick(index: number) {
  if (engine.exploded || engine.isRevealed(index)) return;

  const result = engine.reveal(index);
  const tile = tiles.get(index)!;

  if (result === "safe") {
    tile.setKind(TileType.StarGold); // yellow star
  } else if (result === "explosion") {
    tile.setKind(TileType.Explosion); // red bomb
    revealAll(); // end round
  }
}

function revealAll() {
  const outcome = engine.revealAll();

  outcome.forEach((state, idx) => {
    const t = tiles.get(idx)!;

    if (state === "bomb" && t.kind === TileType.Hidden)
      t.revealFinal(TileType.Bomb, true); // black bomb, flip anim
    else if (state === "hidden") t.revealFinal(TileType.StarBlue, true); // blue star, flip anim
  });
}

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                         */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  app = new Application();
  await app.init({ backgroundAlpha: 0, autoDensity: true });
  if (container.value) container.value.appendChild(app.canvas);

  makeNewGame(); // first game

  resizeObserver = new ResizeObserver(() => drawBoard());
  resizeObserver.observe(container.value!);
});
onUnmounted(() => {
  resizeObserver?.disconnect();
  app.destroy({ removeView: true }, { children: true, texture: true });
});

/*  React to settings change (new round)  */
watch(
  () => settings.minesCount,
  () => makeNewGame()
);
</script>

<template>
  <!-- fluid container – parent dictates size -->
  <div ref="container" class="w-full h-[80%] select-none touch-none"></div>
</template>

<style scoped></style>
