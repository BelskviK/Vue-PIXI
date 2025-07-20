You are a senior Vue 3 / TypeScript architect brought in to refactor only the **/src/components/games/mines** sub‑folder of my project.

🎯 **Overall goal**

- Keep every visual detail exactly the same (all Tailwind classes, positions, animations, PIXI code that draws the board, etc.).
- Raise the architectural quality: strong OOP, clear separation of concerns, one‑way data‑flow through Pinia stores, and easy future integration with a REST API (axios layer).
- Make naming, folder layout, and file responsibilities intuitive.

🔖 **Constraints**

1. **DON’T** touch any Tailwind classes or layout values grid padings margins width heights etc..
2. **DON’T** break current behaviour; unit tests (implicit) must still pass.
3. **DON’T** let sibling components reach into each other’s refs/props.  
   Components read from their parent via props or from the Pinia store only.
4. **DO** keep all animations, sounds, game logic, and existing feature flags as comments.
5. **DO** prepare code for future axios calls (create an `/api` layer, return mock promises for now).
6. **DO** keep the game playable with hot‑reload (Vite).

🗂 **Deliverables**

1. **New folder / file map** (tree view) showing where every file will live after refactor.
2. **Every full, refactored file** in ` ` fences, ready to drop in.
3. A short “why” note for each big change (one‑line bullet).
4. A migration checklist (anything I must rename, delete, or install).

📤 **Here are the current files (unchanged):**
<‑‑ paste each existing file in a ` ` block, one after another. Start with MinesGame.vue, MinesBoard.vue, MinesHeader.vue, MinesFooter.vue, Tile.ts, Engine.ts, round.ts, Store.ts, any helper modules, and their tests. Repeat until everything inside /mines is supplied, including assets / constants. –->

💡 **When you reply**:
Please follow this exact order → 1) folder tree, 2) refactored files, 3) change notes, 4) migration checklist. No extra commentary.

> > > src\pages\GameView.vue:
> > > <template>

  <div class="flex flex-col h-screen bg-[#000000]">
    <div class="flex items-center justify-center h-full w-full">
      <div
        class="relative flex flex-col w-full max-w-[970px] mx-2 h-full md:max-h-[540px] overflow-hidden rounded-xl border-0 md:border-2 md:border-solid"
        :style="wrapperStyle"
      >
        <!-- Header: bottom on small screens, top on md+  h-[34px] ]-->
        <Header
          :key="gameId"
          :theme="config.theme"
          :classes="config.betsClasses"
          class="absolute bottom-[0px] h-[34px] md:h-[32px] md:order-first md:top-0 order-last"
        />

        <!-- Game content stays in middle -->
        <Suspense>
          <template #default>
            <component
              :is="GameComponent"
              class="order-1 h-[calc(100%-202px)] md:h-[calc(100%-100px)]"
            />
          </template>
          <template #fallback>
            <div class="text-white flex items-center justify-center order-1">
              Loading game…
            </div>
          </template>
        </Suspense>

        <!-- BetsControl: above header on small, below game on md+ -->
        <BetsControl
          v-if="config.betsControlProps.showControls !== false"
          :key="gameId"
          :classes="config.betsClasses"
          v-bind="config.betsControlProps"
          :theme="{ btn: config.theme.btn }"
          class="absolute bottom-[34px] h-[145px] mb-1 md:bottom-0 md:h-[70px] md:mb-0 md:order-last order-1 z-40 pointer-events-auto"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, defineAsyncComponent } from "vue";
import Header from "@/components/shared/Header.vue";
import BetsControl from "@/components/shared/BetControls.vue";
import { gameConfigs } from "@/config/gameConfigs";

const route = useRoute();
const gameId = computed(() => (route.params.id as string) || "mines");
const config = computed(
  () => gameConfigs[gameId.value] || gameConfigs["mines"]
);

const GameComponent = computed(() =>
  defineAsyncComponent(config.value.component)
);

const wrapperStyle = computed(() => ({
  backgroundImage: config.value.theme.background,
  borderColor: config.value.theme.border,
}));
</script>

> > > src\components\games\mines\MinesGame.vue:
> > > <template>

  <div
    class="flex flex-col items-center justify-between h-full w-full max-w-[400px] pb-40 pt-2 md:pb-2 md:pt-1 px-1"
  >
    <MinesHeader />

    <!-- now just drop in our new board -->
    <MinesBoard :rows="5" :cols="5" class="w-full py-2" />

    <MinesFooter />

  </div>
</template>

<script setup lang="ts">
import MinesHeader from "@/components/games/mines/MinesHeader.vue";

import MinesBoard from "@/components/games/mines/MinesBoard.vue";

import MinesFooter from "@/components/games/mines/MinesFooter.vue";
</script>

<style scoped></style>

> > > src\components\games\mines\MinesHeader.vue:

<!-- src/components/games/mines/MinesHeader.vue -->
<template>
  <div class="w-full">
    <!-- selector + multiplier row -->
    <div class="flex w-full h-[22px] rounded-[12px] bg-[#15171969]">
      <!-- mines dropdown --------------------------------------------------- -->
      <div class="relative flex-1" ref="wrapper">
        <button
          @click="toggleDropdown"
          :disabled="locked"
          :class="[
            'flex items-center justify-center w-[130px] h-[20px] rounded-3xl px-2 text-white text-[12px]',
            'border border-black shadow-[inset_1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)]',
            locked
              ? 'opacity-40 cursor-not-allowed disabled:active:translate-y-0'
              : 'cursor-pointer active:translate-y-[2px]',
          ]"
          style="background-color: #0267a5"
        >
          <span class="flex-1 truncate">Mines : {{ minesCount }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- dropdown menu -->
        <div
          v-if="isOpen"
          class="absolute top-full left-0 mt-1 w-[150px] bg-[#032e49] rounded-xl p-3 z-10 max-h-[200px] overflow-y-auto"
        >
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="n in numbers"
              :key="n"
              @click="selectMines(n)"
              :class="[
                'rounded-full border border-black py-1 text-[10px] font-medium active:translate-y-[2px]',
                minesCount === n
                  ? 'bg-[#2f82b5] text-white'
                  : 'bg-[#094164] text-white hover:bg-[#0b5679]',
              ]"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </div>

      <!-- multiplier pill -------------------------------------------------- -->
      <div class="flex flex-1 justify-end">
        <div
          class="flex items-center justify-center w-[100px] h-[20px] rounded-3xl border border-black shadow-[1px_1px_0_rgba(0,0,0,0.3),inset_1px_1px_0_rgba(255,255,255,0.2)]"
          :style="{ backgroundColor: multiplierColor }"
        >
          <span class="flex-1 text-center text-[12px] truncate">
            Next: {{ shownMultiplier }}
          </span>
        </div>
      </div>
    </div>

    <!-- progress bar -->
    <div
      class="w-full h-[4px] bg-[#15171969] rounded-full mt-2 overflow-hidden"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="h-full bg-[#28a745]" :style="{ width: progress + '%' }" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { useMinesStore } from "@/components/games/mines/Store";
import { calcMultiplier, TOTAL_TILES } from "@/components/games/mines/math";

/* ─── stores ─────────────────────────────────────────────────── */
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesStore();

/* ─── dropdown helpers ───────────────────────────────────────── */
const locked = computed(() => ui.dropdownLocked);
const isOpen = ref(false);
const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
const minesCount = computed(() => settings.minesCount);

function toggleDropdown() {
  if (!locked.value) isOpen.value = !isOpen.value;
}
function selectMines(n: number) {
  settings.setMinesCount(n);
  isOpen.value = false;
}
watch(locked, (v) => v && (isOpen.value = false));

/* outside-click close */
const wrapper = ref<HTMLElement | null>(null);
function onClickOutside(e: MouseEvent) {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));

/* ─── helper: round up to next 500 ---------------------------------- */
function roundUp500(n: number): number {
  return Math.ceil(n / 500) * 500;
}

/* ─── reactive UI --------------------------------------------------- */
const progress = computed(() => round.progressPercent);
const shownMultiplier = ref("—");

function refreshMultiplier() {
  if (round.finished || round.totalTiles === 0) return;

  const bombs = settings.minesCount;
  const safeRevealed =
    ui.auto.enabled && ui.status === "betActive"
      ? round.preselectedTiles
      : round.revealedTiles;

  const maxSafe = TOTAL_TILES - bombs;

  let kNext = safeRevealed + 1;

  let m: number;

  if (kNext <= maxSafe) {
    /* normal preview of next safe tile */
    m = calcMultiplier(bombs, kNext);
  } else {
    /* no next tile – round current multiplier up to next multiple of 500 */
    const current = calcMultiplier(bombs, safeRevealed);
    m = roundUp500(current);
  }

  shownMultiplier.value = m.toFixed(2) + "x";
}
watch(
  () => [
    settings.minesCount,
    round.revealedTiles,
    round.preselectedTiles,
    round.finished,
    ui.auto.enabled,
    ui.status,
  ],
  refreshMultiplier,
  { immediate: true }
);

/* pill colour – green when Auto armed */
const multiplierColor = computed(() =>
  ui.auto.enabled ? "#28a745" : "#ffc107"
);
</script>

<style scoped>
/* All styling handled by Tailwind */
</style>

> > > src\components\games\mines\MinesBoard.vue:
> > > <template>

  <div ref="container" class="w-full h-[80%] select-none touch-none" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Application } from "pixi.js";
import { Tile, TileType } from "./Tile";
import { MinesEngine } from "@/components/games/mines/Engine";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { useMinesStore } from "@/components/games/mines/Store";
import { useUserStore } from "@/stores/user";
import { calcMultiplier } from "@/components/games/mines/math";

/* ---------- props ---------- */
interface Props {
  rows: number;
  cols: number;
  tileWidth?: number;
  tileHeight?: number;
  padding?: number;
}
const props = defineProps<Props>();

/* ---------- PIXI ---------- */
const container = ref<HTMLDivElement | null>(null);
let app: Application;
let resizeObserver: ResizeObserver;

/* ---------- state & helpers ---------- */
let engine: MinesEngine;
const tiles = new Map<number, Tile>();
const BASE_W = props.tileWidth ?? 64;
const BASE_H = props.tileHeight ?? 48;
const GAP = props.padding ?? 10;

/* pre-selection */
const preselected = new Set<number>();
const settings = useMinesSettings();
const round = useMinesRound();
const ui = useMinesStore();
const preselectMode = computed(
  () => ui.auto.enabled && ui.status === "betActive"
);
function maxSelectable() {
  return props.rows * props.cols - settings.minesCount;
}
function syncPreselected() {
  round.setPreselected(preselected.size);
}
function clearPreselection() {
  preselected.forEach((idx) => {
    const t = tiles.get(idx);
    if (t && t.kind === TileType.Preselect) t.setKind(TileType.Hidden);
  });
  preselected.clear();
  syncPreselected();
}
/* NEW — remove only the most-recent green tile */
function deselectOnePreselection() {
  if (preselected.size === 0) return;
  const idx = Array.from(preselected).pop()!;
  preselected.delete(idx);

  const t = tiles.get(idx);
  if (t && t.kind === TileType.Preselect) t.setKind(TileType.Hidden);

  syncPreselected();
}

/* timers */
let explodeTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let cashoutTimer: ReturnType<typeof setTimeout> | null = null;

/* other stores & flags */
const wallet = useUserStore();
const boardActive = computed(() => ui.boardActive);
let firstSafe = false;

/* ---------- core helpers ---------- */
function clear(t: ReturnType<typeof setTimeout> | null) {
  if (t) clearTimeout(t);
}
function clearAllTimers() {
  clear(explodeTimer);
  explodeTimer = null;
  clear(idleTimer);
  idleTimer = null;
  clear(cashoutTimer);
  cashoutTimer = null;
}
function scheduleIdleRestart() {
  clear(idleTimer);
  idleTimer = setTimeout(makeNewGame, 30_000);
}
function makeNewGame() {
  clearAllTimers();
  clearPreselection();
  engine = new MinesEngine(props.rows, props.cols, settings.minesCount);
  round.startRound(props.rows, props.cols);
  ui.startNewRound();
  firstSafe = false;
  drawBoard();
}

/* ---------- board drawing ---------- */
function drawBoard() {
  if (!container.value) return;
  app.stage.removeChildren();
  tiles.clear();

  const cssW = container.value.clientWidth,
    cssH = container.value.clientHeight;
  const boardW = props.cols * BASE_W + (props.cols - 1) * GAP;
  const boardH = props.rows * BASE_H + (props.rows - 1) * GAP;
  const scale = Math.min(cssW / boardW, cssH / boardH);
  const offX = (cssW - boardW * scale) / 2,
    offY = (cssH - boardH * scale) / 2;

  for (let r = 0; r < props.rows; r++)
    for (let c = 0; c < props.cols; c++) {
      const idx = r * props.cols + c;
      const t = new Tile();
      t.scale.set(scale);
      t.position.set(
        offX + c * (BASE_W + GAP) * scale,
        offY + r * (BASE_H + GAP) * scale
      );
      t.eventMode = "static";
      t.cursor = "pointer";
      t.on("pointertap", () => handleTileClick(idx));
      tiles.set(idx, t);
      app.stage.addChild(t);
    }

  app.renderer.resize(cssW, cssH);
  applyDim();
}
function applyDim() {
  const dim = !boardActive.value && !preselectMode.value;
  tiles.forEach((t) => t.setDimmed(dim));
}

/* ---------- gameplay ---------- */
function handleTileClick(idx: number) {
  /* Auto-game pre-selection */
  if (preselectMode.value) {
    if (preselected.has(idx)) {
      preselected.delete(idx);
      tiles.get(idx)!.setKind(TileType.Hidden);
    } else if (preselected.size < maxSelectable()) {
      preselected.add(idx);
      tiles.get(idx)!.setKind(TileType.Preselect);
    }
    syncPreselected();
    return;
  }

  /* Normal play */
  if (!boardActive.value) return;
  if (engine.exploded || engine.isRevealed(idx)) return;

  const result = engine.reveal(idx);
  const tile = tiles.get(idx)!;

  if (result === "safe") {
    round.revealOne();
    tile.setKind(TileType.StarGold);

    if (!firstSafe) {
      firstSafe = true;
      ui.activateCashout();
      clear(idleTimer);
    }
  } else {
    tile.setKind(TileType.Explosion);
    finishByExplosion();
  }
}

/* RANDOM helpers */
function preselectRandomTile() {
  if (preselected.size >= maxSelectable()) return;
  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!preselected.has(i)) options.push(i);
  if (options.length === 0) return;
  const idx = options[Math.floor(Math.random() * options.length)];
  preselected.add(idx);
  tiles.get(idx)!.setKind(TileType.Preselect);
  syncPreselected();
}
function revealRandomTile() {
  if (!boardActive.value) return;
  const options: number[] = [];
  for (let i = 0; i < props.rows * props.cols; i++)
    if (!engine.isRevealed(i)) options.push(i);
  if (options.length === 0) return;
  const idx = options[Math.floor(Math.random() * options.length)];
  handleTileClick(idx);
}
function randomAction() {
  if (preselectMode.value) preselectRandomTile();
  else revealRandomTile();
}

/* round-finishing helpers */
function revealAllTiles() {
  engine.revealAll().forEach((st, idx) => {
    const t = tiles.get(idx)!;
    if (
      st === "bomb" &&
      (t.kind === TileType.Hidden || t.kind === TileType.Preselect)
    )
      t.revealFinal(TileType.Bomb);
    else if (st === "hidden") t.revealFinal(TileType.StarBlue);
  });
}
function finishByExplosion() {
  revealAllTiles();
  round.revealAll();
  ui.forceCashoutInactive();
  clear(idleTimer);
  explodeTimer = setTimeout(makeNewGame, 5_000);
}
function finishByCashout() {
  revealAllTiles();
  round.revealAll();
  ui.forceCashoutInactive();

  const win =
    ui.betValue * calcMultiplier(settings.minesCount, round.revealedTiles);
  cashoutTimer = setTimeout(() => {
    wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));
    makeNewGame();
  }, 5_000);
}

/* ---------- lifecycle ---------- */
onMounted(async () => {
  app = new Application();
  await app.init({
    resolution: Math.ceil(window.devicePixelRatio * 2),
    backgroundAlpha: 0,
    autoDensity: true,
    antialias: true,
  });
  container.value?.appendChild(app.canvas);
  makeNewGame();
  resizeObserver = new ResizeObserver(drawBoard);
  resizeObserver.observe(container.value!);
});
onUnmounted(() => {
  resizeObserver?.disconnect();
  app.destroy({ removeView: true }, { children: true, texture: true });
  clearAllTimers();
});

/* ---------- watchers ---------- */
watch(
  () => settings.minesCount,
  () => {
    clearPreselection();
    makeNewGame();
  }
);
watch(boardActive, applyDim);
watch(preselectMode, (v) => {
  if (!v) clearPreselection();
  applyDim();
});
watch(
  () => ui.status,
  (s) => {
    if (s !== "betActive") clearPreselection();
    if (s === "cashoutInactive" && !firstSafe) scheduleIdleRestart();
    else clear(idleTimer);
  }
);
watch(
  () => ui.cashoutTrigger,
  (n, o) => {
    if (n > o) finishByCashout();
  }
);
watch(
  () => ui.randomTrigger,
  (n, o) => {
    if (n > o) randomAction();
  }
);
/* NEW — watch for single-tile undo */
watch(
  () => ui.undoPreselectTrigger,
  (n, o) => {
    if (n > o) deselectOnePreselection();
  }
);
</script>

<style scoped>
/* PIXI canvas fills the parent */
</style>

> > > src\components\games\mines\Engine.ts:
> > > // src/games/mines/Engine.ts
> > > export type CellState = "hidden" | "safe" | "bomb" | "explosion";

export class MinesEngine {
readonly rows: number;
readonly cols: number;
private bombs: Set<number>;
private revealed: Set<number>;
private \_exploded = false;

constructor(rows: number, cols: number, bombsWanted: number) {
this.rows = rows;
this.cols = cols;
this.revealed = new Set();

    const max = rows * cols;
    const bombs = Math.min(bombsWanted, max - 1); // keep at least one safe
    this.bombs = this.randomUnique(bombs, max);

}

/\*_ Index helper (row-major). _/
private idx(r: number, c: number) {
return r \* this.cols + c;
}

/\*_ Returns true if the given cell hides a bomb. _/
isBomb(index: number) {
return this.bombs.has(index);
}

/\*_ Did the player already click a bomb? _/
get exploded() {
return this.\_exploded;
}

/\*_ True if the given cell has been revealed already. _/
isRevealed(index: number) {
return this.revealed.has(index);
}

/\*\*

- Player clicked a cell.
- • returns "safe" – safe cell clicked
- • returns "explosion" – bomb cell clicked (and marks game as exploded)
  \*/
  reveal(index: number): CellState {
  if (this.revealed.has(index)) return "safe"; // ignore double-clicks
  this.revealed.add(index);


    if (this.bombs.has(index)) {
      this._exploded = true;
      return "explosion";
    }
    return "safe";

}

/\*_ Reveal everything (used when round ends). _/
revealAll(): Map<number, CellState> {
const result = new Map<number, CellState>();

    for (let i = 0; i < this.rows * this.cols; i++) {
      if (this.bombs.has(i))
        result.set(i, this.revealed.has(i) ? "explosion" : "bomb");
      else if (this.revealed.has(i)) result.set(i, "safe");
      else result.set(i, "hidden");
    }
    return result;

}

/\*_ Utility – choose `count` distinct numbers in [0, range). _/
private randomUnique(count: number, range: number): Set<number> {
const s = new Set<number>();
while (s.size < count) s.add(Math.floor(Math.random() \* range));
return s;
}
}

> > > src\components\games\mines\round.ts:
> > > import { defineStore } from "pinia";

/\*\*

- Per-round reactive state
  \*/
  export const useMinesRound = defineStore("minesRound", {
  state: () => ({
  totalTiles: 0,
  revealedTiles: 0,
  preselectedTiles: 0,

      /* multipliers kept in-store so the whole app sees the same values */
      currentMultiplier: 0, // for cash-out
      nextMultiplier: 0, // preview shown in UI

      finished: false,

  }),

getters: {
progressPercent: (s) =>
s.totalTiles === 0
? 0
: Math.round(
((s.revealedTiles + s.preselectedTiles) / s.totalTiles) \* 100
),
},

actions: {
startRound(r: number, c: number) {
this.totalTiles = r _ c;
this.revealedTiles = 0;
this.preselectedTiles = 0;
this.currentMultiplier = 0;
this.nextMultiplier = 0;
this.finished = false;
},
revealOne() {
this.revealedTiles++;
},
/\*\* while user is selecting green tiles (Auto mode before betting) _/
setPreselected(n: number) {
this.preselectedTiles = n;
},
/\*_ board sends both multipliers _/
setMultipliers(cur: number, nxt: number) {
this.currentMultiplier = cur;
this.nextMultiplier = nxt;
},
revealAll() {
this.revealedTiles = this.totalTiles;
this.preselectedTiles = 0;
this.finished = true;
},
reset() {
this.totalTiles = 0;
this.revealedTiles = 0;
this.preselectedTiles = 0;
this.currentMultiplier = 0;
this.nextMultiplier = 0;
this.finished = false;
},
},
});

> > > src\components\games\mines\math.ts:
> > > /_ Shared helpers for Mines multipliers _/
> > > export const TOTAL_TILES = 25; // fixed 5×5 board
> > > export const HOUSE_EDGE = 0.03; // 3 %

/\*\*

- Cash-out multiplier after `kSafe` successful reveals.
- Also used for preview by passing `kSafe + 1`.
  \*/
  export function calcMultiplier(bombs: number, kSafe: number): number {
  if (bombs <= 0 || bombs >= TOTAL_TILES) return 0;
  if (kSafe <= 0) return 0;
  if (kSafe > TOTAL_TILES - bombs) return 0; // cannot go further

let mult = 1;
for (let i = 0; i < kSafe; i++) {
const remaining = TOTAL_TILES - i;
mult _= remaining / (remaining - bombs);
}
return mult _ (1 - HOUSE_EDGE);
}

/\** Round *up* to the next multiple of 500 (for last-safe preview) */
export function roundUp500(n: number): number {
return Math.ceil(n / 500) \* 500;
}

> > > src\components\games\mines\settings.ts:
> > > import { defineStore } from "pinia";

/** Global game settings that other modules can subscribe to. \*/
export const useMinesSettings = defineStore("minesSettings", {
state: () => ({
/** Bombs on the board (clamped 1-20). _/
minesCount: 3,
}),
actions: {
setMinesCount(n: number) {
/_ clamp to the allowed range 1-20 \*/
this.minesCount = Math.min(21, Math.max(1, Math.floor(n)));
},
},
});

> > > src\components\games\mines\Store.ts:
> > > // src/components/games/mines/Store.ts
> > > import { defineStore } from "pinia";
> > > import { useUserStore } from "@/stores/user";
> > > import { useMinesSettings } from "@/components/games/mines/settings";
> > > import { useMinesRound } from "@/components/games/mines/round";
> > > import { calcMultiplier } from "@/components/games/mines/math";

export type ButtonStatus = "betActive" | "cashoutInactive" | "cashoutActive";

export interface AutoState {
enabled: boolean;
running: boolean;
roundsPlanned: number;
currentRound: number;
stopLoss: number | null;
takeProfit: number | null;
}

export const useMinesStore = defineStore("mines", {
/_ ─────────────── STATE ─────────────── _/
state: () => ({
status: "betActive" as ButtonStatus,
betValue: 0.1,

    /* RANDOM */
    randomEnabled: false,
    randomTrigger: 0,

    /* CASH-OUT */
    cashoutTrigger: 0,
    lastWin: 0,

    /* single-tile undo trigger (Auto) */
    undoPreselectTrigger: 0,

    /* AUTO-PLAY */
    auto: <AutoState>{
      enabled: false,
      running: false,
      roundsPlanned: 3,
      currentRound: 0,
      stopLoss: null,
      takeProfit: null,
    },

}),

/_ ─────────────── GETTERS ─────────────── _/
getters: {
boardActive: (s) => s.status !== "betActive",
autoActive: (s) => s.auto.running,
dropdownLocked: (s) => s.status !== "betActive" || s.auto.enabled,
randomButtonEnabled: (s) => s.randomEnabled || s.auto.enabled,
betButtonStatus: (s): ButtonStatus | "betInactive" =>
s.auto.enabled ? "betInactive" : s.status,
},

/_ ─────────────── ACTIONS ─────────────── _/
actions: {
/_ ---------- called by Auto-Play modal ---------- _/
setAutoConditions(cfg: {
rounds: number;
stopLoss?: number | null;
takeProfit?: number | null;
}) {
this.auto.enabled = true;
this.auto.running = false;
this.auto.currentRound = 0;
this.auto.roundsPlanned = cfg.rounds;
this.auto.stopLoss = cfg.stopLoss ?? null;
this.auto.takeProfit = cfg.takeProfit ?? null;
},

    /* ---------- main BET / CASH-OUT button ---------- */
    handleClick() {
      const wallet = useUserStore();
      const settings = useMinesSettings();
      const round = useMinesRound();

      /* place bet */
      if (this.status === "betActive") {
        if (wallet.balance < this.betValue) return;

        wallet.updateBalance(
          parseFloat((wallet.balance - this.betValue).toFixed(2))
        );

        this.status = "cashoutInactive";
        this.randomEnabled = true;
        this.lastWin = 0;
        if (this.auto.enabled) this.auto.running = true;
        return;
      }

      /* cash-out */
      if (this.status === "cashoutActive") {
        const mult = calcMultiplier(settings.minesCount, round.revealedTiles);
        const win = parseFloat((this.betValue * mult).toFixed(2));

        wallet.updateBalance(parseFloat((wallet.balance + win).toFixed(2)));

        this.lastWin = win;
        this.status = "cashoutInactive";
        this.cashoutTrigger++;
        this.randomEnabled = false;
      }
    },

    /* ---------- board-delegated helpers ---------- */
    /** turns grey → yellow once first safe tile is revealed */
    activateCashout() {
      if (this.status === "cashoutInactive") this.status = "cashoutActive";
    },
    /** force back to grey (round ended by bomb or cash-out) */
    forceCashoutInactive() {
      if (this.status !== "betActive") this.status = "cashoutInactive";
      this.randomEnabled = false;
    },

    /* RANDOM button */
    pickRandomTile() {
      if (this.randomButtonEnabled) this.randomTrigger++;
    },

    /* Auto icon: undo one pre-selected tile */
    undoPreselectedTile() {
      if (this.auto.enabled && this.status === "betActive") {
        this.undoPreselectTrigger++;
      }
    },

    /* ---------- round reset ---------- */
    startNewRound() {
      this.status = "betActive";
      this.randomEnabled = false;
      this.randomTrigger = 0;
      this.cashoutTrigger = 0;
      this.undoPreselectTrigger = 0;
      this.lastWin = 0;

      if (this.auto.enabled) {
        this.auto.currentRound++;
        this.auto.running = false;
        if (this.auto.currentRound >= this.auto.roundsPlanned) {
          this.auto.enabled = false;
        }
      }
    },

    /* stake helpers */
    increaseBet() {
      this.betValue = parseFloat((this.betValue + 0.1).toFixed(2));
    },
    decreaseBet() {
      const nxt = parseFloat((this.betValue - 0.1).toFixed(2));
      this.betValue = nxt >= 0.1 ? nxt : this.betValue;
    },
    setBetValue(v: number) {
      const cap = parseFloat(useUserStore().balance.toFixed(2));
      this.betValue = v > cap ? cap : parseFloat(v.toFixed(2));
    },

},
});

> > > src\components\games\mines\Tile.ts:
> > > import { Container, Graphics, FillGradient, Ticker } from "pixi.js";

/_ ───────────── Public API ───────────── _/
export enum TileType {
Hidden = "hidden",
Preselect = "preselect", // ⬅️ NEW – green pre-selected tile
Bomb = "bomb",
StarBlue = "starBlue",
StarGold = "starGold",
Explosion = "explosion",
}

export const TILE_CYCLE: TileType[] = [
TileType.Hidden,
TileType.Preselect, // ⬅️ include in cycle so setKind works
TileType.Bomb,
TileType.StarBlue,
TileType.StarGold,
TileType.Explosion,
];

export interface TileOptions {
width?: number;
height?: number;
radius?: number;
borderWidth?: number;
}

/_ ───────────── Styling ───────────── _/
const BORDER_COLOR = 0x2a4b8c;
const BORDER_ALPHA = 0.8;
const DEFAULT_BORDER = 2;
const FLIP_HALF_DURATION = 0.18;

/_ ───────────── Implementation ───────────── _/
export class Tile extends Container {
private body: Container;
private face: Graphics;
private border: Graphics;
private icon: Graphics;

private readonly w: number;
private readonly h: number;
private readonly r: number;
private readonly borderW: number;

private cycleIndex = 0;
private busy = false;

constructor(opts: TileOptions = {}) {
super();
this.w = opts.width ?? 64;
this.h = opts.height ?? 48;
this.r = opts.radius ?? 8;
this.borderW = opts.borderWidth ?? DEFAULT_BORDER;

    this.body = new Container();
    this.face = new Graphics();
    this.border = new Graphics();
    this.icon = new Graphics();

    this.body.addChild(this.face, this.border, this.icon);
    this.addChild(this.body);

    this.body.pivot.set(this.w / 2, this.h / 2);
    this.body.position.set(this.w / 2, this.h / 2);

    this.redraw();

}

/_ ───── Public helpers ───── _/
next(): void {
if (this.busy) return;
this.cycleIndex = (this.cycleIndex + 1) % TILE_CYCLE.length;
this.redraw();
}

revealFinal(kind: TileType, animate = true): void {
if (animate) this.playHorizontalFlip(TILE_CYCLE.indexOf(kind));
else {
this.cycleIndex = TILE_CYCLE.indexOf(kind);
this.redraw();
}
}

setKind(kind: TileType): void {
const idx = TILE_CYCLE.indexOf(kind);
if (idx >= 0) {
this.cycleIndex = idx;
this.redraw();
}
}

/\*_ Dim/undim for board-state indication. _/
setDimmed(on: boolean) {
this.alpha = on ? 0.6 : 1.0;
}

get kind(): TileType {
return TILE_CYCLE[this.cycleIndex];
}

/_ ───── Internal rendering ───── _/
private redraw(): void {
const [top, bottom] = faceColors(this.kind);
const grad = new FillGradient({
type: "linear",
start: { x: 0, y: 0 },
end: { x: 0, y: 1 },
colorStops: [
{ offset: 0, color: top },
{ offset: 1, color: bottom },
],
});

    this.face
      .clear()
      .roundRect(0, 0, this.w, this.h, this.r)
      .fill({ fill: grad });

    this.border.clear().roundRect(0, 0, this.w, this.h, this.r).stroke({
      width: this.borderW,
      color: BORDER_COLOR,
      alpha: BORDER_ALPHA,
    });

    this.icon.clear();
    if (this.kind === TileType.Hidden || this.kind === TileType.Preselect) {
      const radius = Math.min(this.w, this.h) * 0.2;
      const col = this.kind === TileType.Preselect ? 0xffffff : BORDER_COLOR;
      this.icon.circle(0, 0, radius).fill(col);
    } else {
      drawIcon(this.icon, this.kind, this.w, this.h);
    }
    this.icon.position.set(this.w / 2, this.h / 2);

}

/_ ───── Flip animation for reveal-all ───── _/
private playHorizontalFlip(targetIdx: number): void {
this.busy = true;
const ticker = Ticker.shared;
let phase: 0 | 1 = 0;
let t = 0;
const step = (tk: Ticker): void => {
t += tk.deltaMS / 1000;
const p = Math.min(1, t / FLIP_HALF_DURATION);
const eased = phase === 0 ? 1 - (1 - p) ** 2 : p ** 2;
this.body.scale.x = phase === 0 ? 1 - eased : eased;

      if (p >= 1) {
        if (phase === 0) {
          this.cycleIndex = targetIdx;
          this.redraw();
          phase = 1;
          t = 0;
          return;
        }
        this.body.scale.x = 1;
        ticker.remove(step);
        this.busy = false;
      }
    };
    ticker.add(step);

}
}

/_ ───── Utility helpers ───── _/
function faceColors(kind: TileType): [number, number] {
switch (kind) {
case TileType.Preselect:
return [0x2ecc71, 0x27ae60]; // green gradient
case TileType.StarGold:
return [0xffc63c, 0xe88900];
case TileType.Explosion:
return [0xff8a97, 0xdd4c66];
default:
return [0x0b5aa4, 0x064186]; // default blue
}
}

function drawIcon(g: Graphics, kind: TileType, w: number, h: number): void {
const size = Math.min(w, h) _ 0.45;
switch (kind) {
case TileType.Bomb:
g.circle(0, 0, size).fill(0x000000);
g.circle(-size _ 0.3, -size _ 0.3, size _ 0.45).fill(0x1a1a1a);
g.rect(size _ 0.25, -size _ 0.7, size _ 0.18, size _ 0.45).fill(0x000000);
break;
case TileType.StarBlue:
case TileType.StarGold:
g.star(0, 0, 5, size, size _ 0.45).fill(0xffffff);
break;
case TileType.Explosion:
g.star(0, 0, 12, size _ 1.0, size _ 0.3).fill(0xc70909);
g.star(0, 0, 8, size _ 0.45, size \* 0.15).fill(0xffd23b);
break;
}
}

> > > src\config\gameConfigs.ts:
> > > // ─────────────────────────────────────────────────────────────────────────────
> > > // Types
> > > // ─────────────────────────────────────────────────────────────────────────────
> > > export type ConditionType = "rounds" | "stopLoss" | "takeProfit";

export interface AutoModalConfig {
/** List of controls that should appear in the modal \*/
conditions: ConditionType[];
/** Optional custom button label \*/
buttonLabel?: string;
}

export interface GameConfig {
component: () => Promise<any>;
wrapperBaseClasses: string;
theme: {
btn: string;
background: string;
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
/\*_ New — omit or leave undefined to hide Auto button _/
autoModal?: AutoModalConfig;
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
autoModal: {
buttonLabel: "Auto Game",
conditions: ["rounds", "stopLoss", "takeProfit"],
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

/_ leave other games unchanged until they support Auto _/
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

> > > src\stores\user.ts:
> > > import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
state: () => ({
name: "Guest",
balance: 1000.22,
isLoggedIn: false,
}),
actions: {
updateBalance(amount: number) {
this.balance = amount;
},
login(name: string) {
this.name = name;
this.isLoggedIn = true;
},
logout() {
this.name = "Guest";
this.balance = 1000.0;
this.isLoggedIn = false;
},
},
});

> > > shared files which are useing game to use user data in each games:<<<

> > > src\components\shared\AutoGameModal.vue:
> > > <template>

  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center text-white"
    @keyup.esc="close"
  >
    <div class="absolute inset-0 bg-black/30" @click.self="close" />

    <!-- CARD -->
    <div
      class="relative w-[420px] max-w-full rounded-2xl border border-[#3f3f3f] bg-[#1e1f26] text-[12px] shadow-2xl"
    >
      <!-- HEADER -->
      <header
        class="flex items-center justify-between px-5 py-4 bg-[#14151a] border-b border-[#3f3f3f]"
      >
        <h5 class="font-semibold tracking-wide">AUTO PLAY</h5>
        <button
          class="text-xl leading-none text-gray-400 hover:text-gray-200 border-r border-[#3f3f3f] rounded-[20px] shadow-[inset_1px_1px_#fff1cd33] w-[22px] h-[22px]"
          @click="close"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <!-- BODY -->
      <section class="p-5 space-y-6">
        <!-- Number of rounds -->
        <div v-if="showRounds">
          <p class="text-center mb-3">Number of rounds</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="n in [3, 10, 25, 100, 200, 500]"
              :key="n"
              class="cursor-pointer select-none"
            >
              <input
                type="radio"
                name="rounds"
                class="sr-only"
                :value="n"
                v-model="rounds"
              />
              <div
                :class="[
                  'relative flex items-center justify-center h-10 rounded transition-colors',
                  rounds === n ? 'bg-[#4a4b53]' : 'bg-[#37383f]',
                ]"
              >
                <span
                  :class="[
                    'absolute left-3 w-2.5 h-2.5 rounded-full transition-colors',
                    rounds === n ? 'bg-lime-400' : 'bg-[#1f1f1f]',
                  ]"
                />
                {{ n }}
              </div>
            </label>
          </div>
        </div>

        <!-- Stop/Loss & Take/Profit rows -->
        <template v-for="row in rows" :key="row.key">
          <div
            v-if="row.show"
            class="flex items-center justify-between px-4 py-2.5 rounded bg-[#2a2b33]"
          >
            <!-- toggle switch -->
            <label class="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                class="sr-only"
                v-model="row.enabled.value"
              />
              <span
                :class="[
                  'relative inline-block h-5 w-9 rounded-full transition-colors',
                  row.enabled.value ? 'bg-lime-500' : 'bg-gray-500',
                ]"
              >
                <span
                  :class="[
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                    row.enabled.value ? 'translate-x-4 left-0.5' : 'left-0.5',
                  ]"
                />
              </span>
              {{ row.label }}
            </label>

            <!-- spinner -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                :disabled="!row.enabled.value"
                @click="decrement(row)"
              >
                −
              </button>
              <input
                type="number"
                step="1.00"
                min="0"
                class="w-[74px] text-center rounded bg-[#1a1b20] disabled:opacity-40 disabled:cursor-not-allowed"
                v-model.number="row.model.value"
                :disabled="!row.enabled.value"
              />
              <button
                type="button"
                class="w-6 h-6 flex items-center justify-center rounded bg-[#1a1b20] disabled:opacity-40"
                :disabled="!row.enabled.value"
                @click="increment(row)"
              >
                +
              </button>
            </div>
          </div>
        </template>
      </section>

      <!-- FOOTER -->
      <footer class="px-5 pb-5">
        <button
          class="w-full py-2 rounded-md bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 text-[#1e1f26] font-bold tracking-wide"
          @click="submit"
        >
          START AUTO
        </button>
        <button
          type="button"
          class="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-200"
          @click="close"
        >
          Cancel
        </button>
      </footer>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref } from "vue";
import { useMinesStore } from "@/components/games/mines/Store";
import type { ConditionType } from "@/config/gameConfigs";

const props = defineProps({
  conditions: { type: Array as () => ConditionType[], required: true },
  modelValue: { type: Boolean, default: true },
});
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "submit"): void;
}>();

const store = useMinesStore();

/* visibility */
const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});
function close() {
  visible.value = false;
}

/* bind directly into store.auto */
const rounds = computed<number>({
  get: () => store.auto.roundsPlanned,
  set: (v) => (store.auto.roundsPlanned = v),
});
const showRounds = computed(() => props.conditions.includes("rounds"));

const withStopLoss = computed({
  get: () => store.auto.stopLoss !== null,
  set: (v: boolean) => {
    if (!v) store.auto.stopLoss = null;
    else if (store.auto.stopLoss === null) store.auto.stopLoss = 0;
  },
});
const stopLoss = computed<number>({
  get: () => store.auto.stopLoss ?? 0,
  set: (v) => (store.auto.stopLoss = v),
});
const showStopLoss = computed(() => props.conditions.includes("stopLoss"));

const withTakeProfit = computed({
  get: () => store.auto.takeProfit !== null,
  set: (v: boolean) => {
    if (!v) store.auto.takeProfit = null;
    else if (store.auto.takeProfit === null) store.auto.takeProfit = 0;
  },
});
const takeProfit = computed<number>({
  get: () => store.auto.takeProfit ?? 0,
  set: (v) => (store.auto.takeProfit = v),
});
const showTakeProfit = computed(() => props.conditions.includes("takeProfit"));

/* rows metadata */
interface Row {
  key: string;
  show: typeof showStopLoss | typeof showTakeProfit;
  enabled: typeof withStopLoss | typeof withTakeProfit;
  label: string;
  model: typeof stopLoss | typeof takeProfit;
}
const rows: Row[] = [
  {
    key: "sl",
    show: showStopLoss,
    enabled: withStopLoss,
    label: "Stop if cash decreases by",
    model: stopLoss,
  },
  {
    key: "tp",
    show: showTakeProfit,
    enabled: withTakeProfit,
    label: "Stop if single win exceeds",
    model: takeProfit,
  },
];

/* spinner behavior */
function increment(row: Row) {
  if (!row.enabled.value) return;
  row.model.value = parseFloat((row.model.value + 1).toFixed(2));
}
function decrement(row: Row) {
  if (!row.enabled.value) return;
  row.model.value = Math.max(0, parseFloat((row.model.value - 1).toFixed(2)));
}

/* submit simply enables auto and closes */
function submit() {
  store.auto.enabled = true;
  emit("submit");
  close();
}
</script>

<style scoped>
/* purely Tailwind utilities */
</style>

> > > src\components\shared\Header.vue:
> > > <template>

  <div
    ref="dropdownRef"
    class="relative w-full flex items-center px-4 shadow-md rounded-2xl text-white py-4 md:bg-black/30 bg-black/0"
  >
    <div class="flex items-center w-[50%] space-x-4">
      <!-- game selector button -->
      <button
        @click="toggleDropdown"
        class="flex items-center justify-center w-[130px] h-[24px] rounded-3xl shadow text-white text-[12px] px-2 transition-transform duration-100 active:translate-y-[2px] shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]"
        :style="{ backgroundColor: theme.btn }"
      >
        <span class="flex-1 text-center font-normal truncate">
          {{ selectedGame.name.toUpperCase() }}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- how to play button (static color) -->
      <button
        @click="openHowToPlayModal"
        class="flex items-center justify-center md:w-[150px] h-[22px] rounded-3xl shadow bg-[linear-gradient(to_bottom,_#f9a119,_#f38410)] text-black text-[12px] md:px-2 transition-transform duration-100 active:translate-y-[2px] active:shadow-inner"
      >
        <img
          :src="howTo"
          alt=""
          class="w-[16px] h-[16px] mx-1 md:mr-1 filter brightness-0"
        />
        <span class="hidden md:flex flex-1 text-center truncate">
          HOW TO PLAY?
        </span>
      </button>
    </div>

    <div class="flex justify-end items-center w-[50%] space-x-1 text-[12px]">
      <p class="font-mono">{{ balance.toLocaleString() }}</p>
      <p class="opacity-50">USD</p>
      <button
        @click="openMenu"
        class="p-1 rounded-full w-[24px] h-[24px] transition-transform duration-100 active:translate-y-[2px] shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]"
        :style="{ backgroundColor: theme.btn }"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 28 28"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="dropdownOpen"
      class="absolute md:top-full top-[-650%] left-1 grid grid-cols-4 gap-1 bg-[#212226] p-4 z-50 rounded-lg"
    >
      <div
        v-for="game in gameIcons"
        :key="game.routeName"
        class="flex flex-col items-center justify-end hover:opacity-80 cursor-pointer mb-2 w-[70px]"
        @click="onSelectGame(game)"
      >
        <img :src="game.src" :alt="game.name" class="w-108 h-108 mb-1" />
        <p class="text-[10px] opacity-70 font-extralight truncate">
          {{ game.name }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

import iconBalloon from "@/assets/gameIcons/icon-balloon.svg";
import iconDice from "@/assets/gameIcons/icon-dice.svg";
import iconGoal from "@/assets/gameIcons/icon-goal.svg";
import iconHiLo from "@/assets/gameIcons/icon-hi-lo.svg";
import iconHotline from "@/assets/gameIcons/icon-hotline.svg";
import iconKeno from "@/assets/gameIcons/icon-keno.svg";
import iconMines from "@/assets/gameIcons/icon-mines.svg";
import iconMiniRoulette from "@/assets/gameIcons/icon-mini-roulette.svg";
import iconPlinko from "@/assets/gameIcons/icon-plinko.svg";
import howTo from "@/assets/icon-how-to-play.svg";

interface GameType {
  name: string;
  src: string;
  routeName: string;
}

const props = defineProps<{
  theme: {
    btn: string;
  };
}>();
const { theme } = props;

const router = useRouter();
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedGame = ref<GameType>({
  name: "Mines",
  src: iconMines,
  routeName: "Mines",
});
const gameIcons: GameType[] = [
  { name: "Dice", src: iconDice, routeName: "Dice" },
  { name: "Plinko", src: iconPlinko, routeName: "Plinko" },
  { name: "Goal", src: iconGoal, routeName: "Goal" },
  { name: "Hi-Lo", src: iconHiLo, routeName: "HiLo" },
  { name: "Mines", src: iconMines, routeName: "Mines" },
  { name: "Keno", src: iconKeno, routeName: "Keno" },
  { name: "Mini Roulette", src: iconMiniRoulette, routeName: "miniroulette" },
  { name: "Hotline", src: iconHotline, routeName: "Hotline" },
  { name: "Balloon", src: iconBalloon, routeName: "Balloon" },
];

const userStore = useUserStore();
const { balance } = storeToRefs(userStore);

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

function handleClickOutside(event: MouseEvent) {
  if (
    dropdownOpen.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    dropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

function openHowToPlayModal() {}
function openMenu() {}

function onSelectGame(game: GameType) {
  selectedGame.value = game;
  dropdownOpen.value = false;
  router.push({
    name: "GameView",
    params: { id: game.routeName.toLowerCase() },
  });
}
</script>

<style scoped>
/* no additional custom styles */
</style>

> > > src\components\shared\BetControls.vue:

<!-- src/components/shared/BetControls.vue -->
<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { gameConfigs } from "@/config/gameConfigs";
import AutoGameModal from "@/components/shared/AutoGameModal.vue";

/* ------- game stores -------- */
import { useDiceStore } from "@/components/games/dice/Store";
import { usePlinkoStore } from "@/components/games/plinko/Store";
import { useMinesStore } from "@/components/games/mines/Store";
import { useGoalStore } from "@/components/games/goal/Store";
import { useHiloStore } from "@/components/games/hilo/Store";
import { useKenoStore } from "@/components/games/keno/Store";
import { useMiniRouletteStore } from "@/components/games/mini-roulette/Store";
import { useHotlineStore } from "@/components/games/hotline/Store";
import { useBalloonStore } from "@/components/games/balloon/Store";

/* ------- ui pieces ---------- */
import BetAuto from "@/components/shared/BetAuto.vue";
import BetButton from "@/components/shared/BetButton.vue";
import BetInput from "@/components/shared/BetInput.vue";

/* props -------------------------------------------------------------- */
const props = defineProps<{
  panelType: string;
  classes?: string;
  maxBet?: number;
  theme: { btn: string };
  showControls?: boolean;
}>();

/* pick store ---------------------------------------------------------- */
const gameStores: Record<string, any> = {
  dice: useDiceStore(),
  plinko: usePlinkoStore(),
  mines: useMinesStore(),
  goal: useGoalStore(),
  hilo: useHiloStore(),
  keno: useKenoStore(),
  miniroulette: useMiniRouletteStore(),
  hotline: useHotlineStore(),
  balloon: useBalloonStore(),
};
const store = gameStores[props.panelType];

/* modal spec ---------------------------------------------------------- */
const autoCfg = computed(() => gameConfigs[props.panelType]?.autoModal);

/* stake --------------------------------------------------------------- */
const betValue = ref(props.maxBet ?? 0);

/* reactive flags ------------------------------------------------------ */
const status = computed(() => store.betButtonStatus as string);
const autoEnabled = computed(() => store.auto?.enabled ?? false);
const autoRunning = computed(() => store.auto?.running ?? false);
const roundLocked = computed(() => store.status !== "betActive"); // 🔒
const betAutoDisabled = computed(() => roundLocked.value || !autoEnabled.value);

/* emit bridge --------------------------------------------------------- */
const emit = defineEmits<{
  (e: "update:bet", v: number): void;
  (e: "toggle:auto", v: boolean): void;
  (e: "place:bet"): void;
}>();
watch(betValue, (v) => emit("update:bet", v));

/* helpers ------------------------------------------------------------- */
function inc() {
  betValue.value = parseFloat((betValue.value + 0.1).toFixed(2));
}
function dec() {
  betValue.value = Math.max(0, parseFloat((betValue.value - 0.1).toFixed(2)));
}
function onBetClick() {
  store.handleClick?.();
  emit("place:bet");
}

/* auto toggle & modal ------------------------------------------------- */
const modalOpen = ref(false);

function toggleAuto() {
  if (betAutoDisabled.value) return; // locked or not-armed → ignore
  if (!autoRunning.value && autoCfg.value) {
    modalOpen.value = true; // open settings modal
  }
}

function handleAutoSubmit(payload?: any) {
  if (payload) store.setAutoConditions?.(payload);
  emit("toggle:auto", true);
  modalOpen.value = false;
}
</script>

<template>
  <div
    v-if="showControls !== false"
    :class="[
      classes,
      'w-full flex items-center justify-center shadow-inner rounded-xl',
    ]"
  >
    <div
      class="w-full py-4 md:py-3 flex items-center justify-center flex-col-reverse md:flex-row gap-y-5 md:space-x-4 shadow-inner rounded-xl bg-black/30"
    >
      <!-- stake -->
      <BetInput
        :value="betValue"
        :disabled="roundLocked"
        @increase="inc"
        @decrease="dec"
        :classes="theme.btn"
      />

      <!-- buttons -->
      <div class="flex flex-row justify-between w-[300px]">
        <BetAuto
          v-if="autoCfg"
          :running="autoRunning"
          :ready="autoEnabled"
          :disabled="betAutoDisabled"
          @toggle="toggleAuto"
        />
        <BetButton :status="status" @bet="onBetClick" />
      </div>
    </div>

    <!-- Auto-Play modal -->
    <AutoGameModal
      v-if="modalOpen && autoCfg"
      v-model="modalOpen"
      :conditions="autoCfg.conditions"
      @submit="handleAutoSubmit"
    />

  </div>
</template>

<style scoped>
/* Tailwind only */
</style>

> > > src\components\shared\BetInput.vue:
> > > <template>

  <!-- wrapper fades when locked -->
  <div :class="['relative', disabled ? 'opacity-50' : '']">
    <!-- Main BetInput component -->
    <div
      :class="[
        'flex items-center justify-between w-[300px] h-[50px] border border-[rgba(0,0,0,0.53)] rounded-[30px] shadow-[inset_1px_1px_#fff1cd33] px-3',
        disabled ? 'pointer-events-none' : '',
      ]"
    >
      <!-- text + readonly input (opens num-pad) -->
      <span class="flex flex-col items-start w-full sm:relative static">
        <div
          class="flex flex-col items-center justify-center text-[12px] w-full"
        >
          <p class="text-white text-center font-semibold">Bet USD</p>
          <input
            type="text"
            :value="inputValue"
            @click.stop="openNumPad"
            class="rounded-full border border-black/60 bg-black/30 text-white text-center font-bold cursor-pointer w-full"
            readonly
          />
        </div>

        <!-- pop-up num-pad -->
        <div
          v-if="numPadOpen"
          ref="numPad"
          class="absolute -top-[265px] left-1/2 transform -translate-x-1/2 w-[300px] rounded-2xl p-4 z-20 border"
          :style="{ backgroundColor: classes }"
        >
          <div class="grid grid-cols-3 gap-1 mb-1">
            <button
              v-for="key in keys"
              :key="key"
              @mousedown.prevent
              @click="pressKey(key)"
              class="text-white rounded-lg py-1 text-2xl font-semibold active:translate-y-[2px] border-black shadow-[1px_1px_1px_rgba(0,0,0,0.4),inset_1px_1px_0_rgba(255,255,255,0.2)] filter hover:brightness-90 transition duration-150"
              :style="{ backgroundColor: classes }"
            >
              <template v-if="key === 'back'">⌫</template>
              <template v-else>{{ key }}</template>
            </button>
          </div>
          <div class="flex justify-center">
            <button
              @click="confirmInput"
              class="flex items-center justify-center bg-[#013352] rounded-lg px-6 w-full py-2 active:translate-y-[2px]"
            >
              <img :src="iconTick" alt="Confirm" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </span>

      <!-- +/- and preset trigger -->
      <div class="flex flex-col w-full bg-blue-900 rounded-full py-1 items-end">
        <div class="flex items-center">
          <button
            @click="decrease"
            class="bg-blue-900 hover:bg-[#025580] text-white text-lg rounded-full w-[36px] h-[32px] active:translate-y-[2px] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &minus;
          </button>

          <span
            ref="toggleBtn"
            @click.stop="toggleDropdown"
            class="flex items-center justify-center mx-2 text-white font-medium border border-black rounded-full w-[38px] h-[36px] active:translate-y-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <img :src="iconBetVariant" alt="" class="w-5 h-5" />
          </span>

          <button
            @click="increase"
            class="bg-blue-900 hover:bg-[#025580] text-white text-lg rounded-full w-[36px] h-[32px] active:translate-y-[2px] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.2),inset_2px_2px_0_rgba(255,255,255,0.2)]"
          >
            &plus;
          </button>
        </div>
      </div>
    </div>

    <!-- preset amounts dropdown -->
    <div
      v-if="isOpen"
      ref="dropdown"
      class="absolute bottom-full left-0 w-[300px] bg-[#032e49] rounded-xl p-4 z-10"
    >
      <p
        class="text-center text-white text-[14px] opacity-80 font-bold -mt-2 mb-1"
      >
        Bet USD
      </p>
      <div class="grid grid-cols-2 gap-2 text-white">
        <button
          v-for="amount in amounts"
          :key="amount"
          @click="selectAmount(amount)"
          :class="[
            'rounded-full border border-black py-1 text-center font-medium active:translate-y-[2px] text-xs',
            selectedAmount === amount
              ? 'bg-[#2f82b5]'
              : 'bg-[#094164] hover:bg-[#0b5679]',
          ]"
        >
          {{ amount }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, toRefs } from "vue";
import { useMinesStore } from "@/components/games/mines/Store";
import iconBetVariant from "@/assets/icon-bet-variant.svg";
import iconTick from "@/assets/icon-calculator-tick.svg";

const props = withDefaults(
  defineProps<{ classes?: string; disabled?: boolean }>(),
  { classes: "#ffffff", disabled: false }
);

// keep reactivity on props
const { classes, disabled } = toRefs(props);

const store = useMinesStore();

const isOpen = ref(false);
const numPadOpen = ref(false);
const inputValue = ref(store.betValue.toFixed(2));
const selectedAmount = ref(store.betValue.toFixed(2));

/* ─── presets & keypad ─── */
const amounts = [
  "0.10",
  "0.20",
  "0.30",
  "0.40",
  "0.50",
  "0.60",
  "0.70",
  "0.80",
  "1.20",
  "2.00",
  "4.00",
  "10.00",
  "20.00",
  "50.00",
  "100.00",
];
const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

const toggleBtn = ref<HTMLElement | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const numPad = ref<HTMLElement | null>(null);

/* ─── UI helpers (guarded by disabled) ─── */
function toggleDropdown() {
  if (disabled.value) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) numPadOpen.value = false;
}
function openNumPad() {
  if (disabled.value) return;
  numPadOpen.value = true;
  inputValue.value = "";
  isOpen.value = false;
}
function closeAll() {
  isOpen.value = false;
  numPadOpen.value = false;
}

function selectAmount(a: string) {
  if (disabled.value) return;
  setBet(a);
}
function increase() {
  if (disabled.value) return;
  setBet((store.betValue + 0.1).toFixed(2));
}
function decrease() {
  if (disabled.value) return;
  const next = store.betValue - 0.1;
  setBet((next >= 0.1 ? next : store.betValue).toFixed(2));
}

function pressKey(k: string) {
  if (disabled.value) return;
  if (k === "back") inputValue.value = inputValue.value.slice(0, -1);
  else if (k === "." && inputValue.value.includes(".")) return;
  else inputValue.value += k;
}
function confirmInput() {
  if (disabled.value) return;
  let v = parseFloat(inputValue.value);
  if (isNaN(v) || v === 0) v = 0.1;
  setBet(v.toFixed(2));
  closeAll();
}

/* ─── core setter (delegates capping to store) ─── */
function setBet(amountStr: string) {
  const num = parseFloat(amountStr);
  store.setBetValue(num);
  inputValue.value = store.betValue.toFixed(2);
  selectedAmount.value = inputValue.value;
}

/* ─── outside click ─── */
function handleClickOutside(e: MouseEvent) {
  const t = e.target as Node;
  if (
    !dropdown.value?.contains(t) &&
    !toggleBtn.value?.contains(t) &&
    !numPad.value?.contains(t)
  )
    closeAll();
}
onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside)
);

/* ─── sync when store.betValue changes elsewhere ─── */
watch(
  () => store.betValue,
  (v) => {
    inputValue.value = v.toFixed(2);
    selectedAmount.value = inputValue.value;
  }
);

/* ─── close / reopen UI when disabled toggles ─── */
watch(disabled, (d) => {
  if (d) closeAll(); // close any open pop-ups while locked
});
</script>

> > > src\components\shared\BetAuto.vue:

<!-- src/components/shared/BetAuto.vue -->
<template>
  <button
    @click="handleClick"
    class="w-full max-w-[50px] h-[50px] mr-3 rounded-full"
    :disabled="disabled"
    :class="buttonClasses"
  >
    <!-- countdown while running -->
    <span v-if="running" class="text-white font-semibold text-lg">
      {{ countdown }}
    </span>

    <!-- icon when idle -->
    <img
      v-else
      :src="iconAutoPlay"
      alt="Auto Play"
      class="w-6 h-6 flex-shrink-0"
    />

  </button>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import iconAutoPlay from "@/assets/icon-auto-play.svg";

const props = withDefaults(
  defineProps<{
    running: boolean; // red / countdown mode
    ready: boolean; // checkbox ticked
    disabled: boolean; // round locked OR not-ready
  }>(),
  { running: false, ready: false, disabled: false }
);

const emit = defineEmits<{ (e: "toggle"): void }>();

/* ---------------- countdown while running --------------------------- */
const countdown = ref(0);
watch(
  () => props.running,
  (run) => {
    countdown.value = run ? 5 : 0;
  }
);

/* ---------------- click logic --------------------------------------- */
function handleClick() {
  if (props.disabled) return; // guard: inactive
  if (!props.running) emit("toggle"); // open modal when idle
}

/* ---------------- styling ------------------------------------------- */
const buttonClasses = computed(() => {
  const base =
    "w-16 h-16 flex items-center justify-center rounded-full border-2 " +
    "shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]";

  if (props.disabled) return [base, "opacity-40 cursor-not-allowed"];

  if (props.running) return [base, "bg-[#cc000e] border-gray-400"]; // red

  /* idle */
  const dim = props.ready ? "opacity-100" : "opacity-40";
  return [base, dim, "bg-green-500 border-green-400 hover:brightness-110"];
});
</script>

> > > src\components\shared\BetButton.vue:

<!-- src/components/shared/BetButton.vue -->
<template>
  <button
    :disabled="isDisabled"
    @click="handleClick"
    :class="[
      'relative inline-flex items-center justify-center w-full h-[50px] rounded-3xl font-semibold text-lg text-white tracking-wide',
      'transition-transform duration-75 focus:outline-none',
      'shadow-[2px_2px_0_rgba(0,0,0,0.3),inset_2px_2px_0_rgba(255,255,255,0.2)]',
      opacityClass,
    ]"
  >
    <span
      class="absolute inset-0 rounded-2xl ring-[2px] ring-black shadow-[inset_0_0_10px_rgba(25,0,0,0.3)]"
    />
    <span
      class="absolute inset-0 rounded-2xl pointer-events-none"
      :style="gradientStyle"
    />

    <!-- content -->
    <span
      :class="[
        'relative w-full px-6',
        isCashout
          ? 'flex flex-col items-center space-y-1'
          : 'flex items-center justify-between',
      ]"
    >
      <template v-if="isCashout">
        <span class="text-white font-semibold text-[16px] -mb-2">CASH OUT</span>
        <div
          class="bg-[rgba(0,0,0,0.41)] text-white font-semibold text-[12px] text-center px-2 rounded h-4 mt-1 leading-[1.5]"
        >
          {{ liveCash }} USD
        </div>
      </template>

      <template v-else>
        <img :src="iconBet" class="w-6 h-6" alt="bet" />
        <span
          class="flex-1 text-center font-semibold -ml-6 text-[14px]"
          style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6)"
        >
          BET
        </span>
      </template>
    </span>

  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMinesStore } from "@/components/games/mines/Store";
import { useMinesSettings } from "@/components/games/mines/settings";
import { useMinesRound } from "@/components/games/mines/round";
import { calcMultiplier } from "@/components/games/mines/math";
import iconBet from "@/assets/icon-bet.svg";

const props = defineProps<{ status: string }>();
const emit = defineEmits<{ (e: "bet"): void }>();

/* stores */
const ui = useMinesStore();
const settings = useMinesSettings();
const round = useMinesRound();

/* flags */
const isCashout = computed(() => props.status.includes("cashout"));
const isDisabled = computed(
  () => props.status === "betInactive" || props.status === "cashoutInactive"
);
const opacityClass = computed(() => (isDisabled.value ? "opacity-50" : ""));

/* gradient */
const gradientStyle = computed(() => {
  const shadow = "inset 0 -6px 8px rgba(0,0,0,0.3)";
  return isCashout.value
    ? {
        backgroundImage:
          "radial-gradient(44% 44% at 49.36% 52%,#dba355 0%,#c4872e 100%)",
        boxShadow: shadow,
      }
    : {
        backgroundImage:
          "radial-gradient(circle at 50% 50%, #61a503, #2d7500 94%)",
        boxShadow: shadow,
      };
});

const liveCash = computed(() => {
  if (props.status === "cashoutActive") {
    const mult = calcMultiplier(settings.minesCount, round.revealedTiles);
    return (ui.betValue * mult).toFixed(2);
  }
  if (props.status === "cashoutInactive") {
    return ui.lastWin.toFixed(2);
  }
  return "0.00";
});

function handleClick() {
  if (!isDisabled.value) emit("bet");
}
</script>
