import colorMap from "./colors";
import Game from "./game";

import { IDrawable, IFadeable, IUpdateable } from "./common";
import { clerp } from "./helpers";

export default class Dust implements IDrawable, IFadeable, IUpdateable {
  public game: Game;

  public drawingSize;
  public size = { width: 1, height: 1 };
  public pos = { x: 0, y: 0 };
  public color: string = colorMap[1];
  public visible: boolean = false;
  public alpha = 1;

  private percentGrown: number = 0;
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

  public update(timestamp: number) {
      if (!this.visible) return;
      this.percentGrown = (timestamp - this.startTime) / 1500;
      this.visible = this.percentGrown >= 1 ? false : true;
      this.alpha = clerp(.3, 0, 0, .3, this.percentGrown);
  }

  public draw(context) {
    const size = clerp(1, 3, 1, 3, this.percentGrown);
    context.globalAlpha = this.alpha;
    context.fillStyle = this.color;

    // TOOO: This sort of makes .drawingSize a lie... maybe make clearer later (haha)?
    context.fillRect(
      -this.drawingSize.width * size / 2,
      -this.drawingSize.height * size / 2,
      this.drawingSize.width * size,
      this.drawingSize.height * size,
    );
  }
}
