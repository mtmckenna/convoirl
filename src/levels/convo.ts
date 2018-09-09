import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import colorMap from "../colors";
import EnergyBar from "../energy-bar";
import Game from "../game";
import Text from "../text";

import {
  L_HEIGHT,
  L_SPACE,
  LISTEN,
  T_TIME,
  TS,
} from "../common";

import {
  clamp,
  randomIndex,
  removeElement,
  throttle,
} from "../helpers";

const BUDDY_Y_FROM_BOX = 4;
const ARROW_SPACING = 2;
const BAR_SPACING = 3;
const D_ALPHA = .5;
const SB_MULT = .2;

let box: Box;
let buddies: Buddy[];
let buddy: Buddy;
let cameraOffset = 0; // cameraOffset puts camera in the middle of the level so screen shake looks decent
let convoBar: EnergyBar;
let convoLevel: number;
let currentSkillIndex: number = 0;
let downArrow: Text;
let energyBar: EnergyBar;
let skills: Text[];
let upArrow: Text;
let waiting: boolean = false;
let multiplier: number = 1;
let lastBuddyTopic: number = null;

export default class Convo extends Level {
  public backgroundColor = colorMap[9];
  public usedTopics: string[];

  protected tileTypeMap = ["green", "flowers", "sky", "tree"];
  protected tileIndexes;

  constructor(game: Game) {
    super(game);
    energyBar = new EnergyBar(this.game, { x: this.game.ss, y: this.game.ss }, "ENERGY");
    convoBar = new EnergyBar(this.game, { x: this.game.ss, y: this.game.ss }, "CONVO");
    box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
    upArrow = new Text(this.game, "^");
    downArrow = new Text(this.game, "_");
    const throttledHandleInput = throttle(this.handleInput.bind(this), T_TIME);
    this.handleInput = throttledHandleInput;
    upArrow.touched = () => this.handleInput("ArrowUp");
    downArrow.touched = () => this.handleInput("ArrowDown");
  }

  get boxPosY() {
    return box.pos.y / this.game.ss - this.game.p.size.height - BUDDY_Y_FROM_BOX;
  }

  public handleInput(key) {
    switch (key) {
      case "ArrowUp":
        moveSkillCursor.call(this, 1);
        break;
      case "ArrowDown":
        moveSkillCursor.call(this, -1);
        break;
      case "Enter":
        useSelectedSkill.call(this);
        break;
    }
  }

  public handleTouch(touch) {
    const touched = this.touchedTouchable(touch);
    if (touched) touched.touched();
  }

  public setBuddy(updatedBuddy: Buddy) {
    buddy = updatedBuddy;
    buddy.setConvoMode(true, "left");
  }

  public levelWillStart() {
    waiting = false;
    this.game.p.setConvoMode(true, "right");
    convoLevel = 0;
    this.usedTopics = [];
    lastBuddyTopic = null;
    buddies = [this.game.p, buddy];

    if (buddy.skills.length > 2) multiplier = SB_MULT;

    skills = this.game.p.skills.map((skillString) => new Text(this.game, skillString));
    skills.forEach((skill) => skill.touched = () => {
      if (skills[currentSkillIndex] === skill) this.handleInput("Enter");
    });
  }

  public levelStarted() {
    convoBar.animateToLevel(convoLevel);
    energyBar.animateToLevel(this.game.p.energy);
  }

  public resize() {
    this.configViz();
  }

  public update(timestamp) {
    super.update(timestamp);
    this.game.camera.move({ x: cameraOffset, y: 0 });

    updateText.call(this);
    updateFloatyText.call(this);

    waiting = floatiesInArray(this.odables).length > 0 || this.game.transitioning();

    // Don't win or lose if we're still animating
    if (!doneAnimating(this.odables)) return;

    // Win
    if (convoLevel >= 1) {
      const nextState = (this.game.p.skills.length === 1) ? "post-listen" : "post-convo";
      this.game.queueNextLevel(this.game.levels.world, nextState);
    // Lose
    } else if (this.game.p.energy <= 0) {
      this.game.queueNextLevel(this.game.levels.world, "nap");
    }
  }

  public configViz() {
    super.configViz();

    const sizeInTiles = this.game.sizeInTiles();
    cameraOffset = -sizeInTiles.width * TS * this.game.ss / 2;
    sizeInTiles.width *= 2;
    sizeInTiles.height *= 2;

    // Move the box to the bottom
    // Align the buddies to be on top of the box
    // Generate tiles so that they begin in the middle of buddies
    updateBoxes.call(this);
    updateText.call(this);
    moveBuddies.call(this);
    moveSkillCursor.call(this, 0);

    this.generateTileIndexes(sizeInTiles);
    this.generateTiles();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(buddies, 1);
    this.addOverlayDrawables([
      box,
      upArrow,
      downArrow,
      energyBar,
      convoBar,
      ...skills,
    ]);
    this.addTouchables([upArrow, downArrow, ...skills]);
  }

  protected generateTileIndexes(sizeInTiles) {
    const playerTileIndexY = Math.min(this.game.p.tileIndex.y + 1, sizeInTiles.height);

    // Ground tiles
    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndex([0, 1]))); // Don't include the sky/tree tile

    // Sky tiles
    for (let i = 0; i < playerTileIndexY; i++) {
      this.tileIndexes[i] = this.tileIndexes[i].map(() => 2);
    }

    // Tree trees
    const treeRow = this.tileIndexes[playerTileIndexY - 1];
    if (treeRow) {
      this.tileIndexes[playerTileIndexY - 1] = treeRow.map(() => 3);
    }
  }
}

function doneAnimating(drawables): boolean {
  return !convoBar.animating && floatiesInArray(drawables).length === 0;
}

function moveSkillCursor(amountToMoveBy) {
  const updatedIndex = currentSkillIndex + amountToMoveBy;
  const skill = skills[updatedIndex] || skills[currentSkillIndex];
  currentSkillIndex = skills.indexOf(skill);
  downArrow.alpha = 1;
  upArrow.alpha = 1;
  skills.forEach((s) => s.alpha = D_ALPHA);

  if (currentSkillIndex === 0) downArrow.alpha = D_ALPHA;
  if (currentSkillIndex === skills.length - 1) upArrow.alpha = D_ALPHA;
}

function updateConvoLevel(increment: number) {
  convoLevel = clamp(Math.round((convoLevel + increment) * 100) / 100, 0, 1);
}

function updateEnergyLevel(buddyToUpdate: Buddy, increment) {
  buddyToUpdate.energy = clamp(Math.round((buddyToUpdate.energy + increment) * 100) / 100, 0, 1);
}

function useSelectedSkill() {
  if (waiting) return;

  waiting = true;
  const skillIndex = currentSkillIndex;
  buddyExecuteSkillIndex.call(this, this.game.p, skillIndex);

  setTimeout(() => react.call(this, skillIndex), 2000);

  // If we're at the listenbuddy for the first time, just have them do listen
  let buddySkillIndex = buddy.skills.indexOf(LISTEN);

  if (this.game.p.skills.length !== 1) buddySkillIndex = randomIndex(buddy.skills);

  setTimeout(() => buddyExecuteSkillIndex.call(this, buddy, buddySkillIndex), 4500);
}

function react(skillIndex) {
  const skill = this.game.p.skills[skillIndex];

  // If haven't learend listen yet
  if (this.game.p.skills.length === 1) {
    goodReaction.call(this, -.1, .5);
  // If the player only knows weather and listen
  } else if (skill === LISTEN && this.game.p.skills.length === 2) {
    goodReaction.call(this, -.1, .5);
  // Otherwise...
  } else {
    if (skill === LISTEN) {
      updateBars.call(this, -.1, .25);
    } else if (lastBuddyTopic === skill) {
      goodReaction.call(this, -.15, .50);
    } else if (buddy.skills.includes(skill)) {
      goodReaction.call(this, -.1, .34);
    } else {
      badReaction.call(this, -.2);
    }
  }

  convoBar.animateToLevel(convoLevel);
  energyBar.animateToLevel(this.game.p.energy);
}

function goodReaction(energyIncrement, convoIncrement) {
  buddyFloatText.call(this, buddy, "cool!", colorMap[2]);
  updateBars.call(this, energyIncrement, convoIncrement);
}

function badReaction(energyIncrement) {
  buddyFloatText.call(this, buddy, "oh...", colorMap[10]);
  updateBars.call(this, energyIncrement, 0);
  this.game.camera.shakeScreen();
}

function updateBars(energyIncrement, convoIncrement) {
  updateEnergyLevel(this.game.p, energyIncrement);
  updateConvoLevel(convoIncrement * multiplier);
}

function buddyFloatText(floatBuddy, word, color) {
  const text = new Text(this.game, word, color);
  text.buddy = floatBuddy;

  const boxPosY = this.boxPosY * this.game.ss + this.game.p.dSize.height / 2 ;
  const startPos = { x: box.pos.x + this.game.p.dSize.width / 2, y: boxPosY };
  const endPos = { x: this.game.canvas.width, y: -L_HEIGHT };

  if (floatBuddy !== this.game.p) {
    startPos.x +=  box.dSize.width - text.dSize.width - this.game.p.dSize.width;
    endPos.x = 0;
  }

  if (word === LISTEN) endPos.x = startPos.x;

  text.startFloat(startPos, endPos);
  this.addOverlayDrawables([text]);
  this.addUpdateables([text]);
}

function buddyExecuteSkillIndex(skillBuddy, skillIndex) {
  if (convoLevel >= 1 || this.game.p.energy <= 0) return;
  const skill = skillBuddy.skills[skillIndex];
  const color = skill === LISTEN ? colorMap[9] : colorMap[1];
  buddyFloatText.call(this, skillBuddy, skill, color);
  if (skillBuddy === buddy) {
    lastBuddyTopic = skill;
    if (!this.usedTopics.includes(skill)) this.usedTopics.push(skill);
  }
}

function moveBuddies() {
  // Use cameraOffset to compsenate for the larger levelsize
  const boxPosX = this.game.boxPos().x / this.game.ss -
  buddy.size.width / 2 -
  cameraOffset / this.game.ss;

  const buddyX = boxPosX + box.dSize.width / this.game.ss - buddy.size.width / 2;
  const playerPos = { x: boxPosX + this.game.p.size.width / 2, y: this.boxPosY };

  buddy.move({ x: buddyX, y: playerPos.y });
  this.game.p.move(playerPos);
}

function updateBoxes() {
  const y = this.game.canvas.height - this.game.boxSize().height * this.game.ss - this.game.ss * 2;
  box.move({ x: this.game.boxPos().x, y });
  box.updateSize(this.game.boxSize());
  const barWidth =
  energyBar.dSize.width +
  convoBar.dSize.width +
  BAR_SPACING * this.game.ss;

  const energyX = (this.game.canvas.width - barWidth) / 2;
  energyBar.move({ x: energyX, y: energyBar.pos.y });

  const convoX = energyBar.pos.x + energyBar.dSize.width + BAR_SPACING * this.game.ss;
  convoBar.move({ x: convoX, y: convoBar.pos.y });
}

function updateText() {
  const spacing = ARROW_SPACING * this.game.ss;
  const upX = box.pos.x +
  box.dSize.width -
  upArrow.dSize.width -
  spacing;

  const upY = box.pos.y + box.dSize.height / 2 - upArrow.dSize.height / 2;
  const downX = box.pos.x + spacing;
  const downY = upY;

  upArrow.move({ x: upX, y: upY });
  downArrow.move({ x: downX, y: downY });

  skills.forEach((skill, index) => {
    const indexDiff = currentSkillIndex - index;

    skill.alpha = indexDiff === 0 && !waiting ? 1 : D_ALPHA;

    const skillX = box.pos.x +
      box.dSize.width / 2 -
      skill.dSize.width / 2;

    const skillY = box.pos.y +
      box.dSize.height / 2 -
      skill.dSize.height / 2 +
      indexDiff * L_SPACE * this.game.ss;

    skill.move({ x: skillX, y: skillY });
    skill.visible = Math.abs(indexDiff) > 1 ? false : true;
  });
}

function floatiesInArray(drawables) {
  return drawables.filter((drawable) => drawable instanceof Text && drawable.buddy);
}

function updateFloatyText() {
  const floaties = floatiesInArray(this.odables);

  // Don't open mouth when listening (good tip for life too)
  buddies.forEach((talkingBuddy) => talkingBuddy.talking = !!floaties.find((floaty) => {
    return floaty.words !== LISTEN && floaty.buddy === talkingBuddy;
  }));

  for (let i = floaties.length - 1; i >= 0; i--) {
    const floaty = floaties[i];
    if (!floaty) break;
    if (!floaty.a.floatText.running) {
      removeElement(floaty, this.odables);
      this.uables.splice(i, 1);
    }
  }
}
