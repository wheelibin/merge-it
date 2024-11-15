import * as Phaser from "phaser";
import * as config from "../config";
import { loadScores, saveScore } from "../scores";

type sceneData = {
  finalScore: number;
};

const sceneHeight = 500;
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
    saveScore(this.finalScore);
  }

  preload() {}

  create() {
    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;
    const middleX = this.worldWidth / 2;
    const middleY = this.worldHeight / 2;
    const topOfPopup = middleY - sceneHeight / 2;

    const scores = loadScores();

    // full screen overlay
    this.add.rectangle(0, 0, this.worldWidth, this.worldHeight, 0x000, sceneAlpha).setOrigin(0);

    // the popup
    this.add
      .rectangle(middleX, middleY, (this.worldWidth / 3) * 2, sceneHeight, 0x000, 0.5)
      .setOrigin(0.5, 0.5)
      .setStrokeStyle(1, config.UIColorAltHex);

    this.addText("GAME OVER", middleX, topOfPopup + 75, config.UIColorAlt, "5em");
    this.addText(this.finalScore.toLocaleString(), middleX, topOfPopup + 175, config.UIColor, "7em");
    // this.addText("FINAL SCORE", middleX, topOfPopup + 190, config.UIColor, "5em");
    this.addText("HIGH SCORES", middleX, topOfPopup + 250, config.UIColorAlt, "3em");

    const startX = middleX - 200;
    const gapX = 150;
    const gapY = 50;
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];

      this.addText((i + 1).toString(), startX, topOfPopup + 310 + i * gapY, config.UIColorAlt, "3em");
      if (s.score) {
        this.addText(
          s.score.toLocaleString(),
          startX + gapX,
          topOfPopup + 310 + i * gapY,
          config.UIColor,
          "3em",
        ).setOrigin(1);
      }
      if (s.date) {
        console.log(new Date(s.date).toDateString())
        this.addText(
          new Date(s.date).toDateString(),
          startX + gapX * 2,
          topOfPopup + 310 + i * gapY,
          config.UIColor,
          "3em",
        ).setOrigin(0.5, 1);
      }
    }

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

  addText(text: string, x: number, y: number, color: string, size: string) {
    const t = this.add
      .text(x, y, text, {
        color,
        fontSize: size,
        // fontStyle: "bold",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(0.5, 1);
    t.preFX?.addShadow();
    return t;
  }

  restartGame = () => {
    this.scene.stop(config.SceneNames.GameOver);
    this.scene.launch(config.SceneNames.Game);
  };
}
