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
  randomIndexFromArray,
  removeElementFromArray,
  throttle,
} from "../helpers";

const BUDDY_Y_FROM_BOX = 4;
const ARROW_SPACING = 2;
const BAR_SPACING = 3;
const D_ALPHA = .5;

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

export default class Convo extends Level {
  public backgroundColor = colorMap[9];

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
    return box.pos.y / this.game.ss - this.game.player.size.height - BUDDY_Y_FROM_BOX;
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
    // TODO: DELETE THIS DEBUG CODE
    if (!buddy) {
      this.setBuddy(new Buddy(this.game));
      buddy.skills.push(LISTEN);
    }

    this.clearTouchables();
    this.game.player.setConvoMode(true, "right");
    convoLevel = 0;
    buddies = [this.game.player, buddy];
    skills = this.game.player.skills.map((skillString) => new Text(this.game, skillString));
    skills.forEach((skill) => skill.touched = () => {
      if (skills[currentSkillIndex] === skill) this.handleInput("Enter");
    });
  }

  public levelStarted() {
    convoBar.animateToLevel(convoLevel);
    energyBar.animateToLevel(this.game.player.energy);
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public update(timestamp) {
    super.update(timestamp);
    this.game.camera.move({ x: cameraOffset, y: 0 });

    updateText.call(this);
    updateFloatyText.call(this);
    if (convoLevel >= 1 && !convoBar.animating) {
      const nextState = (buddy.skills.length === 1) ? "post-listen" : "post-convo";
      this.game.queueNextLevel(this.game.levels.world, nextState);
    }
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();

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
    const playerTileIndexY = Math.min(this.game.player.tileIndex.y + 1, sizeInTiles.height);

    // Ground tiles
    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndexFromArray([0, 1]))); // Don't include the sky/tree tile

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

function useSelectedSkill() {
  if (waiting) return;
  if (this.game.player.energy <= 0 || convoLevel >= 1) return;
  const skillIndex = currentSkillIndex;
  buddyExecuteSkillIndex.call(this, this.game.player, skillIndex);

  waiting = true;
  setTimeout(() => react.call(this, skillIndex), 2000);

  let buddySkillIndex = randomIndexFromArray(buddy.skills);

  if (this.game.player.skills.length === 1) {
    buddySkillIndex = buddy.skills.indexOf(LISTEN);
  }

  setTimeout(() => {
    buddyExecuteSkillIndex.call(this, buddy, buddySkillIndex);
  }, 4500);
}

function react(skillIndex) {
  const skill = this.game.player.skills[skillIndex];

  // If haven't learend listen yet
  if (skill === "WEATHER" && this.game.player.skills.length === 1) {
    convoLevel += .4;
    goodReaction.call(this);
  // Otherwise..
  } else {
    if (skill === LISTEN) {
      listenReaction.call(this);
    } else if (buddy.skills.includes(skill)) {
      goodReaction.call(this);
    } else {
      badReaction.call(this);
    }
  }

  convoBar.animateToLevel(convoLevel);
  energyBar.animateToLevel(this.game.player.energy);
}

function listenReaction() {
  this.game.player.energy = Math.max(this.game.player.energy - .15, 0);
}

function goodReaction() {
  buddyFloatText.call(this, buddy, "cool!", colorMap[2]);
  this.game.player.energy = Math.max(this.game.player.energy - .1, 0);
  convoLevel = Math.min(convoLevel + .2, 1);
}

function badReaction() {
  buddyFloatText.call(this, buddy, "oh...", colorMap[10]);
  this.game.player.energy = Math.max(this.game.player.energy - .2, 0);
  this.game.camera.shakeScreen();
}

function buddyFloatText(floatBuddy, word, color) {
  const text = new Text(this.game, word, color);
  text.buddy = floatBuddy;

  const boxPosY = this.boxPosY * this.game.ss + this.game.player.drawingSize.height / 2 ;
  const startPos = { x: box.pos.x + this.game.player.drawingSize.width / 2, y: boxPosY };
  const endPos = { x: this.game.canvas.width, y: -L_HEIGHT };

  if (floatBuddy !== this.game.player) {
    startPos.x +=  box.drawingSize.width - text.drawingSize.width - this.game.player.drawingSize.width;
    endPos.x = 0;
  }

  if (word === LISTEN) endPos.x = startPos.x;

  text.startFloat(startPos, endPos);
  this.addOverlayDrawables([text]);
  this.addUpdateables([text]);
}

function buddyExecuteSkillIndex(skillBuddy, skillIndex) {
  const skill = skillBuddy.skills[skillIndex];
  const color = skill === LISTEN ? colorMap[9] : colorMap[1];
  buddyFloatText.call(this, skillBuddy, skill, color);
  if (skillBuddy === buddy) waiting = false;
}

function moveBuddies() {
  // Use cameraOffset to compsenate for the larger levelsize
  const boxPosX = this.game.boxPos().x / this.game.ss -
  buddy.size.width / 2 -
  cameraOffset / this.game.ss;

  const buddyX = boxPosX + box.drawingSize.width / this.game.ss - buddy.size.width / 2;
  const playerPos = { x: boxPosX + this.game.player.size.width / 2, y: this.boxPosY };

  buddy.move({ x: buddyX, y: playerPos.y });
  this.game.player.move(playerPos);
}

function updateBoxes() {
  const y = this.game.canvas.height - this.game.boxSize().height * this.game.ss - this.game.ss * 2;
  box.move({ x: this.game.boxPos().x, y });
  box.updateSize(this.game.boxSize());
  const barWidth =
  energyBar.drawingSize.width +
  convoBar.drawingSize.width +
  BAR_SPACING * this.game.ss;

  const energyX = (this.game.canvas.width - barWidth) / 2;
  energyBar.move({ x: Math.floor(energyX), y: Math.floor(energyBar.pos.y) });

  const convoX = energyBar.pos.x + energyBar.drawingSize.width + BAR_SPACING * this.game.ss;
  convoBar.move({ x: Math.floor(convoX), y: Math.floor(convoBar.pos.y) });
}

function updateText() {
  const spacing = ARROW_SPACING * this.game.ss;
  const upX = Math.floor(box.pos.x +
  box.drawingSize.width -
  upArrow.drawingSize.width -
  spacing);

  const upY = Math.floor(box.pos.y + box.drawingSize.height / 2 - upArrow.drawingSize.height / 2);
  const downX = Math.floor(box.pos.x + spacing);
  const downY = Math.floor(upY);

  upArrow.move({ x: upX, y: upY });
  downArrow.move({ x: downX, y: downY });

  skills.forEach((skill, index) => {
    const indexDiff = currentSkillIndex - index;

    skill.alpha = indexDiff === 0 && !waiting ? 1 : D_ALPHA;

    const skillX = Math.floor(
      box.pos.x +
      box.drawingSize.width / 2 -
      skill.drawingSize.width / 2,
    );

    const skillY = Math.floor(
      box.pos.y +
      box.drawingSize.height / 2 -
      skill.drawingSize.height / 2 +
      indexDiff * L_SPACE * this.game.ss,
    );

    skill.move({ x: skillX, y: skillY });
    skill.visible = Math.abs(indexDiff) > 1 ? false : true;
  });
}

function updateFloatyText() {
  const floaties = this.overlayDrawables.filter((drawable) => drawable instanceof Text && drawable.buddy);

  // Don't open mouth when listening (good tip for life too)
  buddies.forEach((talkingBuddy) => talkingBuddy.talking = !!floaties.find((floaty) => {
    return floaty.words !== LISTEN && floaty.buddy === talkingBuddy;
  }));

  for (let i = floaties.length - 1; i >= 0; i--) {
    const floaty = floaties[i];
    if (!floaty) break;
    if (!floaty.animations.floatText.running) {
      removeElementFromArray(floaty, this.overlayDrawables);
      this.updateables.splice(i, 1);
    }
  }
}
