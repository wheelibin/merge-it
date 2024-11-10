import * as Phaser from "phaser";
import { config } from "./config";
import { GameScene } from "./scenes/GameScene";

new Phaser.Game({ ...(config as any), scene: [GameScene] });
