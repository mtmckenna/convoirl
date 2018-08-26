import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import colorMap from "../colors";
import Game from "../game";

import Flowers from "../tiles/flowers";
import Green from "../tiles/green";
import Sky from "../tiles/sky";
import Tree from "../tiles/tree";

import { Direction, TILE_SIZE } from "../common";
import { randomIndexFromArray } from "../helpers";

const BOX_HEIGHT = 5;
const BUDDY_Y_FROM_BOX = 2 * TILE_SIZE;
const BUDDY_DISTANCE = 4 * TILE_SIZE;
const BOX_X = 2;

export default class Convo extends Level {
  public backgroundColor = colorMap[9];

  protected tileTypeMap = [Green, Flowers, Sky, Tree];
  protected tileIndexes = [[]];

  private box: Box;
  private buddies: Buddy[];

  constructor(game: Game) {
    super(game);
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

    this.updateBoxes();
    this.moveBuddies();
    this.generateTileIndexes();
    this.generateTiles();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.buddies, 1);
    this.addOverlayDrawables([this.box]);
  }

  protected generateTileIndexes() {
    const sizeInTiles = this.game.sizeInTiles();
    const playerTileIndexY = this.game.player.tileIndex.y;

    // Ground tiles
    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndexFromArray([0, 1]))); // Don't include the sky/tree tile

    // Sky tiles
    for (let i = 0; i < playerTileIndexY; i++) {
      this.tileIndexes[i] = this.tileIndexes[i].map(() => 2);
    }

    // Tree trees
    this.tileIndexes[playerTileIndexY - 1] = this.tileIndexes[playerTileIndexY].map(() => 3);
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
