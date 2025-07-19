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

## 🏗️ Tech Stack & Versions

```jsonc
"dependencies": {
  "@heroicons/vue": "^2.2.0",
  "@types/pixi.js": "^8.0.2",
  "canvas-confetti": "^1.9.3",
  "pinia": "^3.0.3",
  "pixi.js": "^8.2.1",
  "vue": "^3.4.0",
  "vue-router": "^4.2.5"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4.1.10",
  "@types/canvas-confetti": "^1.9.0",
  "@types/pixi.js": "^4.8.9",
  "@vitejs/plugin-vue": "^5.0.4",
  "@vue/language-plugin-pug": "^2.0.0",
  "autoprefixer": "^10.4.21",
  "postcss": "^8.5.6",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.3.3",
  "vite": "^5.1.0",
  "vite-plugin-vue-devtools": "^7.7.2"
}
```

> **Note:** `package.json` already locks these ranges—run `npm i` and you’ll get exactly the tested versions.

---

## 📂 Project Structure

```
src/
├─ assets/              # Images, SVGs, audio
├─ components/
│  └─ games/
│     └─ mines/
│        ├─ Tiles/      # OOP tile classes (Tile.ts, TileType.ts…)
│        ├─ MinesBoard.vue
│        ├─ MinesHeader.vue
│        └─ MinesGame.vue
├─ pages/
│  └─ GameView.vue      # Wraps any game
├─ stores/
│  ├─ mines.ts          # Pinia store for Mines
│  └─ user.ts
├─ router/
│  └─ index.ts
├─ App.vue
└─ main.ts
```

---

## 🚀 Quick Start

1. **Clone & install**

   ```bash
   git clone https://github.com/your-org/mines-pixi-vue.git
   cd mines-pixi-vue
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

## 🧱 Architecture Overview

| Layer          | Responsibility                                       | Key Classes / Files                                      |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| **Rendering**  | Draw high‑DPI sprites & animations                   | `Tile` (`extends PIXI.Container`), `MinesBoard`, shaders |
| **Game Logic** | Board generation, bomb randomisation, win/lose state | `MinesBoard.vue` (logic section), Pinia `mines.ts`       |
| **State**      | Bet value, buttons status                            | Pinia stores (`mines`, `user`)                           |
| **UI**         | Reactive controls, dropdowns, progress bars          | Vue SFCs (`MinesHeader`, inputs, toggles)                |
| **Styling**    | Layout & theming                                     | Tailwind utility classes with CSS variables              |

### OOP principles

- **Encapsulation:** `Tile` exposes only `reveal()` / `reset()`; internals (graphics) stay private.
- **Inheritance / Polymorphism:** Future tile types can extend a base `AbstractTile`.
- **Separation of Concerns:** Rendering code never touches business logic; state is centralised in Pinia.

---

## 🔌 GitHub Extensions (Recommended Files & Workflows)

Add these files/folders at the root (or under `.github/`) to improve collaboration and automation:

| Purpose                           | Path / File                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| Ignore build and local artefacts  | `.gitignore`                                                                        |
| Consistent editor settings        | `.editorconfig`                                                                     |
| Language‐agnostic text attributes | `.gitattributes`                                                                    |
| Node version pin                  | `.nvmrc`                                                                            |
| Community health files            | `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `LICENSE` (MIT)                            |
| Issue templates                   | `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md` |
| Pull‑request template             | `.github/PULL_REQUEST_TEMPLATE.md`                                                  |
| Code owners                       | `.github/CODEOWNERS`                                                                |
| Dependabot updates                | `.github/dependabot.yml`                                                            |
| Continuous Integration            | `.github/workflows/ci.yml` – install, lint, type‑check, test                        |
| GitHub Pages deploy               | `.github/workflows/deploy.yml` – build & push to `gh-pages` branch                  |

---

## 🧠 Useful NPM Scripts

| Script       | Purpose                             |
| ------------ | ----------------------------------- |
| `dev`        | Start Vite dev server with HMR      |
| `build`      | Production build (minified, hashed) |
| `preview`    | Local preview of built files        |
| `type-check` | Run `tsc` without emit              |
| `lint`       | _Coming soon_ — ESLint + Prettier   |

---

## 🗒️ TODO

Below is an initial backlog—tick off items as the project matures:

- [ ] **Core Engine:** split Pixi classes into `/engine` sub‑folder (`Tile`, `MinesBoard`, `MinesGame`).
- [ ] **Unit Tests:** add Vitest coverage for board generation, reveal logic, win detection.
- [ ] **CI Pipeline:** configure GitHub Actions (`ci.yml`) to run install → lint → type‑check → test on push/PR.
- [ ] **Code Quality:** add ESLint, Prettier, Husky pre‑commit hook.
- [ ] **Deployment:** auto‑deploy `main` branch to GitHub Pages (`deploy.yml`).
- [ ] **Theme Switcher:** dark/light toggle persisted in `localStorage`.
- [ ] **Sound Effects:** flip & explosion sounds with mute toggle.
- [ ] **Win Celebration:** trigger canvas‑confetti on victory.
- [ ] **Accessibility:** keyboard navigation & proper ARIA labels for tiles and controls.
- [ ] **i18n:** integrate `vue-i18n` with English & Spanish locale files.
- [ ] **Leaderboard (stretch):** store best times / scores in Firebase or Supabase and display.

---

## 🤝 Contributing

1. Fork & create a feature branch (`git checkout -b feat/awesome-thing`)
2. Commit with **conventional commits** style (`feat: add x`, `fix: correct y`)
3. Run `npm run lint && npm run type-check && npm test`
4. Open a Pull Request—discussions welcome! ✨

---

## 📝 License

Released under the **MIT License**—hack, share, and profit 🚀
