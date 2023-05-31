
import { device_type } from "../app.js"

// setTimeout( () => {

let game_on = false

// show collisions and debug lines
let show_line = false

let initial_path
if (window.location.pathname.split('/')[1] != "pc_game") {
    initial_path = "./pc_game/"
} else {
    initial_path = "./"
}

const canvas = document.getElementById('gameCanvas')
const c = canvas.getContext("2d")
const audioplay = document.getElementById("audio")

let playlist = ["dooming", "space"]
audioplay.src = initial_path + "music/" + playlist[0] + ".mp3"
audioplay.volume = 0.2

let ad_gun = new Audio(initial_path + "sound/gunshot.mp3")
ad_gun.volume = 0.5

let ad_realod = new Audio(initial_path + "sound/realoding.mp3")
ad_gun.volume = 0.5

window.addEventListener("click", playMusic);

function playMusic() {
    if (device_type == "pc") {
        audioplay.play()
        window.removeEventListener("click", playMusic)
    }
}

//play next song in playlist
let i = 0
audioplay.addEventListener('ended', function () {
    i++;
    if (i == playlist.length) // this is the end of the songs.
    {
        i = 0;
    }
    audioplay.src = initial_path + "music/" + playlist[i] + ".mp3";
    audioplay.load();
    audioplay.play();
}, false);


// renvoi l'angle entre un point A et un point B
function angle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}


// définit la taille du canvas
let viewW
let viewH

function setcanvassize() {
    viewW = window.innerWidth
    viewH = window.innerHeight

    if (viewW > 1024) {
        viewW = 1024
    } if (viewH > 576) {
        viewH = 576
    }

    canvas.width = viewW
    canvas.height = viewH
    // console.log("canvas size changed to : ", viewW, viewH)
}

// renvoi la position de la souris
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// variable par default
let deadman = false
let BulletId = 0
let FireBallId = 0
const gravity = 1
var mousePos = { x: 300, y: canvas.height - 200 }

// gestion du tire
let canshoot = true
let holding = false
let amocount = 20
let reloading = false
let reloadsound = true

// debug de la ligne de direction de visé du joueur
document.addEventListener("mousemove", function line(evt) {
    mousePos = getMousePos(canvas, evt);
}, false)

// définit un joueur
class Player {
    constructor() {
        this.speed = 7
        this.life = 100
        this.position = {
            x: 50,
            y: 50
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.width = 66
        this.height = 150

        this.imgwidth = 66

        this.image = createImage(initial_path + "img/spriteStandRight.png")
        this.frames = 0
        this.sprites = {
            stand: {
                right: createImage(initial_path + "img/spriteStandRight.png"),
                left: createImage(initial_path + "img/spriteStandLeft.png"),
                cropWidth: 177,
                width: 66
            },
            run: {
                right: createImage(initial_path + "img/spriteRunRight.png"),
                left: createImage(initial_path + "img/spriteRunLeft.png"),
                cropWidth: 341,
                width: 127.875
            }
        }

        this.currentSprite = this.sprites.stand.right
        this.currentCropWidth = 177
    }

    draw() {
        let offset = 0
        if (this.imgwidth > this.width) {
            offset = (this.imgwidth / 4)
        }
        c.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x - offset,
            this.position.y,
            this.imgwidth,
            this.height)
        if (show_line) {
            c.beginPath();
            c.rect(this.position.x, this.position.y, this.width, this.height);
            c.stroke();
        }
    }

    update() {
        this.frames++
        if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) {
            this.frames = 0
        } else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) {
            this.frames = 0
        }
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }

        if (this.position.y < 0) {
            this.position.y = 0
            this.velocity.y = 0
        }
    }

}

// définit une platform
class Platform {
    constructor({ x, y, image }) {
        this.position = {
            x,
            y
        }

        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

// définit un objet comme le fond
class GenericObject {
    constructor({ x, y, image }) {
        this.position = {
            x,
            y
        }

        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

// définit une balle
class BulletObject {
    constructor({ id, x, y, image }) {
        this.id = id
        this.position = {
            x,
            y
        }

        this.velocity = 12
        this.rotation = angle(player.position.x + (player.width / 2), player.position.y + (player.height / 3), mousePos.x, mousePos.y)

        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation * Math.PI / 180);
        c.drawImage(this.image, - this.width / 2, - this.height / 2);
        c.restore();
    }

    update() {
        this.draw()
        this.position.x += (this.velocity * Math.cos(this.rotation * Math.PI / 180))
        this.position.y += (this.velocity * Math.sin(this.rotation * Math.PI / 180))
        if (this.position.y > canvas.height + 100 || this.position.x > canvas.width + 100 || this.position.y < -100 || this.position.x < -100) {
            bulletObjects.splice(bulletObjects.indexOf(this), 1)
        }

        monsters.forEach(monster => {
            if (monster.position.x + monster.width >= this.position.x &&
                monster.position.x <= this.position.x + this.width &&
                monster.position.y + monster.height >= this.position.y &&
                monster.position.y <= this.position.y + this.height) {
                this.velocity = 0
                bulletObjects.splice(bulletObjects.indexOf(this), 1)
                monster.life -= 10
            }
        })

        fireBallObjects.forEach(fireBallObject => {
            if (fireBallObject.position.x + fireBallObject.width >= this.position.x &&
                fireBallObject.position.x <= this.position.x + this.width &&
                fireBallObject.position.y + fireBallObject.height >= this.position.y &&
                fireBallObject.position.y <= this.position.y + this.height) {
                this.velocity = 0
                bulletObjects.splice(bulletObjects.indexOf(this), 1)
                fireBallObjects.splice(bulletObjects.indexOf(fireBallObject), 1)
            }
        })

        platforms.forEach(platform => {
            if (platform.position.x + platform.width >= this.position.x - (this.width / 2) &&
                platform.position.x <= this.position.x + (this.width / 2) &&
                platform.position.y + platform.height >= this.position.y - (this.height / 2) &&
                platform.position.y <= this.position.y + (this.height / 2)) {
                this.velocity = 0
                bulletObjects.splice(bulletObjects.indexOf(this), 1)
            }
        });

    }
}

// définit une FireBall
class FireBallObject {
    constructor({ id, x, y, image, monster }) {
        this.id = id
        this.monster = monster
        this.position = {
            x,
            y
        }

        this.velocity = 4
        this.rotation = angle(monster.position.x + (monster.width / 2), monster.position.y + (monster.height / 3), player.position.x + (player.width / 2), player.position.y + (player.height / 3))

        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation * Math.PI / 180);
        c.drawImage(this.image, - this.width / 2, - this.height / 2);
        c.restore();
    }

    update() {
        this.draw()
        this.position.x += (this.velocity * Math.cos(this.rotation * Math.PI / 180))
        this.position.y += (this.velocity * Math.sin(this.rotation * Math.PI / 180))
        if (this.position.y > canvas.height + 100 || this.position.x > canvas.width + 100 || this.position.y < -100 || this.position.x < -100) {
            fireBallObjects.splice(fireBallObjects.indexOf(this), 1)
        }


        if (player.position.x + player.width >= this.position.x - (this.width / 2) &&
            player.position.x <= this.position.x + (this.width / 2) &&
            player.position.y + player.height >= this.position.y - (this.height / 2) &&
            player.position.y <= this.position.y + (this.height / 2)) {
            this.velocity = 0
            fireBallObjects.splice(fireBallObjects.indexOf(this), 1)
            player.life -= 10
        }

        platforms.forEach(platform => {
            if (platform.position.x + platform.width >= this.position.x - (this.width / 2) &&
                platform.position.x <= this.position.x + (this.width / 2) &&
                platform.position.y + platform.height >= this.position.y - (this.height / 2) &&
                platform.position.y <= this.position.y + (this.height / 2)) {
                this.velocity = 0
                fireBallObjects.splice(fireBallObjects.indexOf(this), 1)
            }
        });

    }
}

// définit un monstre
class Monster {
    constructor({ x, y }) {
        this.speed = 7
        this.life = 150
        this.barwidths = 0
        this.position = {
            x: x,
            y: y
        }
        this.velocity = {
            x: 0,
            y: 10
        }

        this.image = createImage(initial_path + "img/greenmonster.png")

        this.width = this.image.width
        this.height = this.image.height

    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)

        // life bar
        this.barwidths = (this.life * 100 / 150);
        c.fillStyle = 'hsla(' + 0 + ', 100%, 40%, 1)';
        c.fillRect(this.position.x + (this.width / 3.5), this.position.y - 10, 100, 10);
        var grad = c.createLinearGradient(0, 0, 0, 130);
        grad.addColorStop(0, "green");
        grad.addColorStop(1, "rgba(18,244,90,1)");
        c.fillStyle = grad;
        c.fillRect(this.position.x + (this.width / 3.5), this.position.y - 10, this.barwidths, 10);

    }

    update() {
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }

        if (this.position.x < -scrollOffset) {
            this.velocity.x = 0
            this.position.x = -scrollOffset
        }

        if (this.life <= 0 || this.position.y < 0) {
            monsters.splice(monsters.indexOf(this), 1)
            new Audio(initial_path + "sound/monster-death.mp3").play()
        }

    }
}

// creer une image
function createImage(imageSrc) {
    const image = new Image()
    image.src = imageSrc
    return image

}

// creation de variable par default
const platformImage = createImage(initial_path + "img/platform.png")
const platformSmallTallImage = createImage(initial_path + "img/platformSmallTall.png")
const platformCube = createImage(initial_path + "img/platformCube.png")

let player = new Player()
let platforms = []
let genericObjects = []
let monsters = []
let bulletObjects = []
let fireBallObjects = []

let lastKey
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
}

let scrollOffset = 0

// initialise le jeu
function init() {

    player = new Player()
    platforms = [
        new Platform({ x: platformImage.width * 1 - 100, y: viewH - 150, image: platformSmallTallImage }),
        new Platform({ x: platformImage.width * 2 - 100, y: viewH - 400, image: platformSmallTallImage }),
        new Platform({ x: -1, y: viewH - 75, image: platformImage }),
        new Platform({ x: platformImage.width - 3, y: viewH - 75, image: platformImage }),
        new Platform({ x: platformImage.width * 2 + 100, y: viewH - 75, image: platformImage }),
        new Platform({ x: platformImage.width * 3 + 300, y: viewH - 75, image: platformImage }),
        new Platform({ x: platformImage.width * 4 + 300 - 2, y: viewH - 75, image: platformImage }),

        new Platform({ x: 400, y: viewH - 300, image: platformCube }),
        new Platform({ x: 1500, y: viewH - 300, image: platformCube })

    ]
    genericObjects = [
        new GenericObject({ x: -1, y: -1, image: createImage(initial_path + "img/background.png") }),
        new GenericObject({ x: 0, y: 0, image: createImage(initial_path + "img/hills.png") })
    ]

    monsters = [
        new Monster({ x: 500, y: 30 })
    ]

    bulletObjects = []

    fireBallObjects = []

    scrollOffset = 0

    canshoot = true
    holding = false
    amocount = 20
    reloading = false
    reloadsound = true
    deadman = false

}

// ai monster
let ai_move = setInterval(function () {
    monsters.forEach(monster => {
        // move
        if (monster.position.x > -viewW / 1.7 && monster.position.x < viewW) {

            if (Math.random() > 0.5) {
                monster.velocity.x = Math.random() * 10
            } else {
                monster.velocity.x = -Math.random() * 10
            }
        } else {
            monster.velocity.x = 0
        }
    })
}, 1000)

let ai_shoot = setInterval(function () {
    monsters.forEach(monster => {
        // shoot
        if (player.position.x - monster.position.x < 800 && player.position.x - monster.position.x > -800) {
            fireBallObjects.push(new FireBallObject({ FireBallId, x: monster.position.x + (monster.width / 2), y: monster.position.y + (monster.height / 3), image: createImage(initial_path + "img/greenball.png"), monster }))
        }
    })
}, 2000)


// loop d'animation
let anim_loop

function loop_game() {
    anim_loop = setInterval(function () {
        animate()
        if (show_line) {
            c.beginPath();
            c.moveTo(player.position.x + (player.width / 2), player.position.y + (player.height / 3));
            c.lineTo(mousePos.x, mousePos.y);
            c.stroke();
        }
    }, 1000 / 60)
}

// animation et update de chaque frame
function animate() {
    c.fillStyle = "white"
    c.fillRect(0, 0, canvas.width, canvas.height)

    genericObjects.forEach(genericObject => {
        genericObject.draw()
    })

    platforms.forEach(platform => {
        platform.draw()
    });

    monsters.forEach(monster => {
        monster.update()
    })

    player.update()

    bulletObjects.forEach(bulletObject => {
        bulletObject.update()
    })

    fireBallObjects.forEach(fireBallObject => {
        fireBallObject.update()
    })

    if (keys.right.pressed && !keys.left.pressed &&
        player.position.x < canvas.width / 2) {
        player.velocity.x = player.speed
    } else if ((keys.left.pressed && !keys.right.pressed &&
        player.position.x > 399) ||
        (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed
    } else {
        player.velocity.x = 0

        if (keys.right.pressed && !keys.left.pressed) {
            scrollOffset += player.speed
            platforms.forEach(platform => {
                platform.position.x -= player.speed
            });
            monsters.forEach(monster => {
                monster.position.x -= player.speed
            })
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66
            })
            bulletObjects.forEach(bulletObject => {
                bulletObject.position.x -= player.speed
            })

            fireBallObjects.forEach(fireBallObject => {
                fireBallObject.position.x -= player.speed
            })
        } else if (keys.left.pressed && !keys.right.pressed && scrollOffset > 0) {
            scrollOffset -= player.speed
            platforms.forEach(platform => {
                platform.position.x += player.speed
            });
            monsters.forEach(monster => {
                monster.position.x += player.speed
            })
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66
            })
            bulletObjects.forEach(bulletObject => {
                bulletObject.position.x += player.speed
            })

            fireBallObjects.forEach(fireBallObject => {
                fireBallObject.position.x += player.speed
            })
        }
    }

    // platform collision detection
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0
        }

        if (player.position.y >= platform.position.y + platform.height &&
            player.position.y + player.velocity.y <= platform.position.y + platform.height &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0
        }

        if (player.position.x + player.width <= platform.position.x &&
            player.position.x + player.width + player.velocity.x >= platform.position.x &&
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height) {
            player.velocity.x = 0
        }

        if (player.position.x >= platform.position.x + platform.width &&
            player.position.x + player.velocity.x <= platform.position.x + platform.width &&
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height) {
            player.velocity.x = 0
        }

        monsters.forEach(monster => {
            if (monster.position.y + monster.height <= platform.position.y &&
                monster.position.y + monster.height + monster.velocity.y >= platform.position.y &&
                monster.position.x + monster.width >= platform.position.x &&
                monster.position.x <= platform.position.x + platform.width) {
                monster.velocity.y = 0
            }

            if (monster.position.y >= platform.position.y + platform.height &&
                monster.position.y + monster.velocity.y <= platform.position.y + platform.height &&
                monster.position.x + monster.width >= platform.position.x &&
                monster.position.x <= platform.position.x + platform.width) {
                monster.velocity.y = 0
            }

            if (monster.position.x + monster.width <= platform.position.x &&
                monster.position.x + monster.width + monster.velocity.x >= platform.position.x &&
                monster.position.y + monster.height >= platform.position.y &&
                monster.position.y <= platform.position.y + platform.height) {
                monster.velocity.x = 0
                monster.position.x -= 10
            }

            if (monster.position.x >= platform.position.x + platform.width &&
                monster.position.x + monster.velocity.x <= platform.position.x + platform.width &&
                monster.position.y + monster.height >= platform.position.y &&
                monster.position.y <= platform.position.y + platform.height) {
                monster.velocity.x = 0
                monster.position.x += 10
            }
        })

    });

    // sprite switching
    if (keys.right.pressed && lastKey === "right" && player.currentSprite != player.sprites.run.right) {
        player.frames = 1
        player.currentSprite = player.sprites.run.right
        player.currentCropWidth = player.sprites.run.cropWidth
        player.imgwidth = player.sprites.run.width
    } else if (keys.left.pressed && lastKey === "left" && player.currentSprite != player.sprites.run.left) {
        player.frames = 1
        player.currentSprite = player.sprites.run.left
        player.currentCropWidth = player.sprites.run.cropWidth
        player.imgwidth = player.sprites.run.width
    } else if (!keys.right.pressed && lastKey === "right" && player.currentSprite != player.sprites.stand.right) {
        player.frames = 1
        player.currentSprite = player.sprites.stand.right
        player.currentCropWidth = player.sprites.stand.cropWidth
        player.imgwidth = player.sprites.stand.width
    } else if (!keys.left.pressed && lastKey === "left" && player.currentSprite != player.sprites.stand.left) {
        player.frames = 1
        player.currentSprite = player.sprites.stand.left
        player.currentCropWidth = player.sprites.stand.cropWidth
        player.imgwidth = player.sprites.stand.width
    }

    // win condition
    if (scrollOffset > platformImage.width * 4 + 100 - 2) {
        console.log("you win")
    }

    // lose condition
    if (player.position.y > canvas.height || player.life <= 0) {
        if (!deadman) {
            deadman = true
            canshoot = false
            new Audio(initial_path + "sound/death.mp3").play()
            setTimeout(() => {
                init()
            }, 1000)
        }

    }

    c.font = '35px serif';
    c.strokeText('🚀:' + amocount + '/20', 10, 45);

}

// init()
// animate()

// gestion des touches
window.addEventListener("keydown", ({ keyCode }) => {
    if (device_type == "pc") {
        //  console.log(keyCode)
        switch (keyCode) {
            case 81:
                // console.log("left")
                keys.left.pressed = true
                lastKey = "left"
                break;
            case 68:
                // console.log("right")
                keys.right.pressed = true
                lastKey = "right"
                break;
            case 90:
                // console.log("up")
                if (player.velocity.y == 0) {
                    player.velocity.y -= 25
                }
                break;
            case 83:
                // console.log("down")
                break;
        }
    }
})

window.addEventListener("keyup", ({ keyCode }) => {
    if (device_type == "pc") {
        //  console.log(keyCode)
        switch (keyCode) {
            case 81:
                // console.log("left")
                keys.left.pressed = false
                break;
            case 68:
                // console.log("right")
                keys.right.pressed = false
                break;
            case 90:
                // console.log("up")
                break;
            case 83:
                // console.log("down")
                break;
        }
    }
})

function firegun() {
    if (canshoot && amocount > 0 && !deadman) {
        amocount--
        bulletObjects.push(new BulletObject({ BulletId, x: player.position.x + (player.width / 2), y: player.position.y + (player.height / 3), image: createImage(initial_path + "img/bullet.png") }))
        BulletId++
        ad_gun.currentTime = 0
        ad_gun.play()
        canshoot = false
        setTimeout(() => {
            if (amocount <= 0) {
                reloading = true
                reloadsound = true
                setTimeout(() => {
                    amocount = 20
                    reloading = false
                    canshoot = true
                }, 2000)
            } else {
                canshoot = true
            }

        }, 115)
    } else if (reloading) {
        if (reloadsound) {
            ad_realod.currentTime = 0
            ad_realod.play()
            reloadsound = false
        }
    }
}

window.addEventListener("mousedown", () => {
    if (device_type == "pc") {
        holding = true
        firegun()
        let fireloop = setInterval(() => {
            if (holding && !deadman) {
                firegun()
            } else {
                clearInterval(fireloop)
            }
        }, 20)
    }
})

window.addEventListener("mouseup", () => {
    if (device_type == "pc") {
        holding = false
    }
})


export function stopGame() {
    if (game_on) {
        audioplay.pause();
        audioplay.currentTime = 0;

        game_on = false
        console.log(j + " game switch to off")
        j++
        // clearInterval(ai_move)
        // clearInterval(ai_shoot)
        clearInterval(anim_loop)

        c.fillStyle = "black"
        c.fillRect(0, 0, canvas.width, canvas.height)
    }
}

let j = 0
export function lauchGame() {
    setcanvassize()
    if (!game_on) {
        if (document.contains(document.getElementById("start-btn"))) {
            document.getElementById("start-btn").remove();
        }
        game_on = true
        console.log(j + " game switch to on")
        j++
        init()
        loop_game()
    }

}





// },1000)