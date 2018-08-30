import Level from "./level";

import Buddy from "../buddy";
import EnergyBar from "../energy-bar";
import Game from "../game";

import {
  Direction,
  HALF_TILE_SIZE,
  IInputBuffer,
  IPoint,
  IPositionable,
  SQUARE_SIZE,
  TILE_SIZE,
} from "../common";

import { canThingMoveToPosition } from "../helpers";

const INPUT_BUFFER_LENGTH = 100;
const HOME_TILE = { x: TILE_SIZE * 4, y: TILE_SIZE * 6 };

export default class World extends Level {
  public energyBar: EnergyBar;

  protected tileTypeMap = ["green", "flowers", "grass", "tree", "house", "unwalkable", "door"];
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
  private playerSpawnPosition: IPoint = HOME_TILE;
  // private playerSpawnPosition: IPoint = { x: TILE_SIZE * 9, y: TILE_SIZE * 10 };
  private inputBuffer: IInputBuffer = { pressedAt: 0, key: null };

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
    this.inputBuffer = { pressedAt: this.game.timestamp, key };
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

  public update(timestamp) {
    super.update(timestamp);
    this.processInput();
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

    this.resize();
  }

  public levelStarted() {
    this.energyBar.percentFull = this.game.player.energy;
    this.game.player.move(this.playerSpawnPosition, false);
    this.game.player.setConvoMode(false);
  }

  private processInput() {
    const timeSinceInput = this.game.timestamp - this.inputBuffer.pressedAt;
    if (timeSinceInput > INPUT_BUFFER_LENGTH) return;

    switch (this.inputBuffer.key) {
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

  private walk(direction: Direction) {
    if (this.game.player.walking) return;

    // Get the tile index that we'd be walking onto
    const prevTileIndex = Object.assign({}, this.game.player.tileIndex);
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

    let levelToQueue = null;

    // Check if we're overlapping interactables like buddies
    const overlappedInteractable = this.interactables.find((interactable) => {
      return interactable.tileIndex.x === tileIndex.x &&
      interactable.tileIndex.y === tileIndex.y;
    });

    if (overlappedInteractable) levelToQueue = this.game.levels.convo;

    // Check if we're overlapping an interactable tile
    if (this.tileAtIndex(tileIndex).interactable) levelToQueue = this.game.levels.sleep;

    if (levelToQueue) {
      this.playerSpawnPosition.x = this.game.player.pos.x;
      this.playerSpawnPosition.y = this.game.player.pos.y;
      this.game.queueNextLevel(levelToQueue);
      return;
    }

    // If we're not overlapping anything fun, just walk
    this.game.player.walk(direction);
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
