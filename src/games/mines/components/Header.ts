// src/games/mines/components/Header.ts
import { Container, Sprite, Texture, Text } from "pixi.js";

export class Header extends Container {
  private bg: Sprite;
  private title: Text;
  private _width: number;
  private _height: number;
  private startColor: string;
  private endColor: string;

  constructor(
    width: number,
    height: number,
    titleText: string = "Mines Game",
    startColor: string = "#055A8E",
    endColor: string = "#013D97"
  ) {
    super();
    this._width = width;
    this._height = height;
    this.startColor = startColor;
    this.endColor = endColor;

    this.bg = this.createGradientBg();
    this.addChild(this.bg);

    this.title = new Text(titleText, {
      fontSize: height * 0.5,
      fill: "#ffffff",
    });
    this.title.anchor.set(0.5);
    this.title.position.set(width / 2, height / 2);
    this.addChild(this.title);
  }

  private createGradientCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = this._width;
    canvas.height = this._height;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, this._width, 0);
    grad.addColorStop(0, this.startColor);
    grad.addColorStop(1, this.endColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this._width, this._height);
    return canvas;
  }

  private createGradientBg(): Sprite {
    const canvas = this.createGradientCanvas();
    const texture = Texture.from(canvas);
    const sprite = new Sprite(texture);
    sprite.width = this._width;
    sprite.height = this._height;
    return sprite;
  }

  private redrawBg(): void {
    const canvas = this.createGradientCanvas();
    const newTexture = Texture.from(canvas);
    this.bg.texture = newTexture;
    this.bg.width = this._width;
    this.bg.height = this._height;
  }

  /**
   * Dynamically update the gradient colors
   */
  public setColors(startColor: string, endColor: string): void {
    this.startColor = startColor;
    this.endColor = endColor;
    this.redrawBg();
  }

  set width(value: number) {
    this._width = value;
    this.title.x = value / 2;
    this.redrawBg();
  }

  set height(value: number) {
    this._height = value;
    this.title.y = value / 2;
    this.redrawBg();
  }
}
