import Box from "../box";
import Game from "../game";
import Text from "../text";

import Level from "./level";

const TEXT_TILE = ["CONVO IRL", "", "TAP TO PLAY"];

export default class StartScreen extends Level {
  public panDirection = 1.0;

  protected tileTypeMap = ["green", "flowers", "grass", "tree"];
  protected tileIndexes = [[]];
  protected title: Text;
  protected instructions: Text;
  protected lastBlinkAt: number = 0;

  private box: Box;

  constructor(game: Game) {
    super(game);
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
    this.box.touched = () => this.handleInput();
    this.box.setWords(TEXT_TILE);
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();

    const sizeInTiles = this.game.sizeInTiles();
    sizeInTiles.width *= 2;
    sizeInTiles.height *= 2;

    this.generateTileIndexes(sizeInTiles);
    this.generateTiles();
    this.moveText();
    this.addTouchables([this.box]);
    this.addDrawables(this.tiles, 0);
    this.box.animateTextIn(this.game.timestamp);
    this.addOverlayDrawables([this.box]);
  }

  public handleInput() {
    if (this.game.transitioning) return;
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }

  private moveText() {
    this.box.move(this.game.boxPos);
    this.box.updateSize(this.game.boxSize);
  }
}
