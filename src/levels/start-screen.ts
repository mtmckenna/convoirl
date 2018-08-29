import Box from "../box";
import colorMap from "../colors";
import Game from "../game";
import Text from "../text";

import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import Tree from "../tiles/tree";

import Level from "./level";

import { BLINK_DURATION, LINE_HEIGHT } from "../common";

const TITLE = "CONVO IRL";
const TAP_TO_PLAY = "TAP TO PLAY";
const PADDING = 2;

export default class StartScreen extends Level {
  protected tileTypeMap = [Green, Flowers, Grass, Tree];
  protected tileIndexes = [[]];
  protected title: Text;
  protected instructions: Text;
  protected lastBlinkAt: number = 0;

  private box: Box;

  constructor(game: Game) {
    super(game);
    this.title = new Text(this.game, TITLE, colorMap[1]);
    this.instructions = new Text(this.game, TAP_TO_PLAY, colorMap[1]);
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
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
    this.addOverlayDrawables([this.box, this.title, this.instructions]);
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
    const { squareSize } = this.game;
    const width = (Math.max(this.title.size.width, this.instructions.size.width) + 2) + PADDING * 2;
    const height = this.title.size.height + this.instructions.size.height + LINE_HEIGHT + PADDING * 2;
    const drawingWidth = squareSize * width;
    const drawingHeight = squareSize * height;

    const boxX = Math.floor((canvasWidth - drawingWidth) / 2);
    const boxY = Math.floor((canvasHeight - drawingHeight) / 2);

    this.box.move({ x: boxX, y: boxY });
    this.box.updateSize({ height, width });

    const titlePosX = Math.floor(boxX + (drawingWidth - this.title.drawingSize.width) / 2);
    const titlePosY = Math.floor(boxY + PADDING * this.game.squareSize);

    const instructionsPosX = Math.floor(boxX + (drawingWidth - this.instructions.drawingSize.width) / 2);
    const instructionsPosY = titlePosY + height + LINE_HEIGHT * this.game.squareSize;

    this.title.move({ x: titlePosX, y: titlePosY });
    this.instructions.move({ x: instructionsPosX, y: instructionsPosY });
  }
}
