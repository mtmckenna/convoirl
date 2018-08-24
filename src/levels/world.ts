import Level from "./level";

import EnergyBar from "../energy-bar";
import Game from "../game";
import Player from "../player";

import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import House from "../tiles/house";
import Tree from "../tiles/tree";
import Unwalkable from "../tiles/unwalkable";

import {
  Direction,
  HALF_TILE_SIZE,
  IPositionable,
  SQUARE_SIZE,
  TILE_SIZE,
} from "../common";

import { canThingMoveToPosition } from "../helpers";

export default class World extends Level {
  public energyBar: EnergyBar;

  protected tileTypeMap = [Green, Flowers, Grass, Tree, House, Unwalkable];
  protected tileIndexes = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 3, 3, 3, 3, 0, 1, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 3, 3],
    [3, 3, 3, 4, 5, 5, 3, 0, 0, 2, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 3, 3],
    [3, 3, 3, 5, 5, 5, 3, 0, 1, 0, 0, 3, 3, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3],
    [3, 3, 3, 5, 5, 5, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3],
    [3, 3, 3, 1, 1, 1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 2, 3, 0, 0, 2, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3],
    [3, 1, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 3],
    [3, 0, 0, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 3, 0, 0, 0, 3],
    [3, 0, 0, 3, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 2, 3, 3, 3, 3],
    [3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 5, 5, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 1, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 5, 5, 5, 3],
    [3, 0, 0, 3, 3, 3, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 5, 5, 5, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 2, 1, 1, 1, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  ];

  private buddies: Player[];

  constructor(game: Game) {
    super(game);
    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: SQUARE_SIZE });

    const buddy = new Player(game);
    buddy.pos.y = TILE_SIZE * 10;
    buddy.pos.x = TILE_SIZE * 10;
    this.buddies = [buddy];
  }

  public handleInput(key) {
    switch (key) {
      case "ArrowUp":
        this.game.walk(Direction.Up);
        break;
      case "ArrowDown":
        this.game.walk(Direction.Down);
        break;
      case "ArrowRight":
        this.game.walk(Direction.Right);
        break;
      case "ArrowLeft":
        this.game.walk(Direction.Left);
        break;
    }
  }

  public handleTouch(touch) {
    if (this.game.player.walking) return;

    const { camera } = this.game;
    const { height, width } = camera.size;
    const offset = camera.offset;

    // TODO: totally forgot how this works...
    const tapXInCameraSpace = touch.clientX * width / window.innerWidth - offset.x;
    const tapYInCameraSpace = touch.clientY * height / window.innerHeight - offset.y;
    const horizontalDistance = tapXInCameraSpace - this.game.player.pos.x * this.game.squareSize;
    const verticalDistance = tapYInCameraSpace - this.game.player.pos.y * this.game.squareSize;
    const absHorizontalDistance = Math.abs(horizontalDistance);
    const absVerticalDistance = Math.abs(verticalDistance);
    const minMoveTheshold = this.game.squareSize * HALF_TILE_SIZE;

    if (absHorizontalDistance < minMoveTheshold && absVerticalDistance < minMoveTheshold) return;

    if (absHorizontalDistance > absVerticalDistance) {
      const couldMoveHorizontally = this.movePlayerHorizontally(horizontalDistance);
      if (!couldMoveHorizontally) this.movePlayerVertically(verticalDistance);
    } else {
      const couldMoveVertically = this.movePlayerVertically(verticalDistance);
      if (!couldMoveVertically) this.movePlayerHorizontally(horizontalDistance);
    }
  }

  public resize() {
    const energyBarX = Math.floor(
      (this.game.canvas.width - this.energyBar.drawingSize.width) / 2,
    );

    this.energyBar.move({ x: energyBarX, y: this.energyBar.pos.y });
  }

  public configureDrawablesAndUpdateables() {
    this.game.addDrawables(this.tiles, 0);
    this.game.addDrawables(this.game.player.dusts, 1);
    this.game.addDrawables([this.game.player], 2);
    this.game.addDrawables(this.buddies, 2);
    this.game.addOverlayDrawables([this.energyBar]);

    this.game.addUpdateables([
      ...this.game.player.dusts,
      this.energyBar,
    ]);

    this.resize();
  }

  private movePlayerVertically(touchDistance: number): boolean {
    if (touchDistance < 0 && this.canThingMoveInDirection(this.game.player, Direction.Up)) {
      this.handleInput("ArrowUp");
      return true;
    }

    if (touchDistance > 0 && this.canThingMoveInDirection(this.game.player, Direction.Down)) {
      this.handleInput("ArrowDown");
      return true;
    }

    return false;
  }

  private movePlayerHorizontally(touchDistance: number): boolean {
    if (touchDistance > 0 && this.canThingMoveInDirection(this.game.player, Direction.Right)) {
      this.handleInput("ArrowRight");
      return true;
    }

    if (touchDistance < 0 && this.canThingMoveInDirection(this.game.player, Direction.Left)) {
      this.handleInput("ArrowLeft");
      return true;
    }

    return false;
  }

  private canThingMoveInDirection(thing: IPositionable, direction: Direction) {
    const pos = Object.assign({}, thing.pos);
    switch (direction) {
      case Direction.Up:
      pos.y -= this.game.tileSize;
      break;
      case Direction.Down:
      pos.y += this.game.tileSize;
      break;
      case Direction.Left:
      pos.x -= this.game.tileSize;
      break;
      case Direction.Right:
      pos.x += this.game.tileSize;
      break;
    }

    // Make sure we're on a tile boundary by subtracting the remainder
    pos.x = pos.x - pos.x % this.game.tileSize;
    pos.y = pos.y - pos.y % this.game.tileSize;

    return canThingMoveToPosition(thing, pos, this);
  }
}
