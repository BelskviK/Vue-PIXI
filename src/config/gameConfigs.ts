// src/config/gameConfigs.ts
export interface GameConfig {
  component: () => Promise<any>;
  wrapperBaseClasses: string;
  theme: {
    bg: string;
    gradientFrom: string;
    gradientTo: string;
    layoutgradientFrom: string;
    layoutgradientTo: string;
    border: string;
  };
  betsClasses: string;
  betsControlProps: Record<string, unknown>;
}

export const gameConfigs: Record<string, GameConfig> = {
  dice: {
    component: () => import("@/pages/games/dice/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#1e1b4b", // dark purple
      gradientFrom: "#a78bfa", // purple-400
      gradientTo: "#7c3aed", // purple-600
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#c084fc", // purple-300
    },
    betsClasses: "bg-gradient-to-r from-purple-400 to-purple-600",
    betsControlProps: { panelType: "standard", maxBet: 100 },
  },

  plinko: {
    component: () => import("@/pages/games/plinko/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#0f172a", // very dark navy
      gradientFrom: "#22d3ee", // cyan-400
      gradientTo: "#14b8a6", // teal-400
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#5eead4", // teal-200
    },
    betsClasses: "bg-gradient-to-r from-cyan-400 to-teal-400",
    betsControlProps: { panelType: "plinko", showPayoutChart: true },
  },

  mines: {
    component: () => import("@/pages/games/mines/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      gradientFrom: "#0781cc",
      gradientTo: "#0049db",
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#FB9C23",
    },
    betsClasses: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    betsControlProps: { panelType: "mines", gridSize: 5 },
  },

  goal: {
    component: () => import("@/pages/games/goal/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#052e16", // very dark green
      gradientFrom: "#34d399", // green-400
      gradientTo: "#10b981", // green-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#6ee7b7", // green-200
    },
    betsClasses: "bg-gradient-to-r from-green-400 to-green-500",
    betsControlProps: { panelType: "goal" },
  },

  hilo: {
    component: () => import("@//pages/games/hilo/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#331e00", // very dark orange
      gradientFrom: "#fb923c", // orange-400
      gradientTo: "#f97316", // orange-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#fdba74", // orange-300
    },
    betsClasses: "bg-gradient-to-r from-orange-400 to-orange-500",
    betsControlProps: { panelType: "hilo" },
  },

  keno: {
    component: () => import("@/pages/games/keno/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#2f0d10", // very dark red
      gradientFrom: "#f87171", // red-400
      gradientTo: "#ef4444", // red-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#fca5a5", // red-300
    },
    betsClasses: "bg-gradient-to-r from-red-400 to-red-500",
    betsControlProps: { panelType: "keno" },
  },

  miniroulette: {
    component: () => import("@/pages/games/mini-roulette/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#1f2937", // dark slate
      gradientFrom: "#f472b6", // pink-400
      gradientTo: "#ec4899", // pink-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#f9a8d4", // pink-300
    },
    betsClasses: "bg-gradient-to-r from-pink-400 to-pink-500",
    betsControlProps: { panelType: "miniRoulette" },
  },

  hotline: {
    component: () => import("@/pages/games/hotline/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#071f5b", // very dark indigo
      gradientFrom: "#818cf8", // indigo-400
      gradientTo: "#6366f1", // indigo-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#a5b4fc", // indigo-300
    },
    betsClasses: "bg-gradient-to-r from-indigo-400 to-indigo-500",
    betsControlProps: { panelType: "hotline" },
  },

  balloon: {
    component: () => import("@/pages/games/balloon/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#0f172a", // match Plinko’s dark bg
      gradientFrom: "#93c5fd", // blue-300
      gradientTo: "#3b82f6", // blue-500
      layoutgradientFrom: "#055a8e",
      layoutgradientTo: "#00329a",
      border: "#60a5fa", // blue-400
    },
    betsClasses: "bg-gradient-to-r from-blue-300 to-blue-500",
    betsControlProps: { panelType: "balloon" },
  },
};
