import { GameScene } from "./GameScene";

type Blob = {
  name: string;
  scale: number;
  color: number;
};

export const BlobSize = 400;

export const blobs: Blob[] = [
  { name: "mouse", scale: 0.12, color: 0xff595e },
  { name: "bird", scale: 0.16, color: 0xff924c },
  { name: "chicken", scale: 0.24, color: 0xffca3a },
  { name: "cat", scale: 0.28, color: 0xc5ca30 },
  { name: "dog", scale: 0.32, color: 0x8ac926 },
  { name: "horse", scale: 0.43, color: 0x52a675 },
  { name: "cow", scale: 0.49, color: 0x1982c4 },
  { name: "lion", scale: 0.61, color: 0x6a4c93 },
  { name: "bear", scale: 0.65, color: 0x4267ac },
  { name: "elephant", scale: 0.83, color: 0xb5a6c9 },
  { name: "whale", scale: 1, color: 0xff0000 },
];

// export const initialiseScene(scene:GameScene)

export const addJar = (
  scene: GameScene,
  width: number,
  height: number,
  thickness: number,
  bottomGap: number,
) => {
  const worldWidth = scene.scale.gameSize.width;
  const worldHeight = scene.scale.gameSize.height;

  const jarColour = 0xc5ca30;
  let y: number;

  // jar: left
  scene.jarLeftX = worldWidth / 2 - width / 2;
  y = worldHeight - height / 2 - bottomGap + 7;
  scene.add
    .line(scene.jarLeftX, y, 0, 0, 0, height, jarColour)
    .setLineWidth(thickness);
  scene.matter.add.rectangle(scene.jarLeftX, y, thickness * 2, height, {
    isStatic: true,
  });

  // jar: right
  scene.jarRightX = worldWidth / 2 + width / 2;
  y = worldHeight - height / 2 - bottomGap + 7;
  scene.add
    .line(scene.jarRightX, y, 0, 0, 0, height, jarColour)
    .setLineWidth(thickness);
  scene.matter.add.rectangle(scene.jarRightX, y, thickness * 2, height, {
    isStatic: true,
  });

  // jar: bottom
  const x = worldWidth / 2;
  y = worldHeight - bottomGap;
  scene.add.line(x, y, 0, 0, width, 0, jarColour).setLineWidth(thickness);
  scene.matter.add.rectangle(x, y, width, thickness * 2, {
    isStatic: true,
  });
};

export const createBlob = (
  scene: GameScene,
  index: number,
  x: number,
  y: number,
  isMerge: boolean = false,
) => {
  try {
    const blob = blobs[index];
    const D = BlobSize * blob.scale;
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
      } catch (error) {
        //
      }
    }
    return f;
  } catch (error) {
    console.error(error);
  }
};
