import Game from "./game";

import Tile from "../tiles/tile"

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

export const TS = 8;
export const MS_PER = 1 / 60;
export const L_SPACE = 8;
export const T_TIME = 120;
export const L_HEIGHT = 5;
export const LISTEN = "*LISTEN*";
