import Box from "../box";
import colorMap from "../colors";
import Game from "../game";
import Text from "../text";

import Level from "./level";

import { BLINK_DURATION, LINE_HEIGHT } from "../common";

const TITLE = "CONVO IRL";
const TAP_TO_PLAY = "TAP TO PLAY";

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
    this.title = new Text(this.game, TITLE, colorMap[1]);
    this.instructions = new Text(this.game, TAP_TO_PLAY, colorMap[1]);
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
    this.box.touched = () => this.handleInput();
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
    this.addOverlayDrawables([this.box, this.title, this.instructions]);
  }

  public handleInput() {
    if (this.game.transitioning) return;
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch(touch) {
    const touched = this.touchedTouchable(touch);
    if (touched) touched.touched();
  }

  public update(timestamp) {
    if (timestamp - this.lastBlinkAt > BLINK_DURATION) {
      this.instructions.visible = !this.instructions.visible;
      this.lastBlinkAt = timestamp;
    }
  }

  private moveText() {
    this.box.move(this.game.boxPos);
    this.box.updateSize(this.game.boxSize);

    const titlePosX = Math.floor(
      this.box.pos.x + this.game.squareSize * (this.game.boxSize.width - this.title.size.width) / 2,
    );
    const titlePosY = Math.floor(this.box.pos.y + LINE_HEIGHT * this.game.squareSize);

    const instructionsPosX = Math.floor(
      this.box.pos.x + this.game.squareSize * (this.game.boxSize.width - this.instructions.size.width) / 2,
    );
    const instructionsPosY = titlePosY + LINE_HEIGHT * this.game.squareSize;

    this.title.move({ x: titlePosX, y: titlePosY });
    this.instructions.move({ x: instructionsPosX, y: instructionsPosY });
  }
}
