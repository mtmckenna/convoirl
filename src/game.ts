import {
  IAnimation,
  IPoint,
  ISize,
  LH,
  LS,
  TS,
} from "./common";

import { clerp } from "./helpers";

import Buddy from "./buddy";
import Camera from "./camera";
import Convo from "./levels/convo";
import Level from "./levels/level";
import StartScreen from "./levels/start-screen";
import World from "./levels/world";

const SQUARE_SIZE = 5;
const SIDE_LENGTH = 16 * TS * SQUARE_SIZE;

const transition: IAnimation = {
  duration: 1000,
  nextLevelAlpha: 0,
  prevLevelAlpha: 1,
  prevLevelScale: 1,
  running: false,
  startTime: 0,
};

let width: number;
let height: number;
let booted: boolean = false;
let context: CanvasRenderingContext2D;
let nextLevel: null | Level = null;
let imageOfPreviousLevel: HTMLImageElement = null;

export default class Game {
  public c: Camera;
  public canvas: HTMLCanvasElement;
  public currentLevel: Level;
  public timestamp: number = 0;
  public levels: { [key: string]: Level; };
  public p: Buddy;
  public ss: number = SQUARE_SIZE;
  public sf: number = 1;
  public nextAlpha: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.p = new Buddy(this);
    this.p.skills.push("WEATHER");

    this.canvas = canvas;
    setSize.call(this);
    context = canvas.getContext("2d", { alpha: false });
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;

    this.levels = {
      convo: new Convo(this),
      startScreen: new StartScreen(this),
      world: new World(this),
    };

    // this.transition = Object.assign({}, transition);
    this.c = new Camera(this);
  }

  public boxPos(): IPoint {
    return {
      x: (this.canvas.width - this.boxSize().w * this.ss) / 2,
      y: (this.canvas.height - this.boxSize().h * this.ss) / 2,
    };
  }

  public boxSize(): ISize {
    return {
      h: 3 * LH + 2 * LS,
      w: LH * 12,
    };
  }

  public inTr(): boolean {
    return transition.running;
  }

  public update(timestamp) {
    if (!booted) {
      this.timestamp = timestamp;
      switchLevel.call(this, this.levels.startScreen);
      this.resize();
      booted = true;
    }

    this.timestamp = timestamp;
    this.currentLevel.update(timestamp);

    if (this.inTr()) updateTransition.call(this, timestamp);
  }

  public draw(timestamp: number) {
    if (!context || !this.c) return;
    this.c.updateShake(timestamp);

    clearCanvasContext.call(this);
    drawDrawables.call(this, timestamp);
    drawOverlayDrawables.call(this, timestamp);
    if (this.inTr()) updateTransition.call(this, timestamp);
  }

  public resize() {
    const aspectRatio = window.innerWidth / window.innerHeight;

    if (aspectRatio >= 1) {
      width = SIDE_LENGTH;
      height = width / aspectRatio;
    } else {
      height = SIDE_LENGTH;
      width = height * aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.c.size = { w: this.canvas.width, h: this.canvas.height };

    setSize.call(this);
    if (this.currentLevel) this.currentLevel.resize();
  }

  public qLevel(updatedLevel: Level, state?: string) {
    if (updatedLevel === this.levels.convo) {
      const { convo, world } = this.levels;
      (convo as Convo).setBuddy((world as World).currentBuddy.copy());
    }
    nextLevel = updatedLevel;
    if (state) nextLevel.state = state;
    startTransition.call(this);
  }

  // TODO: what's the best typescripty way of setting this event?
  public handleInput(event) {
    this.currentLevel.handleInput(event.key);
  }

  public handleTouch(touch: Touch) {
    this.currentLevel.handleTouch(touch);
  }

  public sizeInTiles(): ISize {
    const w = Math.ceil(this.canvas.width / this.ss / TS);
    const h = Math.ceil(this.canvas.height / this.ss / TS);
    return { w, h };
  }
}

function startTransition() {
  transition.startTime = this.timestamp;
  transition.running = true;
  imageOfPreviousLevel = new Image();
  imageOfPreviousLevel.src = this.canvas.toDataURL("png");
  switchLevel.call(this, nextLevel);
}

function setSize() {
  this.sf = window.innerWidth / this.canvas.width;
}

function updateTransition(timestamp) {
  const t = (timestamp - transition.startTime) / transition.duration;

  transition.prevLevelScale = clerp(1, 5, 1, 5, t);
  transition.prevLevelAlpha = clerp(1, 0, 0, 1, t);
  transition.nextLevelAlpha = clerp(0, 1, 0, 1, t);
  this.nextAlpha = transition.nextLevelAlpha;

  if (t >= 1) {
    transition.running = false;
    imageOfPreviousLevel = null;
  }
}

function switchLevel(updatedLevel) {
  this.currentLevel = updatedLevel;
  this.currentLevel.levelWillStart();
  this.currentLevel.configViz();
  this.currentLevel.levelStarted();
}

function drawDrawables(timestamp: number) {
  const offset = this.c.offset;
  this.currentLevel.dables.forEach((drawablesAtZIndex) => {
    drawablesAtZIndex.forEach((drawable) => {
      // the !drawable is a hack to help reduce file size on levels with generated tiles
      if (!drawable || !drawable.visible) return;
      const x = drawable.pos.x * this.ss + offset.x;
      const y = drawable.pos.y * this.ss + offset.y;

      if (isOffScreen.call(this, x, y, drawable.dSize)) return;

      // Bitwise operator is supposedly the fastest way to land on whole pixels:
      // https://www.html5rocks.com/en/tutorials/canvas/performance/
      context.translate((x + .5) | 0, (y + .5) | 0);
      context.globalAlpha = this.inTr() ? transition.nextLevelAlpha : 1;
      drawable.draw(context, timestamp);
      context.setTransform(1, 0, 0, 1, 0, 0);
    });
  });

  context.globalAlpha = 1;

  if (imageOfPreviousLevel) {
    context.globalAlpha = transition.prevLevelAlpha;
    const scaleFactor = transition.prevLevelScale;
    const x = (this.canvas.width * scaleFactor - this.canvas.width) / 2;
    const y = (this.canvas.height * scaleFactor - this.canvas.height) / 2;
    context.drawImage(
      imageOfPreviousLevel,
      -x,
      -y,
      this.canvas.width * scaleFactor,
      this.canvas.height * scaleFactor,
    );
    context.globalAlpha = 1;
  }
}

function isOffScreen(x: number, y: number, dSize: ISize) {
  return x + dSize.w < 0 ||
    x > this.canvas.width ||
    y + dSize.h < 0 ||
    y > this.canvas.height;
}

function drawOverlayDrawables(timestamp: number) {
  if (this.inTr()) context.globalAlpha = transition.nextLevelAlpha;
  this.currentLevel.odables.forEach((drawable) => {
    if (!drawable.visible) return;
    drawable.draw(context, timestamp);
  });

  context.globalAlpha = 1;
}

function clearCanvasContext(): void {
  if (this.inTr()) context.globalAlpha = transition.nextLevelAlpha;
  context.fillStyle = this.currentLevel.bgColor;
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}
