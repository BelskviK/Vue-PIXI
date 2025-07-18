<template>
  <!-- fluid up to 320 px, then scales with parent -->
  <div ref="container" class="select-none touch-none"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps } from "vue";
import { Application } from "pixi.js";
import { Tile, TILE_CYCLE } from "./Tile";

interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

const DESIGN_W = 415;
const DESIGN_H = 320;

const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* ----------------------------------------------------------------------- */
/* lifecycle                                                               */
/* ----------------------------------------------------------------------- */

onMounted(async () => {
  app = new Application();
  await app.init({
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  if (!container.value) return;
  container.value.appendChild(app.canvas);

  drawBoard();

  resizeObserver = new ResizeObserver(drawBoard);
  resizeObserver.observe(container.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  app.destroy({ removeView: true }, { children: true, texture: true });
});

watch(() => [props.rows, props.cols], drawBoard);

/* ----------------------------------------------------------------------- */
/* drawing + interaction                                                   */
/* ----------------------------------------------------------------------- */

function drawBoard() {
  if (!container.value) return;

  const cssW = container.value.clientWidth;
  const cssH = (DESIGN_H / DESIGN_W) * cssW;

  app.renderer.resize(cssW, cssH);
  app.stage.removeChildren();

  /* intrinsic board size (unscaled) */
  const iw = props.cols * BASE_W + (props.cols - 1) * GAP;
  const ih = props.rows * BASE_H + (props.rows - 1) * GAP;
  const scale = Math.min(cssW / iw, cssH / ih);
  const offX = (cssW - iw * scale) / 2;
  const offY = (cssH - ih * scale) / 2;

  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const tile = new Tile();
      tile.scale.set(scale);
      tile.x = offX + c * (BASE_W + GAP) * scale;
      tile.y = offY + r * (BASE_H + GAP) * scale;

      /* make each tile clickable → cycle through styles */
      tile.eventMode = "static";
      tile.cursor = "pointer";
      tile.on("pointertap", () => tile.next());

      app.stage.addChild(tile);
    }
  }
}
</script>

<style scoped>
/* Pixi renders everything; no extra CSS needed */
</style>
