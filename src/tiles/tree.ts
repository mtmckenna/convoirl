import Tile from "./tile";

export default class Tree extends Tile {
  public name = "tree";
  public walkable = false;
  protected colorMatrix = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 7, 7, 7, 7, 2, 2],
    [2, 7, 7, 7, 7, 7, 7, 2],
    [2, 7, 7, 7, 7, 7, 7, 2],
    [2, 2, 7, 7, 7, 7, 2, 2],
    [2, 2, 2, 6, 6, 2, 2, 2],
    [2, 2, 2, 6, 6, 2, 2, 2],
    [2, 2, 6, 6, 6, 6, 2, 2],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
