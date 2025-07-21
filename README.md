# 🧩 Pixi v8 Mines Game (Vue 3 + TypeScript)

A fully-responsive **Mines** game built with **Pixi.js v8** (engine version 8.2.1) integrated into **Vue 3** for reactive UI and **TypeScript** typing. This codebase follows solid **object-oriented design** so sprites, game logic, and UI evolve independently.

---

## ✨ Features

| Area         | Highlights                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gameplay** | • Adjustable board size & bomb count via dropdown<br>• Smooth tile-reveal animation and instant “reveal all” on explosion<br>• High-resolution tile sprites (bombs, stars, explosions)<br>• Confetti celebration on win (canvas-confetti)                                                               |
| **Tech**     | • **Pixi.js v8** scene graph with custom `Tile`, `MinesBoard`, `MinesGame` classes<br>• Vue 3 `<script setup>` SFCs + TypeScript everywhere<br>• Pinia store for state management (bets, rounds)<br>• Vite 5 dev-server & HMR<br>• Tailwind CSS 3.4 utility styling<br>• Heroicons via `@heroicons/vue` |
| **UX**       | • Mobile-first responsive layout (max-width 970 px)<br>• Accessible keyboard / ARIA on inputs & progress bar<br>• Dark-theme friendly                                                                                                                                                                   |

---

## 🚀 Quick Start

1. **Clone & install**

   ```bash
   git clone https://github.com/BelskviK/Vue-PIXI.git
   cd Vue-PIXI
   npm install
   ```

2. **Run dev server**

   ```bash
   npm run dev         # open http://localhost:5173
   ```

3. **Production build**

   ```bash
   npm run build       # outputs to /dist
   npm run preview     # local static preview
   ```

---

## 🎨 Engine Integration

The core game logic and rendering are handled by **Pixi.js v8**. We instantiate a `PIXI.Application` inside a Vue component, mounting the canvas to a reactive container. Scenes, sprites, filters, and animations use Pixi's scene graph and are wrapped in TypeScript classes for OOP separation.

---

© BelskviK
