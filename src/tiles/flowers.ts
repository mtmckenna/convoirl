import Tile from "./tile";

export default class Flowers extends Tile {
  public name = "flowers";
  protected colorMatrix = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 5, 2, 2, 2, 3, 2],
    [2, 5, 4, 5, 2, 2, 2, 2],
    [2, 2, 5, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
