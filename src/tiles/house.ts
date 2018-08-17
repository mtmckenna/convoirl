import Tile from "./tile";

export default class Green extends Tile {
  public name = "house";
  protected colorMatrix = [
    [2, 2, 2, 6, 6, 2, 2, 2],
    [2, 2, 6, 6, 6, 6, 2, 2],
    [2, 6, 6, 6, 6, 6, 6, 2],
    [6, 6, 6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 0, 0, 6, 6],
    [6, 6, 0, 0, 0, 0, 6, 6],
    [6, 6, 0, 0, 0, 0, 6, 6],
    [6, 6, 0, 0, 0, 0, 6, 6],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
