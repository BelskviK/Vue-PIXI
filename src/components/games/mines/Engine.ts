// src/games/mines/Engine.ts
export type CellState = "hidden" | "safe" | "bomb" | "explosion";

export class MinesEngine {
  readonly rows: number;
  readonly cols: number;
  private bombs: Set<number>;
  private revealed: Set<number>;
  private _exploded = false;

  constructor(rows: number, cols: number, bombsWanted: number) {
    this.rows = rows;
    this.cols = cols;
    this.revealed = new Set();

    const max = rows * cols;
    const bombs = Math.min(bombsWanted, max - 1); // keep at least one safe
    this.bombs = this.randomUnique(bombs, max);
  }

  /** Index helper (row-major). */
  private idx(r: number, c: number) {
    return r * this.cols + c;
  }

  /** Returns true if the given cell hides a bomb. */
  isBomb(index: number) {
    return this.bombs.has(index);
  }

  /** Did the player already click a bomb? */
  get exploded() {
    return this._exploded;
  }

  /** True if the given cell has been revealed already. */
  isRevealed(index: number) {
    return this.revealed.has(index);
  }

  /**
   * Player clicked a cell.
   *  • returns "safe"         – safe cell clicked
   *  • returns "explosion"    – bomb cell clicked (and marks game as exploded)
   */
  reveal(index: number): CellState {
    if (this.revealed.has(index)) return "safe"; // ignore double-clicks
    this.revealed.add(index);

    if (this.bombs.has(index)) {
      this._exploded = true;
      return "explosion";
    }
    return "safe";
  }

  /** Reveal everything (used when round ends). */
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

  /** Utility – choose `count` distinct numbers in [0, range). */
  private randomUnique(count: number, range: number): Set<number> {
    const s = new Set<number>();
    while (s.size < count) s.add(Math.floor(Math.random() * range));
    return s;
  }
}
