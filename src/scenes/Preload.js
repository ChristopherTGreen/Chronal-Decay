class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {
        



        // load the visuals
        this.load.path = './assets/'

        // load assets
        this.load.image('character', 'physical/nonstatic/Player.png')
        this.load.image('shadow', 'abstract/nonstatic/Shadow.png')
        this.load.image('enemy', 'abstract/nonstatic/EnemyEye.png')
        this.load.image('facilityTilesetImage', 'physical/static/TilesetPhysical.png')
        this.load.image('abstractTilesetImage', 'abstract/static/TilesetAbstract.png')
        this.load.tilemapTiledJSON('facilityTilemapJSON', 'physical/static/facility.json')
        
        // load audio
        this.load.path = './assets/audio/'
        this.load.audio('jump-sound', 'sfx/jump.wav')
        
        console.log('finished preload')
    }

    create() {
        this.scene.start('facilityScene')
    }
}