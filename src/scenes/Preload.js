class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {
        



        // load the visuals
        this.load.path = './assets/'

        // load assets
        this.load.image('character', 'physical/nonstatic/Player.png')
        this.load.image('facilityTilesetImage', 'physical/static/TilesetPhysical.png')
        this.load.tilemapTiledJSON('facilityTilemapJSON', 'physical/static/facility.json')
        
        
        
        console.log('finished preload')
    }

    create() {
        this.scene.start('facilityScene')
    }
}