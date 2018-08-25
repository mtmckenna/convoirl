import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import Game from "../game";
import Text from "../text";

import Flowers from "../tiles/flowers";
import Green from "../tiles/green";

import { Direction, TILE_SIZE } from "../common";

import { randomIndexFromArray } from "../helpers";

const BOX_HEIGHT = 5;

export default class Convo extends Level {

  protected tileTypeMap = [Green, Flowers];
  protected tileIndexes = [[]];

  private box: Box;
  private boxSelectHeight: number;
  private buddies: Buddy[];

  constructor(game: Game) {
    super(game);

    this.boxSelectHeight = this.game.squareSize * BOX_HEIGHT;
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });

    this.game.player.setConvoMode(true);
    this.game.player.convoLook(Direction.Right);

    const playerPos = { x: TILE_SIZE * 2, y: TILE_SIZE * 2 };
    this.game.player.move(playerPos);

    const buddy2 = new Buddy(game);
    buddy2.move({ x: TILE_SIZE * 5, y: TILE_SIZE * 5 });
    buddy2.setConvoMode(true);

    this.buddies = [this.game.player, buddy2];
  }

  public handleInput(key) {
    return;
  }

  public handleTouch(touch) {
    return;
  }

  public resize() {
    this.generateTileIndexes();
    this.generateTiles();
    this.updateBoxes();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.resize();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.buddies, 1);
    this.addOverlayDrawables([this.box]);
  }

  private generateTileIndexes() {
    // The tiles should fit the screen size since we don't scroll in convo
    const TILES_WIDE = Math.ceil(this.game.canvas.width / this.game.squareSize / TILE_SIZE);
    const TILES_TALL = Math.ceil(this.game.canvas.height / this.game.squareSize / TILE_SIZE);

    this.tileIndexes = new Array(TILES_TALL)
    .fill(null).map(() => new Array(TILES_WIDE)
    .fill(null).map(() => randomIndexFromArray(this.tileTypeMap)));
  }

  private updateBoxes() {
    const width = Math.floor(this.game.canvas.width / this.game.squareSize - this.game.squareSize / 2);
    const y = this.game.canvas.height - this.boxSelectHeight * this.game.squareSize - this.game.squareSize * 2;
    this.box.move({ x: this.game.squareSize, y });
    this.box.updateSize({ height: this.boxSelectHeight, width });
  }
}
