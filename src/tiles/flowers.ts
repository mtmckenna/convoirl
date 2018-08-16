import Tile from "./tile";

export default class Flowers extends Tile {
  public name = "flowers";
  protected colorMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 0, 0, 0, 1, 0],
    [0, 3, 2, 3, 0, 0, 0, 0],
    [0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
