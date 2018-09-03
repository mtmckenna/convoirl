/*
TODO
  - add mouths
  - sfx
  - readme
  - make house look nicer
  - gamepad
  - clouds
  - make drawingsize a getter? or subclass...

BACKBURNER
  - npcs can walk around
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
*/

import Camera from "./camera";
import Game from "./game";
import gameLoopFunction from "./game-loop";

import { MS_PER, SQUARE_SIZE, TS } from "./common";

import StartScreen from "./levels/start-screen";

const gameLoop = gameLoopFunction(MS_PER, update, this);
const canvas: HTMLCanvasElement = document.getElementById("game") as HTMLCanvasElement;

const game: Game = new Game(canvas);
const camera: Camera = new Camera(game);
const sideLength: number = 16 * TS * SQUARE_SIZE;

let width: number = sideLength;
let height: number = sideLength;
let currentTouch: Touch = null;
let touchDown: boolean = false;
let booted: boolean = false;

game.camera = camera;

function resize() {
  const aspectRatio = window.innerWidth / window.innerHeight;

  if (aspectRatio >= 1) {
    width = sideLength;
    height = width / aspectRatio;
  } else {
    height = sideLength;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;
  camera.size = { width: canvas.width, height: canvas.height };
  game.resize();
}

function update(timestamp: number): void {
  if (!booted) {
    game.boot(timestamp);
    resize();
    booted = true;
  }

  game.update(timestamp);

  if (game.currentLevel === game.levels.startScreen) {
    const level = game.levels.startScreen as StartScreen;
    camera.pos.x -= level.panDirection * 0.05;
    if (camera.pos.x < -game.canvas.width) level.panDirection = -1;
    if (camera.pos.x > 0) level.panDirection = 1;
  } else {
    camera.move(game.player);
  }
}

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

window.addEventListener("resize", () => resize());
window.addEventListener("keydown", (event) => game.handleInput(event.key));
window.addEventListener("mousedown", handleTouchDown, false);
window.addEventListener("touchstart", handleTouchDown, false);
window.addEventListener("mouseup", handleTouchUp, false);
window.addEventListener("touchend", handleTouchUp, false);
window.addEventListener("mousemove", handleTouchMove, false);
window.addEventListener("touchmove", handleTouchMove, false);

// Prevent iOS scroll bounce
document.body.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
