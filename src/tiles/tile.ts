import colorMap from "../colors";
import Game from "../game";
import tileCache from "./tile-cache";

import { IDrawable, TILE_SIZE } from "../common";
import { flatten } from "../helpers";

export default abstract class Tile implements IDrawable {
  public drawingSize = { width: TILE_SIZE, height: TILE_SIZE };
  public pos = { x: 0, y: 0 };
  public size = { width: TILE_SIZE, height: TILE_SIZE };
  public walkable: boolean = true;
  public visible: boolean = true;
  public game: Game;
  public abstract name: string;

  protected abstract colorMatrix: number[][];

  constructor(game: Game, rowIndex: number, columnIndex: number) {
    this.game = game;
    this.pos = { x: rowIndex * TILE_SIZE, y: columnIndex * TILE_SIZE };
    this.drawingSize = { width: TILE_SIZE * this.game.squareSize, height: TILE_SIZE * this.game.squareSize };
  }

  get offscreenCanvas(): HTMLCanvasElement {
    return tileCache[this.name].canvas;
  }

  public draw(context) {
    context.drawImage(this.offscreenCanvas, 0, 0);
  }

  public resize() {
    return;
  }

  public update() {
    if (tileCache[this.name].squareSize === this.game.squareSize) return;
    this.drawingSize.width = TILE_SIZE * this.game.squareSize;
    this.drawingSize.height = TILE_SIZE * this.game.squareSize;
    this.cacheOffscreenContext();
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
      offscreenContext.fillStyle = color;
      const x = this.game.squareSize * (index % TILE_SIZE);
      const y = this.game.squareSize * (Math.floor(index / TILE_SIZE));
      offscreenContext.fillRect(x, y, this.game.squareSize, this.game.squareSize);
    });

    tileCache[this.name].squareSize = this.game.squareSize;
    tileCache[this.name].canvas = offscreenCanvas;
  }
}
