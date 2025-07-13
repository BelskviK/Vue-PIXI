import { Graphics, Text } from "pixi.js";

export class CardGraphics extends Graphics {
  index: number;
  isFlipped: boolean;
  textLabel: Text; // Changed from 'label' to 'textLabel' to avoid conflict

  constructor(
    index: number,
    x: number,
    y: number,
    size: number,
    onFlip: (card: CardGraphics) => void
  ) {
    super();
    this.index = index;
    this.isFlipped = false;
    this.x = x;
    this.y = y;
    this.interactive = true;
    this.cursor = "pointer";
    this.textLabel = new Text("?", {
      // Changed property name
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0xffffff,
      align: "center",
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.x = size / 2;
    this.textLabel.y = size / 2;
    this.beginFill(0x2196f3);
    this.drawRoundedRect(0, 0, size, size, 10);
    this.endFill();
    this.addChild(this.textLabel);
    this.on("pointertap", () => onFlip(this));
  }

  revealBomb() {
    this.textLabel.text = "💣";
    this.textLabel.style.fill = 0xff0000;
    this.tint = 0xff5252;
  }

  revealSafe(multiplier: number) {
    this.textLabel.text = `${multiplier.toFixed(2)}x`;
    this.textLabel.style.fill = 0xffffff;
    this.tint = 0x4caf50;
  }
}
