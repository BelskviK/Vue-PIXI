// src/games/mines/components/MinesWrapper.ts
import { Container, Sprite, Texture } from "pixi.js";

export class MinesWrapper extends Container {
  private bg: Sprite;
  private _width: number;
  private _height: number;

  constructor(width: number, height: number) {
    super();
    this._width = width;
    this._height = height;
    this.bg = this.createGradientBg(width, height);
    this.addChild(this.bg);
  }

  private createGradientBg(w: number, h: number): Sprite {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const s = new Sprite(Texture.from(c));
    s.width = w;
    s.height = h;
    return s;
  }

  set width(v: number) {
    this._width = v;
    this.removeChild(this.bg);
    this.bg = this.createGradientBg(this._width, this._height);
    this.addChildAt(this.bg, 0);
  }

  set height(v: number) {
    this._height = v;
    this.removeChild(this.bg);
    this.bg = this.createGradientBg(this._width, this._height);
    this.addChildAt(this.bg, 0);
  }
}
