class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {

        // load the visuals
        this.load.path = './assets/'

        // load assets
        this.load.image('player', 'physical/nonstatic/Player.png')

        console.log('finished preload')
    }

    create() {
        this.scene.start('facilityScene')
    }
}