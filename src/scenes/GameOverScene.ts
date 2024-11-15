import * as Phaser from "phaser";
import * as config from "../config";

type sceneData = {
  finalScore: number;
};

const sceneHeight = 300;
const sceneAlpha = 0.7;

export class GameOverScene extends Phaser.Scene {
  worldHeight = 0;
  worldWidth = 0;
  finalScore = 0;
  playAgainButtonText: Phaser.GameObjects.Text;

  constructor() {
    super(config.SceneNames.GameOver);
  }

  init(data: sceneData) {
    this.finalScore = data.finalScore;
  }

  preload() {}

  create() {
    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;

    this.add.rectangle(0, 0, this.worldWidth, this.worldHeight, 0x000, sceneAlpha).setOrigin(0);

    const middleX = this.worldWidth / 2;
    const middleY = this.worldHeight / 2;

    this.add
      .rectangle(middleX, middleY, (this.worldWidth / 3) * 2, sceneHeight, 0x000, 0.5)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, config.UIColorAltHex);
    this.add
      .text(middleX, middleY - sceneHeight / 4, "GAME OVER", {
        color: config.UIColorAlt,
        fontSize: "5em",
        // fontStyle: "bold",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 1)
      .preFX?.addShadow();

    this.add
      .text(middleX, middleY+30, this.finalScore.toLocaleString(), {
        color: config.UIColor,
        fontSize: "5em",
        // fontStyle: "bold",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 1);

    this.add
      .text(middleX, middleY + 70, "FINAL SCORE", {
        color: config.UIColorAlt,
        fontSize: "3em",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 1);

    this.add
      .rectangle(middleX, middleY + sceneHeight / 2, (this.worldWidth / 5) * 2, 50, 0x000, 1)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, config.UIColorAltHex)
      .setInteractive()
      .on("pointerup", this.restartGame);

    this.playAgainButtonText = this.add
      .text(middleX, middleY + sceneHeight / 2, "PLAY AGAIN", {
        color: config.UIColor,
        fontSize: "3em",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 0.5);
  }

  restartGame = () => {
    this.scene.stop(config.SceneNames.GameOver);
    this.scene.launch(config.SceneNames.Game);
  };
}
