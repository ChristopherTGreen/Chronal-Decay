class Facility extends Phaser.Scene {
    constructor() {
        super("facilityScene")
    }

    preload() {
        //this.load.plugin('rextcrpplugin', './lib/tcrp.js', true);


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


        this.givenHp = 100
        const spawn = this.map.findObject("Objects", obj => obj.name === "SpawnPoint")
        console.log(spawn.x)
        this.player = new Player(this, spawn.x, spawn.y, 'character', 0, 'right', this.givenHp)
        //var recorder = this.plugins.get('rexTCRP').addPlayer(this, config)
        this.curr_comm = 'NONE'

        // create past self
        this.shadow = new Shadow(this, game.config.width/2, game.config.height/2 + game.config.height/4, 'shadow', 0, 'right', this.hp, 'nothing')


        // camera code
        //this.cameras.main.setPostPipeline(Phaser.Renderer.PostFX.ChromaticAberration)
        this.currZoom = 1.0
        this.timer = 0.0
        this.checkInterval = 10
        this.zoomRate = 0.001

        // Player camera (anything that doesn't stretch)
        this.playerCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)
        this.uiCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)
        this.cameras.main.ignore([this.player, this.terrainLayer])
        this.uiCam.ignore([this.abstractLayer, this.player, this.terrainLayer, this.abstractLayer])
        this.playerCam.ignore(this.abstractLayer)
        this.abstractLayer.setVisible(false)


        
        // sets camera position
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.uiCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.playerCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.cameras.main.setZoom(0.1, 0.1)
        //this.cameras.main.setSize(this.game.config.width, this.game.config.height)
        this.cameras.main.startFollow(this.player, true, 1, 1)
        this.playerCam.startFollow(this.player, true, 1, 1)
        


        // set collisions
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.terrainLayer.setCollisionByProperty({ collides: true })
        
        this.physics.add.collider(this.player, this.terrainLayer)
        this.ghostCollision = this.physics.add.collider(this.player, this.shadow)

        // initialize time manager
        this.temporal = new TemporalManager(this, this.player)
        this.physics.add.collider(this.shadow, this.terrainLayer)
        this.playerCam.ignore(this.shadow)


        // create enemy
        this.enemyEye = new EnemyEye(this, spawn.x, spawn.y, 'enemy', 0, 'right', this.player)
        this.cameras.main.ignore(this.enemyEye)
        this.uiCam.ignore(this.enemyEye)


        // key controls
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

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

        this.debugText = this.add.text(10, 0, `Mode: ${this.temporal.mode}`, debugConfig).setScrollFactor(1,1).setDepth(2000)
        this.cameras.main.ignore(this.debugText)
        this.playerCam.ignore(this.debugText)
    }

    update(time, delta) {
        this.playerFSM.step()
        this.timeFSM.step()
        this.eyeFSM.step()

        this.debugText.setText(`Mode: ${this.temporal.mode}`)

        this.curr_delta = delta

        // stretch experiment (make this into a state machine)
        if (this.temporal.mode == 'STATIC' || this.temporal.mode == 'RECORDING') {
            this.cameras.main.removeBounds();
            this.playerCam.removeBounds();

            this.timer += delta
            const speed = Math.abs(this.player.body.velocity.x)
            if (this.timer >= this.checkInterval && Phaser.Math.Linear(0.0, 1.0, speed/(this.player.maxVelocityX)) > this.currZoom) {
                this.currZoom = Phaser.Math.RoundTo(this.currZoom + this.zoomRate, -5)
                this.timer -= this.checkInterval
            }
            else if (this.timer >= this.checkInterval && Phaser.Math.Linear(0.0, 1.0, speed/(this.player.maxVelocityX)) < this.currZoom) {
                this.currZoom = Phaser.Math.RoundTo(this.currZoom - this.zoomRate, -5)
                this.timer -= this.checkInterval
            }

            if (this.currZoom != 0) this.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 1)
            else this.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 0)
        }
        else {
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.playerCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.setZoom(1.0, 1.0)
        }
    }

}