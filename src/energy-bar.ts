import Box from "./box";
import colorMap from "./colors";
import Game from "./game";
import Text from "./text";

import {
  BLINK_DURATION,
  IAnimations,
  IDrawable,
  IPoint,
  ISize,
  SQUARE_SIZE,
} from "./common";

import { animateEnergy } from "./animations";
import { lerp } from "./helpers";

const BLINK_THRESHOLD = 0.2;

export default class EnergyBar implements IDrawable {
  public energyText: Text;
  public game: Game;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize;
  public drawingSize: ISize;
  public visible: boolean = true;
  public percentFull: number = 1.0;
  public lastBlinkAt: number = 0;
  public alpha = 1.0;

  private box: Box;
  private animations: IAnimations = {};

  constructor(game: Game, pos: IPoint, word: string) {
    this.game = game;
    this.energyText = new Text(this.game, word, colorMap[7]);
    this.energyText.shadow = false;

    this.size = Object.assign({}, this.energyText.size);
    this.drawingSize = Object.assign({}, this.energyText.drawingSize);
    this.drawingSize.width = (this.size.width + 1) * this.game.squareSize;
    this.drawingSize.height = (this.size.height + 1) * this.game.squareSize;

    const boxSize = { height: this.size.height + 1, width: this.size.width + 1 };
    this.box = new Box(game, pos, boxSize, colorMap[7]);

    this.animations.level = Object.assign({}, animateEnergy);

    this.move(pos);
  }

  // TODO: check if I can use values
  get animating(): boolean {
    return (Object as any).values(this.animations).find((animation) => animation.running);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    this.box.move(this.pos);
    this.energyText.move({
      x: updatedPos.x + SQUARE_SIZE / 2 + 0.5,
      y: updatedPos.y + SQUARE_SIZE / 2 + 0.5,
    });
  }

  public draw(context, timestamp) {
    this.updateLevel(timestamp);

    this.box.draw(context);
    context.fillStyle = colorMap[1];
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width * this.percentFull, this.drawingSize.height);
    this.energyText.draw(context);
  }

  public animateToLevel(updatedLevel) {
    this.animations.level.startTime = this.game.timestamp;
    this.animations.level.startLevel = this.percentFull;
    this.animations.level.endLevel = updatedLevel;
    this.animations.level.running = true;
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

  private updateLevel(timestamp) {
    if (!this.animations.level.running) return;
    const t = (timestamp - this.animations.level.startTime) / this.animations.level.duration;

    let level = lerp(this.animations.level.startLevel, this.animations.level.endLevel, t);

    if (t >= 1.0) {
      level = this.animations.level.endLevel;
      this.animations.level.running = false;
    }

    this.percentFull = level;
  }
}
