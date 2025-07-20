import { Container, Graphics, FillGradient, Ticker } from "pixi.js";

/* ───────────── Public API ───────────── */
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

/* ───────────── Styling ───────────── */
const BORDER_COLOR = 0x2a4b8c;
const BORDER_ALPHA = 0.8;
const DEFAULT_BORDER = 2;
const FLIP_HALF_DURATION = 0.18;

/* ───────────── Implementation ───────────── */
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

  /* ───── Public helpers ───── */
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

  /** Dim/undim for board-state indication. */
  setDimmed(on: boolean) {
    this.alpha = on ? 0.6 : 1.0;
  }

  get kind(): TileType {
    return TILE_CYCLE[this.cycleIndex];
  }

  /* ───── Internal rendering ───── */
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

  /* ───── Flip animation for reveal-all ───── */
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

/* ───── Utility helpers ───── */
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
  const size = Math.min(w, h) * 0.45;
  switch (kind) {
    case TileType.Bomb:
      g.circle(0, 0, size).fill(0x000000);
      g.circle(-size * 0.3, -size * 0.3, size * 0.45).fill(0x1a1a1a);
      g.rect(size * 0.25, -size * 0.7, size * 0.18, size * 0.45).fill(0x000000);
      break;
    case TileType.StarBlue:
    case TileType.StarGold:
      g.star(0, 0, 5, size, size * 0.45).fill(0xffffff);
      break;
    case TileType.Explosion:
      g.star(0, 0, 12, size * 1.0, size * 0.3).fill(0xc70909);
      g.star(0, 0, 8, size * 0.45, size * 0.15).fill(0xffd23b);
      break;
  }
}
