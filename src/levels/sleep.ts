import colorMap from "../colors";
import Game from "../game";
import Text from "../text";
import Door from "../tiles/door";
import Level from "./level";

const TEXT = "zzzzzz...";
const SLEEP_DURATION = 1200;

export default class Sleep extends Level {
  protected tileTypeMap = [Door];
  protected tileIndexes = [[]];
  protected text: Text;
  protected startedSleepAt: number = null;

  constructor(game: Game) {
    super(game);
    this.text = new Text(this.game, TEXT, colorMap[1]);
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();
    this.generateTileIndexes();
    this.generateTiles();
    this.moveText();
    this.addDrawables(this.tiles, 0);
    this.addOverlayDrawables([this.text]);
  }

  public handleInput() {
    return;
  }

  public handleTouch() {
    return;
  }

  public levelStarted() {
    this.startedSleepAt = null;
    this.game.player.energy = 1.0;
  }

  public update(timestamp) {
    if (!this.startedSleepAt) this.startedSleepAt = timestamp;
    if (timestamp - this.startedSleepAt > SLEEP_DURATION) {
      this.game.queueNextLevel(this.game.levels.world);
    }
  }

  private moveText() {
    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;

    const textPosX = Math.floor((canvasWidth - this.text.drawingSize.width) / 2);
    const textPosY = Math.floor((canvasHeight - this.text.drawingSize.height) / 2);

    this.text.move({ x: textPosX, y: textPosY });
  }
}
