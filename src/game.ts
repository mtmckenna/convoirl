import {
  IAnimation,
  IInteractable,
  InteractableType,
  ISize,
  SQUARE_SIZE,
  TILE_SIZE,
} from "./common";

import { transition } from "./animations";
import { clerp } from "./helpers";

import Buddy from "./buddy";
import Camera from "./camera";
import colorMap from "./colors";
import Convo from "./levels/convo";
import Level from "./levels/level";
import Sleep from "./levels/sleep";
import StartScreen from "./levels/start-screen";
import World from "./levels/world";

const MAX_PREV_IMAGE_SIZE = 5;

export default class Game {
  public camera: Camera;
  public canvas: HTMLCanvasElement;
  public currentLevel: Level;
  public drawingSize: ISize;
  public timestamp: number = 0;
  public tileSize: number = TILE_SIZE;
  public levels: { [key: string]: Level; };
  public player: Buddy;
  public squareSize: number = SQUARE_SIZE;
  public size: ISize;

  private context: CanvasRenderingContext2D;
  private transition: IAnimation;
  private nextLevel: null | Level = null;
  private imageOfPreviousLevel: HTMLImageElement = null;

  constructor(canvas: HTMLCanvasElement) {
    this.player = new Buddy(this);

    this.canvas = canvas;
    this.setSize();
    this.context = canvas.getContext("2d", { alpha: false });
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;

    // @ts-ignore
    this.context.msImageSmoothingEnabled = false; // tslint:disable-line
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;

    this.levels = {
      convo: new Convo(this),
      sleep: new Sleep(this),
      startScreen: new StartScreen(this),
      world: new World(this),
    };

    this.transition = Object.assign({}, transition);

    // this.switchLevel(this.levels.world);
    this.switchLevel(this.levels.startScreen);
    // this.switchLevel(this.levels.convo);
    // this.switchLevel(this.levels.sleep);
  }

  get transitioning(): boolean {
    return this.transition.running;
  }

  public update(timestamp) {
    this.currentLevel.update(timestamp);
    if (this.transitioning) this.updateTransition(timestamp);
  }

  public draw(timestamp: number) {
    if (!this.context || !this.camera) return;
    this.camera.updateScreenShake(timestamp);

    this.clearCanvasContext();
    this.drawDrawables(timestamp);
    this.drawOverlayDrawables(timestamp);
    if (this.transitioning) this.updateTransition(timestamp);

  }

  public resize() {
    this.setSize();
    this.currentLevel.resize();
  }

  public queueNextLevel(nextLevel: Level) {
    this.nextLevel = nextLevel;
    this.startTransition();
  }

  public handleInput(key: string) {
    this.currentLevel.handleInput(key);
  }

  public handleTouch(touch: Touch) {
    this.currentLevel.handleTouch(touch);
  }

  public playerInteractedWithObject(interactedObject: IInteractable) {
    if (interactedObject.interactableType === InteractableType.Buddy) {
      this.queueNextLevel(this.levels.convo);
    }
  }

  private startTransition() {
    this.transition.startTime = this.timestamp;
    this.transition.running = true;
    this.imageOfPreviousLevel = new Image();
    this.imageOfPreviousLevel.src = this.canvas.toDataURL("png");
    this.switchLevel(this.nextLevel);
  }

  private setSize() {
    this.size = {
      height: this.canvas.height / this.squareSize,
      width: this.canvas.width / this.squareSize,
    };

    this.drawingSize = {
      height: this.canvas.height,
      width: this.canvas.width,
    };
  }

  private updateTransition(timestamp) {
    const t = (timestamp - this.transition.startTime) / this.transition.duration;

    this.transition.prevLevelScale = clerp(1.0, MAX_PREV_IMAGE_SIZE, 1.0, MAX_PREV_IMAGE_SIZE, t);
    this.transition.prevLevelAlpha = clerp(1.0, 0.0, 0.0, 1.0, t);
    this.transition.nextLevelAlpha = clerp(0.0, 1.0, 0.0, 1.0, t);

    if (t >= 1.0) {
      this.transition = Object.assign({}, transition);
      this.imageOfPreviousLevel = null;
    }
  }

  private switchLevel(nextLevel) {
    this.currentLevel = nextLevel;
    nextLevel.configureDrawablesAndUpdateables();
    nextLevel.levelStarted();
  }

  private drawDrawables(timestamp: number) {
    if (this.transitioning) this.context.globalAlpha = this.transition.nextLevelAlpha;

    const offset = this.camera.offset;

    this.currentLevel.drawables.forEach((drawablesAtZIndex) => {
      drawablesAtZIndex.forEach((drawable) => {
        if (!drawable.visible) return;
        const x = drawable.pos.x * this.squareSize + offset.x;
        const y = drawable.pos.y * this.squareSize + offset.y;

        if (this.isOffScreen(x, y, drawable.drawingSize)) return;

        // Bitwise operator is supposedly the fastest way to land on whole pixels:
        // https://www.html5rocks.com/en/tutorials/canvas/performance/
        this.context.translate((x + 0.5) | 0, (y + 0.5) | 0);

        drawable.draw(this.context, timestamp);

        this.context.setTransform(1, 0, 0, 1, 0, 0);
      });
    });

    this.context.globalAlpha = 1.0;

    if (this.imageOfPreviousLevel) {
      this.context.globalAlpha = this.transition.prevLevelAlpha;
      const scaleFactor = this.transition.prevLevelScale;
      const x = (this.canvas.width * scaleFactor - this.canvas.width) / 2;
      const y = (this.canvas.height * scaleFactor - this.canvas.height) / 2;
      this.context.drawImage(
        this.imageOfPreviousLevel,
        -x,
        -y,
        this.canvas.width * scaleFactor,
        this.canvas.height * scaleFactor,
      );
      this.context.globalAlpha = 1.0;
    }
  }

  private isOffScreen(x: number, y: number, drawingSize: ISize) {
    return x + drawingSize.width < 0 ||
      x > this.canvas.width ||
      y + drawingSize.height < 0 ||
      y > this.canvas.height;
  }

  private drawOverlayDrawables(timestamp: number) {
    if (this.transitioning) this.context.globalAlpha = this.transition.nextLevelAlpha;
    this.currentLevel.overlayDrawables.forEach((drawable) => {
      if (!drawable.visible) return;
      drawable.draw(this.context, timestamp);
    });

    this.context.globalAlpha = 1.0;
  }

  private clearCanvasContext(): void {
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.transitioning) this.context.globalAlpha = this.transition.nextLevelAlpha;
    this.context.fillStyle = colorMap[2];
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
