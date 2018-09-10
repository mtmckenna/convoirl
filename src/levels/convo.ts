import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import colorMap from "../colors";
import EnergyBar from "../energy-bar";
import Game from "../game";
import Text from "../text";

import {
  ITouchable,
  LH,
  LS,
  LT,
  TS,
  TT,
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
const SB_MULT = .35;

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
let reactTimeout: number = null;
let buddyTimeout: number = null;

export default class Convo extends Level {
  public bgColor = colorMap[9];
  public usedTopics: string[];

  protected tileTypeMap = ["green", "flowers", "sky", "tree"];

  constructor(game: Game) {
    super(game);
    energyBar = new EnergyBar(this.game, { x: this.game.ss, y: this.game.ss }, "ENERGY");
    convoBar = new EnergyBar(this.game, { x: this.game.ss, y: this.game.ss }, "CONVO");
    box = new Box(this.game, { x: 0, y: 0 }, { h: 0, w: 0 });
    upArrow = new Text(this.game, "^");
    downArrow = new Text(this.game, "_");
    const throttledHandleInput = throttle(this.handleInput.bind(this), TT);
    this.handleInput = throttledHandleInput;
    upArrow.touched = () => this.handleInput("ArrowUp");
    downArrow.touched = () => this.handleInput("ArrowDown");
  }

  get boxPosY() {
    return box.pos.y / this.game.ss - this.game.p.size.h - BUDDY_Y_FROM_BOX;
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
    const touched = touchedTouchable.call(this, touch);
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

    // If this is the final buddy, make the game harder
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
    this.game.c.move({ x: cameraOffset, y: 0 });

    updateText.call(this);
    updateFloatyText.call(this);

    // console.log(buddyTimeout, reactTimeout);
    waiting = floatiesInArray(this.odables).length > 0 ||
    this.game.inTr() ||
    !!buddyTimeout ||
    !!reactTimeout;

    // Don't win or lose if we're still animating
    if (!doneAnimating(this.odables)) return;

    // Win
    if (convoLevel >= 1) {
      let nextState = (this.game.p.skills.length === 1) ? "post-listen" : "post-convo";
      nextState = buddy.skills.length > 2 ? "win" : nextState; // If the last buddy, set the game to win
      this.game.qLevel(this.game.levels.world, nextState);
    // Lose
    } else if (this.game.p.energy <= 0) {
      this.game.qLevel(this.game.levels.world, "nap");
    }
  }

  public configViz() {
    super.configViz();

    const sizeInTiles = this.game.sizeInTiles();
    cameraOffset = -sizeInTiles.w * TS * this.game.ss / 2; // TODO: might be able to replace with this.size.w / 2
    sizeInTiles.w *= 2;
    sizeInTiles.h *= 2;

    // Move the box to the bottom
    // Align the buddies to be on top of the box
    // Generate tiles so that they begin in the middle of buddies
    updateBoxes.call(this);
    updateText.call(this);
    moveBuddies.call(this);
    moveSkillCursor.call(this, 0);

    this.generateTileIndexes(sizeInTiles);
    this.generateTiles();
    this.addDables(this.tiles, 0);
    this.addDables(buddies, 1);
    this.addOdables([
      box,
      upArrow,
      downArrow,
      energyBar,
      convoBar,
      ...skills,
    ]);
    this.addTables([upArrow, downArrow, ...skills]);
    this.configClouds(this.size.w, this.game.p.pos.y - TS, .6);
    this.addDables(this.clouds, 0);
  }

  protected generateTileIndexes(sizeInTiles) {
    const playerTileIndexY = Math.min(this.game.p.tileIndex.y + 1, sizeInTiles.h);

    // Ground tiles
    this.tileIndexes = new Array(sizeInTiles.h)
      .fill(null).map(() => new Array(sizeInTiles.w)
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

  reactTimeout = setTimeout(() => react.call(this, skillIndex), 2000);

  // If we're at the listenbuddy for the first time, just have them do listen
  let buddySkillIndex = buddy.skills.indexOf(LT);

  if (this.game.p.skills.length !== 1) buddySkillIndex = randomIndex(buddy.skills);

  buddyTimeout = setTimeout(() => buddyExecuteSkillIndex.call(this, buddy, buddySkillIndex), 4500);
}

function react(skillIndex) {
  const skill = this.game.p.skills[skillIndex];
  reactTimeout = null;

  // If haven't learend listen yet
  if (this.game.p.skills.length === 1) {
    goodReaction.call(this, -.1, .5);
  // If the player only knows weather and listen
  } else if (skill === LT && this.game.p.skills.length === 2) {
    goodReaction.call(this, -.1, .5);
  // Otherwise...
  } else {
    if (skill === LT) {
      updateBars.call(this, -.1, .25);
    } else if (lastBuddyTopic === skill) {
      greatReaction.call(this, -.15, .50);
    } else if (buddy.skills.includes(skill)) {
      goodReaction.call(this, -.1, .34);
    } else {
      badReaction.call(this, -.2);
    }
  }

  convoBar.animateToLevel(convoLevel);
  energyBar.animateToLevel(this.game.p.energy);
}

function greatReaction(energyIncrement, convoIncrement) {
  const textFunc = () => buddyFloatText.call(this, buddy, "totally!", colorMap[2]);
  textFunc();
  window.setTimeout(textFunc, 500);
  window.setTimeout(textFunc, 1000);
  updateBars.call(this, energyIncrement, convoIncrement);
}

function goodReaction(energyIncrement, convoIncrement) {
  buddyFloatText.call(this, buddy, "cool!", colorMap[2]);
  updateBars.call(this, energyIncrement, convoIncrement);
}

function badReaction(energyIncrement) {
  buddyFloatText.call(this, buddy, "oh...", colorMap[10]);
  updateBars.call(this, energyIncrement, 0);
  this.game.c.shakeScreen();
}

function updateBars(energyIncrement, convoIncrement) {
  updateEnergyLevel(this.game.p, energyIncrement);
  updateConvoLevel(convoIncrement * multiplier);
}

function buddyFloatText(floatBuddy, word, color) {
  const text = new Text(this.game, word, color);
  text.buddy = floatBuddy;

  const boxPosY = this.boxPosY * this.game.ss + this.game.p.dSize.h / 2 ;
  const startPos = { x: box.pos.x + this.game.p.dSize.w / 2, y: boxPosY };
  const endPos = { x: this.game.canvas.width, y: -LH };

  if (floatBuddy !== this.game.p) {
    startPos.x +=  box.dSize.w - text.dSize.w - this.game.p.dSize.w;
    endPos.x = 0;
  }

  if (word === LT) endPos.x = startPos.x;

  text.startFloat(startPos, endPos);
  this.addOdables([text]);
  this.addUables([text]);
}

function buddyExecuteSkillIndex(skillBuddy, skillIndex) {
  if (skillBuddy === buddy) buddyTimeout = null;
  if (convoLevel >= 1 || this.game.p.energy <= 0) return;
  const skill = skillBuddy.skills[skillIndex];
  const color = skill === LT ? colorMap[9] : colorMap[1];
  buddyFloatText.call(this, skillBuddy, skill, color);
  if (skillBuddy === buddy) {
    lastBuddyTopic = skill;
    if (!this.usedTopics.includes(skill)) this.usedTopics.push(skill);
  }
}

function moveBuddies() {
  // Use cameraOffset to compsenate for the larger levelsize
  const boxPosX = this.game.boxPos().x / this.game.ss - buddy.size.w / 2 - cameraOffset / this.game.ss;
  const buddyX = boxPosX + box.dSize.w / this.game.ss - buddy.size.w / 2;
  const playerPos = { x: boxPosX + this.game.p.size.w / 2, y: this.boxPosY };
  this.game.p.move(playerPos);
  buddy.move({ x: buddyX, y: playerPos.y });

}

function updateBoxes() {
  const y = this.game.canvas.height - this.game.boxSize().h * this.game.ss - this.game.ss * 2;
  box.move({ x: this.game.boxPos().x, y });
  box.updateSize(this.game.boxSize());
  const barWidth =
  energyBar.dSize.w +
  convoBar.dSize.w +
  BAR_SPACING * this.game.ss;

  const energyX = (this.game.canvas.width - barWidth) / 2;
  energyBar.move({ x: energyX, y: energyBar.pos.y });

  const convoX = energyBar.pos.x + energyBar.dSize.w + BAR_SPACING * this.game.ss;
  convoBar.move({ x: convoX, y: convoBar.pos.y });
}

function updateText() {
  const spacing = ARROW_SPACING * this.game.ss;
  const upX = box.pos.x +
  box.dSize.w -
  upArrow.dSize.w -
  spacing;

  const upY = box.pos.y + box.dSize.h / 2 - upArrow.dSize.h / 2;
  const downX = box.pos.x + spacing;
  const downY = upY;

  upArrow.move({ x: upX, y: upY });
  downArrow.move({ x: downX, y: downY });

  skills.forEach((skill, index) => {
    const indexDiff = currentSkillIndex - index;

    // Appear selectable if it's the current index and we're not waiting
    skill.alpha = indexDiff === 0 && !waiting ? 1 : D_ALPHA;

    const skillX = box.pos.x +
      box.dSize.w / 2 -
      skill.dSize.w / 2;

    const skillY = box.pos.y +
      box.dSize.h / 2 -
      skill.dSize.h / 2 +
      indexDiff * LS * this.game.ss;

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
    return floaty.words !== LT && floaty.buddy === talkingBuddy;
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

function touchedTouchable(touch: Touch): ITouchable {
  const fuzz = 20 * this.game.sf;

  const touched = this.tables.find((touchable) => {
    const size = Object.assign({}, touchable.dSize);
    const pos = Object.assign({}, touchable.pos);
    size.w *= this.game.sf;
    size.h *= this.game.sf;
    pos.x *= this.game.sf;
    pos.y *= this.game.sf;

    return touch.clientX + fuzz >= pos.x &&
    touch.clientX - fuzz <= pos.x + size.w &&
    touch.clientY + fuzz >= pos.y &&
    touch.clientY - fuzz <= pos.y + size.h;
  });

  if (touched && touched.visible) return touched;
}
