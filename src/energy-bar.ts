import Game from "./game";
import Text from "./text";

import { IDrawable, IPoint, ISize, SQUARE_SIZE } from "./common";

const BLINK_THRESHOLD = 0.2;
const BLINK_DURATION = 500;

export default class EnergyBar implements IDrawable {
  public energyText: Text;
  public game: Game;
  public pos: IPoint;
  public size: ISize;
  public drawingSize: ISize;
  public visible: boolean = true;
  public percentFull: number = 0.60;
  public lastBlinkAt: number = 0;

  constructor(game: Game, pos: IPoint) {
    this.game = game;
    this.pos = pos;
    this.energyText = new Text(this.game, "ENERGY", "#3e625e", { x: this.pos.x, y: this.pos.y });
    this.size = Object.assign({}, this.energyText.size);
    this.drawingSize = Object.assign({}, this.energyText.drawingSize);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
    this.energyText.pos.x = updatedPos.x + SQUARE_SIZE;
    this.energyText.pos.y = updatedPos.y + SQUARE_SIZE;
  }

  public resize() {
    this.drawingSize.width = (this.size.width + 2) * this.game.squareSize;
    this.drawingSize.height = (this.size.height + 2) * this.game.squareSize;
  }

  public draw(context) {
    context.strokeStyle = "#ffffff";
    context.fillStyle = "#ffffff";
    context.lineWidth = SQUARE_SIZE;
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width * this.percentFull, this.drawingSize.height);
    context.strokeRect(this.pos.x, this.pos.y, this.drawingSize.width, this.drawingSize.height);
    this.energyText.draw(context);
  }

  public update(timestamp) {
    if (this.percentFull > BLINK_THRESHOLD) {
      this.visible = true;
      return;
    }

    if (timestamp - this.lastBlinkAt > BLINK_DURATION) {
      this.visible = !this.visible;
      this.lastBlinkAt = timestamp;
    }
  }
}
