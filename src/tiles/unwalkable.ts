import Green from "./green";

export default class Unwalkable extends Green {
  public name = "unwalkable";
  public walkable = false;

  constructor(game, rowIndex, columnIndex) {
    super(game, rowIndex, columnIndex);
    this.cacheOffscreenContext();
  }
}
