import {
  IAnimation,
  IPoint,
  ISize,
  LETTER_HEIGHT,
  LINE_HEIGHT,
  SQUARE_SIZE,
  TS,
} from "./common";

import { transition } from "./animations";
import { clerp } from "./helpers";

import Buddy from "./buddy";
import Camera from "./camera";
import Convo from "./levels/convo";
import Level from "./levels/level";
import StartScreen from "./levels/start-screen";
import World from "./levels/world";

const SIDE_LENGTH = 16 * TS * SQUARE_SIZE;

let width: number;
let height: number;
let booted: boolean = false;
let context: CanvasRenderingContext2D;
let nextLevel: null | Level = null;
let imageOfPreviousLevel: HTMLImageElement = null;

export default class Game {
  public camera: Camera;
  public canvas: HTMLCanvasElement;
  public currentLevel: Level;
  public timestamp: number = 0;
  public levels: { [key: string]: Level; };
  public player: Buddy;
  public squareSize: number = SQUARE_SIZE;
  public transition: IAnimation;
  public scaleFactor: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.player = new Buddy(this);
    this.player.skills.push("weather");

    this.canvas = canvas;
    this.setSize();
    context = canvas.getContext("2d", { alpha: false });
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;

    this.levels = {
      convo: new Convo(this),
      startScreen: new StartScreen(this),
      world: new World(this),
    };

    this.transition = Object.assign({}, transition);
    this.camera = new Camera(this);
  }

  get boxPos(): IPoint {
    return {
      x: (this.canvas.width - this.boxSize.width * this.squareSize) / 2,
      y: (this.canvas.height - this.boxSize.height * this.squareSize) / 2,
    };
  }

  get boxSize(): ISize {
    return {
      height: 3 * LETTER_HEIGHT + 2 * LINE_HEIGHT,
      width:  LETTER_HEIGHT * 12,
    };
  }

  get transitioning(): boolean {
    return this.transition.running;
  }

  public boot(timestamp) {
    this.timestamp = timestamp;
    this.switchLevel(this.levels.startScreen);
    // this.switchLevel(this.levels.world);
    // this.switchLevel(this.levels.convo);
  }

  public update(timestamp) {
    if (!booted) {
      this.boot(timestamp);
      this.resize();
      booted = true;
    }

    this.timestamp = timestamp;
    this.currentLevel.update(timestamp);

    if (this.transitioning) this.updateTransition(timestamp);
  }

  public draw(timestamp: number) {
    if (!context || !this.camera) return;
    this.camera.updateScreenShake(timestamp);

    this.clearCanvasContext();
    this.drawDrawables(timestamp);
    this.drawOverlayDrawables(timestamp);
    if (this.transitioning) this.updateTransition(timestamp);
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
    this.camera.size = { width: this.canvas.width, height: this.canvas.height };

    this.setSize();
    if (this.currentLevel) this.currentLevel.resize();
  }

  public queueNextLevel(updatedLevel: Level, state?: string) {
    if (nextLevel === this.levels.convo) {
      const { convo, world } = this.levels;
      (convo as Convo).setBuddy((world as World).currentBuddy.copy());
    }
    nextLevel = updatedLevel;
    if (state) nextLevel.state = state;
    this.startTransition();
  }

  public handleInput(key: string) {
    this.currentLevel.handleInput(key);
  }

  public handleTouch(touch: Touch) {
    this.currentLevel.handleTouch(touch);
  }

  public sizeInTiles(): ISize {
    const w = Math.ceil(this.canvas.width / this.squareSize / TS);
    const h = Math.ceil(this.canvas.height / this.squareSize / TS);
    return { width: w, height: h };
  }

  private startTransition() {
    this.transition.startTime = this.timestamp;
    this.transition.running = true;
    imageOfPreviousLevel = new Image();
    imageOfPreviousLevel.src = this.canvas.toDataURL("png");
    this.switchLevel(nextLevel);
  }

  private setSize() {
    this.scaleFactor = window.innerWidth / this.canvas.width;
  }

  private updateTransition(timestamp) {
    const t = (timestamp - this.transition.startTime) / this.transition.duration;

    this.transition.prevLevelScale = clerp(1, 5, 1, 5, t);
    this.transition.prevLevelAlpha = clerp(1, 0, 0, 1, t);
    this.transition.nextLevelAlpha = clerp(0, 1, 0, 1, t);

    if (t >= 1) {
      this.transition = Object.assign({}, transition);
      imageOfPreviousLevel = null;
    }
  }

  private switchLevel(updatedLevel) {
    this.currentLevel = updatedLevel;
    this.currentLevel.levelWillStart();
    this.currentLevel.configureDrawablesAndUpdateables();
    this.currentLevel.levelStarted();
  }

  private drawDrawables(timestamp: number) {

    const offset = this.camera.offset;

    this.currentLevel.drawables.forEach((drawablesAtZIndex) => {
      drawablesAtZIndex.forEach((drawable) => {
        // the !drawable is a hack to help reduce file size on levels with generated tiles
        if (!drawable || !drawable.visible) return;
        const x = drawable.pos.x * this.squareSize + offset.x;
        const y = drawable.pos.y * this.squareSize + offset.y;

        if (this.isOffScreen(x, y, drawable.drawingSize)) return;

        // Bitwise operator is supposedly the fastest way to land on whole pixels:
        // https://www.html5rocks.com/en/tutorials/canvas/performance/
        context.translate((x + .5) | 0, (y + .5) | 0);

        context.globalAlpha = this.transitioning ? this.transition.nextLevelAlpha : 1;

        drawable.draw(context, timestamp);

        context.setTransform(1, 0, 0, 1, 0, 0);
      });
    });

    context.globalAlpha = 1;

    if (imageOfPreviousLevel) {
      context.globalAlpha = this.transition.prevLevelAlpha;
      const scaleFactor = this.transition.prevLevelScale;
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

  private isOffScreen(x: number, y: number, drawingSize: ISize) {
    return x + drawingSize.width < 0 ||
      x > this.canvas.width ||
      y + drawingSize.height < 0 ||
      y > this.canvas.height;
  }

  private drawOverlayDrawables(timestamp: number) {
    if (this.transitioning) context.globalAlpha = this.transition.nextLevelAlpha;
    this.currentLevel.overlayDrawables.forEach((drawable) => {
      if (!drawable.visible) return;
      drawable.draw(context, timestamp);
    });

    context.globalAlpha = 1;
  }

  private clearCanvasContext(): void {
    if (this.transitioning) context.globalAlpha = this.transition.nextLevelAlpha;
    context.fillStyle = this.currentLevel.backgroundColor;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
