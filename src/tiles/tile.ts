import colorMap from "../colors";
import Game from "../game";

import TILES from "./tiles";

import {
  IDrawable,
  IInteractable,
  IPoint,
  TS,
} from "../common";
import { flatten } from "../helpers";

export default class Tile implements IDrawable, IInteractable {
  public drawingSize = { width: TS, height: TS };
  public pos = { x: 0, y: 0 };
  public size = { width: TS, height: TS };
  public walkable: boolean = true;
  public visible: boolean = true;
  public game: Game;
  public tileIndex: IPoint;
  public interactable: boolean = false;
  public name: string;

  protected tileLength: number = TS;
  protected colorMatrix: number[][];

  constructor(game: Game, name: string, rowIndex: number, columnIndex: number) {
    this.game = game;
    this.pos = { x: rowIndex * TS, y: columnIndex * TS };
    this.tileIndex = { x: rowIndex, y: columnIndex };

    this.name = name;
    this.colorMatrix = TILES[name].colorMatrix;
    this.walkable = TILES[name].hasOwnProperty("walkable") ? TILES[name].walkable : this.walkable;
    this.visible = TILES[name].hasOwnProperty("visible") ? TILES[name].visible : this.visible;
    this.interactable = TILES[name].hasOwnProperty("interactable") ? TILES[name].interactable : this.interactable;
    this.tileLength = TILES[name].hasOwnProperty("tileLength") ? TILES[name].tileLength : this.tileLength;

    this.drawingSize = {
      height: this.tileLength * this.game.ss,
      width: this.tileLength * this.game.ss,
    };

    this.cacheOffscreenContext();
  }

  get offscreenCanvas(): HTMLCanvasElement {
    return TILES[this.name].canvas;
  }

  public draw(context) {
    context.drawImage(this.offscreenCanvas, 0, 0);
  }

  // It's faster to draw the tile as an image from an offscreen
  // canvas than it is to draw each pixel each frame.
  protected cacheOffscreenContext() {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = this.drawingSize.width;
    offscreenCanvas.height = this.drawingSize.height;
    const offscreenContext = offscreenCanvas.getContext("2d");

    const colors = flatten(this.colorMatrix).map((colorIndex) => colorMap[colorIndex]);
    colors.forEach((color, index) => {
      if (!color) return;
      offscreenContext.fillStyle = color;
      const x = this.game.ss * (index % this.tileLength);
      const y = this.game.ss * (Math.floor(index / this.tileLength));
      offscreenContext.fillRect(x, y, this.game.ss, this.game.ss);
    });

    TILES[this.name].canvas = offscreenCanvas;
  }
}
