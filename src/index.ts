/* TODO
  - add NPCs
  - add battle level
  - put tinymusic in
  - animate trees/flowers
  - house recharges energy
  - make house look nicer
  - add menu on battle
  - move overlay stuff into drawables on transition
  - color effects
  - floaty things
  - clouds
  - add day/night
  - gamepad
  - birds
  - shadows
  - change green into empty tiles
  - if blocked, have mouse go other direction
  - fix text centering
  - change from scaling squares to screenshot plus zoom
*/

import Camera from "./camera";
import Game from "./game";
import gameLoopFunction from "./game-loop";

import { HALF_TILE_SIZE, MS_PER_UPDATE, SQUARE_SIZE  } from "./common";

const gameLoop = gameLoopFunction(MS_PER_UPDATE, update, this);
const canvas: HTMLCanvasElement = document.getElementById("game") as HTMLCanvasElement;

const game: Game = new Game(canvas);
const camera: Camera = new Camera(game);
const sideLength: number = 128 * SQUARE_SIZE;

let width: number = sideLength;
let height: number = sideLength;
let currentTouch: Touch = null;
let touchDown: boolean = false;

game.camera = camera;

const keyActions = {
  s: camera.shakeScreen.bind(camera),
  t: () => game.queueNextLevel(game.levels.world),
};

function resize() {
  const aspectRatio = window.innerWidth / window.innerHeight;

  if (aspectRatio >= 1.0) {
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
  game.update(timestamp);
  camera.move(game.player);
}

function animate(timestamp: number): void {
  game.timestamp = timestamp;
  if (currentTouch && touchDown) walkBasedOnTouch(currentTouch);
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

function walkBasedOnTouch(touch: Touch) {
  const offset = camera.offset;
  const tapXInCameraSpace = touch.clientX * width / window.innerWidth - offset.x;
  const tapYInCameraSpace = touch.clientY * height / window.innerHeight - offset.y;
  const horizontalDistance = tapXInCameraSpace - game.player.pos.x * game.squareSize;
  const verticalDistance = tapYInCameraSpace - game.player.pos.y * game.squareSize;
  const absHorizontalDistance = Math.abs(horizontalDistance);
  const absVerticalDistance = Math.abs(verticalDistance);
  const minMoveTheshold = game.squareSize * HALF_TILE_SIZE;

  if (absHorizontalDistance < minMoveTheshold && absVerticalDistance < minMoveTheshold) return;

  if (absHorizontalDistance > absVerticalDistance) {
    if (horizontalDistance > 0) {
      game.handleInput("ArrowRight");
    } else {
      game.handleInput("ArrowLeft");
    }
  } else {
    if (verticalDistance > 0 ) {
      game.handleInput("ArrowDown");
    } else {
      game.handleInput("ArrowUp");
    }
  }
}

resize();
requestAnimationFrame(animate);

window.addEventListener("resize", () => resize());

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (keyActions[key]) {
    keyActions[key]();
  } else {
    game.handleInput(key);
  }
});

window.addEventListener("mousedown", handleTouchDown, false);
window.addEventListener("touchstart", handleTouchDown, false);
window.addEventListener("mouseup", handleTouchUp, false);
window.addEventListener("touchend", handleTouchUp, false);
window.addEventListener("mousemove", handleTouchMove, false);
window.addEventListener("touchmove", handleTouchMove, false);

// Prevent iOS scroll bounce
document.body.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
