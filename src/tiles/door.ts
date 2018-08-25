import Tile from "./tile";

export default class Door extends Tile {
  public name = "door";
  public visible = false;
  public interactable = true;
  protected colorMatrix = [];

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
