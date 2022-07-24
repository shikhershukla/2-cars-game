"use strict";

let leftCar = document.querySelector(".left-car");
let rightCar = document.querySelector(".right-car");
let startScreen = document.querySelector(".startScreen");
let container = document.querySelector(".container");
let left = document.querySelector(".left");
let right = document.querySelector(".right");
let currScore = document.querySelector(".currScore");
let currHighScore = document.querySelector(".currHighScore");

let leftPos = 0; // 0 - left, 1 - right
let rightPos = 1; // 0 - left, 1 - right
let player = { start: false, score: 0, speed: 5, coinsCollected: 0 }; // speed -> obstacle movement speed in pixel
let highScore = 0;
let sp = 70;
let rect = left.getBoundingClientRect();
let width = rect.right - rect.left;

document.addEventListener("click", startGame);

function startGame() {
  startScreen.classList.add("hide");
  player.start = true;
  player.coinsCollected = 0;
  player.score = 0;
  addObstacle();
  gamePlay();
  gamePlay();
  document.removeEventListener("click", startGame);
}

function onKeyDown(event) {
  if (event.key == "ArrowLeft" && leftPos == 0) {
    leftCar.style.animation = "toLeft 0.2s ease-in-out 0s forwards";
    leftPos = 1;
  } else if (event.key == "ArrowLeft" && leftPos == 1) {
    leftCar.style.animation = "toRight 0.2s ease-in-out 0s forwards";
    leftPos = 0;
  }

  if (event.key == "ArrowRight" && rightPos == 0) {
    rightCar.style.animation = "toLeft 0.2s ease-in-out 0s forwards";
    rightPos = 1;
  } else if (event.key == "ArrowRight" && rightPos == 1) {
    rightCar.style.animation = "toRight 0.2s ease-in-out 0s forwards";
    rightPos = 0;
  }
}

document.addEventListener("keydown", onKeyDown);

function generateObstacle() {
  let obstacle = document.createElement("div");
  obstacle.setAttribute("class", "obstacle");
  let img = document.createElement("img");
  obstacle.style.top = 0 + "px";
  let fate = Math.random() / 0.25; // select circle || square , left || right
  fate = Math.ceil(fate);
  if (fate < 3) {
    obstacle.classList.add("circle");
    img.src = "./coin.png";
    img.style.height = "70px";
    img.style.width = "70px";
    obstacle.appendChild(img);
  } else {
    obstacle.classList.add("square");
    img.src = "./obstacle.png";
    img.style.height = "70px";
    img.style.width = "70px";
    obstacle.appendChild(img);
  }
  if (fate % 2 == 0) obstacle.style.left = width / 6 + "px";
  else obstacle.style.left = (4 * width) / 6 + "px";
  return obstacle;
}

function addObstacle() {
  left.appendChild(generateObstacle());
  right.appendChild(generateObstacle());
}

function isCollide(a, b) {
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  );
}
// for experiment
function restart() {
  player.start = false;

  setTimeout(function () {
    document.addEventListener("keydown", onKeyDown);
    startScreen.classList.remove("hide");
    let obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach((obs) => {
      obs.parentNode.removeChild(obs);
    });
    document.addEventListener("click", startGame);
  }, 2000);
}

// const FPS = 10000000;
// let lastTimestamp = 0;

function gamePlay(timestamp) {
  if (!player.start) return;

  // if (timestamp - lastTimestamp < 1000 / FPS) return;
  player.score++;
  // currScore.textContent = player.score;
  // console.log(player.score);
  // if (highScore < player.score) {
  //   highScore = player.score;
  //   currHighScore.textContent = highScore;
  // }
  let obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach(function (obstacle) {
    obstacle.style.top = parseFloat(obstacle.style.top) + player.speed + "px";
    let leftCol = isCollide(leftCar, obstacle);
    let rightCol = isCollide(rightCar, obstacle);
    let col = leftCol || rightCol;
    if (col && obstacle.classList.contains("square")) {
      obstacle.classList.add("collisionSpin");
      document.removeEventListener("keydown", onKeyDown);
      // setTimeout(restart, 500);
      restart();
    } else if (col && obstacle.classList.contains("circle")) {
      player.coinsCollected++;
      currScore.textContent = player.coinsCollected;
      if (highScore < player.coinsCollected) {
        highScore = player.coinsCollected;
        currHighScore.textContent = highScore;
      }
      obstacle.parentNode.removeChild(obstacle);
    }
    if (!isInViewport(obstacle) && obstacle.classList.contains("square")) {
      obstacle.parentNode.removeChild(obstacle);
    } else if (
      !isInViewport(obstacle) &&
      obstacle.classList.contains("circle")
    ) {
      obstacle.classList.add("collisionBlink");
      document.removeEventListener("keydown", onKeyDown);
      restart();
    }
    // player.start = false;
  });
  if (player.score % sp == 0) {
    addObstacle();
  }
  window.requestAnimationFrame(gamePlay);
  // lastTimestamp = timestamp;
  // if (player.score % 1000 == 0 && sp != 50) {
  //   sp -= 10;
  // }
}

// save HS to device, animation blast, see color scheme
