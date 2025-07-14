<!-- src/games/mines/MinesGame.vue -->
<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue";
import { Application } from "pixi.js";
import { Header } from "./components/Header";
import { MinesWrapper } from "./components/MinesWrapper";
import { BetControls } from "./components/BetControls";

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
let resizeHandler: (() => void) | null = null;

const HEADER_RATIO = 0.06;
const WRAPPER_RATIO = 0.8;
const CONTROL_RATIO = 0.14;

onMounted(async () => {
  const container = pixiContainer.value!;
  const cw = container.clientWidth;
  const ch = container.clientHeight;

  // Create & append our canvas
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  container.appendChild(canvas);

  // Instantiate and async‐init the Pixi Application
  app = new Application();
  await app.init({
    canvas, // use 'canvas' instead of deprecated 'view' :contentReference[oaicite:0]{index=0}
    width: cw,
    height: ch,
    backgroundColor: 0x0575cf,
    antialias: true,
    autoDensity: true, // handle devicePixelRatio automatically
    resizeTo: container, // built-in resize plugin
  });

  // Build the scene
  const header = new Header(cw, ch * HEADER_RATIO);
  app.stage.addChild(header);

  const mines = new MinesWrapper(cw, ch * WRAPPER_RATIO);
  mines.y = ch * HEADER_RATIO;
  app.stage.addChild(mines);

  const controls = new BetControls(cw, ch * CONTROL_RATIO);
  controls.y = ch * (HEADER_RATIO + WRAPPER_RATIO);
  app.stage.addChild(controls);

  // Window‐resize handler
  resizeHandler = () => {
    if (!app) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    app.renderer.resize(w, h);

    // Header
    const hh = h * HEADER_RATIO;
    header.width = w;
    header.height = hh;

    // Mines grid
    const wh = h * WRAPPER_RATIO;
    mines.width = w;
    mines.height = wh;
    mines.y = hh;

    // Bet controls
    const chh = h * CONTROL_RATIO;
    controls.width = w;
    controls.height = chh;
    controls.y = hh + wh;
  };

  window.addEventListener("resize", resizeHandler);
  resizeHandler();
});

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});
</script>

<template>
  <div class="flex justify-center items-center">
    <div
      ref="pixiContainer"
      class="w-[960px] h-[540px] bg-[#0575CF] rounded-xl"
    ></div>
  </div>
</template>
