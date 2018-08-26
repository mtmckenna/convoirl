import Tile from "./tile";

const E = null;

export default class Tree extends Tile {
  public name = "tree";
  public walkable = false;
  protected colorMatrix = [
    [E, E, E, E, E, E, E, E],
    [E, E, 7, 7, 7, 7, E, E],
    [E, 7, 7, 7, 7, 7, 7, E],
    [E, 7, 7, 7, 7, 7, 7, E],
    [E, E, 7, 7, 7, 7, E, E],
    [E, E, E, 6, 6, E, E, E],
    [E, E, E, 6, 6, E, E, E],
    [E, E, 6, 6, 6, 6, E, E],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
