import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import EnergyBar from "../energy-bar";
import Game from "../game";

import TinyMusic from "tinymusic";

import {
  IInputBuffer,
  IPoint,
  LISTEN,
  T_TIME,
  TS,
} from "../common";

import { randomIndexFromArray, throttle } from "../helpers";

const TEXT_INTROS = [
  ["great news! a", "new kid moved", "into the woods!"],
  ["become friends", "by having a", "convo... irl!"],
  ["first level up!", "chat with", "your neighbors!"],
  ["talk to them", "about their", "interests!"],
];

// const LISTEN_WORDS = [
//   ["well done! you", "had a convo!"],
// ];

const WB_START_POS = { x: TS * 18, y: TS * 7 };

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
    [3, 3, 3, 3,  ,  ,  , 3, 3, 3, 3, 3,  , 2,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  , 2, 3, 3,  , 2,  , 3, 3, 3,  ,  ,  ,  ,  ,  , 1,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  ,  , 3, 3, 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
    [3,  ,  , 2, 3, 3, 3,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 3],
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
  private walkingBuddy: Buddy;
  private listenBuddy: Buddy;
  private specialBuddy: Buddy;
  private learnedListen: boolean = false;

  constructor(game: Game) {
    super(game);
    this.state = "intro";
    const throttledHandleTouch = throttle(this.handleTouch.bind(this), T_TIME);
    const throttledHandleInput = throttle(this.handleInput.bind(this), T_TIME);
    this.handleTouch = throttledHandleTouch;
    this.handleInput = throttledHandleInput;

    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: game.squareSize }, "ENERGY");

    this.box = new Box(this.game, this.game.boxPos, this.game.boxSize);
    this.createBuddies();
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
    const minMoveTheshold = this.game.squareSize * TS / 2;

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
    this.startConvo(this.game.player.tileIndex);
    this.game.camera.moveToPlayer(this.game.player);

    // Make walking buddy walk
    if (this.walkingBuddy.pos.x <= WB_START_POS.x - 5 * TS) this.walkingBuddy.autoWalkDirection = "right";
    if (this.walkingBuddy.pos.x >= WB_START_POS.x + 5 * TS) this.walkingBuddy.autoWalkDirection = "left";
    this.walkingBuddy.update(timestamp);
    this.listenBuddy.update(timestamp);
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.game.player.dusts, 1);
    this.addDrawables(this.walkingBuddy.dusts, 1);
    this.addDrawables([this.game.player], 2);
    this.addDrawables(this.buddies, 2);
    this.addOverlayDrawables([this.energyBar, this.box]);
    this.addInteractables(this.buddies);
    this.addTouchables([this.box]);
    this.addUpdateables([...this.game.player.dusts, this.game.player, this.walkingBuddy, ...this.walkingBuddy.dusts]);
    this.resize();
  }

  public levelStarted() {
    this.energyBar.animateToLevel(this.game.player.energy);
    this.game.player.move(this.playerSpawnPosition);
    this.walkingBuddy.move(WB_START_POS);
    this.game.player.setConvoMode(false);
    this.showNextIntroBox();
    this.learnFromConvo();
    this.showListenBox();

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
    this.listenBuddy = new Buddy(this.game);
    this.listenBuddy.move({ x: TS * 7, y: TS * 10 });
    this.listenBuddy.skills.push(LISTEN);

    const pastryBuddy = new Buddy(this.game);
    pastryBuddy.move({ x: TS * 8, y: TS * 1 });
    pastryBuddy.skills.push("pastries");

    const travelBuddy = new Buddy(this.game);
    travelBuddy.move({ x: TS * 18, y: TS * 3 });
    travelBuddy.skills.push("france");

    const sportsBuddy = new Buddy(this.game);
    sportsBuddy.move({ x: TS * 25, y: TS * 2 });
    sportsBuddy.skills.push("sports");

    this.specialBuddy = new Buddy(this.game);
    this.specialBuddy.move({ x: TS * 23, y: TS * 18 });
    this.specialBuddy.look("left");
    this.specialBuddy.skills.push("anime");

    const booksBuddy = new Buddy(this.game);
    booksBuddy.move({ x: TS * 15, y: TS * 18 });
    booksBuddy.skills.push("books");
    booksBuddy.look("up");

    const mathBuddy = new Buddy(this.game);
    mathBuddy.move({ x: TS * 26, y: TS * 8 });
    mathBuddy.skills.push("math");
    mathBuddy.look("left");

    this.walkingBuddy = new Buddy(this.game);
    this.walkingBuddy.autoWalkDirection = "left";
    this.walkingBuddy.skills.push("math");
    this.walkingBuddy.animations.walking.duration = 750;

    this.buddies = [
      this.listenBuddy,
      pastryBuddy,
      travelBuddy,
      sportsBuddy,
      this.specialBuddy,
      booksBuddy,
      mathBuddy,
      this.walkingBuddy,
    ];
  }

  private handleBoxInput(): boolean {
    if (this.state === "play") return false;

    // Sleeping
    if (this.state === "sleeping" || this.state === "post-convo") {
      this.state = "play";
      this.box.visible = false;
    }

    if (this.state === "sleeping") this.handleInput("ArrowDown");
    if (this.state === "post-convo" && !this.learnedListen) {
      this.showListenBox();
      this.learnedListen = true;
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

    this.box.visible = true;
    this.box.setWords(words);
    this.box.animateTextIn(this.game.timestamp);
    this.textIntros.shift();
  }

  private learnFromConvo() {
    if (!this.currentBuddy) return;

    const skill = this.currentBuddy.skills[randomIndexFromArray(this.currentBuddy.skills)];
    this.box.visible = true;

    if (this.game.player.skills.includes(skill)) {
      this.box.setWords(["nice convo!", "that was a", "good time"]);
    } else {
      this.box.setWords(["nice convo!", "you learned", `${skill}!`]);
      this.game.player.skills.push(skill);
    }

    this.box.animateTextIn(this.game.timestamp);
  }

  private showListenBox() {
    if (this.currentBuddy !== this.listenBuddy) return;
    this.listenBuddy.walk("right");
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

    // Start a convo if overlapping a buddy
    if (this.startConvo(tileIndex)) return;

    // Check if we're overlapping the door
    if (this.tileAtIndex(tileIndex).interactable) this.sleep();

    // If we're not overlapping anything fun, just walk
    this.game.player.walk(direction);
    return true;
  }

  private startConvo(tileIndex: IPoint): boolean {
    // Check if we're overlapping interactables like buddies
    const overlappedInteractable = this.interactables.find((interactable) => {
      return interactable.tileIndex.x === tileIndex.x &&
        interactable.tileIndex.y === tileIndex.y;
    });

    if (overlappedInteractable) {
      this.currentBuddy = overlappedInteractable as Buddy;
      this.playerSpawnPosition.x = this.game.player.pos.x;
      this.playerSpawnPosition.y = this.game.player.pos.y;
      this.game.queueNextLevel(this.game.levels.convo);
      return true;
    }

    return false;
  }

  private sleep() {
    this.game.player.energy = 1;
    this.energyBar.animateToLevel(this.game.player.energy);
    this.box.setWords(["", "zzzzzz...", ""]);
    this.box.animateTextIn(this.game.timestamp);
    this.box.visible = true;
    this.state = "sleeping";
  }

  private movePlayerVertically(touchDistance: number) {
    if (touchDistance < 0) this.handleInput("ArrowUp");
    if (touchDistance > 0) this.handleInput("ArrowDown");
  }

  private movePlayerHorizontally(touchDistance: number) {
    if (touchDistance > 0) this.handleInput("ArrowRight");
    if (touchDistance < 0) this.handleInput("ArrowLeft");
  }
}
