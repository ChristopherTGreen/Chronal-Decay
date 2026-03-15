class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {
        



        // load the visuals
        this.load.path = './assets/'

        // load assets
        this.load.image('character', 'nonstatic/Player.png')
        this.load.image('shadow', 'nonstatic/Shadow.png')
        this.load.image('enemy', 'nonstatic/EnemyEye.png')
        this.load.image('enemyIcon', 'nonstatic/EnemyEyeIcon.png')
        this.load.spritesheet('uiTime', 'ui/UI-Time.png', {
            frameWidth: 128, 
            frameHeight: 128
        })
        this.load.spritesheet('uiScan', 'ui/UI-Scanner.png', {
            frameWidth: 128, 
            frameHeight: 128
        })


        this.load.image('facilityTilesetImage', 'static/TilesetPhysical.png')
        this.load.image('abstractTilesetImage', 'static/TilesetAbstract.png')
        this.load.tilemapTiledJSON('facilityTilemapJSON', 'static/facility.json')
        
        // load audio
        this.load.path = './assets/audio/'
        this.load.audio('jump-sound', 'sfx/jump.wav')
        
        console.log('finished preload')
    }

    create() {
        this.scene.start('facilityScene')
    }
}