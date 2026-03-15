class Facility extends Phaser.Scene {
    constructor() {
        super("facilityScene")
    }

    preload() {
        //this.load.plugin('rextcrpplugin', './lib/tcrp.js', true);

        // animation UI
        this.scanTime = 1000 // scantime, affects time to scan and get new information
        this.scanDuration = 600 // scanduration, period of knowledge
        this.anims.create({
            key: 'scanning',
            frames: this.anims.generateFrameNumbers('uiScan', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0]
            }),
            framerate: 1,
            duration: this.scanDuration, // ms
            repeat: -1,
            repeatDelay: this.scanTime, // ms
        })


        console.log('finished facility')
    }

    create() {
        // variables
        this.curr_delta = 0

        // creates initial map
        this.map = this.add.tilemap('facilityTilemapJSON')
        const tileset_ground = this.map.addTilesetImage('tilesheet_ground01', 'facilityTilesetImage')
        const tileset_abstract = this.map.addTilesetImage('tilesheet_abstract01', 'abstractTilesetImage')
        this.terrainLayer = this.map.createLayer('PhysicalGround', tileset_ground, 0, 0)
        this.abstractLayer = this.map.createLayer('AbstractGround', tileset_abstract, 0, 0)

        // debug text
        // display
        let debugConfig = {
            fontFamily: 'arial',
            fontSize: '30px',
            backgroundColor: '#a4b9c700',
            color: '#49fff5',
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 400
        }

        this.debugText = this.add.text(10, game.config.height - 50, `Mode: Idle`, debugConfig).setScrollFactor(1,1).setDepth(2000)

        // UI
        this.uiTime = this.add.sprite(64, 64, 'uiTime', 12)
        this.uiScan = this.add.sprite(game.config.width - 64, 64, 'uiScan')
        this.uiScan.play('scanning')
        this.mapZoom = 0.05

        // setup
        this.givenHp = 100
        const spawn = this.map.findObject("Objects", obj => obj.name === "SpawnPoint")
        console.log(spawn.x)
        this.player = new Player(this, spawn.x, spawn.y, 'character', 0, 'right', this.givenHp)
        //var recorder = this.plugins.get('rexTCRP').addPlayer(this, config)
        this.curr_comm = 'NONE'

        // create past self
        this.shadow = new Shadow(this, game.config.width/2, game.config.height/2 + game.config.height/4, 'shadow', 0, 'right', this.hp, 'nothing')
        // create enemy & icon
        this.enemyEye = new EnemyEye(this, spawn.x, spawn.y -1000, 'enemy', 0, 'right', this.player, this.shadow).setDepth(-100)
        this.enemyIcon = this.add.sprite(this.enemyEye.x, this.enemyEye.y, 'enemyIcon').setScale(1.0 / this.mapZoom)

        // camera code
        //this.cameras.main.setPostPipeline(Phaser.Renderer.PostFX.ChromaticAberration)
        this.currZoom = 1.0
        this.timer = 0.0
        this.checkInterval = 10
        this.zoomRateInc = 0.01
        this.zoomRateDec = 0.001

        // circular mask for camera
        const graphics = this.make.graphics()
        graphics.setPosition(this.game.config.width - 126, 2)
        graphics.fillCircle(62, 62, 62)// size of actual map is 124
        const circleMask = graphics.createGeometryMask()

        // Cameras and what they do (double check):
        //      mainCameras: Contains the abstract world
        //      playerCam: For the player sprite only
        //      uiCam: For the UI sprites only (excluding minimap)
        //      miniMap: For the sprites in the minimap itself
        //      enemyCam: For only the enemy sprite, incase stretching
        this.playerCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)
        this.uiCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)
        this.miniMap = this.cameras.add(graphics.x, graphics.y, 124, 124).setZoom(this.mapZoom)
        this.miniMap.setMask(circleMask)
        this.enemyCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)

        // lists of objects and what they ignore
        const mainIgnoreList = [this.player, this.terrainLayer, this.enemyEye, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]
        const playerIgnoreList = [this.shadow, this.abstractLayer, this.enemyEye, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]
        const uiIgnoreList = [this.terrainLayer, this.abstractLayer, this.player, this.shadow, this.enemyEye, this.enemyIcon]
        const miniMapIgnoreList = [this.player, this.shadow, this.terrainLayer, this.abstractLayer, this.enemyEye, this.debugText, this.uiTime, this.uiScan]
        const enemyIgnoreList = [this.terrainLayer, this.abstractLayer, this.player, this.shadow, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]  
        this.cameraTrackList = [this.cameras.main, this.playerCam, this.enemyCam]
        this.cameras.main.ignore(mainIgnoreList)
        this.playerCam.ignore(playerIgnoreList)
        this.enemyCam.ignore(enemyIgnoreList)
        this.uiCam.ignore(uiIgnoreList)
        this.miniMap.ignore(miniMapIgnoreList)
        this.abstractLayer.setVisible(false)


        
        // sets camera position bounds and follows
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.uiCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.playerCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.enemyCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.cameras.main.setZoom(0.1, 0.1)
        //this.cameras.main.setSize(this.game.config.width, this.game.config.height)
        this.cameras.main.startFollow(this.player, true, 1, 1)
        this.playerCam.startFollow(this.player, true, 1, 1)
        this.enemyCam.startFollow(this.player, true, 1, 1)
        this.miniMap.startFollow(this.player, true, 1, 1)
        


        // set collisions
        // map collision
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.terrainLayer.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, this.terrainLayer)
        // ghost collision between player and shadow
        this.ghostCollision = this.physics.add.collider(this.player, this.shadow)
        // shadow collision with the map
        this.physics.add.collider(this.shadow, this.terrainLayer)

        // initialize time manager
        this.manager = new TemporalManager(this, this.player)



        // animation repeat for scanning, icon follows position of enemy eye
        this.uiScan.on('animationupdate', (animation, frame) => {
        this.enemyIcon.setPosition(this.enemyEye.x, this.enemyEye.y)
        })

        // key controls
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }

    update(time, delta) {
        this.playerFSM.step()
        this.timeFSM.step()
        this.eyeFSM.step()

        this.curr_delta = delta

    }

}