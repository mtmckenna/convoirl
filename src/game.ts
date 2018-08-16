import {
  Direction,
  IAnimation,
  IDrawable,
  ISize,
  SQUARE_SIZE,
  TILE_SIZE,
} from "./common";

import { transition } from "./animations";
import { twoPhaseClerp } from "./helpers";

import Camera from "./camera";

import Level from "./levels/level";
import StartScreen from "./levels/start-screen";
import World from "./levels/world";
import Player from "./player";

const MIN_SQUARE_SIZE = SQUARE_SIZE;
const MAX_SQUARE_SIZE = 10 * SQUARE_SIZE;
const NUM_ZINDICES = 3;

export default class Game {
  public camera: Camera;
  public canvas: HTMLCanvasElement;
  public currentLevel: Level;
  public timestamp: number = 0;
  public tileSize: number = TILE_SIZE;
  public levels: { [key: string]: Level; };
  public player: Player;
  public drawables: IDrawable[][];
  public overlayDrawables: IDrawable[];
  public squareSize: number = SQUARE_SIZE;

  private context: CanvasRenderingContext2D;
  private transition: IAnimation;
  private nextLevel: null | Level = null;

  constructor(canvas: HTMLCanvasElement) {
    this.player = new Player(this);

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;

    // @ts-ignore
    this.context.msImageSmoothingEnabled = false; // tslint:disable-line
    this.context.imageSmoothingEnabled = false;

    this.levels = { startScreen: new StartScreen(this), world: new World(this) };
    this.transition = Object.assign({}, transition);

    // this.switchLevel(this.levels.world);
    this.switchLevel(this.levels.startScreen);
  }

  get transitioning(): boolean {
    return this.transition.running;
  }

  public update(timestamp) {
    this.player.update(timestamp);
    this.drawables.forEach((drawablesAtZIndex) => {
      drawablesAtZIndex.forEach((drawable) => {
        drawable.update(timestamp);
      });
    });

    this.overlayDrawables.forEach((drawable) => drawable.update(timestamp));

    if (this.transitioning) this.updateTransition(timestamp);
  }

  public draw(timestamp: number) {
    if (!this.context || !this.camera) return;
    this.camera.updateScreenShake(timestamp);

    this.clearCanvasContext();
    this.drawDrawables(timestamp);
    if (!this.transitioning) this.drawOverlayDrawables(timestamp);
  }

  public resize() {
    this.currentLevel.resize();

    // TODO: dry this up
    this.drawables.forEach((drawablesAtZIndex) => {
      drawablesAtZIndex.forEach((drawable) => {
        drawable.resize();
      });
    });

    this.overlayDrawables.forEach((drawable) => drawable.resize());
  }

  public walk(direction: Direction) {
    this.player.walk(direction);
  }

  public addDrawables(drawables: IDrawable[], zIndex) {
    this.drawables[zIndex].push(...drawables);
  }

  public addOverlayDrawables(drawables: IDrawable[]) {
    this.overlayDrawables.push(...drawables);
  }

  public clearDrawables() {
    this.drawables = new Array(NUM_ZINDICES).fill([]);
  }

  public clearOverlayDrawables() {
    this.overlayDrawables = [];
  }

  public queueNextLevel(nextLevel: Level) {
    this.nextLevel = nextLevel;
    this.startTransition();
  }

  public handleInput(key) {
    this.currentLevel.handleInput(key);
  }

  private startTransition() {
    this.transition.startTime = this.timestamp;
    this.transition.running = true;
  }

  private updateTransition(timestamp) {
    const t = (timestamp - this.transition.startTime) / this.transition.duration;

    if (t >= 0.5) this.switchLevel(this.nextLevel);
    if (t >= 1.0) this.transition.running = false;

    this.squareSize = twoPhaseClerp(t, MIN_SQUARE_SIZE, MAX_SQUARE_SIZE);
    this.context.globalAlpha = Math.min(SQUARE_SIZE / this.squareSize, 1.0);
  }

  private switchLevel(nextLevel) {
    this.currentLevel = nextLevel;
    this.clearDrawables();
    this.clearOverlayDrawables();
    nextLevel.configureDrawables();
  }

  private drawDrawables(timestamp: number) {
    const offset = this.camera.offset;

    this.drawables.forEach((drawablesAtZIndex) => {
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
  }

  private isOffScreen(x: number, y: number, drawingSize: ISize) {
    return x + drawingSize.width < 0 ||
      x > this.canvas.width ||
      y + drawingSize.height < 0 ||
      y > this.canvas.height;
  }

  private drawOverlayDrawables(timestamp: number) {
    this.overlayDrawables.forEach((drawable) => {
      if (!drawable.visible) return;
      drawable.draw(this.context, timestamp);
    });
  }

  private clearCanvasContext(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
