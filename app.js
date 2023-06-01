
import { stopGame } from "./pc_game/index.js";
import { lauchGame } from "./pc_game/index.js";

import { stopall } from "./mobile_game/index.js";
import { startGame } from "./mobile_game/index.js";

const game_js = document.getElementById("game_js")
var head = document.head;
var script;
let switching = false
let load

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
    if (!switching) {
        switch (device_type) {
            case "pc":
                switching = true
                stopmobile()
                stoptablet()
                stoppc()
                load = document.createElement("p");
                load.id = "load";
                load.innerText = "Loading ...";
                load.style.position = "absolute";
                load.style.top = window.innerHeight / 2 + 12.5 + "px";
                load.style.left = window.innerWidth / 2 - 60 + "px";
                document.body.appendChild(load);
                setTimeout(() => {
                    switching = false
                    setpc()
                    document.getElementById("load").remove();
                }, 1000);
                break
            case "tablet":
                switching = true
                stopmobile()
                stoptablet()
                stoppc()
                load = document.createElement("p");
                load.id = "load";
                load.innerText = "Loading ...";
                load.style.position = "absolute";
                load.style.top = window.innerHeight / 2 + 12.5 + "px";
                load.style.left = window.innerWidth / 2 - 60 + "px";
                document.body.appendChild(load);
                setTimeout(() => {
                    switching = false
                    settablet()
                    document.getElementById("load").remove();
                }, 1000); 
                break
            case "mobile":
                switching = true
                stopmobile()
                stoptablet()
                stoppc()
                load = document.createElement("p");
                load.id = "load";
                load.innerText = "Loading ...";
                load.style.position = "absolute";
                load.style.top = window.innerHeight / 2 + 12.5 + "px";
                load.style.left = window.innerWidth / 2 - 60 + "px";
                document.body.appendChild(load);
                setTimeout(() => {
                    switching = false
                    setmobile()
                    document.getElementById("load").remove();
                }, 1000);
                break
        }
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


