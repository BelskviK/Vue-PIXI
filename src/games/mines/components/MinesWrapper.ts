// src/games/mines/components/MinesWrapper.ts
import { Container, Graphics } from "pixi.js";

export class MinesWrapper extends Container {
  private bg: Graphics;
  private _width: number;
  private _height: number;

  constructor(width: number, height: number) {
    super();
    this._width = width;
    this._height = height;

    this.bg = new Graphics();
    this.drawBackground(width, height);
    this.addChild(this.bg);
  }

  private drawBackground(width: number, height: number): void {
    this.bg.clear();
    this.bg.rect(0, 0, width, height).fill({ color: 0x555555, alpha: 1 });
  }

  set width(value: number) {
    this._width = value;
    this.drawBackground(this._width, this._height);
  }

  set height(value: number) {
    this._height = value;
    this.drawBackground(this._width, this._height);
  }
}
