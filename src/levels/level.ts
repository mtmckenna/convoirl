import Game from "../game";
import Tile from "../tiles/tile";

import { ISize, TILE_SIZE } from "../common";
import { flatten } from "../helpers";

export default abstract class Level {
  public game: Game;

  public size: ISize;
  public drawingSize: ISize;

  public tiles: Tile[];
  public tilesGrid: Tile[][];

  protected abstract tileIndexes: number[][];
  protected abstract tileTypeMap: any[]; // <-- what's the right way to do this?

  constructor(game: Game) {
    this.game = game;
  }

  public update() {
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;
  }

  public abstract configureDrawables()
  public abstract resize()
  public abstract handleInput(key: string)

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
}