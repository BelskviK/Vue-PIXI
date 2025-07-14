// src/games/mines/components/BetControls.ts
import { Container, Sprite, Texture, Text } from "pixi.js";

export class BetControls extends Container {
  private bg: Sprite;
  private betText: Text;
  private incBtn: Sprite;
  private decBtn: Sprite;
  private amount = 1;
  private _width: number;
  private _height: number;
  private startColor: string;
  private endColor: string;

  constructor(
    width: number,
    height: number,
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

    this.betText = new Text(`Bet: ${this.amount}`, {
      fontSize: height * 0.4,
      fill: "#ffffff",
    });
    this.betText.anchor.set(0.5);
    this.betText.position.set(width / 2, height / 2);
    this.addChild(this.betText);

    const btnSize = height * 0.6;
    this.decBtn = this.createCircleBtn(btnSize, "#aa0000");
    this.decBtn.anchor.set(0.5);
    this.decBtn.position.set(width / 2 - btnSize - 10, height / 2);
    this.decBtn.interactive = true;
    this.decBtn.on("pointerdown", () => this.updateBet(-1));
    this.addChild(this.decBtn);

    this.incBtn = this.createCircleBtn(btnSize, "#00aa00");
    this.incBtn.anchor.set(0.5);
    this.incBtn.position.set(width / 2 + btnSize + 10 - btnSize, height / 2);
    this.incBtn.interactive = true;
    this.incBtn.on("pointerdown", () => this.updateBet(1));
    this.addChild(this.incBtn);
  }

  private createGradientCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = this._width;
    canvas.height = this._height;
    const ctx = canvas.getContext("2d")!;

    // Create horizontal gradient
    const grad = ctx.createLinearGradient(0, 0, this._width, 0);
    grad.addColorStop(0, this.startColor);
    grad.addColorStop(1, this.endColor);
    ctx.fillStyle = grad;

    // Draw rounded rectangle background
    const radius = Math.min(this._width, this._height) * 0.1;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(this._width - radius, 0);
    ctx.quadraticCurveTo(this._width, 0, this._width, radius);
    ctx.lineTo(this._width, this._height - radius);
    ctx.quadraticCurveTo(
      this._width,
      this._height,
      this._width - radius,
      this._height
    );
    ctx.lineTo(radius, this._height);
    ctx.quadraticCurveTo(0, this._height, 0, this._height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

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
    this.bg.texture = Texture.from(canvas);
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

  private createCircleBtn(size: number, color: string): Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    return new Sprite(Texture.from(canvas));
  }

  private updateBet(delta: number) {
    const newAmt = this.amount + delta;
    if (newAmt < 1) return;
    this.amount = newAmt;
    this.betText.text = `Bet: ${this.amount}`;
  }

  set width(value: number) {
    this._width = value;
    this.betText.x = value / 2;
    const btnSize = this.incBtn.width;
    this.decBtn.x = value / 2 - btnSize - 10;
    this.incBtn.x = value / 2 + btnSize + 10 - btnSize;
    this.redrawBg();
  }

  set height(value: number) {
    this._height = value;
    this.betText.y = value / 2;
    this.decBtn.y = value / 2;
    this.incBtn.y = value / 2;
    this.redrawBg();
  }
}
