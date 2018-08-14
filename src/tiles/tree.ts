import Tile from "./tile";

export default class Tree extends Tile {
  public name = "tree";
  public walkable = false;
  protected colorMap = ["#96c083", "#6e4c49", "#3e625e"];
  protected colorMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
