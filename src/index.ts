/*
TODO
  - sfx
  - readme
  - make house look nicer
  - clouds
  - panning on convo
  - logic for when someone runs out of energy
  - special buddy logic
  - some way to know you selected the right thing (fireworks? change color of sky)
  - can touch on non selected texts
  - fix walking buddy collision stuff
  - fix holding down the touch as you walk
  - slightly delay on showing text on load

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
  - make drawingsize a getter? or subclass...
  - might be able to save space by using gameCoordsFrom/gameSizeFrom
  - dedupe some lerp stuff (buddy/energybar)
  - might be able to remove drawingSize on some things
  - drawingSize for buddy can be hardcoded
  - could reduce common indexes in tiles
  - try closure
  - look for private members that can be singletons (all the levels/camera)
  - maybe remove either levelwillstart or levelstarted?
  - rename drawingsize?
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
  event.preventDefault(); // Prevent iOS scroll bounce
  let touch: MouseEvent | Touch = event;
  if (event.touches) touch = event.changedTouches[0];
  currentTouch = touch as Touch;
}

function handleTouchUp() {
  currentTouch = null;
  touchDown = false;
}

requestAnimationFrame(animate);

window.onresize = game.resize.bind(game);
window.onkeydown = game.handleInput.bind(game);
window.onmousedown = handleTouchDown;
window.ontouchstart = handleTouchDown;
window.onmouseup = handleTouchUp;
window.ontouchend = handleTouchUp;
window.onmousemove = handleTouchMove;
window.addEventListener("touchmove", handleTouchMove, { passive: false });
