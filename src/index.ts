/*
TODO
  - sfx
  - readme
  - make house look nicer
  - clouds
  - make sure text comes from player pos in convo
  - make drawingsize a getter? or subclass...
  - panning on convo
  - buddies have two skills
  - logic for when someone runs out of energy
  - special buddy logic
  - some way to know you selected the right thing (fireworks? change color of sky)
  - don't go back to level until floaty text is done animating
  - can touch on non selected texts
  - fix pressting enter bug
  - automatically go to sleep when run out of energy
  - fix walking buddy collision stuff
  - leave convo

BACKBURNER
  - add sun and clouds in convo
  - animate buttons when you press them
  - can probably consolidate a lot of the code around walking
  - add color effects on transition
  - have player be an instance on every level
  - use diff easing function for level transition
  - did I get rowindex/colindex backwards on tile?
  - gamepad

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
