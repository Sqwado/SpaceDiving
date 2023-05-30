
import { stopGame } from "./tablet_game/index.js";
import { lauchGame } from "./tablet_game/index.js";

import { stopall } from "./mobile_game/index.js";
import { startGame } from "./mobile_game/index.js";

const game_js = document.getElementById("game_js")
var head = document.head;
var script;

const mobile_only = document.getElementById("mobile_only");
const tablet_only = document.getElementById("tablet_only");
const pc_only = document.getElementById("pc_only");

export let device_type = "pc";

function reportWindowSize() {
    setdisplay()
}

window.onresize = reportWindowSize;
window.onload = reportWindowSize;

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
            setpc()
            break
        case "tablet":
            stoptablet()
            stopmobile()
            settablet()
            break
        case "mobile":
            stoptablet()
            stopmobile()
            setmobile()
            break
    }

}

function setpc() {


}

function stoptablet() {
    stopGame()
    if (head.contains(script)) {
        script.remove()
    }

}

function settablet() {

    script = document.createElement('script');
    script.type = 'module';
    script.src = "tablet_game/index.js"

    // Fire the loading
    head.appendChild(script);

    lauchGame()

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


