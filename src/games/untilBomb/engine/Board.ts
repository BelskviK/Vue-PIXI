import { Application, Container, BlurFilter } from "pixi.js";
import { CardGraphics } from "./CardGraphics";

export class Board {
  container: Container;
  cards: CardGraphics[] = [];
  bombIndex: number = -1;

  constructor(
    public app: Application,
    public gridSize: number,
    public spacing: number,
    public cardSize: number,
    public onFlip: (card: CardGraphics) => void
  ) {
    this.container = new Container();
    this.app.stage.addChild(this.container);
  }

  generate(blurred = false) {
    this.container.removeChildren();
    this.cards = [];
    this.bombIndex = Math.floor(Math.random() * this.gridSize ** 2);
    const totalSize =
      this.gridSize * this.cardSize + (this.gridSize - 1) * this.spacing;
    const startX = (this.app.screen.width - totalSize) / 2;
    const startY = (this.app.screen.height - totalSize) / 2;
    for (let i = 0; i < this.gridSize ** 2; i++) {
      const row = Math.floor(i / this.gridSize);
      const col = i % this.gridSize;
      const x = startX + col * (this.cardSize + this.spacing);
      const y = startY + row * (this.cardSize + this.spacing);
      const card = new CardGraphics(i, x, y, this.cardSize, this.onFlip);
      this.container.addChild(card);
      this.cards.push(card);
    }
    if (blurred) {
      const blurFilter = new BlurFilter();
      blurFilter.blur = 3;
      this.container.filters = [blurFilter];
      this.container.alpha = 0.3;
    } else {
      this.container.filters = [];
      this.container.alpha = 1;
    }
  }
}
