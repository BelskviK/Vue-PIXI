import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class PixiGameHeader extends Container {
  private bg: Graphics;
  private titleText: Text;
  private userInfoText: Text;

  constructor(title: string, userName: string, balance: number, width: number) {
    super();

    this.bg = new Graphics()
      .beginFill(0x000000, 0.8)
      .drawRect(0, 0, width, 50)
      .endFill();
    this.addChild(this.bg);

    this.titleText = new Text(
      title,
      new TextStyle({
        fontSize: 20,
        fill: "#ffffff",
        fontWeight: "bold",
      })
    );
    this.titleText.position.set(20, 15);
    this.addChild(this.titleText);

    this.userInfoText = new Text(
      `👤 ${userName} | 💰 ${balance}$`,
      new TextStyle({
        fontSize: 16,
        fill: "#ffffff",
      })
    );
    this.userInfoText.anchor.set(1, 0);
    this.userInfoText.position.set(width - 20, 17);
    this.addChild(this.userInfoText);
  }

  updateBalance(newBalance: number) {
    const parts = this.userInfoText.text.split("|");
    this.userInfoText.text = `${parts[0]}| 💰 ${newBalance}$`;
  }

  updateUser(name: string) {
    const parts = this.userInfoText.text.split("|");
    this.userInfoText.text = `👤 ${name} | ${parts[1]}`;
  }

  updateTitle(newTitle: string) {
    this.titleText.text = newTitle;
  }
}
