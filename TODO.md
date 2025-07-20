# Master TODO Checklist

- [ ✅] **MinesFooter.vue:** ensure left‑side auto‑toggle SVG rotates and clears tiles properly.
- [ ✅ ] **BetInput / NumPad / ValuePicker:** pull their colours dynamically from config.

- [ ] **Auto Game:** honour all 3 stop conditions (X rounds, balance ≤ target, balance ≥ target).
- [ ] **ADDING component** label wich shows gained or lost money.

- [ ] **Header.vue:** highlight the active game in the switcher (change SVG fill for the selected game).
- [ ] **Header.vue:** replace “How to Play” button with a shared modal system; modal content per game lives in `src/config/gameConfigs.ts`.
- [ ] **gameConfigs.ts:** add burger‑menu hover + dropdown with public links.

- [ ] **Global:** remove any lingering `defineProps` warnings.
- [ ] when selected mines = 1 multiplier rounds 24 to 500
- [ ] betinput null
- [ ] animation when reveal, unimate click before rvealing

      adjustments:

- [ ✅ ] nextMultiplier did not worked on last selected two tiles until (fullgrid.q - selectedMines)
- [ ✅ ] implemented 🔃 to restart preselected grid in auto-game.
- [ ❌ ] highlited SVGs in game selector dropdown.
- [ ❌ ] auto-game is ruled with all conditions from modal.
- [ ❌ ] change favicons dynamicly by switching games.
