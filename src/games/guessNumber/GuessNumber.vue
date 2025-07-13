<template>
  <div class="w-full h-[calc(100vh-64px)] bg-gray-900">
    <GameHeader :title="'Guess Number'" :balance="balance" />
    <div ref="pixiContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Application, Text, Graphics } from "pixi.js";
import GameHeader from "../../components/GameHeader.vue";
import { useUserStore } from "../../stores/user";

const userStore = useUserStore();
const balance = ref(userStore.balance);
const pixiContainer = ref<HTMLDivElement | null>(null);
let app: Application | null = null;
const targetNumber = ref(Math.floor(Math.random() * 10) + 1);
const guess = ref<number | null>(null);

onMounted(async () => {
  if (!pixiContainer.value) return;

  try {
    // Initialize Pixi application with modern v8 syntax
    app = new Application();
    await app.init({
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resizeTo: pixiContainer.value,
    });

    pixiContainer.value.appendChild(app.canvas);

    // Create title text
    const title = new Text({
      text: "Guess a number between 1-10",
      style: {
        fill: "#ffffff",
        fontSize: 24,
        fontFamily: "Arial",
      },
    });
    title.anchor.set(0.5);
    title.position.set(app.screen.width / 2, 100);
    app.stage.addChild(title);

    // Create number buttons with modern Graphics API
    const buttonRadius = 30;
    const buttonPadding = 10;
    const totalWidth = (buttonRadius * 2 + buttonPadding) * 10 - buttonPadding;
    const startX = (app.screen.width - totalWidth) / 2 + buttonRadius;

    for (let i = 1; i <= 10; i++) {
      const button = new Graphics()
        .fill(0x4a5568) // Modern fill syntax
        .circle(0, 0, buttonRadius) // Modern circle syntax
        .fill(); // Commit the fill

      button.x = startX + (i - 1) * (buttonRadius * 2 + buttonPadding);
      button.y = app.screen.height / 2;
      button.interactive = true;
      button.cursor = "pointer";

      const numberText = new Text({
        text: i.toString(),
        style: {
          fill: "#ffffff",
          fontSize: 20,
          fontFamily: "Arial",
        },
      });
      numberText.anchor.set(0.5);
      numberText.position.set(button.x, button.y);

      button.on("pointerdown", () => handleGuess(i));

      app.stage.addChild(button, numberText);
    }

    // Result text
    const resultText = new Text({
      text: "",
      style: {
        fill: "#ffffff",
        fontSize: 24,
        fontFamily: "Arial",
      },
    });
    resultText.anchor.set(0.5);
    resultText.position.set(app.screen.width / 2, app.screen.height - 100);
    app.stage.addChild(resultText);

    function handleGuess(number: number) {
      guess.value = number;

      if (number === targetNumber.value) {
        resultText.text = "Correct! You win 100$";
        balance.value += 100;
        userStore.updateBalance(balance.value);
        targetNumber.value = Math.floor(Math.random() * 10) + 1;
      } else {
        resultText.text =
          number > targetNumber.value
            ? "Too high! Try again"
            : "Too low! Try again";
        balance.value -= 10;
        userStore.updateBalance(balance.value);
      }
    }
  } catch (error) {
    console.error("PixiJS initialization error:", error);
  }
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
  }
});
</script>
