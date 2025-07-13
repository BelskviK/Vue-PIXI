// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import GameLobby from "../pages/GameLobby.vue";
import GameView from "../pages/GameView.vue";

const routes: RouteRecordRaw[] = [
  { path: "/games", name: "GameLobby", component: GameLobby },
  { path: "/games/:id", name: "GameView", component: GameView },
  { path: "/", redirect: "/games" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
