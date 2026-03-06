class TemporalManager {
    constructor(scene, object, shadow) {
        this.scene = scene
        this.object = object
        this.history = [] // history of past commands (maybe find way to save memory)
        // could make this a fixed array
        this.index = 0
        this.mode = 'IDLE' // Idle, Recording, Static, Replay
        this.timer = 0
        this.timeFreq = 1000
    }
    
    // update might be tweaked heavily
    //
    update(time, delta) {
        if (this.mode === 'RECORDING') {
            this.record
            this.timer += delta
            console.log('recording')

            if (this.timer >= this.timeFreq) {
                this.setMode('STATIC')
            }
        }

        

        if (this.mode === 'STATIC') {
            //this.scene.shadow.setVisible(true)
            console.log('static')

        }
    }

    record(comm = null) {
        if (object.name == 'player') {
            this.history.push({
                x: this.object.x,
                y: this.object.y,
                command: comm,
                anim: this.object.anims.currentAnim.key, // maybe, will probably be a trouble child
                flipX: this.object.flipX, // might get rid of depending on animations
                state: this.object.playerFSM
            })
        }
        else {
            this.history.push({
                x: this.object.x,
                y: this.object.y,
                flipX: this.object.flipX, // might get rid of depending on animations
                state: this.object.playerFSM
            })
        }
    }

    setMode(newMode) {
        this.mode = newMode
        if (newMode === 'STATIC') {
            // reset index to the end of the recording
            this.index = this.history.length - 1
        }
    }

    updatePast() {
        const data = this.history[this.index]
        if (!data) return

        this.scene.shadow.setPosition(data.x, data.y)
        this.scene.shadow.setFlipX(data.flipX)
        if (object.name == 'player') this.scene.shadow.play(data.anim, true)
    }
}