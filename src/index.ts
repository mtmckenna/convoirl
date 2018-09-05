/*
TODO
  - sfx
  - readme
  - make house look nicer
  - gamepad
  - clouds
  - make sure text comes from player pos in convo
  - fix weird lines in convo text
  - make drawingsize a getter? or subclass...

BACKBURNER
  - move input stuff into its own class
  - add sun and clouds in convo
  - animate buttons when you press them
  - can probably consolidate a lot of the code around walking
  - add color effects on transition
  - have player be an instance on every level
  - use diff easing function for level transition
  - panning on convo
  - move camera into game
  - did I get rowindex/colindex backwards on tile?

SPACE SAVING THOUGHTS
  - might be able to save space by using gameCoordsFrom/gameSizeFrom
  - dedupe some lerp stuff (buddy/energybar)
  - might be able to remove drawingSize on some things
  - drawingSize for buddy can be hardcoded
  - remove debug
  - conslidate where flooring
  - could reduce common indexes in tiles
  - try closure
  - can replace two phase clerp with some sin stuff?
  - look for private members that can be singletons (all the levels/camera)
*/

import Game from "./game";
import gameLoopFunction from "./game-loop";

import { MS_PER } from "./common";

const canvas: HTMLCanvasElement = document.getElementById("game") as HTMLCanvasElement;

const game: Game = new Game(canvas);
const gameLoop = gameLoopFunction(MS_PER, game.update, game);

let currentTouch: Touch = null;
let touchDown: boolean = false;

function animate(timestamp: number): void {
  if (currentTouch && touchDown) game.handleTouch(currentTouch);
  gameLoop(timestamp);
  game.draw(timestamp);
  requestAnimationFrame(animate);
}

function handleTouchDown(event) {
  handleTouchMove(event);
  touchDown = true;
}

function handleTouchMove(event) {
  let touch: MouseEvent | Touch = event;
  if (event.touches) touch = event.changedTouches[0];
  currentTouch = touch as Touch;
}

function handleTouchUp() {
  currentTouch = null;
  touchDown = false;
}

requestAnimationFrame(animate);

window.addEventListener("resize", () => game.resize());
window.addEventListener("keydown", (event) => game.handleInput(event.key));
window.addEventListener("mousedown", handleTouchDown, false);
window.addEventListener("touchstart", handleTouchDown, false);
window.addEventListener("mouseup", handleTouchUp, false);
window.addEventListener("touchend", handleTouchUp, false);
window.addEventListener("mousemove", handleTouchMove, false);
window.addEventListener("touchmove", handleTouchMove, false);

// Prevent iOS scroll bounce
document.body.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
