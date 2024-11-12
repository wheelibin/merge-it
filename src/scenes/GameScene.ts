import * as Phaser from "phaser";
import * as entities from "./entities";
import * as config from "../config";
import WebFontFile from "../webFontFile";

const uiGoogleFont = "Orbitron";
const padding = 32;
const uiYOffset = 550;
const uiLineHeight = 50;
const jarColour = 0xc5ca30;
const jarThickness = 16;
const jarWidth = config.GameWidth - padding;
const jarHeight = config.GameHeight - 300;

export class GameScene extends Phaser.Scene {
  aimImage: Phaser.GameObjects.Image;
  currentIndex: number = 0;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  jarLeftX: number = 0;
  jarRightX: number = 0;
  nextAimImage: Phaser.GameObjects.Image;
  nextBlobsQueue: number[] = [randomIndex(), randomIndex()];
  pointerX: number = 0;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;
  worldHeight = 0;
  worldWidth = 0;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("bg", "assets/bg.png");
    this.load.audio("pop", `assets/pop.flac`);
    this.load.audio("hit", `assets/hit.wav`);
    this.load.addFile(new WebFontFile(this.load, uiGoogleFont));
    for (let index = 0; index < entities.blobs.length; index++) {
      const element = entities.blobs[index];
      this.load.image(element.name, `assets/animals/${element.name}.png`);
      this.load.audio(element.name, `assets/animals/${element.name}.wav`);
    }
  }

  create() {
    // set the bounds
    this.worldWidth = this.scale.gameSize.width;
    this.worldHeight = this.scale.gameSize.height;
    this.matter.world.setBounds(undefined, undefined, undefined, this.worldHeight);

    // add background
    this.addBackground();

    // add the jar
    this.addJar();

    // add UI
    this.addUI();

    // queue up current and next blobs
    this.aimImage = this.add.image(0, 0, "");
    this.nextAimImage = this.add.image(0, 0, "");
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
    this.input.on("pointerdown", this.handlePointerMove);
    this.input.on("pointerup", this.handlePointerUp);
    this.input.on("pointermove", this.handlePointerMove);
    this.matter.world.on("collisionstart", this.handleCollisionStart);
  }

  handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if (!this.aimImage.visible) {
      return;
    }
    this.aimImage.setVisible(false);
    this.createBlob(
      this,
      this.currentIndex,
      this.constrainInJar(pointer.x, this.aimImage.width * entities.blobs[this.currentIndex].scale),
      this.getAimImageY(),
    );
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
            this.emitter.setTexture(entities.blobs[collidedIndex].name);
            this.emitter.explode(8, pos.x, pos.y);
            bodyA.gameObject.destroy();
            bodyB.gameObject.destroy();
            this.score += 10 * collidedIndex;
            this.scoreText.setText(this.score.toString());
            this.createBlob(this, collidedIndex + 1, pos.x, pos.y, isMerge);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  constrainInJar(x: number, width: number) {
    const R = width / 2;
    if (x < this.jarLeftX + R) {
      return this.jarLeftX + R + jarThickness;
    } else if (x > this.jarRightX - R) {
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
    this.add.text(this.worldWidth / 2 - jarWidth / 2, this.worldHeight / 2 - uiYOffset, "SCORE", {
      color: "#c5ca30",
      fontSize: "5em",
      fontFamily: uiGoogleFont,
    });
    const nextLabel = this.add.text(this.worldWidth / 2 + jarWidth / 2, this.worldHeight / 2 - uiYOffset, "NEXT", {
      color: "#c5ca30",
      fontSize: "5em",
      fontFamily: uiGoogleFont,
    });
    // align right
    nextLabel.setOrigin(1, 0);

    this.scoreText = this.add.text(
      this.worldWidth / 2 - jarWidth / 2,
      this.worldHeight / 2 - uiYOffset + uiLineHeight,
      this.score.toString(),
      {
        color: "#c5ca30",
        fontSize: "5em",
        fontStyle: "bold",
        fontFamily: uiGoogleFont,
      },
    );
  }

  createBlob(scene: GameScene, index: number, x: number, y: number, isMerge: boolean = false) {
    try {
      const blob = entities.blobs[index];
      const D = entities.BlobSize * blob.scale;
      const f = scene.matter.add.image(x, y, blob.name, undefined, {
        mass: 1,
      });
      f.setCircle(D / 2);
      f.scale = blob.scale;

      // f.setFriction(0.005);
      // f.setBounce(1);

      f.setName(blob.name);
      f.setData("landed", isMerge);
      f.setData("index", index);

      if (isMerge) {
        try {
          scene.sound.play(blob.name, { rate: 1.3 });
          // scene.sound.play("pop");
        } catch (error) {
          console.warn(error);
        }
      }
      return f;
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

    this.aimImage.setPosition(this.constrainInJar(this.pointerX, nextD), this.getAimImageY());
    this.aimImage.setTexture(current.name);
    this.aimImage.scale = current.scale;
    this.aimImage.setVisible(true);

    this.nextAimImage.setOrigin(1, 0);
    this.nextAimImage.setPosition(
      this.worldWidth / 2 + jarWidth / 2,
      this.worldHeight / 2 - uiYOffset + uiLineHeight + 10,
    );
    this.nextAimImage.setTexture(next.name);
    this.nextAimImage.scale = entities.blobs[0].scale;
  }
}

function randomIndex(): number {
  return randomIntFromInterval(0, entities.LastDroppableBlobIndex);
}

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
