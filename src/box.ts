import colorMap from "./colors";
import Game from "./game";

import {
  IDrawable,
  IPoint,
  ISize,
  SQUARE_SIZE,
 } from "./common";

export default class Box implements IDrawable {
  public game: Game;
  public pos: IPoint = { x: 0, y: 0 };
  public size: ISize = { height: SQUARE_SIZE, width: SQUARE_SIZE };
  public drawingSize: ISize;
  public visible: boolean = true;

  private strokePos: IPoint = { x: 0, y: 0 };
  private color: string;

  constructor(game: Game, pos: IPoint, size: ISize, color: string = colorMap[8]) {
    this.game = game;
    this.pos = pos;
    this.size = size;
    this.color = color;
    this.drawingSize = {
      height: this.size.height * this.game.squareSize,
      width: this.size.width * this.game.squareSize,
    };

    this.move(pos);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;

    // tslint:disable-next-line
    // https://stackoverflow.com/questions/28057881/javascript-either-strokerect-or-fillrect-blurry-depending-on-translation
    this.strokePos.x = Math.floor(this.pos.x) + 0.5;
    this.strokePos.y = Math.floor(this.pos.y) + 0.5;
  }

  public updateSize(updatedSize: ISize) {
    this.size.height = updatedSize.height;
    this.size.width = updatedSize.width;
    this.drawingSize.height = this.size.height * this.game.squareSize;
    this.drawingSize.width = this.size.width * this.game.squareSize;
  }

  public draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.pos.x, this.pos.y, this.drawingSize.width, this.drawingSize.height);
    context.strokeStyle = colorMap[1];
    context.fillStyle = colorMap[1];
    context.lineWidth = this.game.squareSize;
    context.strokeRect(this.strokePos.x, this.strokePos.y, this.drawingSize.width, this.drawingSize.height);
  }
}
