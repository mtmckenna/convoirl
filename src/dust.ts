import Game from "./game";

import { IDrawable } from "./common";
import { clerp } from "./helpers";

const GROW_DURATION = 750;
const MIN_SIZE = 1.0;
const MAX_SIZE = 3.0;
const INITIAL_ALPHA = 0.3;

export default class Dust implements IDrawable {
  public game: Game;

  public drawingSize;
  public size = { width: 1, height: 1 };
  public pos = { x: 0, y: 0};
  public color: string = "#ffffff";
  public visible: boolean = false;

  private percentGrown: number = 0.0;
  private startTime: number;

  constructor(game: Game) {
    this.game = game;
    this.drawingSize = {
      height: this.size.height * this.game.squareSize,
      width: this.size.width * this.game.squareSize,
    };
  }

  public reJuice(timestamp: number, x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
    this.percentGrown = 0;
    this.startTime = timestamp;
    this.visible = true;
  }

  public resize() {
    return;
  }

  public update(timestamp: number) {
      if (!this.visible) return;
      this.drawingSize.width = this.size.width * this.game.squareSize;
      this.drawingSize.height = this.size.height * this.game.squareSize;
      this.percentGrown = (timestamp - this.startTime) / GROW_DURATION;
      this.visible = this.percentGrown >= 1.0 ? false : true;
  }

  public draw(context, timestamp) {
    const size = clerp(MIN_SIZE, MAX_SIZE, MIN_SIZE, MAX_SIZE, this.percentGrown);
    const alpha = clerp(INITIAL_ALPHA, 0.0, 0.0, INITIAL_ALPHA, this.percentGrown);

    context.globalAlpha = alpha;
    context.fillStyle = this.color;

    // This sort of makes .drawingSize a lie... maybe make clearer later (haha)?
    context.fillRect(
      -this.drawingSize.width * size / 2.0,
      -this.drawingSize.height * size / 2.0,
      this.drawingSize.width * size,
      this.drawingSize.height * size,
    );

    context.globalAlpha = 1.0;
  }
}
