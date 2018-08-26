import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import Game from "../game";

import Flowers from "../tiles/flowers";
import Green from "../tiles/green";

import { Direction, TILE_SIZE } from "../common";

const BOX_HEIGHT = 5;
const BUDDY_Y_FROM_BOX = 2 * TILE_SIZE;
const BUDDY_DISTANCE = 4 * TILE_SIZE;
const BOX_X = 2;

export default class Convo extends Level {

  protected tileTypeMap = [Green, Flowers];
  protected tileIndexes = [[]];

  private box: Box;
  // private boxHeight: number;
  // private boxWidth: number;
  private buddies: Buddy[];

  constructor(game: Game) {
    super(game);
    // this.boxHeight = this.game.squareSize * BOX_HEIGHT;
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
  }

  public handleInput(key) {
    return;
  }

  public handleTouch(touch) {
    return;
  }

  public levelWillStart() {
    this.updateBoxes();

    this.game.player.setConvoMode(true);
    this.game.player.convoLook(Direction.Right);
    const buddy2 = new Buddy(this.game);
    buddy2.setConvoMode(true);

    this.buddies = [this.game.player, buddy2];
  }

  public levelStarted() {
    this.moveBuddies();
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();

    this.generateTileIndexes();
    this.generateTiles();
    this.updateBoxes();
    this.moveBuddies();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.buddies, 1);
    this.addOverlayDrawables([this.box]);
  }

  private moveBuddies() {
    const buddy = this.buddies[1];
    const boxPos = this.game.gameCoordsFromDrawingCoords(this.box.pos);
    const boxSize = this.game.gameSizeFromDrawingSize(this.box.drawingSize);
    const convoWidth = this.game.player.size.width + BUDDY_DISTANCE + buddy.size.width;

    const playerPos = {
      x: boxPos.x + (boxSize.width - convoWidth) / 2,
      y: boxPos.y - BUDDY_Y_FROM_BOX,
    };

    const buddyPos = Object.assign({}, playerPos);
    buddyPos.x += BUDDY_DISTANCE + this.game.player.size.width;

    this.game.player.move(playerPos, false);
    buddy.move(buddyPos, false);
  }

  private updateBoxes() {
    const width = Math.floor(this.game.canvas.width / this.game.squareSize - this.game.squareSize);
    const height = this.game.squareSize * BOX_HEIGHT;
    const y = this.game.canvas.height - height * this.game.squareSize - this.game.squareSize * 2;
    this.box.move({ x: this.game.squareSize * BOX_X, y });
    this.box.updateSize({ height, width });
  }
}
