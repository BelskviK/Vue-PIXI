// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// Core pages
import GameView from "@/pages/GameView.vue";

// Deferred (lazy) imports for each game
const Dice = () => import("@/pages/games/dice/index.vue");
const Plinko = () => import("@/pages/games/plinko/index.vue");
const Goal = () => import("@/pages/games/goal/index.vue");
const HiLo = () => import("@/pages/games/hi-lo/index.vue");
const Mines = () => import("@/pages/games/mines/index.vue");
const Keno = () => import("@/pages/games/keno/index.vue");
const MiniRoulette = () => import("@/pages/games/mini-roulette/index.vue");
const Hotline = () => import("@/pages/games/hotline/index.vue");
const Balloon = () => import("@/pages/games/balloon/index.vue");

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/games/mines" },

  // Individual game routes
  { path: "/games/dice", name: "Dice", component: Dice },
  { path: "/games/plinko", name: "Plinko", component: Plinko },
  { path: "/games/goal", name: "Goal", component: Goal },
  { path: "/games/hi-lo", name: "HiLo", component: HiLo },
  { path: "/games/mines", name: "Mines", component: Mines },
  { path: "/games/keno", name: "Keno", component: Keno },
  {
    path: "/games/mini-roulette",
    name: "MiniRoulette",
    component: MiniRoulette,
  },
  { path: "/games/hotline", name: "Hotline", component: Hotline },
  { path: "/games/balloon", name: "Balloon", component: Balloon },

  // Fallback for any unknown game id
  { path: "/games/:id", name: "GameView", component: GameView, props: true },

  // Catch-all redirect
  { path: "/:pathMatch(.*)*", redirect: "/games/mines" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
