import colorMap from "../colors";
import Convo from "./convo";
import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import EnergyBar from "../energy-bar";
import Game from "../game";

import {
  IDrawable,
  IFadeable,
  IInputBuffer,
  IInteractable,
  IPoint,
  LT,
  TS,
  TT,
} from "../common";

import {
  randomIndex,
  removeElement,
  throttle,
} from "../helpers";

const TEXT_INTROS = [
  ["great news! a", "new kid moved", "into the woods!"],
  ["become friends", "by having a", "convo... irl!"],
  ["first level up!", "chat with", "your neighbors!"],
  ["talk to them", "about their", "interests!"],
];

const TEXT_FIRST_CONVO = [
  ["keep at it", "and make", "new friends!"],
  ["if you are", "low on energy", "take a nap!"],
];

const TEXT_WIN = [
  ["well done!", "you made a", "new friend!"],
  ["maybe you", "will become", "best buds!"],
  ["be kind to", "your friends", "because"],
  ["every quest", "is better", "with friends!"],
];

const WB_START_POS = { x: TS * 18, y: TS * 7 };
const SLEEP_POS = { x: TS * 4, y: TS * 5 };
const TOPICS = [
  "BAKING",
  "FRANCE",
  "SPORTS",
  "ANIME",
  "BOOKS",
  "MATH",
  "CATS",
];

const SECONDARY_TOPICS = TOPICS.slice();
const playerSpawnPosition: IPoint = { x: TS * 4, y: TS * 6 };

let showNextIntroBox;
let showPostListenBox;
let showWinBox;

let buddies: Buddy[];
let box: Box;
let inputBuffer: IInputBuffer = { pressedAt: 0, key: null };
let walkingBuddy: Buddy;
let listenBuddy: Buddy;
let specialBuddy: Buddy;
let energyBar: EnergyBar;
let gameOverStartTime: number = 0;
let iables: IInteractable[] = [];

export default class World extends Level {
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

  constructor(game: Game) {
    super(game);
    showNextIntroBox = () => showBox.call(this, TEXT_INTROS);
    showPostListenBox = () => showBox.call(this, TEXT_FIRST_CONVO);
    showWinBox = () => showBox.call(this, TEXT_WIN);

    this.state = "intro";
    const throttledHandleTouch = throttle(this.handleTouch.bind(this), TT);
    const throttledHandleInput = throttle(this.handleInput.bind(this), TT);
    this.handleTouch = throttledHandleTouch;
    this.handleInput = throttledHandleInput;

    this.generateTiles();
    energyBar = new EnergyBar(this.game, { x: 0, y: game.ss }, "ENERGY");

    box = new Box(this.game, this.game.boxPos(), this.game.boxSize());
    createBuddies.call(this);
  }

  public handleInput(key) {
    if (this.game.inTr()) return;
    if (handleBoxInput.call(this)) return;
    inputBuffer = { pressedAt: this.game.tstamp, key };
  }

  public handleTouch(touch) {
    if (this.game.inTr()) return;
    if (this.game.p.walking) return;
    if (handleBoxInput.call(this)) return;

    const { c } = this.game;
    const { h, w } = c.size;
    const offset = c.offset;

    // TODO: totally forgot how this works...
    const tapXInCameraSpace = touch.clientX * w / window.innerWidth - offset.x;
    const tapYInCameraSpace = touch.clientY * h / window.innerHeight - offset.y;
    const horizontalDistance = tapXInCameraSpace - this.game.p.pos.x * this.game.ss;
    const verticalDistance = tapYInCameraSpace - this.game.p.pos.y * this.game.ss;
    const absHorizontalDistance = Math.abs(horizontalDistance);
    const absVerticalDistance = Math.abs(verticalDistance);
    const minMoveTheshold = this.game.ss * TS / 2;

    if (absHorizontalDistance < minMoveTheshold && absVerticalDistance < minMoveTheshold) return;

    if (absHorizontalDistance > absVerticalDistance) {
      movePlayerHorizontally.call(this, horizontalDistance);
    } else {
      movePlayerVertically.call(this, verticalDistance);
    }
  }

  public resize() {
    const energyBarX = (this.game.canvas.width - energyBar.dSize.w) / 2;
    energyBar.move({ x: energyBarX, y: energyBar.pos.y });
    updateBox.call(this);
  }

  public update(timestamp) {
    super.update(timestamp);
    processInput.call(this);
    startConvo.call(this, this.game.p.tileIndex);
    this.game.c.moveToPlayer(this.game.p);

    // Make walking buddy walk
    if (walkingBuddy.pos.x <= WB_START_POS.x - 5 * TS) walkingBuddy.autoWalkDirection = "right";
    if (walkingBuddy.pos.x >= WB_START_POS.x + 5 * TS) walkingBuddy.autoWalkDirection = "left";
  }

  public configViz() {
    super.configViz();
    iables = [];
    this.addDables(this.tiles, 0);
    this.addDables(this.game.p.dusts, 1); // TODO: can combine onto one line
    this.addDables(walkingBuddy.dusts, 1);
    this.addDables([this.game.p], 2);
    this.addDables(buddies, 2);
    this.addOdables([energyBar, box]);
    iables.push(...buddies);
    this.addUables([
      ...this.game.p.dusts,
      this.game.p,
      walkingBuddy,
      ...walkingBuddy.dusts,
      listenBuddy,
    ]);
    this.configClouds(this.size.w, this.size.h, .3);
    this.addDables(this.clouds, 3);
    this.resize();
  }

  public levelStarted() {
    energyBar.animateToLevel(this.game.p.energy);
    walkingBuddy.move(WB_START_POS);
    this.game.p.move(playerSpawnPosition);
    this.game.p.stop();
    this.game.p.setConvoMode(false);

    switch (this.state) {
      case "intro":
        showNextIntroBox();
        break;
      case "nap":
        this.game.p.move(SLEEP_POS);
        sleep.call(this);
        break;
      case "win":
        this.game.p.energy = 1;
        showWinBox();
        break;
      case "post-listen":
      case "post-convo":
        learnFromConvo.call(this);
        this.game.p.lastConvo = this.game.tstamp;
        break;
    }
  }
}

function hideBox() {
  box.visible = false;
}

function handleBoxInput(): boolean {
  if (this.state === "play") return false;
  // if (box.ani) return true;
  let done = false;

  switch (this.state) {
    case "sleeping":
      hideBox.call(this);
      this.state = "play";
      this.handleInput("ArrowDown");
      break;
    case "post-convo":
      hideBox.call(this);
      this.state = "play";
      this.currentBuddy.lastConvo = this.game.tstamp;
      break;
    case "post-listen":
      done = showPostListenBox();
      if (done) {
        this.state = "play";
        listenBuddy.walk("right");
        listenBuddy.look("left");
      }
      break;
    case "intro":
      done = showNextIntroBox();
      if (done) this.state = "play";
      break;
    case "win":
      showWinBox();
      if (TEXT_WIN.length === 0) {
        this.state = "game-over";
        gameOverStartTime = this.game.tstamp;
        shadeBox.game = this.game;
        shadeBox.size = Object.assign({}, this.size);
        shadeBox.dSize = Object.assign({}, this.dSize);
        this.addDables([shadeBox], 3);
        energyBar.animateToLevel(1);
      }
      break;
  }

  return true;
}

function showBox(textArray): boolean {
  const words = textArray[0];

  if (!words) {
    box.visible = false;
    return true;
  }

  box.visible = true;
  box.setWords(words);
  box.aniText(this.game.tstamp);
  textArray.shift();
  return false;
}

function learnFromConvo() {
  if (!this.currentBuddy) return;

  const convo = (this.game.levels.convo as Convo);
  const topics = convo.usedTopics.filter((topic) => !this.game.p.skills.includes(topic));
  const skill = topics.length > 0 ? topics[randomIndex(topics)] : null;
  box.visible = true;

  if (skill) {
    box.setWords(["nice convo!", "you learned", `${skill}!`]);
    this.game.p.skills.push(skill);
  } else {
    box.setWords(["nice convo!", "that was a", "good time!"]);
  }

  box.aniText(this.game.tstamp);
}

function updateBox() {
  box.move(this.game.boxPos());
  box.updateSize(this.game.boxSize());
}

function startConvo(tileIndex: IPoint): boolean {
  // Check if we're overlapping interactables like buddies
  const overlappedInteractable = iables.find((interactable) => {
    return interactable.tileIndex.x === tileIndex.x &&
      interactable.tileIndex.y === tileIndex.y;
  }) as Buddy;

  if (overlappedInteractable && (this.game.tstamp - overlappedInteractable.lastConvo) > 1000 && !box.visible) {
    this.currentBuddy = overlappedInteractable as Buddy;
    playerSpawnPosition.x = this.game.p.pos.x;
    playerSpawnPosition.y = this.game.p.pos.y;
    this.game.qLevel(this.game.levels.convo);
    return true;
  }

  // Still don't want the player to move if there's an interactable in the way
  return !!overlappedInteractable;
}

function sleep() {
  this.game.p.energy = 1;
  energyBar.animateToLevel(this.game.p.energy);
  box.setWords(["", "zzzzzz...", ""]);
  box.aniText(this.game.tstamp);
  box.visible = true;
  this.state = "sleeping";
}

function movePlayerVertically(touchDistance: number) {
  if (touchDistance < 0) this.handleInput("ArrowUp");
  if (touchDistance > 0) this.handleInput("ArrowDown");
}

function movePlayerHorizontally(touchDistance: number) {
  if (touchDistance > 0) this.handleInput("ArrowRight");
  if (touchDistance < 0) this.handleInput("ArrowLeft");
}

function getSecondaryTopic(primaryTopic: string): string {
  const topic = SECONDARY_TOPICS.find((secondaryTopic) => secondaryTopic !== primaryTopic);
  removeElement(topic, SECONDARY_TOPICS);
  return topic;
}

function createBuddies() {
  listenBuddy = new Buddy(this.game);
  listenBuddy.move({ x: TS * 7, y: TS * 10 });
  listenBuddy.skills.push(LT, TOPICS[6]);
  listenBuddy.look("up");

  const pastryBuddy = new Buddy(this.game);
  pastryBuddy.move({ x: TS * 8, y: TS * 1 });
  pastryBuddy.skills.push(TOPICS[0], getSecondaryTopic(TOPICS[0]));

  const travelBuddy = new Buddy(this.game);
  travelBuddy.move({ x: TS * 18, y: TS * 3 });
  travelBuddy.skills.push(TOPICS[1], getSecondaryTopic(TOPICS[1]));

  const sportsBuddy = new Buddy(this.game);
  sportsBuddy.move({ x: TS * 25, y: TS * 2 });
  sportsBuddy.skills.push(TOPICS[2], getSecondaryTopic(TOPICS[2]));

  const booksBuddy = new Buddy(this.game);
  booksBuddy.move({ x: TS * 15, y: TS * 18 });
  booksBuddy.skills.push(TOPICS[3], getSecondaryTopic(TOPICS[3]));
  booksBuddy.look("up");

  const mathBuddy = new Buddy(this.game);
  mathBuddy.move({ x: TS * 26, y: TS * 8 });
  mathBuddy.skills.push(TOPICS[4], getSecondaryTopic(TOPICS[4]));
  mathBuddy.look("left");

  walkingBuddy = new Buddy(this.game);
  walkingBuddy.autoWalkDirection = "left";
  walkingBuddy.skills.push(TOPICS[5], getSecondaryTopic(TOPICS[5]));
  walkingBuddy.a.walking.duration = 600;

  specialBuddy = new Buddy(this.game);
  specialBuddy.move({ x: TS * 23, y: TS * 18 });
  specialBuddy.look("left");
  specialBuddy.skills.push(...TOPICS);

  buddies = [
    listenBuddy,
    pastryBuddy,
    travelBuddy,
    sportsBuddy,
    specialBuddy,
    booksBuddy,
    mathBuddy,
    walkingBuddy,
  ];
}

// This function is gigantic not because I'm a bad person but because
// I needed to de-dupe the switch statements to save space.
function processInput(): boolean {
  const timeSinceInput = this.game.tstamp - inputBuffer.pressedAt;
  if (timeSinceInput > 30) return false; // For input buffering
  if (this.game.p.walking) return false;

  // Get the tile index that we'd be walking onto
  const tileIndex = Object.assign({}, this.game.p.tileIndex);
  let direction = null;

  switch (inputBuffer.key) {
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
    default:
      return;
  }

  // Start a convo if overlapping a buddy
  if (startConvo.call(this, tileIndex)) return;

  // Check if we're overlapping the door
  const onSleepTile = tileIndex.x === (SLEEP_POS.x / TS) && tileIndex.y === (SLEEP_POS.y / TS);
  if (onSleepTile) sleep.call(this);

  // If we're not overlapping anything fun, just walk
  const walked = this.game.p.walk(direction);
  // if (walked) this.game.pa("walk");
  return true;
}

const shadeBox: IDrawable & IFadeable = {
  alpha: 0.0,
  dSize: { w: 0, h: 0 },
  draw(context) {
    context.fillStyle = colorMap[0];
    context.globalAlpha = Math.min((this.game.tstamp - gameOverStartTime) / 2000, .8);
    context.fillRect(0, 0, this.dSize.w, this.dSize.h);
  },
  game: null,
  pos: { x: 0, y: 0 },
  size: { w: 0, h: 0 },
  visible: true,
};
