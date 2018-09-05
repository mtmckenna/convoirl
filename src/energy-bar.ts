import Box from "./box";
import colorMap from "./colors";
import Game from "./game";
import Text from "./text";

import {
  IAnimation,
  IAnimations,
  IDrawable,
  IPoint,
  ISize,
  SQUARE_SIZE,
} from "./common";

import { lerp } from "./helpers";

export default class EnergyBar implements IDrawable {
  public energyText: Text;
  public game: Game;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize;
  public drawingSize: ISize;
  public visible: boolean = true;
  public percentFull: number = 0;

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

    const level: IAnimation = {
      duration: 1000,
      endLevel: 0,
      running: false,
      startLevel: 0,
      startTime: 0,
    };

    this.animations.level = level;

    this.move(pos);
  }

  get animating(): boolean {
    const animationArray = Object.keys(this.animations).map((key) => this.animations[key]);
    return !!animationArray.find((animation) => animation.running);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    this.box.move(this.pos);
    this.energyText.move({
      x: Math.floor(updatedPos.x + SQUARE_SIZE / 2 + .5),
      y: Math.floor(updatedPos.y + SQUARE_SIZE / 2 + .5),
    });
  }

  public draw(context, timestamp) {
    this.updateLevel(timestamp);

    this.box.draw(context, timestamp);
    context.fillStyle = colorMap[1];
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width * this.percentFull, this.drawingSize.height);
    this.energyText.draw(context, timestamp);
  }

  public animateToLevel(updatedLevel) {
    this.animations.level.startTime = this.game.timestamp;
    this.animations.level.startLevel = this.percentFull;
    this.animations.level.endLevel = updatedLevel;
    this.animations.level.running = true;
  }

  private updateLevel(timestamp) {
    if (!this.animations.level.running) return;
    const t = (timestamp - this.animations.level.startTime) / this.animations.level.duration;

    let level = lerp(this.animations.level.startLevel, this.animations.level.endLevel, t);

    if (t >= 1) {
      level = this.animations.level.endLevel;
      this.animations.level.running = false;
    }

    this.percentFull = level;
  }
}
