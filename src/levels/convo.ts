import Level from "./level";

import Box from "../box";
import Buddy from "../buddy";
import colorMap from "../colors";
import Game from "../game";
import Text from "../text";

import Flowers from "../tiles/flowers";
import Green from "../tiles/green";
import Sky from "../tiles/sky";
import Tree from "../tiles/tree";

import { Direction, LINE_HEIGHT, TILE_SIZE } from "../common";
import { randomIndexFromArray } from "../helpers";

const BOX_HEIGHT = 7;
const BUDDY_Y_FROM_BOX = 2 * TILE_SIZE;
const BUDDY_DISTANCE = 4 * TILE_SIZE;
const BOX_X = 2;
const ARROW_SPACING = 2;

export default class Convo extends Level {
  public backgroundColor = colorMap[9];

  protected tileTypeMap = [Green, Flowers, Sky, Tree];
  protected tileIndexes = [[]];

  private box: Box;
  private buddies: Buddy[];
  private upArrow: Text;
  private downArrow: Text;
  private skills: Text[];
  private currentSkillIndex: number = 0;

  constructor(game: Game) {
    super(game);
    this.box = new Box(this.game, { x: 0, y: 0 }, { height: 0, width: 0 });
    this.upArrow = new Text(this.game, "^");
    this.downArrow = new Text(this.game, "_");
  }

  public handleInput() {
    this.game.queueNextLevel(this.game.levels.world);
  }

  public handleTouch(touch) {
    this.handleInput();
  }

  public levelWillStart() {
    this.updateBoxes();

    this.game.player.setConvoMode(true);
    this.game.player.convoLook(Direction.Right);
    const buddy2 = new Buddy(this.game);
    buddy2.setConvoMode(true);

    this.buddies = [this.game.player, buddy2];
    this.skills = this.game.player.skills.map((skillString) => new Text(this.game, skillString));
  }

  public levelStarted() {
    this.moveBuddies();
  }

  public resize() {
    this.configureDrawablesAndUpdateables();
  }

  public configureDrawablesAndUpdateables() {
    super.configureDrawablesAndUpdateables();

    this.updateBoxes();
    this.updateText();
    this.moveBuddies();
    this.generateTileIndexes();
    this.generateTiles();
    this.addDrawables(this.tiles, 0);
    this.addDrawables(this.buddies, 1);
    this.addOverlayDrawables([
      this.box,
      this.upArrow,
      this.downArrow,
      ...this.skills,
    ]);
  }

  protected generateTileIndexes() {
    const sizeInTiles = this.game.sizeInTiles();
    const playerTileIndexY = this.game.player.tileIndex.y;

    // Ground tiles
    this.tileIndexes = new Array(sizeInTiles.height)
      .fill(null).map(() => new Array(sizeInTiles.width)
        .fill(null).map(() => randomIndexFromArray([0, 1]))); // Don't include the sky/tree tile

    // Sky tiles
    for (let i = 0; i < playerTileIndexY; i++) {
      this.tileIndexes[i] = this.tileIndexes[i].map(() => 2);
    }

    // Tree trees
    const treeRow = this.tileIndexes[playerTileIndexY - 1];
    if (treeRow) {
      this.tileIndexes[playerTileIndexY - 1] = treeRow.map(() => 3);
    }
  }

  private moveBuddies() {
    const buddy = this.buddies[1];
    const boxPos = this.game.gameCoordsFromDrawingCoords(this.box.pos);
    const boxSize = this.game.gameSizeFromDrawingSize(this.box.drawingSize);
    const convoWidth = this.game.player.size.width + BUDDY_DISTANCE + buddy.size.width;

    const playerPos = {
      x: boxPos.x + (boxSize.width - convoWidth) / 2,
      y: boxPos.y - BUDDY_Y_FROM_BOX,
    };

    const buddyPos = Object.assign({}, playerPos);
    buddyPos.x += BUDDY_DISTANCE + this.game.player.size.width;

    this.game.player.move(playerPos, false);
    buddy.move(buddyPos, false);
  }

  private updateBoxes() {
    const width = Math.floor(this.game.canvas.width / this.game.squareSize - this.game.squareSize);
    const height = this.game.squareSize * BOX_HEIGHT;
    const y = this.game.canvas.height - height * this.game.squareSize - this.game.squareSize * 2;
    this.box.move({ x: this.game.squareSize * BOX_X, y });
    this.box.updateSize({ height, width });
  }

  private updateText() {
    const spacing = ARROW_SPACING * this.game.squareSize;
    const upX = this.box.pos.x +
    this.box.drawingSize.width -
    this.upArrow.drawingSize.width -
    spacing;

    const upY = Math.floor(this.box.pos.y + this.box.drawingSize.height / 2 - this.upArrow.drawingSize.height / 2);
    const downX = this.box.pos.x + spacing;
    const downY = upY;

    this.upArrow.move({ x: upX, y: upY });
    this.downArrow.move({ x: downX, y: downY });

    this.skills.forEach((skill, index) => {
      const indexDiff = this.currentSkillIndex - index;
      const skillX = Math.floor(
        this.box.pos.x +
        this.box.drawingSize.width / 2 -
        skill.drawingSize.width / 2,
      );

      const skillY = Math.floor(
        this.box.pos.y +
        this.box.drawingSize.height / 2 -
        skill.drawingSize.height / 2 +
        indexDiff * LINE_HEIGHT,
      );

      skill.move({ x: skillX, y: skillY });
      skill.visible = Math.abs(indexDiff) > 1 ? false : true;
    });
  }
}
