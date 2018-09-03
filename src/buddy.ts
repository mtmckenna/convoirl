import Dust from "./dust";
import Game from "./game";

import {
  canThingMoveToPosition,
  lerp,
  randomElementFromArray,
  shouldDoAnimation,
  twoPhaseClerp,
} from "./helpers";

import {
  IAnimations,
  IDrawable,
  IInteractable,
  IPoint,
  ISize,
  SQUARE_SIZE,
  TS,
} from "./common";

import {
  blinking as blinkingAnimation,
  lookAway as lookAwayAnimation,
  walking as walkingAnimation,
} from "./animations";

const EYE_SIZE = 2;
const EYE_REFLECTION_SIZE = 1;
const RIGHT_EYE_OFFSET = 4;
const EYE_OFFSET = 1;
const EYE_OFFSET_CONVO = 4;
const CONVO_LOOK_RIGHT_OFFSET = 6;

const COLORS = ["#94725d", "#bfa17a", "#eeeec7", "#5a444e", "#cd9957", "#3e2d2e"];

// ["weather", "pastries", "france", "cats", "sports", "math"]

export default class Buddy implements IDrawable, IInteractable {
  public game: Game;
  public drawingSize: ISize;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize = { height: TS, width: TS };
  public visible: boolean = true;
  public dusts: Dust[];
  public skills: string[] = ["weather"];

  public tileIndex: IPoint = { x: 0, y: 0 };
  public energy: number = 1;

  private animations: IAnimations = {};
  private rot: number = Math.PI;
  private color: string;
  private lastDustAt: number = 0;
  private inConvoMode: boolean = false;
  private convoLookRight: boolean = false;
  private squareSize: number = SQUARE_SIZE;

  constructor(game) {
    this.game = game;
    this.animations.blinking = Object.assign({}, blinkingAnimation);
    this.animations.walking = Object.assign({}, walkingAnimation, { endPos: this.pos });
    this.animations.lookAway = Object.assign({}, lookAwayAnimation);
    this.color = randomElementFromArray(COLORS);
    this.dusts = Array.from(Array(50).keys()).map(() => new Dust(this.game));
    this.drawingSize = {
      height: TS * this.game.squareSize,
      width: TS * this.game.squareSize,
    };

    this.squareSize = this.game.squareSize;
  }

  get blinking() {
    return this.animations.blinking.running;
  }

  get walking() {
    return this.animations.walking.running;
  }

  public copy(): Buddy {
    const buddy = new Buddy(this.game);
    buddy.move(this.pos);
    buddy.color = this.color;
    buddy.skills = this.skills;
    return buddy;
  }

  public setConvoMode(inConvoMode: boolean) {
    this.inConvoMode = inConvoMode;
    this.rot = Math.PI;
    this.squareSize = this.game.squareSize;
    this.size.width = TS;
    this.size.height = TS;
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;

    if (inConvoMode) {
      this.squareSize *= 2;
      this.size.width *= 2;
      this.size.height *= 2;
      this.drawingSize.width *= 2;
      this.drawingSize.height *= 2;
    }
  }

  public convoLook(direction: "left" | "right") {
    if (direction === "right") {
      this.convoLookRight = true;
    } else if (direction === "left") {
      this.convoLookRight = false;
    }
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
    this.tileIndex.x = Math.ceil(this.pos.x / TS);
    this.tileIndex.y = Math.ceil(this.pos.y / TS);
  }

  public walk(direction: "up" | "down" | "left" | "right") {
    let { x, y } = this.pos;

    switch (direction) {
      case "left":
        this.rot = -Math.PI / 2;
        x -= this.game.tileSize;
        break;
      case "right":
        this.rot = Math.PI / 2;
        x += this.game.tileSize;
        break;
      case "down":
        this.rot = Math.PI;
        y += this.game.tileSize;
        break;
      case "up":
        this.rot = 0;
        y -= this.game.tileSize;
        break;
    }

    const startPos = { x: this.pos.x, y: this.pos.y };
    const endPos = { x, y };
    const canMove = canThingMoveToPosition(this, endPos, this.game.currentLevel);
    if (canMove) this.configureWalkingAnimation(startPos, endPos);
  }

  public configureWalkingAnimation(startPos, endPos) {
    const { walking } = this.animations;
    walking.startTime = this.game.timestamp;
    walking.endPos = endPos;
    walking.startPos = startPos;
    walking.running = true;
    walking.t = 0;
  }

  public updateWalkingPosition(timestamp) {
    if (!this.walking) return;
    const t = (timestamp - this.animations.walking.startTime) / this.animations.walking.duration;
    let x = lerp(this.animations.walking.startPos.x, this.animations.walking.endPos.x, t);
    let y = lerp(this.animations.walking.startPos.y, this.animations.walking.endPos.y, t);

    this.animations.walking.t = t;

    if (t >= 1) {
      x = this.animations.walking.endPos.x;
      y = this.animations.walking.endPos.y;
      this.animations.walking.running = false;
      this.animations.walking.t = 0;
    }

    // TODO: avoid creating new objects
    this.move({ x, y });
  }

  public draw(context, timestamp) {
    this.updateWalkingPosition(timestamp);
    const t = this.animations.walking.t;

    context.translate(
      this.drawingSize.width / 2,
      this.drawingSize.height / 2,
    );

    context.rotate(this.rot);

    context.translate(
      -this.drawingSize.width / 2,
      -this.drawingSize.height / 2,
    );

    context.fillStyle = this.color;

    let growAmount = t;
    if (t > .5) growAmount = 1 - t;

    context.fillRect(
      0,
      0,
      this.drawingSize.width,
      this.drawingSize.height + this.drawingSize.height * growAmount,
    );

    this.maybeDoEyeAnimations(timestamp);

    this.drawEye(context, "left", this.animations.blinking.openness, this.animations.lookAway.offset);
    this.drawEye(context, "right", this.animations.blinking.openness, this.animations.lookAway.offset);

    if (this.walking && (timestamp - this.lastDustAt) > 30) {
      const dust = this.dusts.find((potentialDust) => !potentialDust.visible);
      if (dust) {
        const xOffset = this.size.width / 2 * Math.random() + this.size.width / 4;
        const yOffset = this.size.height / 2 * Math.random() + this.size.height / 4;
        const x = this.pos.x + xOffset;
        const y = this.pos.y + yOffset;
        dust.reJuice(timestamp, x, y);
        this.lastDustAt = timestamp;
      }
    }
  }

  private maybeDoEyeAnimations(timestamp) {
    const { blinking, lookAway } = this.animations;

    if (shouldDoAnimation(blinking, timestamp)) {
      blinking.running = true;
      blinking.startTime = timestamp;
    }

    if (shouldDoAnimation(lookAway, timestamp)) {
      lookAway.running = true;
      lookAway.startTime = timestamp;
    }

    this.runBlinkingAnimation(blinking, timestamp);
    this.runLookAwayAnimation(lookAway);
  }

  private runLookAwayAnimation(lookAway) {
    if (!lookAway.running) return;
    lookAway.offset = lookAway.offset === 0 ? 1 : 0;
    lookAway.running = false;
  }

  private runBlinkingAnimation(blinking, timestamp) {
    const t = (timestamp - blinking.startTime) / blinking.duration;
    blinking.openness = twoPhaseClerp(t, 0, 1, true);
    if (t >= 1) blinking.running = false;
  }

  private drawEye(context, whichOne, openness, lookAwayOffset) {
    const leftRightOffset = whichOne === "left" ? 0 : (RIGHT_EYE_OFFSET * this.squareSize);

    context.fillStyle = "rgb(0, 0, 0)";

    let offset = EYE_OFFSET;
    let convoLookRightOffset = 0;
    if (this.inConvoMode) offset = EYE_OFFSET_CONVO;
    if (this.inConvoMode && this.convoLookRight) convoLookRightOffset = CONVO_LOOK_RIGHT_OFFSET * this.squareSize;

    const scaledEyeOffset = offset * this.squareSize;
    const scaledEyeSize = EYE_SIZE * this.squareSize;
    const scaledEyeReflectionSize = EYE_REFLECTION_SIZE * this.squareSize;

    context.fillRect(
      scaledEyeOffset + leftRightOffset - convoLookRightOffset,
      scaledEyeOffset,
      scaledEyeSize,
      scaledEyeSize * openness,
    );

    context.fillStyle = "rgb(255, 255, 255)";

    context.fillRect(
      scaledEyeOffset + leftRightOffset + (lookAwayOffset * this.squareSize) - convoLookRightOffset,
      scaledEyeOffset,
      scaledEyeReflectionSize,
      scaledEyeReflectionSize * openness,
    );
  }
}
