import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class Background extends Container {
  private bg: Graphics;
  private textLabel: Text;

  constructor(width: number, height: number) {
    super();

    this.bg = new Graphics();
    this.drawBackground(width, height);
    this.addChild(this.bg);

    const style = new TextStyle({
      fontSize: 18,
      fill: "#ffffff",
    });

    this.textLabel = new Text("Welcome to Mines Game", style);
    this.textLabel.anchor.set(0.5);
    this.textLabel.x = width / 2;
    this.textLabel.y = height / 2;
    this.addChild(this.textLabel);
  }

  private drawBackground(width: number, height: number) {
    this.bg.clear();
    this.bg.beginFill(0x007bff); // blue
    this.bg.drawRect(0, 0, width, height);
    this.bg.endFill();
  }

  set width(value: number) {
    this.drawBackground(value, this.height);
    this.textLabel.x = value / 2;
  }

  set height(value: number) {
    this.drawBackground(this.width, value);
    this.textLabel.y = value / 2;
  }
}
