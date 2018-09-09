import Box from "../box";
import Game from "../game";
import Level from "./level";

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
    this.game.camera.pos.x -= panDirection * 0.05;
    if (this.game.camera.pos.x < -this.game.canvas.width) panDirection = -1;
    if (this.game.camera.pos.x > 0) panDirection = 1;
  }

  public configViz() {
    super.configViz();

    const sizeInTiles = this.game.sizeInTiles();
    sizeInTiles.w *= 2;
    sizeInTiles.h *= 2;

    this.generateTileIndexes(sizeInTiles);
    this.generateTiles();
    this.box.move(this.game.boxPos());
    this.box.updateSize(this.game.boxSize());
    this.addDables(this.tiles, 0);
    this.addOdables([this.box]);
    this.configClouds(this.size.w, this.size.h, .3);
    this.addDables(this.clouds, 3);
  }

  public levelStarted() {
    window.setTimeout(() => this.box.animateTextIn(this.game.timestamp), 200);
  }

  public handleInput() {
    if (this.game.inTr()) return;
    this.game.qLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }
}