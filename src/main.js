// WIP
// Working on temporal based game, involving command patterns and state machines, and cameras

"use strict"


let config = {
    type: Phaser.AUTO,
    width: 854,
    height: 480,
    parent: 'Chronal Decay',
    backgroundColor: '#d3d3d3',
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
            debug: true,
        }
    },
    audio: {
        enableWebAudio: true
    },
    // plugins: {
    //     global: [{
    //         key: 'rexTCRP',
    //         plugin: TCRPPlugin, // find source script
    //         start: true
    //     }]
    // },

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