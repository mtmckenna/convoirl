import Tile from "./tile";

import { singleColorTileArray } from "../helpers";

export default class Sky extends Tile {
  public name = "sky";
  protected colorMatrix = singleColorTileArray(9);
  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
