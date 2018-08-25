import colorMap from "../colors";
import Game from "../game";
import Level from "./level";

import Text from "../text";

import Flowers from "../tiles/flowers";
import Grass from "../tiles/grass";
import Green from "../tiles/green";
import Tree from "../tiles/tree";

import { SQUARE_SIZE } from "../common";

const TITLE = "CONVO IRL";
const TAP_TO_PLAY = "TAP TO PLAY";

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

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.addDrawables(this.tiles, 0);
    this.resize();
  }

  public resize() {
    this.addText();
  }

  public handleInput() {
    if (this.game.transitioning) return;
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch() {
    this.handleInput();
  }

  private addText() {
    const shadowOffset = 0.4;
    const title1Pos = { x: SQUARE_SIZE, y: SQUARE_SIZE };
    const title1ShadowPos = { x: title1Pos.x + shadowOffset, y: title1Pos.y + shadowOffset };
    const instructionsPos =  { x: SQUARE_SIZE, y: 50 };
    const instructionsShadowPos = { x: instructionsPos.x + shadowOffset, y: instructionsPos.y + shadowOffset };

    const title1 = new Text(this.game, TITLE, colorMap[1], title1Pos);
    const title1Shadow = new Text(this.game, TITLE, colorMap[0], title1ShadowPos);

    const instructions = new Text(this.game, TAP_TO_PLAY, colorMap[1], instructionsPos);
    const instructionsShadow = new Text(this.game, TAP_TO_PLAY, colorMap[0], instructionsShadowPos);

    this.addOverlayDrawables([
      title1Shadow,
      instructionsShadow,
      title1,
      instructions,
    ]);
  }
}
