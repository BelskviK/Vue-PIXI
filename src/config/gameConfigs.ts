// src/config/gameConfigs.ts
export interface GameConfig {
  component: () => Promise<any>;
  wrapperBaseClasses: string;
  theme: {
    btn: string;
    background: string; // full gradient CSS
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
      btn: "#6d23c1",
      background: "linear-gradient(-57deg, #421cae 3%, #6d2eb3 85%)",
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
      btn: "#017c80",
      background: "radial-gradient(circle at 50% 62%, #1cc49a, #0870aa 88%)",
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
      btn: "#0267a5",
      background: "linear-gradient(-57deg, #0048dc 3%, #0781cc 85%)",
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
      btn: "#3e6c00",
      background: "radial-gradient(circle at 50% 62%, #6bb800, #295120 88%)",
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
      btn: "#e28109",
      background: "radial-gradient(circle at 50% 62%, #ebc70b, #d37006 88%)",
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
      btn: "#ca0348",
      background: "radial-gradient(circle at 50% 62%, #dc004d, #9b0a3d 57%)",
      border: "#f87171",
    },
    betsClasses: "bg-gradient-to-r from-red-400 to-red-600",
    betsControlProps: {
      panelType: "keno",
      showControls: true,
    },
  },

  miniroulette: {
    component: () => import("@/pages/games/mini-roulette/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      btn: "#018220",
      background: "radial-gradient(circle at 50% 62%, #018e38, #03602c 88%)",
      border: "#34d399",
    },
    betsClasses: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    betsControlProps: {
      panelType: "miniroulette",
      showControls: true,
    },
  },

  hotline: {
    component: () => import("@/pages/games/hotline/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      btn: "#194eae",
      background: "radial-gradient(circle at 50% 62%, #004dc0, #3b5097 88%)",
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
      btn: "#06378f",
      background: "radial-gradient(circle at 50% 62%, #022059, #022059 88%)",
      border: "#f43f5e",
    },
    betsClasses: "bg-gradient-to-r from-rose-500 to-rose-700",
    betsControlProps: {
      panelType: "balloon",
      showControls: true,
    },
  },
};
