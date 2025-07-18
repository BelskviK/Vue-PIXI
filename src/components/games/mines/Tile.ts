import { Container, Graphics, FillGradient } from "pixi.js";

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export enum TileType {
  Hidden = "hidden", // covered / unrevealed
  Bomb = "bomb",
  StarBlue = "starBlue",
  StarGold = "starGold",
  Explosion = "explosion",
}

/** order we cycle through on click */
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

/**
 * One Mines tile.  Drawn entirely with Pixi v8 Graphics, so it scales crisply.
 */
export class Tile extends Container {
  private bg: Graphics;
  private icon: Graphics;
  private w: number;
  private h: number;
  private r: number;
  private cycleIndex = 0; // starts at Hidden

  constructor(opts: TileOptions = {}) {
    super();

    this.w = opts.width ?? 64;
    this.h = opts.height ?? 48;
    this.r = opts.radius ?? 8;

    this.bg = new Graphics();
    this.icon = new Graphics();

    this.addChild(this.bg, this.icon);

    this.redraw();
  }

  /* -------------------------------------------------------------- */
  /* Public helpers                                                 */
  /* -------------------------------------------------------------- */

  /** advance to next style in the cycle */
  next(): void {
    this.cycleIndex = (this.cycleIndex + 1) % TILE_CYCLE.length;
    this.redraw();
  }

  /** directly set kind (useful for game logic) */
  setKind(kind: TileType): void {
    const idx = TILE_CYCLE.indexOf(kind);
    if (idx >= 0) {
      this.cycleIndex = idx;
      this.redraw();
    }
  }

  get kind(): TileType {
    return TILE_CYCLE[this.cycleIndex];
  }

  /* -------------------------------------------------------------- */
  /* drawing                                                        */
  /* -------------------------------------------------------------- */

  private redraw(): void {
    const kind = this.kind;

    /* ----------- background ------------------------------------ */
    const [top, bottom] = backgroundColors(kind);
    const grad = new FillGradient({
      type: "linear",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: top },
        { offset: 1, color: bottom },
      ],
    });

    this.bg
      .clear()
      // drop-shadow
      .roundRect(1, 1, this.w, this.h, this.r)
      .fill(bottom)
      // face
      .roundRect(0, 0, this.w, this.h, this.r)
      .fill({ fill: grad });

    /* ----------- icon ------------------------------------------ */
    this.icon.clear();
    if (kind !== TileType.Hidden) {
      drawIcon(this.icon, kind, this.w, this.h);
      this.icon.position.set(this.w / 2, this.h / 2); // centre
    }
  }
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function backgroundColors(kind: TileType): [number, number] {
  switch (kind) {
    case TileType.StarGold:
      return [0xffc63c, 0xe88900];
    case TileType.Explosion:
      return [0xff7d90, 0xdd4c66];
    default:
      return [0x065199, 0x003c71]; // Hidden, Bomb, StarBlue
  }
}

function drawIcon(g: Graphics, kind: TileType, w: number, h: number): void {
  const size = Math.min(w, h) * 0.45;

  switch (kind) {
    case TileType.Bomb: {
      g.circle(0, 0, size).fill(0x000000); // body
      g.circle(-size * 0.3, -size * 0.3, size * 0.45).fill(0x222222); // glare
      g.rect(size * 0.25, -size * 0.7, size * 0.18, size * 0.45).fill(0x000000); // fuse
      g.moveTo(size * 0.5, -size * 0.9) // spark
        .lineTo(size * 0.9, -size * 1.3)
        .lineTo(size * 0.4, -size * 1.15)
        .fill(0xffe04d);
      break;
    }
    case TileType.StarBlue:
    case TileType.StarGold:
      g.star(0, 0, 5, size, size * 0.45).fill(0xffffff);
      break;

    case TileType.Explosion:
      g.star(0, 0, 12, size, size * 0.3).fill(0xc70909); // red burst
      g.star(0, 0, 8, size * 0.45, size * 0.15).fill(0xffd23b); // yellow core
      break;

    default:
      break; // Hidden => no icon
  }
}
