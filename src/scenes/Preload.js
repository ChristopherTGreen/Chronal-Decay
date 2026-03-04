class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {
        // load plugin
        this.load.plugin('tcrp', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexarcadetcrpplugin.min.js', true)



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