export type Blob = {
  name: string;
  scale: number;
  color: number;
};

export const BlobSize = 400;
export const LastDroppableBlobIndex = 4;

const globalScaleFactor = 1.2;

export const blobs: Blob[] = [
  { name: "mouse", scale: 0.12 * globalScaleFactor, color: 0xff595e },
  { name: "bird", scale: 0.16 * globalScaleFactor, color: 0xff924c },
  { name: "chicken", scale: 0.24 * globalScaleFactor, color: 0xffca3a },
  { name: "cat", scale: 0.28 * globalScaleFactor, color: 0xc5ca30 },
  { name: "dog", scale: 0.32 * globalScaleFactor, color: 0x8ac926 },
  { name: "horse", scale: 0.43 * globalScaleFactor, color: 0x52a675 },
  { name: "cow", scale: 0.49 * globalScaleFactor, color: 0x1982c4 },
  { name: "lion", scale: 0.61 * globalScaleFactor, color: 0x6a4c93 },
  { name: "bear", scale: 0.65 * globalScaleFactor, color: 0x4267ac },
  { name: "elephant", scale: 0.83 * globalScaleFactor, color: 0xb5a6c9 },
  { name: "whale", scale: 1 * globalScaleFactor, color: 0xff0000 },
];
