import Game from "./game";
import Tile from "./tiles/tile";

export enum Direction {
  Up,
  Down,
  Left,
  Right,
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

export interface IDrawable extends IPositionable {
  drawingSize: ISize;
  visible: boolean;
  game: Game;
  draw(context: CanvasRenderingContext2D, timestamp: number): void;
}

export interface ITileMap {
  tiles: Tile[];
}

export const TILE_SIZE: number = 8;
export const HALF_TILE_SIZE: number = TILE_SIZE / 2;
export const SQUARE_SIZE = 5;
export const MS_PER_UPDATE = 1.0 / 60.0;
export const NUM_TILES_ON_LONG_SIDE = 16;
