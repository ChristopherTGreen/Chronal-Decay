// Name: Christopher Green
// Title: Chronal Decay
// Time Spent: 40 hours at minimum
// Features: 

// Game AI
// The enemy eye has several different states, along with behavioral tendencies, 
// based on given world state, player position, and shadow position. Will always
// chase shadow if present in replay state. 

// Cameras:
// There are 5 cameras, which track different aspects. There is a minimap top-right
// which displays the current position of the enemy eye from afar. 
// Another camera is the UI itself, to prevent distortions from affecting it.
// Another camera, or several, is for the player, enemy, and the physical background.

// Postcard flip:
// The postcard flips, and right when you can't see either side, it switches scenes for a smooth transition.

// Subtle Death:
// Player ages, eventually corroding into rust and ashes.


"use strict"


let config = {
    type: Phaser.AUTO,
    width: 854,
    height: 480,
    parent: 'Chronal Decay',
    backgroundColor: '#ffffff',
    scale: {
        zoom: 1
    },
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false,
        }
    },
    audio: {
        enableWebAudio: true
    },
    plugins: {
        global: [{
            key: 'rexSwirlPipeline',
            plugin: window.rexswirlpipelineplugin,
            start: true
        }]
    },

    scene: [ Preload, Facility, Abstract, Menu, Postcard ]
}

let game = new Phaser.Game(config)

// reserve keyboard bindings (might change to cursors)
let keyLEFT, keyRIGHT, keyUP, keyDOWN, keyQ, keyE, keySPACE


// initial settings
game.settings = {
    volume: 1,
    music: 1,
    highScore: 0
}