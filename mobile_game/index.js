import EnemyController from "./src/EnemyController.js";
import Player from "./src/Player.js";
import BulletController from "./src/BulletController.js";
import Score from "./src/Score.js";

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext("2d");

// définit la taille du canvas
let viewW
let viewH

function setcanvassize() {
  viewW = window.innerWidth
  viewH = window.innerHeight

  canvas.width = viewW
  canvas.height = viewH
  console.log("canvas size changed to : ", viewW, viewH)
}

const background = new Image();
background.src = "./mobile_game/images/space.png";

const scoreObject = new Score();
const playerBulletController = new BulletController(canvas, 10, "orange", true);
const enemyBulletController = new BulletController(canvas, 4, "red", false);

const enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController,
  scoreObject
);
const player = new Player(canvas, 3, playerBulletController);

// Controle tactile
let touchHandler = function (event) {
  player.shootPressed = true;
  if (event.touches && event.touches[0]) {
    player.viewX = event.touches[0].clientX;
  } else if (event.originalEvent && event.originalEvent.changedTouches[0]) {
    player.viewX = event.originalEvent.changedTouches[0].clientX;
  } else if (event.clientX && event.clientY) {
    player.viewX = event.clientX;
  }

  player.viewX = Math.round(player.viewX);

  if (player.viewX < 0) {
    player.viewX = 0;
  }
  if (player.viewX > canvas.width) {
    player.viewX = canvas.width;
  }
};

window.addEventListener("touchstart", touchHandler, false);
window.addEventListener("touchmove", touchHandler, false);

playerBulletController.setScoreObject(scoreObject);
enemyBulletController.setScoreObject(scoreObject);
enemyController.setScoreObject(scoreObject);

let isGameOver = false;
let didWin = false;

function game() {
  checkGameOver();
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  displayGameOver();
  if (!isGameOver) {
    enemyController.draw(ctx);
    player.draw(ctx);
    playerBulletController.draw(ctx);
    enemyBulletController.draw(ctx);

    // score en haut à gauche
    ctx.fillStyle = "white";
    ctx.font = "20px Bruno Ace SC";
    let scoreText = "Score: " + scoreObject.score;
    ctx.fillText(scoreText, 10, 30);
  }
}

let restart

function displayGameOver() {
  if (isGameOver) {
    // Message fin de partie
    let text = didWin ? "You Win" : "Game Over";

    ctx.fillStyle = "white";
    ctx.font = "40px Bruno Ace SC";
    let textWidth = ctx.measureText(text).width;
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);

    // Bouton restart
    restart = document.getElementById("restart-btn");
    if (!restart) {
      restart = document.createElement("button");
      restart.id = "restart-btn";
      restart.innerText = "Restart";
      restart.style.position = "absolute";
      restart.style.top = canvas.height / 2 + 50 + "px";
      restart.style.left = canvas.width / 2 - 60 + "px";
      document.body.appendChild(restart);
    }

    restart.addEventListener("click", () => { initnewgame() });

    // Score au milieu de l'écran
    ctx.fillStyle = "white";
    ctx.font = "20px Bruno Ace SC";
    let scoreText = "Score: " + scoreObject.score;
    ctx.fillText(scoreText, canvas.width / 2 - 50, canvas.height / 2 + 160);
  }
}

function initnewgame() {
  enemyController.enemyRows = [];
  enemyController.createEnemies();
  playerBulletController.bullets = [];
  enemyBulletController.bullets = [];
  scoreObject.score = 0;
  playerBulletController.bulletColor = "orange";

  player.y = canvas.height - 100

  isGameOver = false;
  didWin = false;

  if (document.contains(document.getElementById("restart-btn"))) {
    document.getElementById("restart-btn").remove();
  }
}

function checkGameOver() {
  if (isGameOver) {
    return;
  }

  if (enemyBulletController.collideWith(player)) {
    isGameOver = true;
    // Sound Game Over
    let audio = new Audio("./mobile_game/sounds/explosion.wav");
    audio.volume = 0.5;
    audio.play();
  }

  if (enemyController.collideWith(player)) {
    isGameOver = true;
    // Sound Game Over
    let audio = new Audio("./mobile_game/sounds/explosion.wav");
    audio.volume = 0.5;
    audio.play();
  }

  if (enemyController.enemyRows.length === 0) {
    didWin = true;
    isGameOver = true;
    // Sound Win
    let audio = new Audio("./mobile_game/sounds/win.wav");
    audio.volume = 0.2;
    audio.play();
  }
}

let interval
let gaming

//Lancer le compte à rebours avant le début de la partie
function lanceur() {
  // Sound comptes à rebours
  let audio = new Audio("./mobile_game/sounds/comptesARebours.wav");
  audio.volume = 0.5;
  audio.play();

  let count = 3;

  interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Bruno Ace SC";
    ctx.fillText(count, canvas.width / 2, canvas.height / 2);
    count--;
    if (count < 0) {
      clearInterval(interval);
      gaming = setInterval(game, 1000 / 60);
    }
  }, 1000);
}

let start
//Lancer le jeu
export function startGame() {
  setcanvassize()
  initnewgame()
  // Message de début de partie
  ctx.fillStyle = "white";
  ctx.font = "38px Bruno Ace SC";
  ctx.fillText("SpaceDiving", (canvas.width / 1.95) - (38 * 3.5), canvas.height / 2.5);

  // Bouton start
  start = document.getElementById("start-btn");
  if (!start) {
    start = document.createElement("button");
    start.id = "start-btn";
    start.innerText = "Start";
    start.style.position = "absolute";
    start.style.top = canvas.height / 2 + 50 + "px";
    start.style.left = canvas.width / 2 - 50 + "px";
    document.body.appendChild(start);
  }

  // Lancer le compte à rebours au click
  start.addEventListener("click", startclick);
}

function startclick() {
  start.removeEventListener("click", startclick);
  lanceur();
  if (document.contains(document.getElementById("start-btn"))) {
    document.getElementById("start-btn").remove();
  }
}

// startGame();

export function stopall() {
  clearInterval(interval)
  clearInterval(gaming)

}
