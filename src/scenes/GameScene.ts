import * as Phaser from "phaser";
import * as entities from "./entities";
import * as config from "../config";
import WebFontFile from "../webFontFile";

const gameTitle = "MERGE-IT";
const padding = 32;
const uiLineHeight = 50;
const jarColour = config.UIColorHex;
const jarThickness = 16;
const jarWidth = config.GameWidth - 200;
const jarHeight = config.GameHeight - 500;

export class GameScene extends Phaser.Scene {
  aimImage: Phaser.GameObjects.Image;
  currentIndex: number = 0;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  jarLeftX: number = 0;
  jarRightX: number = 0;
  jarTop: number = 0;
  nextAimImage: Phaser.GameObjects.Image;
  nextBlobsQueue: number[] = [randomIndex(), randomIndex()];
  pointerX: number = 0;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;
  worldHeight = 0;
  worldWidth = 0;
  uiYOffset = 550;

  constructor() {
    super(config.SceneNames.Game);
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.audio("hit", `assets/hit.wav`);
    this.load.addFile(new WebFontFile(this.load, config.UIGoogleFont));
    for (let index = 0; index < entities.blobs.length; index++) {
      const element = entities.blobs[index];
      this.load.image(element.name, `assets/animals/${element.name}.png`);
      this.load.audio(element.name, `assets/animals/${element.name}.wav`);
    }
  }

  create() {
    this.score = 0;

    // set the bounds
    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;
    this.matter.world.setBounds(undefined, undefined, this.worldWidth, this.worldHeight);
    this.uiYOffset = 380;

    // add background
    this.addBackground();

    // add the jar
    this.addJar();

    // add UI
    this.addUI();

    // queue up current and next blobs
    this.aimImage = this.add.image(0, 0, "");
    // this.aimImage.preFX?.addShadow();
    this.nextAimImage = this.add.image(0, 0, "");
    this.nextAimImage.preFX?.addShadow();
    this.queueNext();

    // add an emitter for explosion on merge
    this.emitter = this.add.particles(0, 0, "", {
      lifespan: 500,
      speed: { min: 250, max: 500 },
      scale: { start: 0.2, end: 0 },
      // gravityY: 150,
      emitting: false,
    });

    // input events
    this.input
      .on("pointerdown", this.handlePointerMove)
      .on("pointerup", this.handlePointerUp)
      .on("pointermove", this.handlePointerMove);
    this.matter.world.on("collisionstart", this.handleCollisionStart);
  }

  handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if (!this.aimImage.visible) {
      return;
    }
    const aimImageWidth = this.aimImage.width * entities.blobs[this.currentIndex].scale;

    this.aimImage.setVisible(false);
    this.createBlob(this.currentIndex, this.constrainInJar(pointer.x, aimImageWidth), this.getAimImageY());
  };

  handlePointerMove = (pointer: Phaser.Input.Pointer) => {
    this.aimImage.x = this.constrainInJar(pointer.x, this.aimImage.width * entities.blobs[this.currentIndex].scale);
    this.pointerX = this.aimImage.x;
  };

  handleCollisionStart = (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
    for (const { bodyA, bodyB } of event.pairs) {
      const bodyALanded = bodyA.gameObject === null || bodyA.gameObject?.getData("landed");
      const bodyBLanded = bodyB.gameObject === null || bodyB.gameObject?.getData("landed");

      if (!bodyALanded || !bodyBLanded) {
        this.queueNext();
      }

      // play sound when landed
      if (bodyA.gameObject && bodyA.gameObject.getData("landed") === false) {
        try {
          // this.sound.play(bodyA.gameObject.name, { rate: 1.5 });
          this.sound.play("hit");
        } catch (error) {
          console.debug(error);
          //
        }
      }
      if (bodyB.gameObject && bodyB.gameObject.getData("landed") === false) {
        try {
          // this.sound.play(bodyB.gameObject.name, { rate: 1.5 });
          this.sound.play("hit");
        } catch (error) {
          //
        }
      }

      bodyA.gameObject?.setData("landed", true);
      bodyB.gameObject?.setData("landed", true);

      // sound on every collision
      // this.sound.play("hit");
      // if (bodyA.gameObject) {
      //   this.sound.play(bodyA.gameObject.name);
      // }
      // if (bodyB.gameObject) {
      //   this.sound.play(bodyB.gameObject.name);
      // }

      if (bodyA.gameObject && bodyB.gameObject && bodyA.gameObject?.name === bodyB.gameObject?.name) {
        const isMerge = true;
        const collidedIndex = bodyA.gameObject?.getData("index");

        try {
          if (collidedIndex < entities.blobs.length - 1) {
            const pA = new Phaser.Math.Vector2(bodyA.position.x, bodyA.position.y);
            const pB = new Phaser.Math.Vector2(bodyB.position.x, bodyB.position.y);
            const pos = Phaser.Geom.Point.GetCentroid([pA, pB]);
            this.emitter.setTexture(entities.blobs[collidedIndex].name).explode(8, pos.x, pos.y);
            bodyA.gameObject.destroy();
            bodyB.gameObject.destroy();
            this.score += 10 * collidedIndex;
            this.scoreText.setText(this.score.toString());
            this.createBlob(collidedIndex + 1, pos.x, pos.y, isMerge);

            // if a merged blob is over the jar, game over
            if (pos.y < this.jarTop) {
              this.gameOver();
            }
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // if a landed blob is over the jar, game over
        if (bodyA.position.y < this.jarTop || bodyB.position.y < this.jarTop) {
          this.gameOver();
        }
      }
    }
  };

  constrainInJar(x: number, width: number) {
    const R = width / 2;
    if (x < this.jarLeftX + R + jarThickness) {
      return this.jarLeftX + R + jarThickness;
    } else if (x > this.jarRightX - R - jarThickness) {
      return this.jarRightX - (R + jarThickness);
    } else {
      return x;
    }
  }

  getAimImageY() {
    return this.worldHeight / 2 - padding * 5;
  }

  addBackground() {
    const bgImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "bg");
    bgImage.setTint(0x606060);
    const scaleX = this.cameras.main.width / bgImage.width;
    const scaleY = this.cameras.main.height / bgImage.height;
    const scale = Math.max(scaleX, scaleY);
    bgImage.setScale(scale).setScrollFactor(0);
  }

  addJar() {
    let y: number;
    this.jarTop = this.worldHeight / 2 - (padding + jarThickness);
    // jar: left
    this.jarLeftX = this.worldWidth / 2 - jarWidth / 2;
    y = this.worldHeight / 2 + jarHeight / 2 - padding + jarThickness / 2;
    this.add.line(this.jarLeftX, y, 0, 0, 0, jarHeight, jarColour).setLineWidth(jarThickness);
    this.matter.add.rectangle(this.jarLeftX, y, jarThickness * 2, jarHeight, {
      isStatic: true,
    });

    // jar: right
    this.jarRightX = this.worldWidth / 2 + jarWidth / 2;
    y = this.worldHeight / 2 + jarHeight / 2 - padding + jarThickness / 2;
    this.add.line(this.jarRightX, y, 0, 0, 0, jarHeight, jarColour).setLineWidth(jarThickness);
    this.matter.add.rectangle(this.jarRightX, y, jarThickness * 2, jarHeight, {
      isStatic: true,
    });

    // jar: bottom
    const x = this.worldWidth / 2;
    y += jarHeight / 2 - jarThickness / 2;
    this.add.line(x, y, 0, 0, jarWidth, 0, jarColour).setLineWidth(jarThickness);
    this.matter.add.rectangle(x, y, jarWidth, jarThickness * 2, {
      isStatic: true,
    });
  }

  addUI() {
    this.add.rectangle(this.worldWidth / 2, 0, this.worldWidth, 125, 0x000, 0.7).setOrigin(0.5, 0);

    this.add
      .text(this.worldWidth / 2, 1, gameTitle, {
        color: config.UIColor,
        fontSize: "100px",
        fontFamily: config.UIGoogleFont,
        // fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .preFX?.addShadow();

    this.add
      .text(this.worldWidth / 2 - jarWidth / 2, this.worldHeight / 2 - this.uiYOffset, "SCORE", {
        color: config.UIColor,
        fontSize: "5em",
        fontFamily: config.UIGoogleFont,
      })
      .preFX?.addShadow();

    this.add
      .text(this.worldWidth / 2 + jarWidth / 2, this.worldHeight / 2 - this.uiYOffset, "NEXT", {
        color: config.UIColor,
        fontSize: "5em",
        fontFamily: config.UIGoogleFont,
      })
      .setOrigin(1, 0)
      .preFX?.addShadow();

    this.scoreText = this.add.text(
      this.worldWidth / 2 - jarWidth / 2,
      this.worldHeight / 2 - this.uiYOffset + uiLineHeight,
      this.score.toString(),
      {
        color: config.UIColor,
        fontSize: "5em",
        fontStyle: "bold",
        fontFamily: config.UIGoogleFont,
      },
    );
    this.scoreText.preFX?.addShadow();
  }

  createBlob(index: number, x: number, y: number, isMerge: boolean = false) {
    try {
      const blob = entities.blobs[index];
      const D = entities.BlobSize * blob.scale;

      this.matter.add
        .image(x, y, blob.name, undefined, {
          mass: 1,
        })
        .setCircle(D / 2)
        .setName(blob.name)
        .setData("landed", isMerge)
        .setData("index", index).scale = blob.scale;

      // f.setFriction(0.005);
      // f.setBounce(1);

      if (isMerge) {
        try {
          this.sound.play(blob.name, { rate: 1.3 });
        } catch (error) {
          console.warn(error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  queueNext() {
    this.currentIndex = this.nextBlobsQueue.shift() ?? randomIndex();
    this.nextBlobsQueue.push(randomIndex());

    const current = entities.blobs[this.currentIndex];
    const next = entities.blobs[this.nextBlobsQueue[0]];
    const nextD = entities.BlobSize * next.scale;

    this.aimImage
      .setPosition(this.constrainInJar(this.pointerX, nextD), this.getAimImageY())
      .setTexture(current.name)
      .setVisible(true);
    this.aimImage.scale = current.scale;

    this.nextAimImage
      .setOrigin(1, 0)
      .setPosition(this.worldWidth / 2 + jarWidth / 2, this.worldHeight / 2 - this.uiYOffset + uiLineHeight + 10)
      .setTexture(next.name);
    this.nextAimImage.scale = entities.blobs[0].scale;
  }

  gameOver() {
    this.scene.pause(config.SceneNames.Game);
    this.scene.launch(config.SceneNames.GameOver, { finalScore: this.score });
  }
}

function randomIndex(): number {
  return randomIntFromInterval(0, entities.LastDroppableBlobIndex);
}

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
