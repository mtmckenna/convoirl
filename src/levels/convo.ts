import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import colorMap from "../colors";
import EnergyBar from "../energy-bar";
import Game from "../game";
import Text from "../text";

import {
  DISABLED_ALPHA,
  LINE_HEIGHT,
  THROTTLE_TIME,
  TILE_SIZE,
} from "../common";

import { randomIndexFromArray, throttle } from "../helpers";

const BUDDY_Y_FROM_BOX = 4;
const BUDDY_DISTANCE = 4 * TILE_SIZE;
const ARROW_SPACING = 2;
const BAR_SPACING = 3;
const FLOATY_TEXT_INDEX = 2;

export default class Convo extends Level {
  public backgroundColor = colorMap[9];

  protected tileTypeMap = ["green", "flowers", "sky", "tree"];
  protected tileIndexes = [[]];

  private box: Box;
  private buddies: Buddy[];
  private upArrow: Text;
  private downArrow: Text;
  private skills: Text[];
  private currentSkillIndex: number = 0;
  private buddy: Buddy;
  private energyBar: EnergyBar;
  private convoBar: EnergyBar;
  private convoLevel: number = 0.0;
  private convoPerTurn: number = 0.25;

  constructor(game: Game) {
    super(game);
    this.energyBar = new EnergyBar(this.game, { x: this.game.squareSize, y: this.game.squareSize }, "ENERGY");
    this.convoBar = new EnergyBar(this.game, { x: this.game.squareSize, y: this.game.squareSize }, "CONVO");
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
    this.upArrow = new Text(this.game, "^");
    this.downArrow = new Text(this.game, "_");
    const throttledHandleInput = throttle(this.handleInput.bind(this), THROTTLE_TIME);
    this.handleInput = throttledHandleInput;
    this.upArrow.touched = () => this.handleInput("ArrowUp");
    this.downArrow.touched = () => this.handleInput("ArrowDown");
  }

  public handleInput(key) {
    switch (key) {
      case "ArrowUp":
        this.moveSkillCursor(1);
        break;
      case "ArrowDown":
        this.moveSkillCursor(-1);
        break;
      case "Enter":
        this.useSelectedSkill();
        break;
      case "q":
        this.game.queueNextLevel(this.game.levels.world);
    }
  }

  public handleTouch(touch) {
    const touched = this.touchedTouchable(touch);
    if (touched) {
      touched.touched();
    } else {
      this.handleInput(null);
    }
  }

  public setBuddy(buddy: Buddy) {
    this.buddy = buddy;
    this.buddy.setConvoMode(true);
    this.buddy.convoLook("left");
  }

  public levelWillStart() {
    if (!this.buddy) this.setBuddy(new Buddy(this.game));
    this.clearTouchables();

    this.game.player.setConvoMode(true);
    this.game.player.convoLook("right");

    this.energyBar.animateToLevel(this.game.player.energy);
    this.convoLevel = 0.0;
    this.convoBar.animateToLevel(this.convoLevel);

    this.buddies = [this.game.player, this.buddy];
    this.skills = this.game.player.skills.map((skillString) => new Text(this.game, skillString));
    this.skills.forEach((skill) => skill.touched = () => {
      if (this.skills[this.currentSkillIndex] === skill) this.handleInput("Enter");
    });
  }

  public levelStarted() {
    this.moveBuddies();
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public update(timestamp) {
    super.update(timestamp);
    this.updateText();
    this.updateFloatyText();
    if (this.convoLevel >= 1.0 && !this.convoBar.animating) {
      this.game.queueNextLevel(this.game.levels.world);
    }
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();

    this.updateBoxes();
    this.updateText();
    this.moveSkillCursor(0);
    this.moveBuddies();
    this.generateTileIndexes();
    this.generateTiles();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.buddies, 1);
    this.addOverlayDrawables([
      this.box,
      this.upArrow,
      this.downArrow,
      this.energyBar,
      this.convoBar,
      ...this.skills,
    ]);
    this.addTouchables([this.upArrow, this.downArrow, ...this.skills]);
  }

  protected generateTileIndexes() {
    const sizeInTiles = this.game.sizeInTiles();
    const playerTileIndexY = this.game.player.tileIndex.y;

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

  private moveSkillCursor(amountToMoveBy) {
    const updatedIndex = this.currentSkillIndex + amountToMoveBy;
    const updatedSkill = this.skills[updatedIndex];
    this.downArrow.alpha = 1.0;
    this.upArrow.alpha = 1.0;
    this.skills.forEach((skill) => skill.alpha = DISABLED_ALPHA);

    if (updatedSkill) {
      updatedSkill.alpha = 1.0;
      this.currentSkillIndex = updatedIndex;
    } else {
      this.skills[this.currentSkillIndex].alpha = 1.0;
    }

    if (this.currentSkillIndex === 0) this.downArrow.alpha = DISABLED_ALPHA;
    if (this.currentSkillIndex === this.skills.length - 1) this.upArrow.alpha = DISABLED_ALPHA;
  }

  private useSelectedSkill() {
    if (this.game.player.energy <= 0 || this.convoLevel >= 1) return;
    const skill = this.skills[this.currentSkillIndex];
    const text = new Text(this.game, skill.words, colorMap[9]);

    const pos = { x: this.game.player.pos.x, y: this.game.player.pos.y };
    text.startFloat(pos);
    this.addDrawables([text], FLOATY_TEXT_INDEX);

    this.convoLevel += this.convoPerTurn;
    this.convoBar.animateToLevel(this.convoLevel);
  }

  private moveBuddies() {
    const buddy = this.buddies[1];

    const boxPosX = this.box.pos.x / this.game.squareSize;
    const boxPosY = this.box.pos.y / this.game.squareSize - this.game.player.size.height - BUDDY_Y_FROM_BOX;

    const boxSize = this.game.gameSizeFromDrawingSize(this.box.drawingSize);
    const convoWidth = this.game.player.size.width + BUDDY_DISTANCE + buddy.size.width;

    const playerPos = {
      x: boxPosX + (boxSize.width - convoWidth) / 2,
      y: boxPosY,
    };

    const buddyPos = Object.assign({}, playerPos);
    buddyPos.x += BUDDY_DISTANCE + this.game.player.size.width;

    this.game.player.move(playerPos);
    buddy.move(buddyPos);
  }

  private updateBoxes() {
    const y = this.game.canvas.height - this.game.boxSize.height * this.game.squareSize - this.game.squareSize * 2;
    this.box.move({ x: this.game.boxPos.x, y });
    this.box.updateSize(this.game.boxSize);

    const barWidth =
    this.energyBar.drawingSize.width +
    this.convoBar.drawingSize.width +
    BAR_SPACING * this.game.squareSize;

    const energyX = (this.game.canvas.width - barWidth) / 2;
    this.energyBar.move({ x: Math.floor(energyX), y: Math.floor(this.energyBar.pos.y) });

    const convoX = this.energyBar.pos.x + this.energyBar.drawingSize.width + BAR_SPACING * this.game.squareSize;
    this.convoBar.move({ x: Math.floor(convoX), y: Math.floor(this.convoBar.pos.y) });
  }

  private updateText() {
    const spacing = ARROW_SPACING * this.game.squareSize;
    const upX = Math.floor(this.box.pos.x +
    this.box.drawingSize.width -
    this.upArrow.drawingSize.width -
    spacing);

    const upY = Math.floor(this.box.pos.y + this.box.drawingSize.height / 2 - this.upArrow.drawingSize.height / 2);
    const downX = Math.floor(this.box.pos.x + spacing);
    const downY = Math.floor(upY);

    this.upArrow.move({ x: upX, y: upY });
    this.downArrow.move({ x: downX, y: downY });

    this.skills.forEach((skill, index) => {
      const indexDiff = this.currentSkillIndex - index;
      const skillX = Math.floor(
        this.box.pos.x +
        this.box.drawingSize.width / 2 -
        skill.drawingSize.width / 2,
      );

      const skillY = Math.floor(
        this.box.pos.y +
        this.box.drawingSize.height / 2 -
        skill.drawingSize.height / 2 +
        indexDiff * LINE_HEIGHT * this.game.squareSize,
      );

      skill.move({ x: skillX, y: skillY });
      skill.visible = Math.abs(indexDiff) > 1 ? false : true;
    });
  }

  private updateFloatyText() {
    const floaties = this.drawables[FLOATY_TEXT_INDEX];

    for (let i = floaties.length - 1; i >= 0; i--) {
      const floaty = floaties[i];
      if (floaty.pos.y < 0) floaties.splice(i, 1);
    }
  }
}
