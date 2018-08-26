import Level from "./level";

import Buddy from "../buddy";
import EnergyBar from "../energy-bar";
import Game from "../game";

import Door from "../tiles/door";
import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import House from "../tiles/house";
import Tree from "../tiles/tree";
import Unwalkable from "../tiles/unwalkable";

import {
  Direction,
  HALF_TILE_SIZE,
  IPoint,
  IPositionable,
  SQUARE_SIZE,
  TILE_SIZE,
} from "../common";

import { canThingMoveToPosition } from "../helpers";

export default class World extends Level {
  public energyBar: EnergyBar;

  protected tileTypeMap = [Green, Flowers, Grass, Tree, House, Unwalkable, Door];
  protected tileIndexes = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 3, 3, 3, 3, 0, 1, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 3, 3],
    [3, 3, 3, 4, 5, 5, 3, 0, 0, 2, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 3, 3],
    [3, 3, 3, 5, 5, 5, 3, 0, 1, 0, 0, 3, 3, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 3, 3, 3],
    [3, 3, 3, 5, 6, 5, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3],
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
    [3, 0, 0, 3, 3, 3, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 5, 6, 5, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 2, 1, 1, 1, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  ];

  private buddies: Buddy[];
  private playerSpawnPosition: IPoint = { x: TILE_SIZE * 4, y: TILE_SIZE * 6 };

  constructor(game: Game) {
    super(game);
    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: SQUARE_SIZE });
    this.game.player.energy = 0.6;

    const buddy = new Buddy(game);
    buddy.move({ x: TILE_SIZE * 10, y: TILE_SIZE * 10 });
    this.buddies = [buddy];
  }

  public handleInput(key) {
    switch (key) {
      case "ArrowUp":
        this.walk(Direction.Up);
        break;
      case "ArrowDown":
        this.walk(Direction.Down);
        break;
      case "ArrowRight":
        this.walk(Direction.Right);
        break;
      case "ArrowLeft":
        this.walk(Direction.Left);
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
    const energyBarX = Math.floor((this.game.canvas.width - this.energyBar.drawingSize.width) / 2);
    this.energyBar.move({ x: energyBarX, y: this.energyBar.pos.y });
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.game.player.dusts, 1);
    this.addDrawables([this.game.player], 2);
    this.addDrawables(this.buddies, 2);
    this.addOverlayDrawables([this.energyBar]);
    this.addInteractables(this.buddies);
    this.addUpdateables([...this.game.player.dusts, this.energyBar]);

    this.configurePlayer();
    this.resize();
  }

  public levelStarted() {
    this.energyBar.percentFull = this.game.player.energy;
  }

  private walk(direction: Direction) {
    if (this.game.player.walking) return;
    // Get the tile index that we'd be walking onto
    const tileIndex = Object.assign({}, this.game.player.tileIndex);
    switch (direction) {
      case Direction.Up:
      tileIndex.y -= 1;
      break;
      case Direction.Down:
      tileIndex.y += 1;
      break;
      case Direction.Left:
      tileIndex.x -= 1;
      break;
      case Direction.Right:
      tileIndex.x += 1;
      break;
    }

    // Check if we're overlapping interactables like buddies
    const overlappedInteractable = this.interactables.find((interactable) => {
      return interactable.tileIndex.x === tileIndex.x &&
      interactable.tileIndex.y === tileIndex.y;
    });

    if (overlappedInteractable) {
      this.game.playerInteractedWithObject(overlappedInteractable);
      return;
    }

    // Check if we're overlapping an interactable tile
    const proposedTile = this.tileAtIndex(tileIndex);
    if (proposedTile.interactable) {
      if (proposedTile.name === "door") {
        this.game.queueNextLevel(this.game.levels.sleep);
      }
    }

    // If we're not overlapping anything fun, just walk
    this.game.player.walk(direction);
  }

  private configurePlayer() {
    this.game.player.setConvoMode(false);
    this.game.player.move(this.playerSpawnPosition);
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
