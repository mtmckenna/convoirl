import Tile from "./tile";

export default class Grass extends Tile {
  public name = "grass";
  protected colorMap = ["#96c083", "#5fa367"];
  protected colorMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
