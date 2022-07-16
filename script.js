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
let player = { start: false, score: 0, speed: 5 }; // speed -> obstacle movement speed in pixel
let highScore = 0;
let sp = 70;
let rect = left.getBoundingClientRect();
// console.log(rect.top, rect.right, rect.bottom, rect.left);
let width = rect.right - rect.left;

document.addEventListener("keydown", function (event) {
  //   console.log(event.key);
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
});

function generateObstacle() {
  let obstacle = document.createElement("div");
  obstacle.setAttribute("class", "obstacle");
  obstacle.style.top = 0 + "px";
  let fate = Math.random() / 0.25; // select circle || square , left || right
  fate = Math.ceil(fate);
  if (fate < 3) obstacle.classList.add("circle");
  else obstacle.classList.add("square");
  if (fate % 2 == 0) obstacle.style.left = width / 6 + "px";
  else obstacle.style.left = (4 * width) / 6 + "px";
  return obstacle;
}

function addObstacle() {
  left.appendChild(generateObstacle());
  right.appendChild(generateObstacle());
}

document.addEventListener("click", function () {
  startScreen.classList.add("hide");
  player.start = true;
  player.score = 0;
  addObstacle();
  gamePlay();
});

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

function restart() {
  startScreen.classList.remove("hide");
  player.start = false;
  let obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obs) => {
    obs.parentNode.removeChild(obs);
  });
}

function gamePlay() {
  if (player.start) {
    player.score++;
    currScore.textContent = player.score;
    // console.log(player.score);
    if (highScore < player.score) {
      highScore = player.score;
      currHighScore.textContent = highScore;
    }
    let obstacles = document.querySelectorAll(".obstacle");
    obstacles.forEach(function (obstacle) {
      obstacle.style.top = parseFloat(obstacle.style.top) + player.speed + "px";
      let leftCol = isCollide(leftCar, obstacle);
      let rightCol = isCollide(rightCar, obstacle);
      let col = leftCol || rightCol;
      if (col && obstacle.classList.contains("square")) {
        restart();
      } else if (col && obstacle.classList.contains("circle")) {
        obstacle.parentNode.removeChild(obstacle);
      }
      if (!isInViewport(obstacle) && obstacle.classList.contains("square")) {
        obstacle.parentNode.removeChild(obstacle);
      } else if (!isInViewport(obstacle) && obstacle.classList.contains("circle")) 
      restart();
        // player.start = false;
    });
    window.requestAnimationFrame(gamePlay);
    if (player.score % sp == 0) {
      addObstacle();
    }
    // if (player.score % 1000 == 0 && sp != 50) {
    //   sp -= 10;
    // }
  }
}

// end game, restart, save HS to device, animation blast, see color scheme
