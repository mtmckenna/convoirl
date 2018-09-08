import Game from "./game";

import {
  IDrawable,
  IPoint,
  IPositionable,
  ISize,
} from "./common";

let game: Game;
let shake: IScreenShakeProps;

// Note that a stupid thing I did was make the size/pos of
// camera be the drawing size/pos and not the non-scaled pos...
export default class Camera implements IPositionable {
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize = { width: 0, height: 0 };

  constructor(updatedGame) {
    game = updatedGame;
    this.size = { width: game.canvas.width, height: game.canvas.height };
    shake = {
      amplitude: 0,
      dir: { x: 1, y: 1 },
      pos: { x: 0, y: 0 },
    };
  }

  get offset(): IPoint {
    return {
      x: shake.pos.x + this.pos.x,
      y: shake.pos.y + this.pos.y,
    };
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
  }

  public moveToPlayer(drawable: IDrawable): void {
    this.pos.x = game.canvas.width / 2 -
      drawable.pos.x * game.ss -
      drawable.drawingSize.width / 2;

    this.pos.y = game.canvas.height / 2 -
      drawable.pos.y * game.ss -
      drawable.drawingSize.height / 2;

    // Stop camera at edges of level size
    const leftStop = 0;
    const rightStop = -1 * (game.currentLevel.drawingSize.width - this.size.width);
    const topStop = 0;
    const bottomStop = -1 * (game.currentLevel.drawingSize.height - this.size.height);
    if (this.pos.x > leftStop) this.pos.x = leftStop;
    if (this.pos.x < rightStop) this.pos.x = rightStop;
    if (this.pos.y > topStop) this.pos.y = topStop;
    if (this.pos.y < bottomStop) this.pos.y = bottomStop;
  }

  public shakeScreen(): void {
    shake.pos = { x: 0, y: 0 };
    shake.amplitude = 10 * game.ss;
    shake.dir.x = oneOrMinusOne();
    shake.dir.y = oneOrMinusOne();
  }

  public updateScreenShake(timestamp): void {
    shake.amplitude *= .9;
    const { amplitude, dir } = shake;

    if (Math.abs(amplitude) <= .01) {
      shake.pos.x = 0;
      shake.pos.y = 0;
    } else {
      shake.pos.x = Math.sin(timestamp / 50) * amplitude * dir.x;
      shake.pos.y = Math.sin(timestamp / 50) * amplitude * dir.y;
    }
  }
}

function oneOrMinusOne(): number {
  return Math.round(Math.random()) * 2 - 1;
}

interface IScreenShakeProps {
  pos: IPoint;
  dir: IPoint;
  amplitude: number;
}
