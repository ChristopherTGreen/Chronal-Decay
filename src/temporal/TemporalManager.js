class TemporalManager {
    constructor(scene, object) {
        this.scene = scene
        this.object = object
        this.history = [] // history of past commands (maybe find way to save memory)
        // could make this a fixed array
        this.index = 0 // pointer and write pointer
        this.tail = 0 // oldest data point, or tail
        this.univIndex = 0 // acts as the total size of memory in respect to the head pointer, and tail (where it would be if we shifted)
        this.isFull = false
        this.mode = 'IDLE' // Idle, Record, Static, Replay
        this.timer = 0
        this.timeMin = 160 // min time in static, will be checking which frame current anim is in, mostlikely for 1
        this.timeMax = 2000 // max time in static, will be checking which frame current anim is in, most likely for 13
        this.currMaxIndex = 0

        this.staticDist = 100 // distance required to replay

        // variables for camera
        this.worldDelta = 0.0
        this.currZoom = 1.0

        // initialize state machine temporal manager (initial state, possible states, state args[])
        scene.timeFSM = new StateMachine('idleTime', {
            idleTime: new IdleTimeState(),
            //record: new RecordState(),
            static: new StaticState(),
            replay: new ReplayState(),
        }, [scene, this]) // scene context
    }

    update(time, delta) {
     
    }

    record(comm = null) {
        //console.log(comm)
        let data
        if (this.object.name == 'player') {
            data = {
                x: this.object.x,
                y: this.object.y,
                velX: this.object.body.velocity.x,
                velY: this.object.body.velocity.y,
                command: comm,
                state: this.object.playerFSM
            }
        }
        else {
            data = {
                x: this.object.x,
                y: this.object.y,
                velX: this.object.body.velocity.x,
                velY: this.object.body.velocity.y,
                command: comm,
                state: this.object.playerFSM
            }
        }

        this.history[this.index] = data
        console.log(data)
        console.log(this.index)
        console.log(this.tail)

        this.index = (this.index + 1) % this.timeMax

        if (this.isFull) {
            this.tail = (this.tail + 1) % this.timeMax
        }

        if (this.index === 0 && !this.isFull) {
            this.isFull = true
            this.tail += 1
        }

        if (!this.isFull) this.univIndex = ((this.univIndex + 1) % this.timeMax)
    }

    // sets new mode, may not be required anymore due to state machine
    setMode(newMode) {
        this.mode = newMode
        this.scene.worldState = this.mode
    }

    // update shadow to go to the past, using positions
    updatePast() {
        // wrapping
        let prevIndex = (this.index - 1 + this.timeMax) % this.timeMax
        if (prevIndex === this.tail) return // limit reached
        this.index = prevIndex
        this.univIndex -= 1

        const data = this.history[this.index]
        if (!data) return

        console.log('success past movement')
        this.scene.shadow.setPosition(data.x, data.y)
        this.scene.shadow.setFlipX(data.flipX)
        //if (this.object.name == 'player') this.scene.shadow.play(data.anim, true)
    }

    // update shadow to go forward through time
    updateForward() {
        const data = this.history[this.index]
        if (!data) return
        this.univIndex += 1

        this.scene.shadow.command = data.command
        
    }

    // updates shadow with initial velocity when playing back, in order to prevent issues in playback
    updateVelOnce() {
        const data = this.history[this.index]
        if (!data) return

        this.scene.shadow.setVelocity(data.velX, data.velY)
    }

    // remove all current history, reset indexing back to 0, takes up more computational power, but its easier to digest
    clearHistory(){
        this.history = []
        this.index = 0
        this.tail = 0
        this.univIndex = 0
        this.isFull = false
        this.currMaxIndex = 0 // might not be needed
    }

    // sync up moves the animations either forward or backwards, replaces the need of animations, but lacks performance
    syncUI(isRecharging = true) {
        const animKey = isRecharging ? 'ui_restoring' : 'ui_recording'
        let ratio = 0
        if (this.mode == 'IDLE') ratio = this.index / this.timeMax
        if (this.mode == 'STATIC') ratio = (this.isFull) ? 1 - (this.univIndex / this.timeMax) : 1 - (this.index / this.timeMax)
        if (this.mode == 'REPLAY') ratio = this.univIndex / this.timeMax
            console.log(ratio)

        // moves one by one
        if (this.scene.uiTime.anims.currentAnim?.key !== animKey) {
            this.scene.uiTime.play(animKey)
            this.scene.uiTime.anims.pause()
        }
        this.scene.uiTime.anims.setProgress(ratio)
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

// new combined state prototype
// IdleState:
// Temporal Manager is in an idle state, recording constantly, with consideration of the pointer
// and the last point stored from the last replay, until hitting the restriction in size.
class IdleTimeState extends State {
    // enter initial call
    enter (scene, manager) {
        console.log('idle')
        
        manager.clearHistory()
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
        scene.uiTime.frame.name = 0
        //scene.restoring(manager.timeMax)

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        manager.record(scene.curr_comm)
        if (!manager.isFull) manager.syncUI(true)

        console.log(scene.uiTime.frame.name)
        if (keyQ.isDown && ((!manager.isFull && manager.index > manager.timeMin) || (manager.isFull))) {
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
        console.log('static')
        scene.shadow.setGravityY(0)
        manager.currMaxIndex = manager.index
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
        //scene.uiTime.stop()
        //scene.uiTime.setFrame(0)
        //manager.timer = 0

        // frees camera to prevent shifting of camera when expanding
        scene.cameraTrackList.forEach((cam) => {
            cam.removeBounds()
        })

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)

        console.log(manager.index)
        console.log(manager.tail)
        console.log(manager.currMaxIndex)
    }

    // executes every call/frame
    execute(scene, manager) {

        // handle zoom updates
        manager.cameraUpdate(scene.curr_delta)
        
        //if (manager.timer >= (manager.currMaxIndex / 13)) {
        //    manager.timer = 0
        //    scene.uiTime.setFrame(scene.uiTime.frame.name + 1)
        //}
        manager.syncUI(false)
        
        if (keyQ.isDown) {
            manager.updatePast()

            manager.timer += 1
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

        //manager.timer = (manager.currMaxIndex / 13) - manager.timer // inverses

        // update text
        scene.debugText.setText(`Mode: ${manager.mode}`)
    }

    // executes every call/frame
    execute(scene, manager) {
        console.log('replay')

        //if (manager.timer >= (manager.currMaxIndex / 13)) {
        //    manager.timer = 0
        //    scene.uiTime.setFrame(scene.uiTime.frame.name - 1)
        //}
        manager.syncUI(false)

        // handle zoom updates
        manager.cameraUpdate(scene.curr_delta)
        console.log(manager.index)
        console.log(manager.tail)
        console.log(manager.currMaxIndex)

        if (manager.index !== manager.currMaxIndex) {
            manager.updateForward()
            scene.shadowFSM.step()
            //console.log(manager.index)
            //console.log(manager.currMaxIndex)
            manager.index = (manager.index + 1) % manager.timeMax // runs every frame, be careful
            manager.timer += 1
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