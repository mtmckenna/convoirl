import Tile from "./tile";

export default class Green extends Tile {
  public name = "green";
  public visible = false;
  protected colorMatrix = [];
  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
