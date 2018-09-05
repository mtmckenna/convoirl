import Buddy from "./buddy";
import Game from "./game";

import {
  IDrawable,
  IPoint,
  IPositionable,
  ISize,
} from "./common";

import { oneOrMinusOne } from "./helpers";

// Note that a stupid thing I did was make the size/pos of
// camera be the drawing size/pos and not the non-scaled pos...
export default class Camera implements IPositionable {
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize = { width: 0, height: 0 };

  private game: Game;
  private shake: IScreenShakeProps;

  constructor(game) {
    this.game = game;
    this.size = { width: game.canvas.width, height: game.canvas.height };
    this.shake = {
      amplitude: 0,
      dir: { x: 1, y: 1 },
      pos: { x: 0, y: 0 },
    };
  }

  get offset(): IPoint {
    return {
      x: this.shake.pos.x + this.pos.x,
      y: this.shake.pos.y + this.pos.y,
    };
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
  }

  public moveToPlayer(drawable: IDrawable): void {
    this.pos.x = this.game.canvas.width / 2 -
      drawable.pos.x * this.game.squareSize -
      drawable.drawingSize.width / 2;

    this.pos.y = this.game.canvas.height / 2 -
      drawable.pos.y * this.game.squareSize -
      drawable.drawingSize.height / 2;

    // Stop camera at edges of level size
    const leftStop = 0;
    const rightStop = -1 * (this.game.currentLevel.drawingSize.width - this.size.width);
    const topStop = 0;
    const bottomStop = -1 * (this.game.currentLevel.drawingSize.height - this.size.height);
    if (this.pos.x > leftStop) this.pos.x = leftStop;
    if (this.pos.x < rightStop) this.pos.x = rightStop;
    if (this.pos.y > topStop) this.pos.y = topStop;
    if (this.pos.y < bottomStop) this.pos.y = bottomStop;
  }

  public shakeScreen(): void {
    this.shake.pos = { x: 0, y: 0 };
    this.shake.amplitude = 10 * this.game.squareSize;
    this.shake.dir.x = oneOrMinusOne();
    this.shake.dir.y = oneOrMinusOne();
  }

  public updateScreenShake(timestamp): void {
    this.shake.amplitude *= .9;
    const { amplitude, dir } = this.shake;

    if (Math.abs(amplitude) <= .01) {
      this.shake.pos.x = 0;
      this.shake.pos.y = 0;
    } else {
      this.shake.pos.x = Math.sin(timestamp / 50) * amplitude * dir.x;
      this.shake.pos.y = Math.sin(timestamp / 50) * amplitude * dir.y;
    }
  }
}

interface IScreenShakeProps {
  pos: IPoint;
  dir: IPoint;
  amplitude: number;
}
