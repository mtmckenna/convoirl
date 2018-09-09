import colorMap from "../colors";
import Game from "../game";

import TILES from "./tiles";

import {
  IDrawable,
  IFadeable,
  IInteractable,
  IPoint,
  TS,
} from "../common";
import { flatten } from "../helpers";

export default class Tile implements IDrawable, IInteractable, IFadeable {
  public dSize = { w: TS, h: TS };
  public pos = { x: 0, y: 0 };
  public size = { w: TS, h: TS };
  public walkable: boolean = true;
  public visible: boolean = true;
  public game: Game;
  public tileIndex: IPoint;
  public interactable: boolean = false;
  public name: string;
  public alpha = 1.0;
  public speed?: number;
  public lWidth?: number;

  protected tileLength: number = TS;
  protected cMatrix: number[][];

  constructor(game: Game, name: string, rowIndex: number, columnIndex: number) {
    this.game = game;
    this.pos = { x: rowIndex * TS, y: columnIndex * TS };
    this.tileIndex = { x: rowIndex, y: columnIndex };

    this.name = name;
    this.cMatrix = TILES[name].cMatrix;

    // TODO: check if I can check for undefined instead of hasownprop
    this.walkable = TILES[name].hasOwnProperty("walkable") ? TILES[name].walkable : this.walkable;
    this.visible = TILES[name].hasOwnProperty("visible") ? TILES[name].visible : this.visible;
    this.interactable = TILES[name].hasOwnProperty("interactable") ? TILES[name].interactable : this.interactable;
    this.tileLength = TILES[name].hasOwnProperty("tileLength") ? TILES[name].tileLength : this.tileLength;

    this.dSize = {
      h: this.tileLength * this.game.ss,
      w: this.tileLength * this.game.ss,
    };

    this.cacheOffscreenContext();
  }

  public draw(context) {
    context.globalAlpha = this.alpha;
    context.drawImage(TILES[this.name].canvas, 0, 0);
  }

  public moveleft() {
    this.pos.x = (this.pos.x + this.size.w) < 0 ? this.lWidth : this.pos.x - .008 * this.speed;
  }

  // It's faster to draw the tile as an image from an offscreen
  // canvas than it is to draw each pixel each frame.
  protected cacheOffscreenContext() {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = this.dSize.w;
    offscreenCanvas.height = this.dSize.h;
    const offscreenContext = offscreenCanvas.getContext("2d");

    const colors = flatten(this.cMatrix).map((colorIndex) => colorMap[colorIndex]);
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
