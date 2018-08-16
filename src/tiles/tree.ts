import Tile from "./tile";

export default class Tree extends Tile {
  public name = "tree";
  public walkable = false;
  protected colorMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 5, 5, 5, 5, 5, 5, 0],
    [0, 5, 5, 5, 5, 5, 5, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
