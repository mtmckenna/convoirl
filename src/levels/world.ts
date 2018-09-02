import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import EnergyBar from "../energy-bar";
import Game from "../game";

import TinyMusic from "tinymusic";

import {
  HALF_TILE_SIZE,
  IInputBuffer,
  IPoint,
  IPositionable,
  THROTTLE_TIME,
  TILE_SIZE,
} from "../common";

import { canThingMoveToPosition, throttle } from "../helpers";

const INPUT_BUFFER_LENGTH = 50;
const HOME_TILE = { x: TILE_SIZE * 4, y: TILE_SIZE * 7 };

const TEXT_INTROS = [
  ["great news!", "a new kid moved", "into the woods!"],
  ["become friends", "by having a", "convo... irl!"],
  ["first level up", "by chatting with", "your neighbors!"],
  ["people like", "talking about", "their interests!"],
];

const TEXT_SLEEP = ["", "zzzzzz...", ""];

export default class World extends Level {
  public energyBar: EnergyBar;
  public currentBuddy: Buddy;

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
  private box: Box;
  private playerSpawnPosition: IPoint = HOME_TILE;
  // private playerSpawnPosition: IPoint = { x: TILE_SIZE * 9, y: TILE_SIZE * 10 };
  private inputBuffer: IInputBuffer = { pressedAt: 0, key: null };
  private textIntros = TEXT_INTROS;

  constructor(game: Game) {
    super(game);
    const throttledHandleTouch = throttle(this.handleTouch.bind(this), 1000);
    this.handleTouch = throttledHandleTouch;
    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: game.squareSize }, "ENERGY");
    this.game.player.energy = 0.6;

    const buddy = new Buddy(game);
    buddy.move({ x: TILE_SIZE * 10, y: TILE_SIZE * 10 });
    this.buddies = [buddy];
    this.box = new Box(this.game, this.game.boxPos, this.game.boxSize);
    this.box.setWords(TEXT_INTROS[0]);
    this.box.touched = () => this.showNextIntroBox();
  }

  public handleInput(key) {
    this.inputBuffer = { pressedAt: this.game.timestamp, key };
  }

  public handleTouch(touch) {
    const touched = this.touchedTouchable(touch);
    if (touched) {
      touched.touched();
      return;
    }

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
    this.updateBox();
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
    this.addOverlayDrawables([this.energyBar, this.box]);
    this.addInteractables(this.buddies);
    this.addTouchables([this.box]);
    this.addUpdateables([...this.game.player.dusts, this.energyBar]);

    this.resize();
  }

  public levelStarted() {
    this.energyBar.animateToLevel(this.game.player.energy);
    this.game.player.move(this.playerSpawnPosition);
    this.game.player.setConvoMode(false);

    // @ts-ignore
    const NormalizedAudioContext = window.AudioContext || webkitAudioContext;

    const ac = new NormalizedAudioContext();
    const tempo = 120;
    const sequence = new TinyMusic.Sequence(ac, tempo, [
      "G2 q",
      "G3 q",
      "G4 q",
    ]);

    sequence.loop = false;
    sequence.play();
  }

  private showNextIntroBox() {
    this.textIntros.shift();
    if (!this.textIntros.length) {
      this.box.visible = false;
      return;
    }

    this.box.setWords(this.textIntros[0]);
  }

  private updateBox() {
    this.box.move(this.game.boxPos);
    this.box.updateSize(this.game.boxSize);
  }

  private processInput() {
    const timeSinceInput = this.game.timestamp - this.inputBuffer.pressedAt;
    if (timeSinceInput > INPUT_BUFFER_LENGTH) return;

    switch (this.inputBuffer.key) {
      case "ArrowUp":
        this.walk("up");
        break;
      case "ArrowDown":
        this.walk("down");
        break;
      case "ArrowRight":
        this.walk("right");
        break;
      case "ArrowLeft":
        this.walk("left");
        break;
    }
  }

  private walk(direction: "up" | "down" | "left" | "right") {
    if (this.game.player.walking) return;

    // Get the tile index that we'd be walking onto
    const tileIndex = Object.assign({}, this.game.player.tileIndex);
    switch (direction) {
      case "up":
      tileIndex.y -= 1;
      break;
      case "down":
      tileIndex.y += 1;
      break;
      case "left":
      tileIndex.x -= 1;
      break;
      case "right":
      tileIndex.x += 1;
      break;
    }

    let levelToQueue = null;

    // Check if we're overlapping interactables like buddies
    const overlappedInteractable = this.interactables.find((interactable) => {
      return interactable.tileIndex.x === tileIndex.x &&
      interactable.tileIndex.y === tileIndex.y;
    });

    if (overlappedInteractable) {
      this.currentBuddy = overlappedInteractable as Buddy;
      levelToQueue = this.game.levels.convo;
    }

    // Check if we're overlapping an interactable tile
    if (this.tileAtIndex(tileIndex).interactable) this.sleep();

    if (levelToQueue) {
      this.playerSpawnPosition.x = this.game.player.pos.x;
      this.playerSpawnPosition.y = this.game.player.pos.y;
      this.game.queueNextLevel(levelToQueue);
      return;
    }

    // If we're not overlapping anything fun, just walk
    this.game.player.walk(direction);
  }

  private sleep() {
    this.game.player.energy = 1;
    this.energyBar.animateToLevel(this.game.player.energy);
    this.box.setWords(TEXT_SLEEP);
    this.box.visible = true;
    this.box.touched = () => {
      this.game.player.walk("down");
      this.box.visible = false;
    }
  }

  private movePlayerVertically(touchDistance: number): boolean {
    if (touchDistance < 0 && this.canThingMoveInDirection(this.game.player, "up")) {
      this.handleInput("ArrowUp");
      return true;
    }

    if (touchDistance > 0 && this.canThingMoveInDirection(this.game.player, "down")) {
      this.handleInput("ArrowDown");
      return true;
    }

    return false;
  }

  private movePlayerHorizontally(touchDistance: number): boolean {
    if (touchDistance > 0 && this.canThingMoveInDirection(this.game.player, "right")) {
      this.handleInput("ArrowRight");
      return true;
    }

    if (touchDistance < 0 && this.canThingMoveInDirection(this.game.player, "left")) {
      this.handleInput("ArrowLeft");
      return true;
    }

    return false;
  }

  private canThingMoveInDirection(thing: IPositionable, direction: "up" | "down" | "right" | "left") {
    const pos = Object.assign({}, thing.pos);
    switch (direction) {
      case "up":
      pos.y -= this.game.tileSize;
      break;
      case "down":
      pos.y += this.game.tileSize;
      break;
      case "left":
      pos.x -= this.game.tileSize;
      break;
      case "right":
      pos.x += this.game.tileSize;
      break;
    }

    // Make sure we're on a tile boundary by subtracting the remainder
    pos.x = pos.x - pos.x % this.game.tileSize;
    pos.y = pos.y - pos.y % this.game.tileSize;

    return canThingMoveToPosition(thing, pos, this);
  }
}
