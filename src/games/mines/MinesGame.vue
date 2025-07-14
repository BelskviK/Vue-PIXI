<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue";
import * as PIXI from "pixi.js";
import { Background } from "./components/Background";

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: PIXI.Application | null = null;

onMounted(async () => {
  const container = pixiContainer.value;
  if (!container) return;

  try {
    // Initialize PIXI Application
    app = new PIXI.Application({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundAlpha: 0,
      antialias: true,
      resizeTo: container,
    });

    // Wait for application to be ready
    await app.init();

    // Append canvas to container
    container.appendChild(app.canvas);

    // Create background
    const background = new Background(
      container.clientWidth,
      container.clientHeight
    );
    app.stage.addChild(background);

    const resize = () => {
      if (!app || !container) return;
      app.renderer.resize(container.clientWidth, container.clientHeight);
      background.width = container.clientWidth;
      background.height = container.clientHeight;
    };

    window.addEventListener("resize", resize);
    resize();
  } catch (error) {
    console.error("Error initializing PixiJS:", error);
  }
});

onBeforeUnmount(() => {
  if (app) {
    window.removeEventListener("resize", () => {});
    app.destroy(true, {
      children: true,
      texture: true,
    });
    app = null;
  }
});
</script>
<template>
  <div class="flex justify-center items-center">
    <div ref="pixiContainer" class="w-[960px] h-[540px]"></div>
  </div>
</template>
