export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("ball", "assets/ball.png");
    this.load.image("net", "assets/net.png");
  }

  create() {
    this.add
      .image(100, 100, "ball")
      .setInteractive()
      .on("pointerup", () => {
        // this.scale.startFullscreen();
        this.scene.start("GameScene");
      });
  }
}
