import Game from "../game";
import Level from "./level";
import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import Tree from "../tiles/tree";
import Text from "../text";

import { SQUARE_SIZE } from "../common";

export default class StartScreen extends Level {
  protected tileTypeMap = [Green, Flowers, Grass, Tree];
  protected tileIndexes = [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3],
    [3, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 3],
    [3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 3],
    [3, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  ];

  constructor(game: Game) {
    super(game);
    this.generateTiles();
  }

  public configureDrawables() {
    this.game.addDrawables(this.tiles, 0);
    this.resize();
  }

  public resize() {
    this.game.clearOverlayDrawables();
    this.addText();
  }

  public handleInput() {
    this.game.queueNextLevel(this.game.levels["world"]);
  }

  private addText() {
    const lineHeight = 10;
    const startX = SQUARE_SIZE
    const startY = SQUARE_SIZE
    const shadowOffset = 1;
    const title1Pos = { x: startX, y: startY };
    const title1ShadowPos = { x: title1Pos.x + shadowOffset, y: title1Pos.y + shadowOffset };
    const title2Pos =  { x: title1Pos.x, y: lineHeight * SQUARE_SIZE + title1Pos.y };
    const title2ShadowPos = { x: title2Pos.x + shadowOffset, y: title2Pos.y + shadowOffset };
    const instructionsPos =  { x: title2Pos.x, y: lineHeight * SQUARE_SIZE + title2Pos.y };
    const instructionsShadowPos = { x: instructionsPos.x + shadowOffset, y: instructionsPos.y + shadowOffset };


    const title1 = new Text(this.game, "GAME", "#FFFFFF", title1Pos);
    const title1Shadow = new Text(this.game, "GAME", "#000000", title1ShadowPos);
    const title2 = new Text(this.game, "TITLE", "#FFFFFF", title2Pos);
    const title2Shadow = new Text(this.game, "TITLE", "#000000", title2ShadowPos);

    const instructions = new Text(this.game, "TAP TO PLAY", "#FFFFFF", instructionsPos);
    const instructionsShadow = new Text(this.game, "TAP TO PLAY", "#000000", instructionsShadowPos);

    this.game.addOverlayDrawables([
      title1Shadow,
      title2Shadow,
      instructionsShadow,
      title1,
      title2,
      instructions,
    ]);

  }
}
