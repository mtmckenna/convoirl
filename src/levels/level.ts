import colorMap from "../colors";
import Game from "../game";
import Tile from "../tiles/tile";

import {
  IDrawable,
  IInteractable,
  IPoint,
  ISize,
  ITouchable,
  IUpdateable,
  TILE_SIZE,
 } from "../common";

import { flatten, randomIndexFromArray } from "../helpers";

export default abstract class Level {
  public game: Game;

  public size: ISize;
  public drawingSize: ISize;

  public tiles: Tile[];
  public tilesGrid: Tile[][] = [];

  public drawables: IDrawable[][];
  public overlayDrawables: IDrawable[];
  public updateables: IUpdateable[];
  public interactables: IInteractable[];
  public touchables: ITouchable[];
  public backgroundColor: string = colorMap[2];

  protected  tileIndexes: number[][];

  protected abstract tileTypeMap: string[];

  constructor(game: Game) {
    this.game = game;
  }

  public abstract resize();
  public abstract handleInput(key: string);
  public abstract handleTouch(touch: Touch);

  public levelWillStart() { return; }
  public levelStarted() { return; }

  public update(timestamp: number) {
    this.updateables.forEach((updateable) => updateable.update(timestamp));
  }

  public configureDrawablesAndUpdateables() {
    this.clearDrawables();
    this.clearOverlayDrawables();
    this.clearUpdateables();
    this.clearInteractables();
    this.clearTouchables();
  }

  public tileAtIndex(tileIndex: IPoint) {
    return this.tilesGrid[tileIndex.y][tileIndex.x];
  }

  protected generateTiles() {
    const width = this.tileIndexes[0].length * TILE_SIZE;
    const height = this.tileIndexes.length * TILE_SIZE;

    this.size = { width, height };
    this.drawingSize = { width: width * this.game.squareSize, height: height * this.game.squareSize };

    for (let i = 0; i < this.tileIndexes.length; i++) {
      this.tilesGrid.push(new Array(this.tileIndexes[i].length));
      for (let j = 0; j < this.tileIndexes[i].length; j++) {
        const tileType = this.tileTypeMap[this.tileIndexes[i][j] || 0];
        this.tilesGrid[i][j] = new Tile(this.game, tileType, j, i);
      }
    }

    this.tiles = flatten(this.tilesGrid);
  }

  protected addDrawables(drawables: IDrawable[], zIndex: number) {
    this.drawables[zIndex].push(...drawables);
  }

  protected addOverlayDrawables(drawables: IDrawable[]) {
    this.overlayDrawables.push(...drawables);
  }

  protected addUpdateables(updateables: IUpdateable[]) {
    this.updateables.push(...updateables);
  }

  protected addTouchables(touchables: ITouchable[]) {
    this.touchables.push(...touchables);
  }

  protected addInteractables(interactables: IInteractable[]) {
    this.interactables.push(...interactables);
  }

  protected clearDrawables() {
    this.drawables = new Array(3).fill(null).map(() => new Array().fill(null));
  }

  protected clearOverlayDrawables() {
    this.overlayDrawables = [];
  }

  protected clearUpdateables() {
    this.updateables = [];
  }

  protected clearInteractables() {
    this.interactables = [];
  }

  protected clearTouchables() {
    this.touchables = [];
  }

  protected generateTileIndexes(sizeInTiles?: ISize) {
    // The tiles should fit the screen size since we don't scroll in convo
    sizeInTiles = sizeInTiles || this.game.sizeInTiles();

    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndexFromArray(this.tileTypeMap)));
  }

  protected touchedTouchable(touch: Touch): ITouchable {
    const fuzz = 20 * this.game.scaleFactor;

    const touched = this.touchables.find((touchable) => {
      const size = Object.assign({}, touchable.drawingSize);
      const pos = Object.assign({}, touchable.pos);
      size.width *= this.game.scaleFactor;
      size.height *= this.game.scaleFactor;
      pos.x *= this.game.scaleFactor;
      pos.y *= this.game.scaleFactor;

      return touch.clientX + fuzz >= pos.x &&
      touch.clientX - fuzz <= pos.x + size.width &&
      touch.clientY + fuzz >= pos.y &&
      touch.clientY - fuzz <= pos.y + size.height;
    });

    if (touched && touched.visible) return touched;
  }
}
