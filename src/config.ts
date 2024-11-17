import * as Phaser from "phaser";

export const GameWidth = 768;
export const GameHeight = 1024;
export const UIGoogleFont = "Cherry Bomb One";
export const UIColorHex = 0xc5ca30;
export const UIColor = "#c5ca30";
export const UIColorAltHex = 0xff595e;
export const UIColorAlt = "#ff595e";

export enum SceneNames {
  Game = "GameScene",
  GameOver = "GameOverScene",
}

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "matter",
    matter: {
      // enableSleeping: true,
      // debug: true,
      gravity: {
        x: 0,
        y: 3,
      },
    },
  },
  backgroundColor: "#000",
  width: GameWidth,
  height: GameHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
