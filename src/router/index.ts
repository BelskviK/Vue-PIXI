import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import GameView from "@/pages/GameView.vue";

const routes: RouteRecordRaw[] = [
  // Redirect root → game view for “mines”
  { path: "/", redirect: "/games/mines" },

  // Every individual game uses the same wrapper
  {
    path: "/games/:id",
    name: "GameView",
    component: GameView,
    props: true,
  },

  // Fallback any unknown URL back into mines
  { path: "/:pathMatch(.*)*", redirect: "/games/mines" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
