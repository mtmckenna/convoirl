import Tile from "./tile";

export default class Grass extends Tile {
  public name = "grass";
  protected colorMatrix = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 3, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
