<template>
  <div class="w-full h-[calc(100vh-64px)] bg-gray-900">
    <GameHeader :title="'Until Bomb'" />
    <div ref="pixiContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { Application, Text } from "pixi.js";
import GameHeader from "../../components/GameHeader.vue";

const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});

onMounted(async () => {
  if (!pixiContainer.value) return;

  try {
    app = new Application({
      backgroundColor: 0x222222,
      resizeTo: pixiContainer.value,
    });

    await app.init();
    pixiContainer.value.appendChild(app.canvas);

    const msg = new Text({
      text: "Keep guessing...",
      style: {
        fill: "#ffffff",
        fontSize: 32,
        fontFamily: "Arial",
      },
    });
    msg.anchor.set(0.5);
    msg.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(msg);
  } catch (error) {
    console.error("PixiJS initialization error:", error);
  }
});
</script>
