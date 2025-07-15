export interface GameConfig {
  /** Loader that returns a Promise resolving to the game component */
  component: () => Promise<any>;
  /** Base wrapper classes (size, layout) */
  wrapperBaseClasses: string;
  /** Theme colors */
  theme: {
    bg: string; // fallback solid background
    gradientFrom: string; // gradient start
    gradientTo: string; // gradient end
    border: string; // border color
  };
  /** Settings for the bets control panel */
  betsControlProps: Record<string, unknown>;
}

export const gameConfigs: Record<string, GameConfig> = {
  dice: {
    component: () => import("@/pages/games/dice/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[60%] h-[65%] overflow-hidden rounded-xl",
    theme: {
      bg: "#0F2027",
      gradientFrom: "#2C5364",
      gradientTo: "#203A43",
      border: "#88C057",
    },
    betsControlProps: { panelType: "standard", maxBet: 100 },
  },
  plinko: {
    component: () => import("@/pages/games/plinko/index.vue"),
    wrapperBaseClasses:
      "relative flex flex-col w-[56%] h-[57%] overflow-hidden rounded-xl",
    theme: {
      bg: "#1B1B2F",
      gradientFrom: "#16213E",
      gradientTo: "#0F3460",
      border: "#E94560",
    },
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
      border: "#FB9C23",
    },
    betsControlProps: { panelType: "mines", gridSize: 5 },
  },
  // ...other games follow same pattern
};
