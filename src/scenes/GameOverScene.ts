import * as Phaser from "phaser";
import * as config from "../config";

export class GameOverScene extends Phaser.Scene {
  worldHeight = 0;
  worldWidth = 0;

  constructor() {
    super(config.SceneNames.GameOver);
  }

  preload() {}

  create() {
    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;

    const middleX = this.worldWidth / 2;
    const middleY = this.worldHeight / 2;

    this.add.rectangle(middleX, middleY, 400, 200, 0x000, 0.7).setOrigin(0.5, 0.5);
    this.add
      .text(middleX, middleY, "GAME OVER", {
        color: config.UIColor,
        fontSize: "5em",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 0.5);

    this.input.on("pointerup", this.handlePointerUp);
  }

  handlePointerUp = () => {
    this.scene.stop(config.SceneNames.GameOver);
    this.scene.launch(config.SceneNames.Game);
  };
}
