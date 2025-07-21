# 🧩 Pixi v8 Mines Game (Vue 3 + TypeScript)

A fully‑responsive **Mines** game built with **Pixi.js v8** for high‑performance canvas rendering and **Vue 3** for reactive UI. The codebase follows solid **object‑oriented design** so sprites, game logic, and UI can evolve independently.

---

## ✨ Features

| Area         | Highlights                                                                                                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gameplay** | • Adjustable board size & bomb count via dropdown<br>• Smooth tile‑reveal animation and instant “reveal all” on explosion<br>• High‑resolution tile sprites (bombs, stars, explosions)<br>• Pinia store drives bet / cash‑out flow |
| **Tech**     | • Pixi.js 8 scene graph with custom `Tile`, `MinesBoard`, `MinesGame` classes<br>• Vue 3 `<script setup>` SFCs + TypeScript typing everywhere<br>• Vite 5 dev‑server & hot‑reload<br>• Tailwind CSS 3.4 utility styling            |
| **UX**       | • Mobile‑first responsive layout (max‑width 970 px)<br>• Accessible keyboard / ARIA on inputs & progress bar<br>• Dark‑theme friendly                                                                                              |

---

## 🚀 Quick Start

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

## 🧠 Useful NPM Scripts

| Script    | Purpose                             |
| --------- | ----------------------------------- |
| `dev`     | Start Vite dev server with HMR      |
| `build`   | Production build (minified, hashed) |
| `preview` | Local preview of built files        |

---
