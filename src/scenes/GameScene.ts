import * as Phaser from "phaser";
import * as game from "./game";
import * as config from "../config";

const padding = 32;
const jarThickness = 16;
const jarWidth = config.GameWidth - padding * 2;
const jarHeight = config.GameHeight - 300;
const bottomGap = padding;

export class GameScene extends Phaser.Scene {
  public jarLeftX: number = 0;
  public jarRightX: number = 0;
  private pointerX: number = 0;
  private currentIndex: number = 0;
  private aimImage: Phaser.GameObjects.Image;
  private nextAimImage: Phaser.GameObjects.Image;
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private scoreText: Phaser.GameObjects.Text;
  private score: number = 0;

  private nextBlobsQueue: number[] = [randomIndex(), randomIndex()];
  private worldWidth = 0;
  private worldHeight = 0;

  private queueNext() {
    this.currentIndex = this.nextBlobsQueue.shift() ?? randomIndex();
    this.nextBlobsQueue.push(randomIndex());
    this.updateAimImage(this.currentIndex, this.nextBlobsQueue[0]);
  }

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    for (let index = 0; index < game.blobs.length; index++) {
      const element = game.blobs[index];
      this.load.image(element.name, `assets/animals/${element.name}.png`);
      this.load.audio(element.name, `assets/animals/${element.name}.wav`);
    }
  }

  create() {
    // set the bounds

    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;
    this.matter.world.setBounds(
      undefined,
      undefined,
      undefined,
      this.worldHeight,
    );

    // add background
    const image = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bg",
    );
    image.setTint(0x606060);
    const scaleX = this.cameras.main.width / image.width;
    const scaleY = this.cameras.main.height / image.height;
    const scale = Math.max(scaleX, scaleY);
    image.setScale(scale).setScrollFactor(0);

    // add the jar
    game.addJar(this, jarWidth, jarHeight, jarThickness, bottomGap);

    const s = this.add.text(padding, padding, "SCORE:", {
      color: "#c5ca30",
      fontSize: "5em",
    });
    this.scoreText = this.add.text(
      padding + (s.width + padding),
      padding,
      this.score.toString(),
      {
        color: "#c5ca30",
        fontSize: "5em",
        fontStyle: "bold",
      },
    );

    // queue up current and next blobs
    this.nextAimImage = this.add.image(0, 0, "");
    this.queueNext();

    this.emitter = this.add.particles(0, 0, "cat", {
      lifespan: 500,
      speed: { min: 250, max: 250 },
      scale: { start: 0.8, end: 0 },
      // gravityY: 150,
      emitting: false,
    });

    // input events
    this.input.on("pointerdown", this.handlePointerDown);
    this.input.on("pointermove", this.handlePointerMove);
    this.matter.world.on("collisionstart", this.handleCollisionStart);
  }

  handlePointerDown = (pointer: any) => {
    if (!this.aimImage.visible) {
      return;
    }
    this.aimImage.setVisible(false);
    game.createBlob(
      this,
      this.currentIndex,
      this.constrainInJar(pointer.x, this.aimImage.width),
      this.worldHeight - (jarHeight + bottomGap * 2),
    );
  };

  handlePointerMove = (pointer: any) => {
    this.aimImage.x = this.constrainInJar(
      pointer.x,
      this.aimImage.width * game.blobs[this.currentIndex].scale,
    );
    this.pointerX = this.aimImage.x;
  };

  handleCollisionStart = (
    event: Phaser.Physics.Matter.Events.CollisionStartEvent,
    // bodyA:MatterJS.BodyType,
    // bodyB:MatterJS.BodyType,
  ) => {
    for (const { bodyA, bodyB } of event.pairs) {
      const bodyALanded =
        bodyA.gameObject === null || bodyA.gameObject?.getData("landed");
      const bodyBLanded =
        bodyB.gameObject === null || bodyB.gameObject?.getData("landed");

      if (!bodyALanded || !bodyBLanded) {
        this.queueNext();
      }

      // // play sound when landed
      // if (bodyA.gameObject && bodyA.gameObject.getData("landed") === false) {
      //   try {
      //     this.sound.play(bodyA.gameObject.name, { rate: 1.5 });
      //   } catch (error) {
      //     console.debug(error);
      //     //
      //   }
      // }
      // if (bodyB.gameObject && bodyB.gameObject.getData("landed") === false) {
      //   try {
      //     this.sound.play(bodyB.gameObject.name, { rate: 1.5 });
      //   } catch (error) {
      //     //
      //   }
      // }

      bodyA.gameObject?.setData("landed", true);
      bodyB.gameObject?.setData("landed", true);

      //// sound on every collision
      // if (bodyA.gameObject) {
      //   this.sound.play(bodyA.gameObject.name);
      // }
      // if (bodyB.gameObject) {
      //   this.sound.play(bodyB.gameObject.name);
      // }

      if (
        bodyA.gameObject &&
        bodyB.gameObject &&
        bodyA.gameObject?.name === bodyB.gameObject?.name
      ) {
        const isMerge = true;
        const collidedIndex = bodyA.gameObject?.getData("index");

        try {
          if (collidedIndex < game.blobs.length - 1) {
            const pA = new Phaser.Math.Vector2(
              bodyA.position.x,
              bodyA.position.y,
            );
            const pB = new Phaser.Math.Vector2(
              bodyB.position.x,
              bodyB.position.y,
            );
            const pos = Phaser.Geom.Point.GetCentroid([pA, pB]);
            this.emitter.setTexture(game.blobs[collidedIndex + 1].name);
            this.emitter.explode(5, pos.x, pos.y);
            bodyA.gameObject.destroy();
            bodyB.gameObject.destroy();
            this.score += 10 * collidedIndex;
            this.scoreText.setText(this.score.toString());
            game.createBlob(this, collidedIndex + 1, pos.x, pos.y, isMerge);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  private constrainInJar(x: number, width: number) {
    const R = width / 2;
    if (x < this.jarLeftX + R) {
      return this.jarLeftX + R + jarThickness;
    } else if (x > this.jarRightX - R) {
      return this.jarRightX - (R + jarThickness);
    } else {
      return x;
    }
  }

  private updateAimImage(index: number, nextIndex: number) {
    const current = game.blobs[index];
    const next = game.blobs[nextIndex];
    const nextD = game.BlobSize * next.scale;

    if (this.aimImage) {
      this.aimImage.destroy();
    }
    this.aimImage = this.add.image(
      this.constrainInJar(this.pointerX, nextD),
      this.worldHeight - (jarHeight + bottomGap * 2),
      current.name,
    );
    this.aimImage.scale = current.scale;
    this.aimImage.setVisible(true);

    this.nextAimImage.setPosition(this.worldWidth - nextD - padding, 75);
    this.nextAimImage.setTexture(next.name);
    this.nextAimImage.scale = next.scale;
  }
}

function randomIndex(): number {
  return randomIntFromInterval(0, 4);
}

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
