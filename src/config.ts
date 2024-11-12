import * as Phaser from "phaser";

export const GameWidth = 768;
export const GameHeight = 1024;

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "matter",
    matter: {
      enableSleeping: true,
      // debug: true,
      gravity: {
        x: 0,
        y: 3,
      },
    },
  },
  // width: 768,
  // height: 1024,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // scale: {
  //   width: 360,
  //   height: 640,
  //   // resolution: window.devicePixelRatio,
  //   mode: Phaser.Scale.RESIZE,
  //   autoCenter: Phaser.Scale.CENTER_BOTH,
  // },
};
