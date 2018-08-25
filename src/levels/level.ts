import Game from "../game";
import Tile from "../tiles/tile";

import {
  IDrawable,
  ISize,
  IUpdateable,
  TILE_SIZE,
 } from "../common";
import { flatten } from "../helpers";

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

  protected abstract tileIndexes: number[][];
  protected abstract tileTypeMap: any[]; // <-- what's the right way to do this?

  constructor(game: Game) {
    this.game = game;

  }

  public abstract resize();
  public abstract handleInput(key: string);
  public abstract handleTouch(touch: Touch);

  public update() {
    return;
  }

  public configureDrawablesAndUpdateables() {
    this.clearDrawables();
    this.clearOverlayDrawables();
    this.clearUpdateables();
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

  protected clearDrawables() {
    this.drawables = new Array(NUM_ZINDICES).fill(null).map(() => new Array().fill(null));
  }

  protected clearOverlayDrawables() {
    this.overlayDrawables = [];
  }

  protected clearUpdateables() {
    this.updateables = [];
  }
}
