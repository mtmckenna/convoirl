import Tile from "./tile";

export default class Blank extends Tile {
  public name = "blank";
  public walkable = false;

  protected colorMatrix = [[]];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
