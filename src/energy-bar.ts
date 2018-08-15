import Game from "./game";
import Text from "./text";

import { IDrawable, IPoint, ISize } from "./common";

export default class EnergyBar implements IDrawable {
  public energyText: Text;
  public game: Game;
  public pos: IPoint;
  public size: ISize;
  public drawingSize: ISize;
  public visible: true;

  constructor(game: Game, pos: IPoint) {
    this.game = game;
    this.pos = pos;
    this.energyText = new Text(this.game, "ENERGY", "#000000", { x: this.pos.x , y: this.pos.y });
    this.size = Object.assign({}, this.energyText.size);
    this.drawingSize = Object.assign({}, this.energyText.drawingSize);
  }

  public move(updatedPos: IPoint) {
    this.pos.x = updatedPos.x;
    this.pos.y = updatedPos.y;
    this.energyText.pos.x = updatedPos.x;
    this.energyText.pos.y = updatedPos.y;
  }

  public resize() {
    this.drawingSize.width = this.size.width * this.game.squareSize;
    this.drawingSize.height = this.size.height * this.game.squareSize;
  }

  public draw(context) {
    this.energyText.draw(context);
  }

  public update() {
    return;
  }
}
