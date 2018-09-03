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
  THROTTLE_TIME,
  TS,
} from "../common";

import { throttle } from "../helpers";

const TEXT_INTROS = [
  ["great news! a", "new kid moved", "into the woods!"],
  ["become friends", "by having a", "convo... irl!"],
  ["first level up!", "chat with", "your neighbors!"],
  ["talk to them", "about their", "interests!"],
];

const TEXT_SLEEP = ["", "zzzzzz...", ""];

export default class World extends Level {
  public energyBar: EnergyBar;
  public currentBuddy: Buddy;

  protected tileTypeMap = ["green", "flowers", "grass", "tree", "house", "unwalkable", "door"];
  protected tileIndexes = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3,  ,  ,  , 3, 3, 3, 3,  ,  ,  ,  ,  , 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 2,  ,  , 3, 3, 3, 3,  , 1,  ,  ,  , 3, 3, 3, 3, 3,  ,  , 3, 3],
    [3, 3, 3, 4, 5, 5, 3,  ,  , 2,  , 3, 3, 3,  ,  ,  ,  ,  , 3, 3, 3, 3,  ,  ,  , 3, 3],
    [3, 3, 3, 5, 5, 5, 3,  , 1,  ,  , 3, 3, 2,  ,  ,  , 2,  ,  ,  , 3,  ,  ,  , 3, 3, 3],
    [3, 3, 3, 5, 6, 5, 3,  ,  ,  , 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3, 3, 3],
    [3, 3, 3, 1, 1, 1, 1, 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3,  ,  ,  ,  ,  , 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3, 3, 3, 3,  ,  ,  ,  , 3, 3, 3, 3,  , 2,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  , 2, 3,  ,  , 2,  ,  , 3, 3,  ,  ,  ,  ,  ,  , 1,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  ,  , 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  ,  , 2, 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3, 1,  , 3, 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1,  ,  , 3,  ,  ,  ,  , 3],
    [3,  ,  , 3, 3, 2,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3,  ,  , 2, 3,  ,  ,  , 3],
    [3,  ,  , 3, 3,  ,  ,  , 2,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3, 3,  ,  , 2, 3, 3, 3, 3],
    [3,  ,  , 3,  ,  ,  ,  ,  ,  , 1, 3, 3,  ,  ,  ,  ,  ,  ,  , 3, 3,  ,  , 4, 5, 5, 3],
    [3,  ,  ,  ,  ,  ,  ,  , 3, 3, 3, 3,  , 1,  ,  ,  ,  ,  ,  , 3, 3,  ,  , 5, 5, 5, 3],
    [3,  ,  , 3, 3, 3,  , 3, 3, 3, 3,  ,  ,  ,  ,  , 3, 3, 3, 3, 3, 3,  ,  , 5, 6, 5, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2,  ,  ,  ,  ,  , 3, 3, 3, 3, 3,  , 2, 1, 1, 1, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  ];

  private buddies: Buddy[];
  private box: Box;
  private playerSpawnPosition: IPoint = { x: TS * 4, y: TS * 6 };
  private inputBuffer: IInputBuffer = { pressedAt: 0, key: null };
  private textIntros: string[][] = TEXT_INTROS;
  // private state: string = "intro";
  private state: string = "play";

  constructor(game: Game) {
    super(game);
    const throttledHandleTouch = throttle(this.handleTouch.bind(this), THROTTLE_TIME);
    const throttledHandleInput = throttle(this.handleInput.bind(this), THROTTLE_TIME);
    this.handleTouch = throttledHandleTouch;
    this.handleInput = throttledHandleInput;

    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: game.squareSize }, "ENERGY");

    this.box = new Box(this.game, this.game.boxPos, this.game.boxSize);
    this.box.visible = false; // TODO: remove this debug code
  }

  public handleInput(key) {
    if (this.game.transitioning) return;
    if (this.handleBoxInput()) return;
    this.inputBuffer = { pressedAt: this.game.timestamp, key };
  }

  public handleTouch(touch) {
    if (this.game.transitioning) return;
    if (this.game.player.walking) return;
    if (this.handleBoxInput()) return;

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
      this.movePlayerHorizontally(horizontalDistance);
    } else {
      this.movePlayerVertically(verticalDistance);
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
    this.createBuddies();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.game.player.dusts, 1);
    this.addDrawables([this.game.player], 2);
    this.addDrawables(this.buddies, 2);
    this.addOverlayDrawables([this.energyBar, this.box]);
    this.addInteractables(this.buddies);
    this.addTouchables([this.box]);
    this.addUpdateables([...this.game.player.dusts]);

    this.resize();
  }

  public levelStarted() {

    this.energyBar.animateToLevel(this.game.player.energy);
    this.game.player.move(this.playerSpawnPosition);
    this.game.player.setConvoMode(false);
    this.showNextIntroBox();

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

  private createBuddies() {
    const listenBuddy = new Buddy(this.game);
    listenBuddy.move({ x: TS * 10, y: TS * 10 });
    listenBuddy.skills.push("listen");

    const pastryBuddy = new Buddy(this.game);
    pastryBuddy.move({ x: TS * 8, y: TS * 1 });
    listenBuddy.skills.push("pastries");

    const travelBuddy = new Buddy(this.game);
    travelBuddy.move({ x: TS * 18, y: TS * 3 });
    travelBuddy.skills.push("france");

    const sportsBuddy = new Buddy(this.game);
    sportsBuddy.move({ x: TS * 25, y: TS * 2 });
    sportsBuddy.skills.push("sports");

    const specialBuddy = new Buddy(this.game);
    specialBuddy.move({ x: TS * 23, y: TS * 18 });
    specialBuddy.look("left");
    specialBuddy.skills.push("gymnastics");

    const booksBuddy = new Buddy(this.game);
    booksBuddy.move({ x: TS * 15, y: TS * 18 });
    booksBuddy.skills.push("books");
    booksBuddy.look("up");

    this.buddies = [
      listenBuddy,
      pastryBuddy,
      travelBuddy,
      sportsBuddy,
      specialBuddy,
      booksBuddy,
    ];
  }

  private handleBoxInput(): boolean {
    if (this.state === "play") return false;

    // Sleeping
    if (this.state === "sleeping") {
      this.state = "play";
      this.box.visible = false;
      this.handleInput("ArrowDown");
    }

    // Run through intro
    if (this.state === "intro") this.showNextIntroBox();

    return true;
  }

  private showNextIntroBox() {
    if (this.state !== "intro") return; // TODO: remove this debug code!
    const words = this.textIntros[0];
    if (!words) {
      this.state = "play";
      this.box.visible = false;
      return;
    }

    this.box.setWords(words);
    this.box.animateTextIn(this.game.timestamp);
    this.textIntros.shift();
  }

  private updateBox() {
    this.box.move(this.game.boxPos);
    this.box.updateSize(this.game.boxSize);
  }

  // This function is gigantic not because I'm a bad person but because
  // I needed to de-dupe the switch statements to save space.
  private processInput(): boolean {
    const timeSinceInput = this.game.timestamp - this.inputBuffer.pressedAt;
    if (timeSinceInput > 50) return false; // For input buffering
    if (this.game.player.walking) return false;

    // Get the tile index that we'd be walking onto
    const tileIndex = Object.assign({}, this.game.player.tileIndex);
    let direction = null;

    switch (this.inputBuffer.key) {
      case "ArrowUp":
        direction = "up";
        tileIndex.y -= 1;
        break;
      case "ArrowDown":
        direction = "down";
        tileIndex.y += 1;
        break;
      case "ArrowLeft":
        direction = "left";
        tileIndex.x -= 1;
        break;
      case "ArrowRight":
        direction = "right";
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
    return true;
  }

  private sleep() {
    this.game.player.energy = 1;
    this.energyBar.animateToLevel(this.game.player.energy);
    this.box.setWords(TEXT_SLEEP);
    this.box.animateTextIn(this.game.timestamp);
    this.box.visible = true;
    this.state = "sleeping";
  }

  private movePlayerVertically(touchDistance: number): boolean {
    if (touchDistance < 0) {
      this.handleInput("ArrowUp");
      return true;
    }

    if (touchDistance > 0) {
      this.handleInput("ArrowDown");
      return true;
    }

    return false;
  }

  private movePlayerHorizontally(touchDistance: number): boolean {
    if (touchDistance > 0) {
      this.handleInput("ArrowRight");
      return true;
    }

    if (touchDistance < 0) {
      this.handleInput("ArrowLeft");
      return true;
    }

    return false;
  }
}
