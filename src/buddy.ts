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
  Direction,
  IAnimations,
  IDrawable,
  IInteractable,
  InteractableType,
  IPoint,
  ISize,
  TILE_SIZE,
} from "./common";

import {
  blinking as blinkingAnimation,
  lookAway as lookAwayAnimation,
  walking as walkingAnimation,
} from "./animations";

const EYE_SIZE = 2;
const EYE_REFLECTION_SIZE = 1;
const EYE_REFLECTION_COLOR = "rgb(255, 255, 255)";
const EYE_COLOR = "rgb(0, 0, 0)";
const RIGHT_EYE_OFFSET = 4;
const EYE_OFFSET = 1;
const EYE_OFFSET_CONVO = 4;
const NUM_DUSTS = 50;
const TIME_BETWEEN_DUSTS = 30;

const COLORS = ["#94725d", "#bfa17a", "#eeeec7", "#5a444e", "#cd9957", "#3e2d2e"];

const LEFT = "left";
const RIGHT = "right";

export default class Buddy implements IDrawable, IInteractable {
  public game: Game;

  public drawingSize: ISize = { width: TILE_SIZE, height: TILE_SIZE };
  public pos: IPoint = { x: TILE_SIZE, y: TILE_SIZE };
  public size: ISize = { width: TILE_SIZE, height: TILE_SIZE };
  public visible: boolean = true;
  public dusts: Dust[];
  public skills: string[] = ["weather"];
  public tileIndex: IPoint = { x: 0, y: 0 };
  public interactableType: InteractableType = InteractableType.Buddy;
  public energy: number = 1.0;

  private animations: IAnimations = {};
  private rot: number = Math.PI;
  private color: string;
  private lastDustAt: number = 0;
  private inConvoMode: boolean = false;
  private convoLookLeft: boolean = true;

  constructor(game) {
    this.game = game;
    this.animations.blinking = Object.assign({}, blinkingAnimation);
    this.animations.walking = Object.assign({}, walkingAnimation, { endPos: this.pos });
    this.animations.lookAway = Object.assign({}, lookAwayAnimation);
    this.color = randomElementFromArray(COLORS);
    this.dusts = Array.from(Array(NUM_DUSTS).keys()).map(() => new Dust(this.game));
    this.drawingSize.width = TILE_SIZE * this.game.squareSize;
    this.drawingSize.height = TILE_SIZE * this.game.squareSize;
  }

  get blinking() {
    return this.animations.blinking.running;
  }

  get walking() {
    return this.animations.walking.running;
  }

  public setConvoMode(inConvoMode: boolean) {
    this.inConvoMode = inConvoMode;
  }

  public convoLook(direction) {
    if (direction === Direction.Left) {
      this.convoLookLeft = true;
    } else if (direction === Direction.Right) {
      this.convoLookLeft = false;
    }
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
    this.tileIndex.x = Math.ceil(this.pos.x / TILE_SIZE);
    this.tileIndex.y = Math.ceil(this.pos.y / TILE_SIZE);
  }

  public walk(direction) {
    const animationEndTime = this.animations.walking.startTime + this.animations.walking.duration;
    if (this.game.timestamp < animationEndTime) return;
    let { x, y } = this.pos;

    if (direction === Direction.Left) {
      this.rot = -Math.PI / 2.0;
      x -= this.game.tileSize;
    } else if (direction === Direction.Right) {
      this.rot = Math.PI / 2.0;
      x += this.game.tileSize;
    } else if (direction === Direction.Down) {
      this.rot = Math.PI;
      y += this.game.tileSize;
    } else if (direction === Direction.Up) {
      this.rot = 0;
      y -= this.game.tileSize;
    }

    // Todo: avoid recreating objects
    const endPos = { x, y };
    const canMove = canThingMoveToPosition(this, endPos, this.game.currentLevel);
    if (canMove) this.configureWalkingAnimation(endPos);
  }

  public configureWalkingAnimation(endPos) {
    this.animations.walking.startTime = this.game.timestamp;
    this.animations.walking.endPos = endPos;
    this.animations.walking.running = true;
  }

  public updateWalkingPosition(timestamp) {
    if (!this.walking) return;
    const t = (timestamp - this.animations.walking.startTime) / this.animations.walking.duration;
    let x = lerp(this.pos.x, this.animations.walking.endPos.x, t);
    let y = lerp(this.pos.y, this.animations.walking.endPos.y, t);

    if (t >= 1.0) {
      x = this.animations.walking.endPos.x;
      y = this.animations.walking.endPos.y;
      this.animations.walking.running = false;
    }

    // TODO: avoid creating new objects
    this.move({ x, y });
  }

  public draw(context, timestamp) {
    this.updateWalkingPosition(timestamp);

    context.translate(
      this.drawingSize.width / 2.0,
      this.drawingSize.height / 2.0,
    );

    context.rotate(this.rot);

    context.translate(
      -this.drawingSize.width / 2.0,
      -this.drawingSize.height / 2.0,
    );

    context.fillStyle = this.color;
    context.fillRect(
      0,
      0,
      this.drawingSize.width,
      this.drawingSize.height,
    );

    this.maybeDoEyeAnimations(timestamp);

    this.drawEye(context, LEFT, this.animations.blinking.openness, this.animations.lookAway.offset);
    this.drawEye(context, RIGHT, this.animations.blinking.openness, this.animations.lookAway.offset);

    if (this.walking && (timestamp - this.lastDustAt) > TIME_BETWEEN_DUSTS) {
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

    // context.setTransform(1, 0, 0, 1, 0, 0);
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
    if (t >= 1.0) blinking.running = false;
  }

  private drawEye(context, whichOne, openness, lookAwayOffset) {
    const leftRightOffset = whichOne === LEFT ? 0 : (RIGHT_EYE_OFFSET * this.game.squareSize);

    context.fillStyle = EYE_COLOR;

    let offset = EYE_OFFSET;
    if (this.inConvoMode) offset = EYE_OFFSET_CONVO;

    const scaledEyeOffset = offset * this.game.squareSize;
    const scaledEyeSize = EYE_SIZE * this.game.squareSize;
    const scaledEyeReflectionSize = EYE_REFLECTION_SIZE * this.game.squareSize;

    context.fillRect(
      scaledEyeOffset + leftRightOffset,
      scaledEyeOffset,
      scaledEyeSize,
      scaledEyeSize * openness,
    );

    context.fillStyle = EYE_REFLECTION_COLOR;

    context.fillRect(
      scaledEyeOffset + leftRightOffset + (lookAwayOffset * this.game.squareSize),
      scaledEyeOffset,
      scaledEyeReflectionSize,
      scaledEyeReflectionSize * openness,
    );
  }
}
