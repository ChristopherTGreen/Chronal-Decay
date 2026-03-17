// scene at the end, which flips over everything

class Postcard extends Phaser.Scene {
    constructor() {
        super("postcardScene")
    }

    preload() {

        console.log('finished postcard')
    }

    create() {
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
    }

    update() {

    }
}