// WIP
// Working on temporal based game, involving command patterns and state machines, and cameras

"use strict"

let config = {
    type: Phaser.AUTO,
    width: 854,
    height: 480,
    parent: 'Blade Cycle',
    backgroundColor: '#ffffff',
    scale: {
        zoom: 1
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

    scene: [ Preload, Facility, Abstract ]
}

let game = new Phaser.game(config)

// reserve keyboard bindings (might change to cursors)
let keyLEFT, keyRIGHT, keyUP, keyDOWN, keyQ, keyE, keySPACE