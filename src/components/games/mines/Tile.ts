import { Container, Graphics, FillGradient } from "pixi.js";

/* ────────────────────────────────────────────────────────────────────────── */
/* Public API                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export enum TileType {
  Hidden = "hidden",
  Bomb = "bomb",
  StarBlue = "starBlue",
  StarGold = "starGold",
  Explosion = "explosion",
}

export const TILE_CYCLE: TileType[] = [
  TileType.Hidden,
  TileType.Bomb,
  TileType.StarBlue,
  TileType.StarGold,
  TileType.Explosion,
];

export interface TileOptions {
  width?: number; // default 64
  height?: number; // default 48
  radius?: number; // default 8
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Internal constants                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

const BORDER_COLOR = 0x2a4b8c; // same blue as the dot
const BORDER_ALPHA = 0.8;
const BORDER_WIDTH = 2;

const DEPTH_FRAC = 0.12; // how thick the “card” appears

/* ────────────────────────────────────────────────────────────────────────── */
/* Utility                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function shade(color: number, factor: number): number {
  // factor < 1 → darker,  factor > 1 → lighter
  const r = Math.max(0, Math.min(255, ((color >> 16) & 0xff) * factor));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 0xff) * factor));
  const b = Math.max(0, Math.min(255, (color & 0xff) * factor));
  return (r << 16) | (g << 8) | b;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Tile class                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export class Tile extends Container {
  private depth: Graphics; // faux thickness
  private face: Graphics; // gradient face
  private border: Graphics; // outline
  private icon: Graphics; // centre graphic

  private readonly w: number;
  private readonly h: number;
  private readonly r: number;
  private cycle = 0;

  constructor(opts: TileOptions = {}) {
    super();

    this.w = opts.width ?? 64;
    this.h = opts.height ?? 48;
    this.r = opts.radius ?? 8;

    this.depth = new Graphics();
    this.face = new Graphics();
    this.border = new Graphics();
    this.icon = new Graphics();

    /* draw order: depth → face → border → icon */
    this.addChild(this.depth, this.face, this.border, this.icon);

    this.redraw();
  }

  /* ------------------------------------------------------------ */
  /* Public helpers                                               */
  /* ------------------------------------------------------------ */

  next(): void {
    this.cycle = (this.cycle + 1) % TILE_CYCLE.length;
    this.redraw();
  }

  setKind(kind: TileType): void {
    const idx = TILE_CYCLE.indexOf(kind);
    if (idx >= 0) {
      this.cycle = idx;
      this.redraw();
    }
  }

  get kind(): TileType {
    return TILE_CYCLE[this.cycle];
  }

  /* ------------------------------------------------------------ */
  /* Rendering                                                    */
  /* ------------------------------------------------------------ */

  private redraw(): void {
    const kind = this.kind;

    /* ---------- colours -------------------------------------- */
    const [top, bottom] = faceColors(kind);
    const depthColor = shade(bottom, 0.65); // darker bottom lip
    const starIvory = 0xfff9e2;

    /* ---------- depth (bottom lip) --------------------------- */
    const depthH = Math.round(this.h * DEPTH_FRAC);
    this.depth
      .clear()
      .roundRect(0, depthH, this.w, this.h, this.r) // slightly offset down
      .fill(depthColor);

    /* ---------- face ----------------------------------------- */
    const faceGrad = new FillGradient({
      type: "linear",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: top },
        { offset: 1, color: bottom },
      ],
    }); // Pixi linear-gradient fill :contentReference[oaicite:0]{index=0}

    this.face
      .clear()
      .roundRect(0, 0, this.w, this.h, this.r)
      .fill({ fill: faceGrad });

    /* ---------- outline -------------------------------------- */
    this.border.clear().roundRect(0, 0, this.w, this.h, this.r).stroke({
      width: BORDER_WIDTH,
      color: BORDER_COLOR,
      alpha: BORDER_ALPHA,
    }); // Pixi stroke style  :contentReference[oaicite:1]{index=1}

    /* ---------- icon & centre dot ---------------------------- */
    this.icon.clear();

    if (kind === TileType.Hidden) {
      // original blue dot
      const radius = Math.min(this.w, this.h) * 0.2;
      this.icon.circle(0, 0, radius).fill(BORDER_COLOR);
    } else {
      drawIcon(this.icon, kind, this.w, this.h, starIvory);
    }

    this.icon.position.set(this.w / 2, this.h / 2);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function faceColors(kind: TileType): [number, number] {
  switch (kind) {
    case TileType.StarGold:
      return [0xffc63c, 0xe88900];
    case TileType.Explosion:
      return [0xff8a97, 0xdd4c66];
    default:
      return [0x0b5aa4, 0x064186]; // Hidden, Bomb, StarBlue
  }
}

function drawIcon(
  g: Graphics,
  kind: TileType,
  w: number,
  h: number,
  starIvory: number
): void {
  const size = Math.min(w, h) * 0.45;

  switch (kind) {
    case TileType.Bomb: {
      g.circle(0, 0, size).fill(0x000000); // body
      g.circle(-size * 0.3, -size * 0.3, size * 0.45).fill(0x1a1a1a); // subtle glare
      g.rect(size * 0.25, -size * 0.7, size * 0.18, size * 0.45).fill(0x000000); // fuse
      break;
    }

    case TileType.StarBlue:
    case TileType.StarGold: {
      // soft radial gradient for ivory star
      const starGrad = new FillGradient({
        type: "radial",
        center: { x: 0.5, y: 0.5 },
        innerRadius: 0,
        outerRadius: 1,
        colorStops: [
          { offset: 0, color: 0xffffff },
          { offset: 1, color: starIvory },
        ],
      }); // radial gradient demo  :contentReference[oaicite:2]{index=2}

      g.star(0, 0, 5, size, size * 0.45).fill({ fill: starGrad });
      break;
    }

    case TileType.Explosion: {
      g.star(0, 0, 12, size, size * 0.3).fill(0xc70909); // red burst
      g.star(0, 0, 8, size * 0.45, size * 0.15).fill(0xffd23b); // yellow core
      break;
    }

    default:
      break; // Hidden handled earlier
  }
}
