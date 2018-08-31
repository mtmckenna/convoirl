import Game from "./game";
import Tile from "./tiles/tile";

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export enum InteractableType {
  Buddy,
  Tile,
}

export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  height: number;
  width: number;
}

export interface IAnimations {
  [key: string]: IAnimation;
}

export interface IAnimation {
  duration: number;
  running: boolean;
  startTime: number;
  [key: string]: any;
}

export interface IPositionable {
  pos: IPoint;
  size: ISize;
}

export interface IUpdateable {
  update(timestamp: number): void;
}

export interface IInteractable {
  tileIndex: IPoint;
  interactableType: InteractableType;
}

export interface IDrawable extends IPositionable {
  drawingSize: ISize;
  visible: boolean;
  game: Game;
  alpha: number;
  draw(context: CanvasRenderingContext2D, timestamp: number): void;
}

export interface ITouchable extends IDrawable {
  touched(): void;
}

export interface IInputBuffer {
  pressedAt: number;
  key: string;
}

export const TILE_SIZE: number = 8;
export const HALF_TILE_SIZE: number = TILE_SIZE / 2;
export const SQUARE_SIZE = 5;
export const MS_PER_UPDATE = 1.0 / 60.0;
export const NUM_TILES_ON_LONG_SIDE = 16;
export const BLINK_DURATION = 750;
export const LINE_HEIGHT = 8;
export const DISABLED_ALPHA = 0.5;
export const THROTTLE_TIME = 120;
