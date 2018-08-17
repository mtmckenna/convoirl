import colorMap from "./colors";
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

  private strokePos: IPoint = { x: 0, y: 0 };

  constructor(game: Game, pos: IPoint) {
    this.game = game;
    this.pos = pos;
    this.energyText = new Text(this.game, "ENERGY", colorMap[7], { x: this.pos.x, y: this.pos.y });
    this.size = Object.assign({}, this.energyText.size);
    this.drawingSize = Object.assign({}, this.energyText.drawingSize);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    // tslint:disable-next-line
    // https://stackoverflow.com/questions/28057881/javascript-either-strokerect-or-fillrect-blurry-depending-on-translation
    this.strokePos.x = Math.floor(this.pos.x) + 0.5;
    this.strokePos.y = Math.floor(this.pos.y) + 0.5;
    this.energyText.pos.x = updatedPos.x + SQUARE_SIZE / 2 + 0.5;
    this.energyText.pos.y = updatedPos.y + SQUARE_SIZE / 2 + 0.5;
  }

  public resize() {
    this.drawingSize.width = (this.size.width + 1) * this.game.squareSize;
    this.drawingSize.height = (this.size.height + 1) * this.game.squareSize;
  }

  public draw(context) {
    this.resize();
    context.fillStyle = colorMap[2];
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width, this.drawingSize.height);
    context.strokeStyle = colorMap[1];
    context.fillStyle = colorMap[1];
    context.lineWidth = SQUARE_SIZE;
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width * this.percentFull, this.drawingSize.height);
    context.strokeRect(this.strokePos.x, this.strokePos.y, this.drawingSize.width, this.drawingSize.height);
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
