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
} from "./common";

import { lerp } from "./helpers";

export default class EnergyBar implements IDrawable {
  public energyText: Text;
  public game: Game;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize;
  public dSize: ISize;
  public visible: boolean = true;
  public percentFull: number = 0;

  private box: Box;
  private a: IAnimations = {};

  constructor(game: Game, pos: IPoint, word: string) {
    this.game = game;
    this.energyText = new Text(this.game, word, colorMap[1]);
    this.energyText.shadow = false;

    this.size = Object.assign({}, this.energyText.size);

    this.dSize = {
      h: (this.size.h + 2) * this.game.ss,
      w: (this.size.w + 2) * this.game.ss,
    };

    const boxSize = { h: this.size.h + 2, w: this.size.w + 2 };
    this.box = new Box(game, pos, boxSize, null);

    const level: IAnimation = {
      duration: 1000,
      endLevel: 0,
      running: false,
      startLevel: 0,
      startTime: 0,
    };

    this.a.level = level;

    this.move(pos);
  }

  get animating(): boolean {
    const animationArray = Object.keys(this.a).map((key) => this.a[key]);
    return !!animationArray.find((animation) => animation.running);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    this.box.move(this.pos);
    this.energyText.move({
      x: updatedPos.x + this.game.ss / 2 + 2.5,
      y: updatedPos.y + this.game.ss / 2 + 2.5,
    });
  }

  public draw(context, timestamp) {
    updateLevel.call(this, timestamp);

    context.globalAlpha = this.game.inTr() ? this.game.nextAlpha : 1;
    context.fillStyle = colorMap[10]; // red
    context.fillRect(this.pos.x, this.pos.y, this.dSize.w, this.dSize.h);
    context.fillStyle = colorMap[7]; // green
    context.fillRect(
      Math.ceil(this.pos.x + 1),
      Math.ceil(this.pos.y + 1),
      Math.floor(Math.max(this.dSize.w * this.percentFull - 2, 0)),
      Math.floor(this.dSize.h - 2),
    );
    this.box.draw(context, timestamp);
    this.energyText.draw(context, timestamp);
  }

  public animateToLevel(updatedLevel) {
    this.a.level.startTime = this.game.tstamp;
    this.a.level.startLevel = this.percentFull;
    this.a.level.endLevel = updatedLevel;
    this.a.level.running = true;
  }
}

function updateLevel(timestamp) {
  if (!this.a.level.running) return;
  const t = (timestamp - this.a.level.startTime) / this.a.level.duration;

  let level = lerp(this.a.level.startLevel, this.a.level.endLevel, t);

  if (t >= 1) {
    level = this.a.level.endLevel;
    this.a.level.running = false;
  }

  this.percentFull = level;
}
