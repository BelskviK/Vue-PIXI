// src/config/gameConfigs.ts
export interface GameConfig {
  component: () => Promise<any>;
  wrapperBaseClasses: string;
  theme: {
    bg: string;
    btn: string;
    gradientFrom: string;
    gradientTo: string;
    layoutgradientFrom: string;
    layoutgradientTo: string;
    border: string;
  };
  betsClasses: string;
  betsControlProps: {
    panelType: string;
    maxBet?: number;
    gridSize?: number;
    showControls?: boolean;
    showPayoutChart?: boolean;
    [key: string]: unknown;
  };
}

export const gameConfigs: Record<string, GameConfig> = {
  dice: {
    component: () => import("@/pages/games/dice/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#662bb2",
      gradientFrom: "#8b5cf6",
      gradientTo: "#6d28d9",
      layoutgradientFrom: "#6b21a8",
      layoutgradientTo: "#4c1d95",
      border: "#c084fc",
    },
    betsClasses: "bg-gradient-to-r from-purple-500 to-purple-700",
    betsControlProps: {
      panelType: "dice",
      maxBet: 100,
      showControls: true,
    },
  },

  plinko: {
    component: () => import("@/pages/games/plinko/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#017c80",
      gradientFrom: "#22d3ee",
      gradientTo: "#0891b2",
      layoutgradientFrom: "#0e7490",
      layoutgradientTo: "#075985",
      border: "#67e8f9",
    },
    betsClasses: "bg-gradient-to-r from-cyan-400 to-cyan-600",
    betsControlProps: {
      panelType: "plinko",
      showPayoutChart: true,
      showControls: true,
    },
  },

  mines: {
    component: () => import("@/pages/games/mines/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#0267a5",
      gradientFrom: "#0781cc",
      gradientTo: "#0049db",
      layoutgradientFrom: "#0369a1",
      layoutgradientTo: "#1e40af",
      border: "#FB9C23",
    },
    betsClasses: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    betsControlProps: {
      panelType: "mines",
      gridSize: 5,
      showControls: true,
    },
  },

  goal: {
    component: () => import("@/pages/games/goal/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#3e6c00",
      gradientFrom: "#22c55e",
      gradientTo: "#15803d",
      layoutgradientFrom: "#16a34a",
      layoutgradientTo: "#166534",
      border: "#4ade80",
    },
    betsClasses: "bg-gradient-to-r from-green-400 to-green-600",
    betsControlProps: {
      panelType: "goal",
      showControls: true,
    },
  },

  hilo: {
    component: () => import("@/pages/games/hilo/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#e28109",
      gradientFrom: "#f59e0b",
      gradientTo: "#ea580c",
      layoutgradientFrom: "#d97706",
      layoutgradientTo: "#b45309",
      border: "#fbbf24",
    },
    betsClasses: "bg-gradient-to-r from-orange-400 to-orange-600",
    betsControlProps: {
      panelType: "hilo",
      showControls: true,
    },
  },

  keno: {
    component: () => import("@/pages/games/keno/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#ca0348",
      gradientFrom: "#ef4444",
      gradientTo: "#b91c1c",
      layoutgradientFrom: "#dc2626",
      layoutgradientTo: "#991b1b",
      border: "#f87171",
    },
    betsClasses: "bg-gradient-to-r from-red-400 to-red-600",
    betsControlProps: {
      panelType: "keno",
      showControls: true,
    },
  },

  miniRoulette: {
    component: () => import("@/pages/games/mini-roulette/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#018220",
      gradientFrom: "#10b981",
      gradientTo: "#059669",
      layoutgradientFrom: "#0d9488",
      layoutgradientTo: "#065f46",
      border: "#34d399",
    },
    betsClasses: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    betsControlProps: {
      panelType: "miniRoulette",
      showControls: true,
    },
  },

  hotline: {
    component: () => import("@/pages/games/hotline/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#194eae",
      gradientFrom: "#3b82f6",
      gradientTo: "#1d4ed8",
      layoutgradientFrom: "#2563eb",
      layoutgradientTo: "#1e3a8a",
      border: "#60a5fa",
    },
    betsClasses: "bg-gradient-to-r from-blue-400 to-blue-600",
    betsControlProps: {
      panelType: "hotline",
      showControls: true,
    },
  },

  balloon: {
    component: () => import("@/pages/games/balloon/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#202020",
      btn: "#06378f",
      gradientFrom: "#e11d48",
      gradientTo: "#9f1239",
      layoutgradientFrom: "#be123c",
      layoutgradientTo: "#881337",
      border: "#f43f5e",
    },
    betsClasses: "bg-gradient-to-r from-rose-500 to-rose-700",
    betsControlProps: {
      panelType: "balloon",
      showControls: true,
    },
  },
};
