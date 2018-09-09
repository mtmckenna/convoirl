import Game from "./game";

export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  h: number;
  w: number;
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
}

export interface IFadeable {
  alpha: number;
}

export interface IDrawable extends IPositionable {
  dSize: ISize;
  visible: boolean;
  game: Game;
  draw(context: CanvasRenderingContext2D, timestamp: number): void;
}

export interface ITouchable extends IDrawable {
  touched(): void;
}

export interface IInputBuffer {
  pressedAt: number;
  key: string;
}

export const TS = 8; // tile size
export const MS = 1 / 60; // ms per second
export const LS = 8; // spacing between lines
export const TT = 120; // throttle time
export const LH = 5; // letter heights
export const LT = "*LISTEN*"; // listen skill
