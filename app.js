
import { stopGame } from "./pc_game/index.js";
import { lauchGame } from "./pc_game/index.js";

import { stopall } from "./mobile_game/index.js";
import { startGame } from "./mobile_game/index.js";

const game_js = document.getElementById("game_js")
var head = document.head;
var script;

const mobile_only = document.getElementById("mobile_only");
const tablet_only = document.getElementById("tablet_only");
const pc_only = document.getElementById("pc_only");

export let device_type = "pc";

window.onresize = setdisplay;
window.onload = setdisplay;

function setdisplay() {
    if (window.innerWidth <= window.innerHeight) {
        mobile_only.style.display = "block"
        tablet_only.style.display = "none"
        pc_only.style.display = "none"
        device_type = "mobile"
    } else if (window.innerWidth <= 1180 && window.innerHeight <= 820) {
        mobile_only.style.display = "none"
        tablet_only.style.display = "block"
        pc_only.style.display = "none"
        device_type = "tablet"
    } else {
        mobile_only.style.display = "none"
        tablet_only.style.display = "none"
        pc_only.style.display = "block"
        device_type = "pc"
    }
    setgame()
}

function setgame() {
    switch (device_type) {
        case "pc":
            stopmobile()
            stoptablet()
            stoppc()
            setpc()
            break
        case "tablet":
            stopmobile()
            stoptablet()
            stoppc()
            settablet()
            break
        case "mobile":
            stopmobile()
            stoptablet()
            stoppc()
            setmobile()
            break
    }

}

function stoppc() {
    stopGame()
    if (head.contains(script)) {
        script.remove()
    }
}

function setpc() {
    script = document.createElement('script');
    script.type = 'module';
    script.src = "pc_game/index.js"

    // Fire the loading
    head.appendChild(script);

    lauchGame()
}

function stoptablet() {

}

function settablet() {

}


function stopmobile() {
    stopall()
    if (head.contains(script)) {
        script.remove()
    }

}

function setmobile() {
    script = document.createElement('script');
    script.type = 'module';
    script.src = "mobile_game/index.js"

    // Fire the loading
    head.appendChild(script);

    startGame()

}


