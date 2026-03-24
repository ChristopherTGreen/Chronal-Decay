// scene menu, which flips into the starting scene

class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene")
    }

    preload() {
        
    }

    create() {
        // reset flip anim
        this.time.delayedCall(4375 / 2.0, () => {
            this.game.canvas.classList.remove('moving-card')
            this.game.canvas.style.transform = ''
        })

        const camOffX = 10
        const camOffY = 10
        this.background = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackground').setOrigin(0, 0).setTilePosition(60, 120 - camOffY * 2).setScrollFactor(0,0)
        this.backgroundWall = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackgroundWall').setOrigin(0, 0).setTilePosition(60, 120 - camOffY * 2).setScrollFactor(0, 0)
        this.backgroundCity = this.add.tileSprite(-camOffX, -camOffY, this.game.config.width + camOffX*2, this.game.config.height + camOffY*2, 'physicalBackgroundCity').setOrigin(0, 0).setTilePosition(60, 120 - camOffY * 2).setScrollFactor(0,0)

        // click sound
        const clickSound = this.sound.add('click-sound', {
            volume: this.game.settings.volume
        })

        // text config
        let textConfig = {
            fontFamily: 'chronal',
            fontSize: '64px',
            backgroundColor: '#a4b9c700',
            color: '#49fff5',
            align: 'center',
            padding: {
                top: 0,
                bottom: 0,
            },
            fixedWidth: game.config.width
        }
        this.titleText = this.add.text(0, game.config.height/4.0, `Chronal Decay`, textConfig)
        textConfig.fontSize = 32
        this.authorText = this.add.text(0, game.config.height/4.0 + 96, `Developed by Christopher Green`, textConfig)

        // text config
        let buttonConfig = {
            fontFamily: 'chronal',
            fontSize: '40px',
            backgroundColor: '#a4b9c700',
            color: '#4e6a6c',
            align: 'center',
            padding: {
                top: 0,
                bottom: 0,
            },
            fixedWidth: game.config.width
        }
        // start buttons
        const startBg = this.add.image(0, 0, 'button', 0).setOrigin(0.5, 0.5)
        const startTitle = this.add.text(0, 2, `Start`, buttonConfig).setOrigin(0.5, 0.5)
        const startGroup = this.add.group([ startBg, startTitle ])
        
        const startContain = this.add.container(game.config.width/2, game.config.height/1.5, [ startBg, startTitle ])
        startBg.setInteractive()

        startBg.on('pointerup', () => {
            clickSound.play()
            
            startBg.setFrame(1)
            startTitle.setColor('#49fff5')
            this.time.delayedCall(200, () => {
                startBg.setFrame(0)
                startTitle.setColor('#4e6a6c')
            
                this.time.delayedCall(300, () => {
                    this.scene.start('facilityScene')
                })

            })
        })
        console.log('finished menu')
    }

    update(){

    }
}