import Dust from "./dust";
import Game from "./game";

import {
  clerp,
  lerp,
  randomIndex,
} from "./helpers";

import {
  IAnimation,
  IAnimations,
  IDrawable,
  IInteractable,
  IPoint,
  ISize,
  IUpdateable,
  MS,
  TS,
} from "./common";

const EYE_SIZE = 2;
const EYE_REFLECTION_SIZE = 1;
const RIGHT_EYE_OFFSET = 4;
const EYE_OFFSET = 1;
const EYE_OFFSET_CONVO = 4;
const CONVO_LOOK_RIGHT_OFFSET = 6;

const COLORS = ["#94725d", "#bfa17a", "#eeeec7", "#5a444e", "#cd9957", "#3e2d2e"];

export default class Buddy implements IDrawable, IUpdateable, IInteractable {
  public game: Game;
  public dSize: ISize;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize = { h: TS, w: TS };
  public visible: boolean = true;
  public dusts: Dust[];
  public skills: string[] = [];
  public autoWalkDirection: "left" | "right" | "up" | "down";
  public a: IAnimations = {};
  public tileIndex: IPoint = { x: 0, y: 0 };
  public energy: number = 1;
  public talking: boolean = false;
  public lastConvo: number = 0;

  private rot: number = Math.PI;
  private color: string;
  private lastDustAt: number = 0;
  private inConvoMode: boolean = false;
  private convoLookRight: boolean = false;
  private squareSize: number;
  private rando: number;

  constructor(game) {
    this.game = game;

    const blinking: IAnimation =  {
      duration: 300,
      minTimeDelta: 3000,
      openness: 1,
      percentChance: .5,
      running: false,
      startTime: 0,
    };

    const lookAway: IAnimation = {
      duration: 0,
      minTimeDelta: 1000,
      offset: 0,
      percentChance: .008,
      running: false,
      startTime: 0,
    };

    this.a.blinking = blinking;
    this.a.lookAway = lookAway;
    this.stop();

    this.color = COLORS[randomIndex(COLORS)];
    this.dusts = Array.from(Array(50).keys()).map(() => new Dust(this.game));
    this.dSize = {
      h: TS * this.game.ss,
      w: TS * this.game.ss,
    };

    this.squareSize = this.game.ss;
    this.rando = Math.random() * 100;
  }

  get walking() {
    return this.a.walking.running;
  }

  public copy(): Buddy {
    const buddy = new Buddy(this.game);
    buddy.move(this.pos);
    buddy.color = this.color;
    buddy.skills = this.skills;
    return buddy;
  }

  public setConvoMode(inConvoMode: boolean, direction?: "left" | "right") {
    this.inConvoMode = inConvoMode;
    this.rot = Math.PI;
    this.squareSize = this.game.ss;
    this.size.w = TS;
    this.size.h = TS;
    this.dSize.w = this.size.w * this.game.ss;
    this.dSize.h = this.size.h * this.game.ss;

    if (inConvoMode) {
      this.squareSize *= 2;
      this.size.w *= 2;
      this.size.h *= 2;
      this.dSize.w *= 2;
      this.dSize.h *= 2;
      this.a.walking.tw = 0;
    } else {
      this.talking = false;
    }

    this.convoLookRight = direction === "right";
  }

  public stop() {
    const walking: IAnimation = {
      duration: 250,
      endPos: { x: 0, y: 0 },
      running: false,
      startPos: { x: -1, y: -1 },
      startTime: 0,
      t: 0,
      tw: 0, // tw tracks the time walking in order to make the trail
    };
    this.a.walking = walking;
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
    this.tileIndex.x = Math.round(this.pos.x / TS);
    this.tileIndex.y = Math.round(this.pos.y / TS);
  }

  public look(direction: "up" | "down" | "left" | "right") {
    this.walk(direction, true);
  }

  public walk(direction: "up" | "down" | "left" | "right", justLook: boolean = false): boolean {
    let { x, y } = this.pos;

    switch (direction) {
      case "left":
        this.rot = -Math.PI / 2;
        x -= TS;
        break;
      case "right":
        this.rot = Math.PI / 2;
        x += TS;
        break;
      case "down":
        this.rot = Math.PI;
        y += TS;
        break;
      case "up":
        this.rot = 0;
        y -= TS;
        break;
    }

    if (justLook || this.walking) return;

    const startPos = { x: this.pos.x, y: this.pos.y };
    const endPos = { x, y };
    if (canMoveToPosition.call(this, endPos)) {
      this.configureWalkingAnimation(startPos, endPos);
      return true;
    }

    return false;
  }

  public configureWalkingAnimation(startPos, endPos) {
    const { walking } = this.a;
    walking.startTime = this.game.tstamp;
    walking.endPos = endPos;
    walking.startPos = startPos;
    walking.running = true;
    walking.t = 0;
  }

  public update(timestamp) {
    if (this.autoWalkDirection) this.walk(this.autoWalkDirection);
    if (this.a.walking.startPos.x === -1) return;

    const t = (timestamp - this.a.walking.startTime) / this.a.walking.duration;
    let x = lerp(this.a.walking.startPos.x, this.a.walking.endPos.x, t);
    let y = lerp(this.a.walking.startPos.y, this.a.walking.endPos.y, t);

    this.a.walking.t = t;

    if (t >= 1) {
      x = this.a.walking.endPos.x;
      y = this.a.walking.endPos.y;
      this.a.walking.running = false;
      this.a.walking.t = 0;
      this.a.walking.tw = Math.max(this.a.walking.tw - MS * 100, 0);
    } else {
      this.a.walking.tw = Math.min(this.a.walking.tw + MS * 100, this.a.walking.duration);
    }

    this.move({ x, y });
  }

  public draw(context, timestamp) {
    context.translate(this.dSize.w / 2, this.dSize.h / 2);
    context.rotate(this.rot);
    context.translate(-this.dSize.w / 2, -this.dSize.h / 2);

    // Main body
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.dSize.w, this.dSize.h);

    // Trail
    const trail = this.a.walking.tw / this.a.walking.duration;
    const gradient = context.createLinearGradient(0, this.dSize.h, 0, this.dSize.h * 1.5);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(trail, "rgba(150, 192, 131, 0)"); // grass color in rgba
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.dSize.w, 1.5 * this.dSize.h);

    // Eyes
    maybeDoEyeAnimations.call(this, timestamp);
    drawEye.call(this, context, "left", this.a.blinking.openness, this.a.lookAway.offset);
    drawEye.call(this, context, "right", this.a.blinking.openness, this.a.lookAway.offset);

    // Mouth
    if (this.talking) {
      context.fillStyle = "#000";
      const amountClosed = (Math.sin(timestamp / 80 + this.rando) + 1);
      context.fillRect(
        (this.convoLookRight ? 1 : 5) * this.squareSize,
        this.squareSize + amountClosed / 4,
        2 * this.squareSize + amountClosed,
        2 * this.squareSize * amountClosed / 2,
      );
    }

    // TODO: maybe make this smaller by inlining the vars?
    if (this.walking && (timestamp - this.lastDustAt) > 30) {
      const dust = this.dusts.find((potentialDust) => !potentialDust.visible);
      if (dust) {
        const xOffset = this.size.w / 2 * Math.random() + this.size.w / 4;
        const yOffset = this.size.h / 2 * Math.random() + this.size.h / 4;
        const x = this.pos.x + xOffset;
        const y = this.pos.y + yOffset;
        dust.reJuice(timestamp, x, y);
        this.lastDustAt = timestamp;
      }
    }
  }
}

function maybeDoEyeAnimations(timestamp) {
  const { blinking, lookAway } = this.a;

  if (shouldDoAnimation(blinking, timestamp)) {
    blinking.running = true;
    blinking.startTime = timestamp;
  }

  if (shouldDoAnimation(lookAway, timestamp)) {
    lookAway.running = true;
    lookAway.startTime = timestamp;
  }

  runBlinkingAnimation.call(this, blinking, timestamp);
  runLookAwayAnimation.call(this, lookAway);
}

function runLookAwayAnimation(lookAway) {
  if (!lookAway.running) return;
  lookAway.offset = lookAway.offset === 0 ? 1 : 0;
  lookAway.running = false;
}

function runBlinkingAnimation(blinking, timestamp) {
  const t = (timestamp - blinking.startTime) / blinking.duration;
  blinking.openness = twoPhaseClerp(t, 0, 1, true);
  if (t >= 1) blinking.running = false;
}

function drawEye(context, whichOne, openness, lookAwayOffset) {
  const leftRightOffset = whichOne === "left" ? 0 : (RIGHT_EYE_OFFSET * this.squareSize);

  context.fillStyle = "#000";

  // TODO: can make this smaller to save space vvvv
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

  context.fillStyle = "#fff";

  context.fillRect(
    scaledEyeOffset + leftRightOffset + (lookAwayOffset * this.squareSize) - convoLookRightOffset,
    scaledEyeOffset,
    scaledEyeReflectionSize,
    scaledEyeReflectionSize * openness,
  );
}

function canMoveToPosition(position: IPoint): boolean {
  const level = this.game.cl;
  const inMap = position.x >= 0 &&
    position.x <= level.size.w - this.size.w &&
    position.y >= 0 &&
    position.y < level.size.h;

  let { x, y } = position;
  x /= TS;
  y /= TS;

  return inMap && level.tiles[this.game.cl.size.w / TS * y + x].wable;
}

function shouldDoAnimation(animation: IAnimation, timestamp: number): boolean {
  if (animation.running) return false;
  const enoughTimeHasPassed = timestamp - animation.startTime > animation.minTimeDelta;
  const lucky = animation.percentChance > Math.random();
  return enoughTimeHasPassed && lucky;
}

function twoPhaseClerp(t: number, min: number, max: number, reverse = false): number {
  let start = max;
  let end = min;

  if (reverse) {
    start = min;
    end = max;
  }

  // if in second half of animation
  if (t >= .5) {
    const t2 = (t - .5) / .5;
    return clerp(start, end, min, max, t2);
  // else if in the first half of animation
  } else {
    const t2 = t / .5;
    return clerp(end, start, min, max, t2);
  }
}
