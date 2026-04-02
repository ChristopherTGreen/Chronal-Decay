// Name: Christopher Green
// Title: Chronal Decay
// Time Spent: 40 hours at minimum
// Project Theme: Postcard
// Note: I may or may not have gone to niche. More specifically, it was meant for my father, meaning
// only he understands the context, and since the world this is somewhat based on, would require an hour of
// explanation, some context was lost in the process, which I hope to improve upon in the future.


"use strict"


let config = {
    type: Phaser.AUTO,
    width: 854,
    height: 480,
    parent: 'Chronal Decay',
    backgroundColor: '#ffffff',
    resolution: 1,
    scale: {
        zoom: 1,
        //mode: Phaser.Scale.NONE,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
    music: 1
}