import * as Phaser from "phaser";
import { config } from "./config";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";

new Phaser.Game({ ...config, scene: [GameScene, GameOverScene] });
