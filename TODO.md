# Master TODO Checklist

- [ ] **Header.vue:** highlight the active game in the switcher (change SVG fill for the selected game).

- [ ] **Header.vue:** replace “How to Play” button with a shared modal system; modal content per game lives in `src/config/gameConfigs.ts`.

- [ ] **gameConfigs.ts:** add burger‑menu hover + dropdown with public links.

- [ ] **MinesHeader.vue:** remove `active:/click` class from non‑button multiplier div.
- [ ] **MinesFooter.vue:** ensure left‑side auto‑toggle SVG rotates and clears tiles properly.
- [ ] **Auto Game:** honour all 3 stop conditions (X rounds, balance ≤ target, balance ≥ target).
- [ ] **BetInput / NumPad / ValuePicker:** pull their colours dynamically from config.
- [ ] **Auto Game UI:** add disabled animation while running; ensure button state sync.
- [ ] **Global:** remove any lingering `defineProps` warnings.
