// src/components/games/mines/Tile.ts
import * as PIXI from "pixi.js";

export class Tile extends PIXI.Container {
  private bg: PIXI.Graphics;
  private dot: PIXI.Graphics;

  constructor(
    width: number,
    height: number,
    cornerRadius: number,
    bgColor: number,
    dotColor: number
  ) {
    super();

    this.bg = new PIXI.Graphics()
      .beginFill(bgColor)
      .drawRoundedRect(0, 0, width, height, cornerRadius)
      .endFill();
    this.addChild(this.bg);

    const radius = Math.min(width, height) * 0.2;
    this.dot = new PIXI.Graphics()
      .beginFill(dotColor)
      .drawCircle(width / 2, height / 2, radius)
      .endFill();
    this.addChild(this.dot);
  }
}
