"use strict";

class Game {
    constructor() {
        this.leftCar = document.querySelector(".left-car");
        this.rightCar = document.querySelector(".right-car");
        this.startScreen = document.querySelector(".startScreen");
        this.gameOverScreen = document.querySelector(".gameOverScreen");
        this.finalScoreElement = document.querySelector(".finalScore");
        this.playAgainBtn = document.querySelector(".playAgainBtn");
        this.container = document.querySelector(".container");
        this.leftRoad = document.querySelector(".left");
        this.rightRoad = document.querySelector(".right");
        this.scoreElement = document.querySelector(".currScore");
        this.highScoreElement = document.querySelector(".currHighScore");

        this.player = {
            start: false,
            score: 0,
            speed: 5,
            // shieldActive: false,
            // speedBoostActive: false,
            // coinMagnetActive: false,
            // powerUpDuration: 5000, // 5 seconds
        };
        this.highScore = 0;
        this.obstacleSpawnRate = 70;
        this.roadWidth = this.leftRoad.getBoundingClientRect().width;

        this.leftCarPos = 0; // 0 - left, 1 - right
        this.rightCarPos = 1; // 0 - left, 1 - right

        this.obstacles = [];

        document.addEventListener("click", this.startGame.bind(this));
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
        this.playAgainBtn.addEventListener("click", this.startGame.bind(this));

        this.minObstacleGap = 300; // Minimum vertical pixel gap between obstacles

        this.lastObstacleTimestamp = 0;

        // Sound effects
        this.coinSound = new Audio('coin.mp3');
        this.carMoveSound = new Audio('car_move.mp3');
        this.crashSound = new Audio('crash.mp3');
    }

    async playSound(sound) {
        sound.currentTime = 0;
        try {
            await sound.play();
        } catch (err) {
            if (err.name !== 'NotSupportedError') {
                console.error("Error playing sound:", err);
            }
        }
    }

    startGame() {
        if (this.player.start) return;

        this.startScreen.classList.add("hide");
        this.gameOverScreen.classList.add("hide");
        this.player.start = true;
        this.player.score = 0;
        this.scoreElement.textContent = 0;
        this.obstacles.forEach(obstacle => obstacle.element.remove());
        this.obstacles = [];
        this.leftCar.classList.remove("crash");
        this.rightCar.classList.remove("crash");
        this.lastTimestamp = 0;
        this.lastObstacleTimestamp = 0;
        this.gameReady = false;

        setTimeout(() => {
            this.gameReady = true;
        }, 1000); // 1-second delay

        window.requestAnimationFrame(this.gamePlay.bind(this));
    }

    handleKeyPress(event) {
        if (!this.player.start) {
            if (event.key === "Enter" || event.key === " ") {
                this.startGame();
            }
            return;
        }

        if (event.key === "ArrowLeft") {
            this.leftCarPos = 1 - this.leftCarPos;
            this.updateCarPosition(this.leftCar, this.leftCarPos);
            this.playSound(this.carMoveSound);
        }

        if (event.key === "ArrowRight") {
            this.rightCarPos = 1 - this.rightCarPos;
            this.updateCarPosition(this.rightCar, this.rightCarPos);
            this.playSound(this.carMoveSound);
        }
    }

    updateCarPosition(car, pos) {
        if (pos === 0) {
            car.style.left = "25%";
        } else {
            car.style.left = "75%";
        }
    }

    addObstacle() {
        const obstacleType = Math.random();
        let isCoin = false;
        let isPowerUp = false;
        let powerUpType = null;
        let obstacle;

        if (obstacleType < 0.4) { // 40% chance for coin
            isCoin = true;
        } else if (obstacleType < 0.6) { // 20% chance for power-up
            // isPowerUp = true;
            // const powerUpRandom = Math.random();
            // if (powerUpRandom < 0.33) {
            //     powerUpType = 'shield';
            // } else if (powerUpRandom < 0.66) {
            //     powerUpType = 'speedBoost';
            // } else {
            //     powerUpType = 'coinMagnet';
            // }
        } else if (obstacleType < 0.7) { // 10% chance for large obstacle
            obstacle = new Obstacle(false, null, this.roadWidth, this.player.speed, false, null, 'large');
            this.obstacles.push(obstacle);
            this.container.appendChild(obstacle.element);
            return; // Done with large obstacle
        }

        // For normal obstacles
        const position = Math.random() < 0.5 ? 0 : 1; // 0 for left, 1 for right
        const targetRoad = Math.random() < 0.5 ? this.leftRoad : this.rightRoad;

        obstacle = new Obstacle(isCoin, position, this.roadWidth, this.player.speed, isPowerUp, powerUpType);
        obstacle.road = targetRoad === this.leftRoad ? 'left' : 'right'; // Store the road

        this.obstacles.push(obstacle);
        targetRoad.appendChild(obstacle.element);
    }

    isCollide(a, b) {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return !(
            aRect.bottom < bRect.top ||
            aRect.top > bRect.bottom ||
            aRect.right < bRect.left ||
            aRect.left > bRect.right
        );
    }

    gameOver(crashedCar) {
        this.player.start = false;
        this.gameOverScreen.classList.remove("hide");
        this.finalScoreElement.textContent = this.player.score;
        crashedCar.classList.add("crash");
        this.playSound(this.crashSound);
        
        // Add screen shake effect
        this.container.classList.add("shake");
        // Remove the shake class after animation completes (0.5s match CSS)
        setTimeout(() => {
            this.container.classList.remove("shake");
        }, 500);
    }

    activatePowerUp(type) {
        /*
        switch (type) {
            case 'shield':
                this.player.shieldActive = true;
                // Add visual indicator for shield
                setTimeout(() => {
                    this.player.shieldActive = false;
                    // Remove visual indicator for shield
                }, this.player.powerUpDuration);
                break;
            case 'speedBoost':
                this.player.speedBoostActive = true;
                this.player.speed *= 2; // Double speed temporarily
                // Add visual indicator for speed boost
                setTimeout(() => {
                    this.player.speedBoostActive = false;
                    this.player.speed /= 2; // Revert speed
                    // Remove visual indicator for speed boost
                }, this.player.powerUpDuration);
                break;
            case 'coinMagnet':
                this.player.coinMagnetActive = true;
                // Add visual indicator for coin magnet
                setTimeout(() => {
                    this.player.coinMagnetActive = false;
                    // Remove visual indicator for coin magnet
                }, this.player.powerUpDuration);
                break;
        }
        */
    }

    gamePlay(timestamp) {
        if (!this.player.start) return;

        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        this.obstacles.forEach((obstacle, index) => {
            obstacle.update(deltaTime, this.player.speed);

            // Coin magnet effect
            /*
            if (this.player.coinMagnetActive && obstacle.isCoin) {
                const car = obstacle.road === 'left' ? this.leftCar : this.rightCar;
                const carRect = car.getBoundingClientRect();
                const obstacleRect = obstacle.element.getBoundingClientRect();

                const distanceX = Math.abs((carRect.left + carRect.right) / 2 - (obstacleRect.left + obstacleRect.right) / 2);
                const distanceY = Math.abs((carRect.top + carRect.bottom) / 2 - (obstacleRect.top + obstacleRect.bottom) / 2);

                const magnetRadius = 150; // Adjust as needed

                if (distanceX < magnetRadius && distanceY < magnetRadius) {
                    this.player.score++;
                    this.scoreElement.textContent = this.player.score;
                    if (this.player.score > this.highScore) {
                        this.highScore = this.player.score;
                        this.highScoreElement.textContent = this.highScore;
                    }
                    this.playSound(this.coinSound);
                    obstacle.element.remove();
                    this.obstacles.splice(index, 1);
                    return; // Skip further processing for this obstacle
                }
            }
            */

            const leftCollision = this.isCollide(this.leftCar, obstacle.element);
            const rightCollision = this.isCollide(this.rightCar, obstacle.element);

            if (leftCollision || rightCollision) {
                if (obstacle.isCoin) {
                    this.player.score++;
                    this.scoreElement.textContent = this.player.score;
                    if (this.player.score > this.highScore) {
                        this.highScore = this.player.score;
                        this.highScoreElement.textContent = this.highScore;
                    }
                    this.playSound(this.coinSound);
                    obstacle.element.remove();
                    this.obstacles.splice(index, 1);
                } else if (obstacle.isPowerUp) {
                    // this.playSound(this.coinSound); // Use coin sound for power-up collection for now
                    // this.activatePowerUp(obstacle.powerUpType);
                    // obstacle.element.remove();
                    // this.obstacles.splice(index, 1);
                } else {
                    // if (this.player.shieldActive) {
                    //     obstacle.element.remove();
                    //     this.obstacles.splice(index, 1);
                    //     this.player.shieldActive = false; // Shield used up
                    // } else {
                        this.gameOver(leftCollision ? this.leftCar : this.rightCar);
                    // }
                }
            }

            if (obstacle.isOffScreen()) {
                if (obstacle.isCoin) {
                    this.gameOver(this.leftCar); // Or right car, doesn't matter
                } else {
                    obstacle.element.remove();
                    this.obstacles.splice(index, 1);
                }
            }
        });

        // Increase difficulty based on score
        this.player.speed = 5 + Math.floor(this.player.score / 10); // Increase speed every 10 points
        this.obstacleSpawnRate = 70 - Math.floor(this.player.score / 5); // Decrease spawn rate every 5 points
        if (this.obstacleSpawnRate < 20) this.obstacleSpawnRate = 20; // Cap spawn rate

        if (!this.gameReady) {
            window.requestAnimationFrame(this.gamePlay.bind(this));
            return;
        }

        if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].element.getBoundingClientRect().top > this.minObstacleGap) {
            if (Math.random() * 100 < (100 - this.obstacleSpawnRate)) { // Adjust spawn probability as needed
                this.addObstacle();
            }
        }

        window.requestAnimationFrame(this.gamePlay.bind(this));
    }
}

class Obstacle {
    constructor(isCoin, position, roadWidth, speed, isPowerUp = false, powerUpType = null, obstacleType = 'normal') {
        this.isCoin = isCoin;
        this.position = position;
        this.speed = speed;
        this.roadWidth = roadWidth;
        this.isPowerUp = isPowerUp;
        this.powerUpType = powerUpType;
        this.obstacleType = obstacleType;

        this.element = document.createElement("div");
        this.element.classList.add("obstacle");
        this.element.style.top = "0px";

        const img = document.createElement("img");
        if (isCoin) {
            this.element.classList.add("circle");
            img.src = "./coin.svg";
        } else if (isPowerUp) {
            // this.element.classList.add("power-up");
            // img.src = `./${powerUpType}.svg`;
        } else {
            this.element.classList.add("square");
            img.src = "./obstacle.svg";
        }

        let obstacleWidth = 70;
        if (this.obstacleType === 'large') {
            this.element.classList.add('large-obstacle');
            obstacleWidth = 150;
            img.src = "./obstacle.svg";
        }

        img.style.width = obstacleWidth + "px";
        img.style.height = "70px";
        this.element.appendChild(img);

        if (this.obstacleType === 'large') {
            // Center large obstacles in the container (2 roads)
            this.element.style.left = this.roadWidth - (obstacleWidth / 2) + "px";
        } else if (position === 0) {
            // Left lane
            this.element.style.left = this.roadWidth / 6 + "px";
        } else if (position === 1) {
            // Right lane
            this.element.style.left = (4 * this.roadWidth) / 6 + "px";
        }
    }

    update(deltaTime, gameSpeed) {
        const currentTop = parseFloat(this.element.style.top);
        this.element.style.top = currentTop + (gameSpeed * 100 * deltaTime) + "px";
    }

    isOffScreen() {
        return this.element.getBoundingClientRect().top > window.innerHeight;
    }
}

new Game();