export default class Player {
  rightPressed = false;
  leftPressed = false;
  shootPressed = false;

  constructor(canvas, velocity, bulletController) {
    this.canvas = canvas;
    this.velocity = velocity;
    this.bulletController = bulletController;

    this.viewX = this.canvas.width / 2;

    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 100;
    this.width = 60;
    this.height = 80;
    this.image = new Image();
    this.image.src = "./mobile_game/images/player.png";

    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  }

  draw(ctx) {
    if (this.shootPressed) {
      this.bulletController.shoot(this.x + this.width / 2, this.y, 4, 20);
    }
    this.move();
    this.collideWithWalls();
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  // Collisions
  collideWithWalls() {
    //left
    if (this.x < 0) {
      this.x = 0;
    }

    //right
    if (this.x > this.canvas.width - this.width) {
      this.x = this.canvas.width - this.width;
    }
  }

  move() {
    if (this.rightPressed) {
      this.x += this.velocity;
      this.viewX = this.x;
      space_x = this.x;
    } else if (this.leftPressed) {
      this.x += -this.velocity;
      this.viewX = this.x;
      space_x = this.x;
    } else if (space_x < this.viewX) {
      space_x = space_x + 3;
      this.x = space_x;
    }
    if (space_x > this.viewX) {
      space_x = space_x - 3;
      this.x = space_x;
    }

    space_x = Math.round(space_x);
  }

  keydown = (event) => {
    if (event.code == "ArrowRight") {
      this.rightPressed = true;
      this.shootPressed = true;
    }
    if (event.code == "ArrowLeft") {
      this.leftPressed = true;
      this.shootPressed = true;
    }
  };

  keyup = (event) => {
    if (event.code == "ArrowRight") {
      this.rightPressed = false;
      this.shootPressed = true;
    }
    if (event.code == "ArrowLeft") {
      this.leftPressed = false;
      this.shootPressed = true;
    }
  };
}

let space_x = window.innerWidth / 2;
