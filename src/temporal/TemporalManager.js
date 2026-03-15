class TemporalManager {
    constructor(scene, object) {
        this.scene = scene
        this.object = object
        this.history = [] // history of past commands (maybe find way to save memory)
        // could make this a fixed array
        this.index = 0
        this.mode = 'IDLE' // Idle, Recording, Static, Replay
        this.timer = 0
        this.timeMin = 1000 // min time in static
        this.timeMax = 10000 // max time in static
        this.currMaxIndex = 0

        // variables for camera
        this.worldDelta = 0.0
        this.currZoom = 1.0

        // initialize state machine temporal manager (initial state, possible states, state args[])
        scene.timeFSM = new StateMachine('idleTime', {
            idleTime: new IdleTimeState(),
            record: new RecordState(),
            static: new StaticState(),
            replay: new ReplayState(),
        }, [scene, this]) // scene context
    }

    update(time, delta) {
        // time tracker, needed to put in update
        //this.timer += delta

        //console.log(delta)

        //console.log(this.timer)

        //if (this.timer >= this.timeMax) {
        //    this.setMode('STATIC')
        //}
    }

    record(comm = null) {
        console.log(comm)
        if (this.object.name == 'player') {
            this.history.push({
                x: this.object.x,
                y: this.object.y,
                command: comm,
                //anim: this.object.anims.currentAnim.key, // maybe, will probably be a trouble child
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

    // sets new mode, may not be required anymore due to state machine
    setMode(newMode) {
        this.mode = newMode
        if (newMode === 'STATIC') {
            // reset index to the end of the recording
            this.index = this.history.length - 1
        }
    }

    // update shadow to go to the past
    updatePast() {
        const data = this.history[this.index]
        if (!data) return

        this.scene.shadow.setPosition(data.x, data.y)
        this.scene.shadow.setFlipX(data.flipX)
        //if (this.object.name == 'player') this.scene.shadow.play(data.anim, true)
    }

    // update shadow to go forward through time
    updateForward() {
        const data = this.history[this.index]
        if (!data) return

        this.scene.shadow.command = data.command
        
        
    }


    // camera process/cycle
    // variables 
    cameraUpdate(delta, playerRef = this.object, checkInterval = 10.0, zoomRateInc = 0.01, zoomRateDec = 0.001) {
        this.worldDelta += delta

        const speed = Math.abs(playerRef.body.velocity.x)
        if (this.worldDelta >= checkInterval && Phaser.Math.Linear(0.0, 1.0, speed/(playerRef.maxVelocityX)) > this.currZoom) {
            this.currZoom = Phaser.Math.RoundTo(this.currZoom + zoomRateInc, -5)
            this.worldDelta -= checkInterval
            }
        else if (this.worldDelta >= checkInterval && Phaser.Math.Linear(0.0, 1.0, speed/(playerRef.maxVelocityX)) < this.currZoom) {
            this.currZoom = Phaser.Math.RoundTo(this.currZoom - zoomRateDec, -5)
            this.worldDelta -= checkInterval
        }

        if (this.currZoom != 0) this.scene.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 1)
        else this.scene.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 0)
    }
}

// IdleTimeState:
// Temporal Manager is doing nothing
class IdleTimeState extends State {
    // enter initial call
    enter (scene, manager) {
        manager.history.length = 0
        manager.index = 0
        scene.ghostCollision.active = false
        scene.shadow.setVisible(false)
        scene.shadow.setGravityY(0)

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        console.log('idle')

        if (keyQ.isDown) {
            manager.setMode('RECORDING')
            this.stateMachine.transition('record')
            console.log('ah')
        }
    }
}

// RecordState:
// Temporal Manager is recording frames, positions, and commands
class RecordState extends State {
    // executes upon entering
    enter(scene, manager) {
        manager.timer = 0
        scene.terrainLayer.setVisible(false)
        scene.abstractLayer.setVisible(true)

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        console.log('record')
        
        manager.record(scene.curr_comm)

        // handle zoom updates and manager capacity tracking
        manager.timer += scene.curr_delta
        manager.cameraUpdate(scene.curr_delta)

        if (manager.timer >= manager.timeMax) {
            manager.setMode('STATIC')
            this.stateMachine.transition('static')
        }


        if (keyQ.isDown && manager.timer > manager.timeMin) {
            manager.setMode('STATIC')
            this.stateMachine.transition('static')
        }
    }
}

// StaticState:
// Temporal Manager is in static state, can be reversed.
class StaticState extends State {
    // executes upon entering
    enter(scene, manager) {
        scene.shadow.setGravityY(0)
        manager.currMaxIndex = manager.history.length
        scene.shadow.setVisible(true)

        // frees camera to prevent shifting of camera when expanding
        scene.cameras.main.removeBounds();
        scene.playerCam.removeBounds();

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        console.log('static')
        console.log(scene.curr_delta)

        // handle zoom updates
        manager.cameraUpdate(scene.curr_delta)
        
        console.log(manager.index)
        console.log(manager.currMaxIndex)
        if (keyQ.isDown && manager.index != 0) {
            manager.index = Math.max(0, manager.index - 1)
            manager.updatePast()
            console.log('ah')
        }

        if (keyE.isDown) {
            manager.setMode('REPLAY')
            this.stateMachine.transition('replay')
            console.log('ah')
        }
    }
}

// ReplayState:
// Temporal Manager is doing nothing
class ReplayState extends State {
    // executes upon entering
    enter(scene, manager) {
        scene.shadow.setGravityY(300)
        scene.terrainLayer.setVisible(true)
        scene.abstractLayer.setVisible(false)
        scene.ghostCollision.active = true

        // reset camera to world state boundaries
        scene.cameras.main.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        scene.playerCam.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        scene.cameras.main.setZoom(1.0, 1.0)

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        console.log('replay')

        if (manager.index < manager.currMaxIndex) {
            manager.updateForward()
            scene.shadowFSM.step()
            console.log(manager.index)
            console.log(manager.currMaxIndex)
            manager.index = Math.max(0, manager.index + 1) // runs every frame, be careful
        }
        else {
            scene.shadow.completeStop()

            //if (keyE.isDown) {
            manager.setMode('IDLE')
            this.stateMachine.transition('idleTime')
            //}
        }
    }
}