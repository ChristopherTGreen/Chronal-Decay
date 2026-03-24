class TemporalManager {
    constructor(scene, object) {
        this.scene = scene
        this.object = object
        this.history = [] // history of past commands (maybe find way to save memory)
        // could make this a fixed array
        this.index = 0
        this.mode = 'IDLE' // Idle, Record, Static, Replay
        this.timer = 0
        this.timeMin = 1000 // min time in static, will be checking which frame current anim is in, mostlikely for 1
        this.timeMax = 10000 // max time in static, will be checking which frame current anim is in, most likely for 13
        this.currMaxIndex = 0

        this.staticDist = 100 // distance required to replay

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
     
    }

    record(comm = null) {
        //console.log(comm)
        if (this.object.name == 'player') {
            this.history.push({
                x: this.object.x,
                y: this.object.y,
                velX: this.object.body.velocity.x,
                velY: this.object.body.velocity.y,
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
                velX: this.object.body.velocity.x,
                velY: this.object.body.velocity.y,
                flipX: this.object.flipX, // might get rid of depending on animations
                state: this.object.playerFSM
            })
        }


    }

    // sets new mode, may not be required anymore due to state machine
    setMode(newMode) {
        this.mode = newMode
        this.scene.worldState = this.mode
        if (newMode === 'STATIC') {
            // reset index to the end of the recording
            this.index = this.history.length - 1
        }
    }

    // update shadow to go to the past, using positions
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

    // updates shadow with initial velocity when playing back, in order to prevent issues in playback
    updateVelOnce() {
        const data = this.history[this.index]
        if (!data) return

        this.scene.shadow.setVelocity(data.velX, data.velY)
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

        if (this.currZoom != 0) {
            this.scene.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 1)
            //this.scene.enemyCam.setZoom(Phaser.Math.Linear(0.0, 1.0, 1.0 - this.currZoom), 1)
        }
        else {
            this.scene.cameras.main.setZoom(Phaser.Math.Linear(0.0, 1.0, this.currZoom), 0)
            //this.scene.enemyCam.setZoom(Phaser.Math.Linear(0.0, 1.0, 1.0 - this.currZoom), 0)
        }
    }
}

// IdleTimeState:
// Temporal Manager is doing nothing
class IdleTimeState extends State {
    // enter initial call
    enter (scene, manager) {
        //console.log('idle')

        manager.history.length = 0
        manager.index = 0
        scene.ghostCollision.active = false
        scene.shadow.setVisible(false)
        scene.shadow.setGravityY(0)

        // visibility management
        scene.physicalVisList.forEach((obj) => {
            obj.setVisible(true)
        })
        scene.abstractVisList.forEach((obj) => {
            obj.setVisible(false)
        })
        scene.abstractPanels.pause()

        // collision management
        scene.terrainCollide.active = true
        scene.abstractCollide.active = false

        // reset camera to world state boundaries
        scene.cameraTrackList.forEach((cam) => {
            cam.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels)
            cam.setZoom(1.0, 1.0)
        })
        scene.cameras.main.setZoom(1.0, 1.0)

        // recharge
        scene.restoring(manager.timeMax * ((scene.uiTime.frame.name + 1) / 13))

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        //console.log(scene.uiTime.frame.name)
        if (keyQ.isDown && scene.uiTime.frame.name > 1) {
            manager.setMode('RECORDING')
            this.stateMachine.transition('record')
        }
    }
}

// RecordState:
// Temporal Manager is recording frames, positions, and commands
class RecordState extends State {
    // executes upon entering
    enter(scene, manager) {
        //console.log('record')

        manager.timer = 0

        // plays animation for record based on given duration time
        scene.recording(manager.timeMax * ((scene.uiTime.frame.name + 1) / 13))

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        // handle zoom updates and manager capacity tracking
        manager.record(scene.curr_comm)

        //manager.timer += scene.curr_delta

        //manager.timer >= manager.timeMax, oriignally in this if statement
        if (scene.uiTime.frame.name == 0) {
            manager.setMode('STATIC')
            this.stateMachine.transition('static')
        }


        if (keyQ.isDown && scene.uiTime.frame.name < 12) {
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
        //console.log('static')
        scene.shadow.setGravityY(0)
        manager.currMaxIndex = manager.history.length
        scene.shadow.setVisible(true)

        // visibility management
        scene.physicalVisList.forEach((obj) => {
            obj.setVisible(false)
        })
        scene.abstractVisList.forEach((obj) => {
            obj.setVisible(true)
        })
        scene.abstractPanels.resume()

        // collision management
        scene.terrainCollide.active = false
        scene.abstractCollide.active = true

        // time management
        scene.uiTime.stop()
        scene.uiTime.setFrame(0)
        manager.timer = 0

        // frees camera to prevent shifting of camera when expanding
        scene.cameraTrackList.forEach((cam) => {
            cam.removeBounds()
        })

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {

        // handle zoom updates
        manager.cameraUpdate(scene.curr_delta)
        
        if (manager.timer >= (manager.currMaxIndex / 13)) {
            manager.timer = 0
            scene.uiTime.setFrame(scene.uiTime.frame.name + 1)
        }
        
        if (keyQ.isDown && manager.index != 0) {
            manager.index = Math.max(0, manager.index - 1)
            manager.timer += 1
            manager.updatePast()
        }

        if (keyE.isDown && Phaser.Math.Distance.Between(scene.shadow.x, scene.shadow.y, scene.player.x, scene.player.y) < manager.staticDist) {
            manager.setMode('REPLAY')
            this.stateMachine.transition('replay')
        }
    }
}

// ReplayState:
// Temporal Manager is doing nothing
class ReplayState extends State {
    // executes upon entering
    enter(scene, manager) {
        scene.shadow.setGravityY(300)
        scene.ghostCollision.active = true

        manager.updateVelOnce()

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        //console.log('replay')

        // handle zoom updates
        manager.cameraUpdate(scene.curr_delta)

        if (manager.index < manager.currMaxIndex) {
            manager.updateForward()
            scene.shadowFSM.step()
            //console.log(manager.index)
            //console.log(manager.currMaxIndex)
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