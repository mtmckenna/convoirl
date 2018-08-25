import Game from "../game";
import Tile from "../tiles/tile";

import {
  IDrawable,
  IInteractable,
  IPoint,
  ISize,
  IUpdateable,
  TILE_SIZE,
 } from "../common";

import { flatten, randomIndexFromArray } from "../helpers";

const NUM_ZINDICES = 5;

export default abstract class Level {
  public game: Game;

  public size: ISize;
  public drawingSize: ISize;

  public tiles: Tile[];
  public tilesGrid: Tile[][];

  public drawables: IDrawable[][];
  public overlayDrawables: IDrawable[] = [];
  public updateables: IUpdateable[] = [];
  public interactables: IInteractable[] = [];

  protected abstract tileIndexes: number[][];
  protected abstract tileTypeMap: any[]; // <-- what's the right way to do this?

  constructor(game: Game) {
    this.game = game;
  }

  public abstract resize();
  public abstract handleInput(key: string);
  public abstract handleTouch(touch: Touch);

  public update(timestamp: number) {
    this.updateables.forEach((updateable) => updateable.update(timestamp));
  }

  public configureDrawablesAndUpdateables() {
    this.clearDrawables();
    this.clearOverlayDrawables();
    this.clearUpdateables();
    this.clearInteractables();
  }

  public tileAtIndex(tileIndex: IPoint) {
    return this.tilesGrid[tileIndex.y][tileIndex.x];
  }

  protected generateTiles() {
    const width = this.tileIndexes[0].length * TILE_SIZE;
    const height = this.tileIndexes.length * TILE_SIZE;

    this.size = { width, height };
    this.drawingSize = { width: width * this.game.squareSize, height: height * this.game.squareSize };
    this.tilesGrid = this.tileIndexes.map(
      (column, columnIndex) => column.map(
        (tileIndex, rowIndex) => new this.tileTypeMap[tileIndex](this.game, rowIndex, columnIndex)),
    );

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

  protected addInteractables(interactables: IInteractable[]) {
    this.interactables.push(...interactables);
  }

  protected clearDrawables() {
    this.drawables = new Array(NUM_ZINDICES).fill(null).map(() => new Array().fill(null));
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

  protected generateTileIndexes() {
    // The tiles should fit the screen size since we don't scroll in convo
    const TILES_WIDE = Math.ceil(this.game.canvas.width / this.game.squareSize / TILE_SIZE);
    const TILES_TALL = Math.ceil(this.game.canvas.height / this.game.squareSize / TILE_SIZE);

    this.tileIndexes = new Array(TILES_TALL)
      .fill(null).map(() => new Array(TILES_WIDE)
        .fill(null).map(() => randomIndexFromArray(this.tileTypeMap)));
  }
}
