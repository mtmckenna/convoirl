import Tile from "./tile";

import { singleColorTileArray } from "../helpers";

export default class Door extends Tile {
  public name = "door";
  public interactable = true;
  protected colorMatrix = singleColorTileArray(0);

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
