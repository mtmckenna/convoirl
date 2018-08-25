import colorMap from "../colors";
import Game from "../game";
import Level from "./level";

import Text from "../text";

import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import Tree from "../tiles/tree";

import { BLINK_DURATION } from "../common";

const TITLE = "CONVO IRL";
const TAP_TO_PLAY = "TAP TO PLAY";
const LINE_HEIGHT = 10;

export default class StartScreen extends Level {
  protected tileTypeMap = [Green, Flowers, Grass, Tree];
  protected tileIndexes = [[]];
  protected title: Text;
  protected instructions: Text;
  protected lastBlinkAt: number = 0;

  constructor(game: Game) {
    super(game);
    this.title = new Text(this.game, TITLE, colorMap[1]);
    this.instructions = new Text(this.game, TAP_TO_PLAY, colorMap[1]);
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.generateTileIndexes();
    this.generateTiles();
    this.moveText();
    this.addDrawables(this.tiles, 0);
    this.addOverlayDrawables([this.title, this.instructions]);
  }

  public handleInput() {
    if (this.game.transitioning) return;
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }

  public update(timestamp) {
    if (timestamp - this.lastBlinkAt > BLINK_DURATION) {
      this.instructions.visible = !this.instructions.visible;
      this.lastBlinkAt = timestamp;
    }
  }

  private moveText() {
    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;

    const totalHeight =
    this.title.drawingSize.height +
    this.instructions.drawingSize.height +
    LINE_HEIGHT * this.game.squareSize;

    const titlePosX = Math.floor((canvasWidth - this.title.drawingSize.width) / 2);
    const titlePosY = Math.floor((canvasHeight - totalHeight) / 2);

    const instructionsPosX = Math.floor((canvasWidth - this.instructions.drawingSize.width) / 2);
    const instructionsPosY = titlePosY + LINE_HEIGHT * this.game.squareSize;

    this.title.move({ x: titlePosX, y: titlePosY });
    this.instructions.move({ x: instructionsPosX, y: instructionsPosY });
  }
}
