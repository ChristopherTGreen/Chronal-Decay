// scene at the end, which flips over everything

class Postcard extends Phaser.Scene {
    constructor() {
        super("postcardScene")
    }

    preload() {

        console.log('finished postcard')
    }

    create() {
        // reset flip anim
        this.time.delayedCall(4375 / 2.0, () => {
            this.game.canvas.classList.remove('moving-card')
            this.game.canvas.style.transform = ''
            this.game.config.mode = Phaser.Scale.FIT
            this.game.config.autoCenter = Phaser.Scale.CENTER_BOTH
        })
        

        // postcard
        this.background = this.add.sprite(0, 0, 'physicalBackground').setOrigin(0, 0)
        this.postCard = this.add.sprite(0, 0, 'card').setOrigin(0, 0)
        
        // text config
        let textConfig = {
            fontFamily: 'chronal',
            fontSize: '32px',
            backgroundColor: '#a4b9c700',
            color: '#8ab4f8',
            align: 'left',
            padding: {
                top: 24,
                bottom: 0,
            },
            lineSpacing: 26.5,
            wordWrap: { width: 430, useAdvancedWrap: true }
        }
        this.text = this.add.text(game.config.width/2.0 + 10, 4, 
            `Rust grows, despite the time gained back. In abstract, what may matter more? Aching more to fill a void which you could never fill.`, 
            textConfig)

        // click sound
        const clickSound = this.sound.add('click-sound', {
            volume: this.game.settings.volume
        })


        // button config
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
        const menuBg = this.add.image(0, 0, 'button', 0).setOrigin(0.5, 0.5)
        const menuTitle = this.add.text(0, 2, `Menu`, buttonConfig).setOrigin(0.5, 0.5)
        const menuGroup = this.add.group([ menuBg, menuTitle ])
        
        const menuContain = this.add.container(menuBg.width/2.0 + 12 , menuBg.height, [ menuBg, menuTitle ])
        menuBg.setInteractive()

        menuBg.on('pointerup', () => {
            clickSound.play()
            
            menuBg.setFrame(1)
            menuTitle.setColor('#49fff5')
            this.time.delayedCall(500, () => {
                menuBg.setFrame(0)
                menuTitle.setColor('#4e6a6c')
                //this.game.canvas.classList.add('moving-card')
            
                //this.time.delayedCall(4375, () => {
                    this.sound.stopAll()
                    this.scene.start('menuScene')
                //})

            })
        })
    }

    update() {

    }
}