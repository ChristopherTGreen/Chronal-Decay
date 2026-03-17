class Preload extends Phaser.Scene {
    constructor() {
        super("preloadScene")
    }

    preload() {
        



        // load the visuals
        this.load.path = './assets/'

        // load assets
        
        this.load.image('character', 'nonstatic/Player.png')
        this.load.spritesheet('shadow', 'nonstatic/Shadow.png', {
            frameWidth: 32,
            frameHeight: 64
        })
        this.load.image('enemy', 'nonstatic/EnemyEye.png')
        this.load.image('enemyIcon', 'nonstatic/EnemyEyeIcon.png')
        this.load.spritesheet('enemyProj', 'nonstatic/EnemyProj.png', {
            frameWidth: 4, 
            frameHeight: 6
        })
        this.load.spritesheet('uiTime', 'ui/UI-Time.png', {
            frameWidth: 128, 
            frameHeight: 128
        })
        this.load.spritesheet('uiScan', 'ui/UI-Scanner.png', {
            frameWidth: 128, 
            frameHeight: 128
        })

        this.load.image('abstractPanel', 'nonstatic/Abstract-03.png')
        this.load.image('abstractBackground', 'static/Abstract-02.png')
        this.load.image('physicalBackground', 'static/Background.png')
        this.load.image('physicalBackgroundCity', 'static/BackgroundCity.png')
        this.load.image('physicalBackgroundWall', 'static/BackgroundWall.png')
        this.load.image('facilityTilesetImage', 'static/TilesetPhysical.png')
        this.load.image('abstractTilesetImage', 'static/TilesetAbstract.png')
        this.load.tilemapTiledJSON('facilityTilemapJSON', 'static/facility.json')
        
        // load fonts
        this.load.path = './assets/fonts/'
        this.load.font('chronal', 'Spaceport_2006.otf')

        // load audio
        this.load.path = './assets/audio/'
        this.load.audio('jump-sound', 'sfx/jump.wav')
        this.load.audio('death-sound', 'sfx/death2.wav')
        this.load.audio('hit-sound', 'sfx/hit.wav')
        this.load.audio('wave-sound', 'sfx/wave.wav')
        this.load.audio('charge-sound', 'sfx/charge.wav')
        
        console.log('finished preload')
    }

    create() {
        this.scene.start('facilityScene')
    }
}