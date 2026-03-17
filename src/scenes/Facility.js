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

        // animations
        this.anims.create({
            key: 'burn',
            frameRate: 12,
            frames: this.anims.generateFrameNumbers('enemyProj'),
            repeat: -1,
            yoyo: false
        })
        this.anims.create({
            key: 'shadowIndic',
            frames: this.anims.generateFrameNumbers('shadow'),
            framerate: 1,
            duration: 1000,
            repeat: -1,
        })

        
        


        console.log('finished facility')
    }

    create() {
        // variables
        this.curr_delta = 0
        this.univDamage = 1

        this.swirlPlugin = this.plugins.get('rexSwirlPipeline')
        // creates initial map
        this.map = this.add.tilemap('facilityTilemapJSON')
        const tileset_ground = this.map.addTilesetImage('tilesheet_ground01', 'facilityTilesetImage')
        const tileset_abstract = this.map.addTilesetImage('tilesheet_abstract01', 'abstractTilesetImage')
        this.terrainLayer = this.map.createLayer('PhysicalGround', tileset_ground, 0, 0).setDepth(10)
        this.abstractLayer = this.map.createLayer('AbstractGround', tileset_abstract, 0, 0).setDepth(10)

        const spawn = this.map.findObject("Objects", obj => obj.name === "SpawnPoint")

        // create facility background (traditional wrap)
        const camOffX = 10
        const camOffY = 10
        this.background = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackground').setOrigin(0, 0).setTilePosition(0, 120 - camOffY * 2).setScrollFactor(0,0)
        this.backgroundWall = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackgroundWall').setOrigin(0, 0).setTilePosition(0, 120 - camOffY * 2).setScrollFactor(0, 0)
        this.backgroundCity = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackgroundCity').setOrigin(0, 0).setTilePosition(0, 120 - camOffY * 2).setScrollFactor(0,0)

        // create abstract background
        this.abstractBackground = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'abstractBackground').setDepth(0).setScrollFactor(0, 0)
        this.abstractPanels = this.add.particles(this.game.config.width / 2, this.game.config.height / 2, 'abstractPanel', {
            speed: Phaser.Math.Between(15, 25),
            scale: { start: 0.01, end: 1},
            alpha: { start: 1, end: 0},
            angle: { min: 0, max: 360},
            frequency: 1000,
            lifespan: 20000,
            rotate: {
                onUpdate: (particle) => {
                    if (!particle.data.isOriented) {
                        const angle = Math.atan2(particle.velocityY, particle.velocityX)
                        particle.rotation = angle
                    }
                    return Phaser.Math.RadToDeg(particle.rotation) - 90
                }
            }
        }).setDepth(1).setScrollFactor(0, 0)
        


        // debug text
        // display
        let debugConfig = {
            fontFamily: 'chronal',
            fontSize: '30px',
            backgroundColor: '#a4b9c700',
            color: '#8ab4f8',
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 400
        }

        this.debugText = this.add.text(10, game.config.height - 50, `Mode: Idle`, debugConfig).setScrollFactor(1,1)

        // UI
        this.uiTime = this.add.sprite(64, 64, 'uiTime', 12)
        this.uiScan = this.add.sprite(game.config.width - 64, 64, 'uiScan')
        this.uiScan.play('scanning')
        this.mapZoom = 0.05

        // setup
        this.givenHp = 100
        console.log(spawn.x)
        this.player = new Player(this, spawn.x, spawn.y, 'character', 0, 'right', this.givenHp)
        //var recorder = this.plugins.get('rexTCRP').addPlayer(this, config)
        this.curr_comm = 'NONE'

        // create past self
        this.shadow = new Shadow(this, game.config.width/2, game.config.height/2 + game.config.height/4, 'shadow', 0, 'right', this.hp, 'nothing')
        this.shadow.anims.play('shadowIndic')
        // create enemy & icon
        this.enemyEye = new EnemyEye(this, spawn.x, spawn.y -1000, 'enemy', 0, 'right', this.player, this.shadow).setDepth(3)
        this.enemyIcon = this.add.sprite(this.enemyEye.x, this.enemyEye.y, 'enemyIcon').setScale(1.0 / this.mapZoom)
        // collision setup for particles and player/shadow
        let projCall = {
            contains: (x, y) => {
                if (this.player.recentHit) return

                let playerHit = this.player.body.hitTest(x,y)
                let shadowHit = this.shadow.body.hitTest(x,y)
                if (playerHit) {
                    this.damageHit(this.player, 500, 100)
                    this.player.hp -= this.univDamage

                    return true
                }
                if (shadowHit) {
                    this.damageHit(this.shadow, 500, 100)
                    this.damageHit(this.player, 500, 100)
                    this.player.hp -= this.univDamage

                    return true
                }
                return false
            }
        }
        
        this.enemyProj = this.add.particles(0, 0, 'enemyProj', {
            speed: Phaser.Math.Between(15, 25),
            scale: 1.0,
            alpha: { start: 0.75, end: 0.2},
            frequency: 200,
            lifespan: 3000,
            deathZone: {
                type: 'onEnter',
                source: projCall
            },
            anim: {
                anims: 'burn'
            }
        }).setDepth(10)
        this.enemyProj.startFollow(this.enemyEye, 0, 0, false)

        this.enemyProj.stop()


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

        // depth control on cameras
        Phaser.Utils.Array.SendToBack(this.cameras.cameras, this.enemyCam)

        // lists of objects and what they ignore
        const mainIgnoreList = [this.player, this.terrainLayer, this.abstractBackground, this.abstractPanels, this.background, this.backgroundWall, this.backgroundCity, this.enemyEye, this.enemyProj, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]
        const playerIgnoreList = [this.shadow, this.abstractLayer, this.abstractBackground, this.abstractPanels, this.enemyEye, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]
        const uiIgnoreList = [this.terrainLayer, this.abstractLayer, this.abstractBackground, this.abstractPanels, this.background, this.backgroundWall, this.backgroundCity, this.player, this.shadow, this.enemyEye, this.enemyProj, this.enemyIcon]
        const miniMapIgnoreList = [this.player, this.shadow, this.terrainLayer, this.abstractLayer, this.abstractBackground, this.abstractPanels, this.background, this.backgroundWall, this.backgroundCity, this.enemyEye, this.enemyProj, this.debugText, this.uiTime, this.uiScan]
        const enemyIgnoreList = [this.terrainLayer, this.abstractLayer, this.background, this.backgroundWall, this.backgroundCity, this.player, this.shadow, this.enemyProj, this.debugText, this.uiTime, this.uiScan, this.enemyIcon]  
        this.cameraTrackList = [this.cameras.main, this.playerCam, this.enemyCam]
        this.cameras.main.ignore(mainIgnoreList)
        this.playerCam.ignore(playerIgnoreList)
        this.enemyCam.ignore(enemyIgnoreList)
        this.uiCam.ignore(uiIgnoreList)
        this.miniMap.ignore(miniMapIgnoreList)

        this.physicalVisList = [this.terrainLayer, this.background, this.backgroundWall, this.backgroundCity]
        this.abstractVisList = [this.abstractLayer, this.abstractBackground, this.abstractPanels]
        this.abstractVisList.forEach((obj) => {
            obj.setVisible(false)
        })


        
        // sets camera position bounds and follows
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.uiCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.playerCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.enemyCam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        //this.cameras.main.setZoom(0.1, 0.1)
        //this.cameras.main.setSize(this.game.config.width, this.game.config.height)
        //his.cameras.main.setPostPipeline(SwirlPostFX);
        //this.enemyCam.setPostPipeline(SwirlPostFX);
        //this.playerCam.setPostPipeline(SwirlPostFX);
        this.mainSwirl = this.swirlPlugin.add(this.cameras.main, {
            radius: 100,
            angle: 0
        })
        this.playerSwirl = this.swirlPlugin.add(this.playerCam, {
            radius: 100,
            angle: 0
        })
        this.enemySwirl = this.swirlPlugin.add(this.enemyCam, {
            radius: 100,
            angle: 0
        })

        
        const offsetY = 10
        this.cameras.main.startFollow(this.player, true, 1, 1)
        this.playerCam.startFollow(this.player, true, 1, 1)
        this.enemyCam.startFollow(this.player, true, 1, 1)
        this.miniMap.startFollow(this.player, true, 1, 1)
        
        this.cameras.main.followOffset.set(0, offsetY)
        this.playerCam.followOffset.set(0, offsetY)
        this.enemyCam.followOffset.set(0, offsetY)


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

        this.worldTileUpdate()
        this.distortUpdate()

    }

    // updates the background to follow movement of the camera (maybe move to track camera velocity, not player)
    worldTileUpdate() {
        if (this.cameras.main._bounds && (this.cameras.main.worldView.left > this.cameras.main._bounds.x + 0 && this.cameras.main.worldView.right < this.cameras.main._bounds.right - 0)) {
            console.log('tiles')
            this.background.tilePositionX += this.player.body.velocity.x / 5000
            this.backgroundWall.tilePositionX += this.player.body.velocity.x / 3000
            this.backgroundCity.tilePositionX += this.player.body.velocity.x / 2000
        }
    }

    distortUpdate() {
        if (this.mainSwirl && this.playerSwirl && this.enemySwirl) {
            const cam = this.cameras.main
            const screenX = this.enemyEye.x - cam.scrollX
            const screenY = this.enemyEye.y - cam.scrollY

            this.mainSwirl.setCenter(screenX, screenY)
            this.playerSwirl.setCenter(screenX, screenY)
            this.enemySwirl.setCenter(screenX, screenY)
        }
    }



    // plays the recording animation for the uiTime
    recording(timeRecordDur = 10000, timeRecordDelay = 1000, call = null) {
        if (this.anims.exists('recording')) this.anims.remove('recording')
        this.anims.create({
            key: 'recording',
            frames: this.anims.generateFrameNumbers('uiTime', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]
            }).reverse(),
            framerate: 1,
            duration: timeRecordDur, // ms
            repeat: 0,
        })
        this.uiTime.play('recording')
    }
    // plays the restoring animation for the uiTime
    restoring(timeRestoreDur = 10000, timeRecordDelay = 1000, call = null) {
        if (this.anims.exists('restoring')) this.anims.remove('restoring')
        this.anims.create({
            key: 'restoring',
            frames: this.anims.generateFrameNumbers('uiTime', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            }),
            framerate: 1,
            duration: timeRestoreDur, // ms
            repeat: 0,
        })
        this.uiTime.play('restoring')
    }

    // distorts the world in 3 different cameras
    distort(str = 100, dur = 1000) {
        this.tweens.add({
            targets: this.mainSwirl,
            radius: str,
            angle: Phaser.Math.Between(0, 1) ? 360 : -360,
            duration: dur,
            yoyo: true,
            ease: 'Sine.easeInOut'
        })

        this.tweens.add({
            targets: this.playerSwirl,
            radius: str,
            angle: Phaser.Math.Between(0, 1) ? 360 : -360,
            duration: dur,
            yoyo: true,
            ease: 'Sine.easeInOut'
        })

        this.tweens.add({
            targets: this.enemySwirl,
            radius: str,
            angle: Phaser.Math.Between(0, 1) ? 360 : -360,
            duration: dur,
            yoyo: true,
            ease: 'Sine.easeInOut'
        })
    }


    // tweens for damage and after-damage hits
    // flashing red hit for damage (optional, dependings no webgl or canvas)
    damageHit(source, redTime, time){
        this.cameraTrackList.forEach((cam) => {
            cam.shake(200, 0.003)
        })
        source.recentHit = true
        this.sound.play('hit-sound', {
            volume: game.settings.volume * 1.1
        })
        this.tweens.add({
            targets: source,
            tint: 0xff0000,
            alpha: 1.0,
            duration: redTime,
            yoyo: false,
            repeat: 0,
            onComplete: () => {
                source.alpha = 1
                source.clearTint()
                this.safeTimeHit(source, time)
            }
        })
    }

    // flashing alpha for safe-time after being hit
    safeTimeHit(source, time){
        this.tweens.add({
            targets: source,
            alpha: 0.25,
            duration: time,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                source.alpha = 1
                source.recentHit = false
            }  
        })
    }
}