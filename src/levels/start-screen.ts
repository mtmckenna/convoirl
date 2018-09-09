import Box from "../box";
import Game from "../game";
import Level from "./level";

import { TS } from "../common";

export default class StartScreen extends Level {
  public panDirection = 1;
  protected tileTypeMap = ["green", "flowers", "grass", "tree"];
  private box: Box;

  constructor(game: Game) {
    super(game);
    this.box = new Box(this.game, { x: 0, y: 0 }, { h: 0, w: 0 });
    this.box.setWords(["CONVO IRL", "", "TAP TO PLAY"]);
  }

  public resize() {
    this.configViz();
  }

  public update(timestamp) {
    super.update(timestamp);
    this.game.camera.pos.x -= this.panDirection * 0.05;
    if (this.game.camera.pos.x < -this.game.canvas.width) this.panDirection = -1;
    if (this.game.camera.pos.x > 0) this.panDirection = 1;
  }

  public configViz() {
    super.configViz();

    const sizeInTiles = this.game.sizeInTiles();
    sizeInTiles.w *= 2;
    sizeInTiles.h *= 2;

    this.generateTileIndexes(sizeInTiles);
    this.generateTiles();
    this.moveText();
    this.addDables(this.tiles, 0);
    this.addOdables([this.box]);
    this.configClouds(this.tilesGrid[0].length * TS, this.tilesGrid.length * TS, .3);
    this.addDables(this.clouds, 3);
  }

  public levelStarted() {
    window.setTimeout(() => this.box.animateTextIn(this.game.timestamp), 200);
  }

  public handleInput() {
    if (this.game.transitioning()) return;
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }

  private moveText() {
    this.box.move(this.game.boxPos());
    this.box.updateSize(this.game.boxSize());
  }
}
