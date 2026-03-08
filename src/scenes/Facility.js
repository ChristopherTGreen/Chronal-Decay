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
        const map = this.add.tilemap('facilityTilemapJSON')
        const tileset = map.addTilesetImage('basic_ground', 'facilityTilesetImage')
        const terrainLayer = map.createLayer('Ground', tileset, -300, 0)


        this.givenHp = 100
        this.player = new Player(this, game.config.width/2, game.config.height/2 + game.config.height/4, 'character', 0, 'right', this.givenHp)
        //var recorder = this.plugins.get('rexTCRP').addPlayer(this, config)
        this.curr_comm = 'NONE'


        // camera code
        //this.cameras.main.setPostPipeline(Phaser.Renderer.PostFX.ChromaticAberration)
        this.currZoom = 1.0
        this.timer = 0.0
        this.checkInterval = 10
        this.zoomRate = 0.005

        // Player camera (anything that doesn't stretch)
        this.playerCam = this.cameras.add(0, 0, this.game.config.width, this.game.config.height)
        this.cameras.main.ignore(this.player)
        this.playerCam.ignore(terrainLayer)


        
        // sets camera position
        //this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        //this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.setZoom(1, 1)
        this.cameras.main.setSize(this.game.config.width, this.game.config.height)
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25)
        this.playerCam.startFollow(this.player, true, 0.25, 0.25)







        // set collisions
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        terrainLayer.setCollisionByProperty({ collides: true })
        
        this.physics.add.collider(this.player, terrainLayer)

        // initialize time manager
        // create past self (optional, might move into scene itself)
        this.shadow = new Shadow(this, game.config.width/2, game.config.height/2 + game.config.height/4, 'character', 0, 'right', this.hp, 'nothing')
        this.temporal = new TemporalManager(this, this.player)
        this.physics.add.collider(this.shadow, terrainLayer)
        this.playerCam.ignore(this.shadow)
    
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

        this.curr_delta = delta

        // stretch experiment
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
        
        //if (this.currZoom != 0) this.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 1)
        //else this.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 0)
    }

}