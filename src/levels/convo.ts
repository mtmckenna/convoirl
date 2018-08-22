import Level from "./level";

import EnergyBar from "../energy-bar";
import Game from "../game";
import Player from "../player";

import Flowers from "../tiles/flowers";
import Green from "../tiles/green";

import {
  SQUARE_SIZE,
  TILE_SIZE,
} from "../common";

import { randomIndexFromArray } from "../helpers";

export default class Convo extends Level {
  public energyBar: EnergyBar;

  protected tileTypeMap = [Green, Flowers];
  protected tileIndexes = [[]];

  constructor(game: Game) {
    super(game);
    this.generateTiles();
    this.energyBar = new EnergyBar(this.game, { x: 0, y: SQUARE_SIZE });
  }

  public handleInput(key) {
    return;
  }

  public handleTouch(touch) {
  return;
  }

  public resize() {
    // The tiles should fit the screen size since we don't scroll in convo
    const TILES_WIDE = Math.ceil(this.game.canvas.width / this.game.squareSize / TILE_SIZE);
    const TILES_TALL = Math.ceil(this.game.canvas.height / this.game.squareSize / TILE_SIZE);

    this.tileIndexes = new Array(TILES_TALL).fill([]).map (
      () => new Array(TILES_WIDE).fill(null).map(
        () => randomIndexFromArray(this.tileTypeMap)),
    );

    this.generateTiles();
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    this.game.clearDrawables();
    this.game.addDrawables(this.tiles, 0);
  }
}
