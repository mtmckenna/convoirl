import Tile from "./tile";

export default class Green extends Tile {
  public name = "green";
  public visible = true;
  protected colorMatrix = [];

  constructor(green, rowIndex, columnIndex) {
    super(green, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
