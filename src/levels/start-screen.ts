import Box from "../box";
import Game from "../game";
import Level from "./level";

import { BS, ISize } from "../common";
import { randomIndex } from "../helpers";

let panDirection = 1;

export default class StartScreen extends Level {
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
    this.game.c.pos.x -= panDirection * 0.05;
    if (this.game.c.pos.x < -this.game.canvas.width) panDirection = -1;
    if (this.game.c.pos.x > 0) panDirection = 1;
  }

  public configViz() {
    super.configViz();

    this.tileIndexes = generateTileIndexes(this.game.sizeInTiles(), this.tileTypeMap);
    this.generateTiles();
    this.box.move(this.game.boxPos());
    this.box.updateSize(BS);
    this.addDables(this.tiles, 0);
    this.addOdables([this.box]);
    this.configClouds(this.size.w, this.size.h, .3);
    this.addDables(this.clouds, 3);
  }

  public levelStarted() {
    window.setTimeout(() => this.box.aniText(this.game.tstamp), 200);
  }

  public handleInput() {
    if (this.game.inTr() || this.box.ani) return;
    this.game.qLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }
}

function generateTileIndexes(sizeInTiles: ISize, tileTypeMap: string[]) {
  return new Array(sizeInTiles.h * 2)
    .fill(null).map(() => new Array(sizeInTiles.w * 2)
      .fill(null).map(() => randomIndex(tileTypeMap)));
}
