<template>
  <!-- fluid up to 320px, then scale down to parent width -->
  <div ref="container" class="w-full px-1"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps } from "vue";
import { Application, Graphics } from "pixi.js";

interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
  bgColor?: number;
  dotColor?: number;
}
const props = defineProps<Props>();

const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

// design aspect ratio constants
const DESIGN_WIDTH = 415;
const DESIGN_HEIGHT = 320;

onMounted(async () => {
  app = new Application();

  if (container.value) {
    const cssWidth = container.value.clientWidth;
    const cssHeight = (DESIGN_HEIGHT / DESIGN_WIDTH) * cssWidth;
    const resolution = window.devicePixelRatio || 1;

    await app.init({
      width: cssWidth,
      height: cssHeight,
      backgroundAlpha: 0,
      resolution,
      autoDensity: true,
    });

    container.value.appendChild(app.canvas);
    drawGrid(cssWidth, cssHeight);

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = (DESIGN_HEIGHT / DESIGN_WIDTH) * newW;
        app.renderer.resize(newW, newH);
        drawGrid(newW, newH);
      }
    });
    resizeObserver.observe(container.value);
  }
});

onUnmounted(() => {
  if (resizeObserver && container.value) {
    resizeObserver.unobserve(container.value);
  }
  app.destroy({ removeView: true }, { children: true, texture: true });
});

watch(
  () => [props.rows, props.cols],
  () => {
    if (container.value) {
      const w = container.value.clientWidth;
      const h = (DESIGN_HEIGHT / DESIGN_WIDTH) * w;
      app.stage.removeChildren();
      drawGrid(w, h);
    }
  }
);

function drawGrid(width: number, height: number) {
  const {
    rows,
    cols,
    tileWidth = 64,
    tileHeight = 48,
    padding = 10,
    bgColor = 0x0f2d4e,
    dotColor = 0x2a4b8c,
  } = props;

  const intrinsicW = cols * tileWidth + (cols - 1) * padding;
  const intrinsicH = rows * tileHeight + (rows - 1) * padding;
  const scale = Math.min(width / intrinsicW, height / intrinsicH);

  const scaledTileW = tileWidth * scale;
  const scaledTileH = tileHeight * scale;
  const scaledPadding = padding * scale;
  const cornerRadius = 8 * scale;
  const borderWidth = Math.max(1, Math.round(scale));

  const totalW = intrinsicW * scale;
  const totalH = intrinsicH * scale;
  const startX = (width - totalW) / 2;
  const startY = (height - totalH) / 2;

  app.stage.removeChildren();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xPos = startX + col * (scaledTileW + scaledPadding);
      const yPos = startY + row * (scaledTileH + scaledPadding);

      const shadow = new Graphics()
        .beginFill(0x000000)
        .drawRoundedRect(0, 0, scaledTileW, scaledTileH, cornerRadius)
        .endFill();
      shadow.x = xPos + 1;
      shadow.y = yPos + 1;
      app.stage.addChild(shadow);

      const tile = new Graphics();
      tile.lineStyle(borderWidth, dotColor);
      tile
        .beginFill(bgColor)
        .drawRoundedRect(0, 0, scaledTileW, scaledTileH, cornerRadius)
        .endFill();

      const dotRadius = Math.min(scaledTileW, scaledTileH) * 0.2;
      tile
        .beginFill(dotColor)
        .drawCircle(scaledTileW / 2, scaledTileH / 2, dotRadius)
        .endFill();

      tile.x = xPos;
      tile.y = yPos;
      app.stage.addChild(tile);
    }
  }
}
</script>

<style scoped>
/* no change needed here */
</style>
