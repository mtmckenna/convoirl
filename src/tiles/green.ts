import Tile from "./tile";

import { singleColorTileArray } from "../helpers";

export default class Green extends Tile {
  public name = "green";
  protected colorMatrix = singleColorTileArray(2);
  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
