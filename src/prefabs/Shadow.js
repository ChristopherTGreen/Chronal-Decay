class Shadow extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture, frame, direction, hp) {
        super(scene, x, y, texture, frame)

        // add object to existing scene
        scene.add.existing(this)    // add to existing
        scene.physics.add.existing(this) // add physics to existing
    
        // properties
        this.name = 'shadow'
        this.accelX = 300.0 // maybe make velocity for more control
        this.accelY = -250.0
        this.maxVelocityX = 150
        this.maxVelocityY = 300
        this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY)

        this.direction = direction
        this.hp = hp
        this.initialDist = true
        this.coyoteTime = 2000
        this.coyote = true
        this.command = 'NONE'

        // physics
        //const sizeDiffW = 60
        //const sizeRateW = 1.92 // only for offset
        //const sizeDiffY = 30
        //const sizeRateY = 1.3 // only for offset
        this.setSize(this.width/2, this.height/3).setOffset(this.width/4, this.height/1.5)
        this.setDragX(200)
        console.log("called constructor play")

        // initialize state machine managing hero (initial state, possible states, state args[])
        scene.shadowFSM = new StateMachine('idleS', {
            idleS: new IdleShadowState(),
            moveS: new MoveShadowState(),
            jumpS: new JumpShadowState(),
            deathS: new DeathShadowState(),
        }, [scene, this]) // scene context
    }

    completeStop() {
        this.setAcceleration(0, 0)
        this.setVelocity(0, 0)
        this.setGravityY(0)
    }
}


// IdleShadowState:
// Shadow is currently not moving
class IdleShadowState extends State {
    // enter initial call
    enter (scene, shadow) {

    }

    // executes every call/frame
    execute(scene, shadow) {
        console.log('idle')
        console.log(shadow.command)
        let shadowVector = new Phaser.Math.Vector2(0, 0)
        // movement transition
        if(shadow.command == 'LEFT'|| shadow.command == 'RIGHT') {
            this.stateMachine.transition('moveS')
        }

        shadow.setAccelerationX(shadow.accelX * shadowVector.x)

        // jump
        if(shadow.command == 'JUMP') {
            shadow.body.setVelocityY(shadow.accelY)
            shadow.coyote = false

            this.stateMachine.transition('jumpS')
        }

        // detection if death & transition to death
        if (shadow.hp <= 0) {
            this.stateMachine.transition('deathS')
        }
        
    }
}

// MoveState:
// Shadow is currently moving
class MoveShadowState extends State {
    // executes every call/frame
    execute(scene, shadow) {
        // use destructuring to make a local copy of the keyboard object
        let shadowVector = new Phaser.Math.Vector2(0, 0)
        console.log('move')
        
        
        if(shadow.command == 'LEFT') {
            shadow.direction = 'left'
            console.log('left')
            shadowVector.x = -1
        } else if(shadow.command == 'RIGHT') {
            shadow.direction = 'right'
            console.log('right')
            shadowVector.x = 1
        }

        if(shadow.command == 'JUMP' || !shadow.body.onFloor()) {
            if(shadow.command == 'JUMP') {
                shadow.body.setVelocityY(shadow.accelY)
                shadow.coyote = false
            }
            this.stateMachine.transition('jumpS')
        }

        shadow.setAccelerationX(shadow.accelX * shadowVector.x)

        // check if the shadow is static relative to body
        if (shadow.body.velocity.x == 0 && shadow.body.accelerationX == 0) this.stateMachine.transition('idleS')

        // detection if death & transition to death
        if (shadow.hp <= 0) {
            this.stateMachine.transition('deathS')
        }
    }
}

// JumpState:
// Shadow is currently jumping
class JumpShadowState extends State {
    // executes every call/frame
    execute(scene, shadow) {
        console.log('jump')
        // use destructuring to make a local copy of the keyboard object
        let shadowVector = new Phaser.Math.Vector2(0, 0)

        // coyote jump
        if(keySPACE.isDown && shadow.coyote) {
            shadow.body.setVelocityY(shadow.accelY)
            shadow.coyote = false
            
        }
        if (shadow.coyote) scene.time.delayedCall(shadow.coyoteTime, () => {
            shadow.coyote = false
        })
        
        
        if(shadow.command == 'LEFT') {
            shadow.direction = 'left'
            shadowVector.x = -1
        } else if(shadow.command == 'RIGHT') {
            shadow.direction = 'right'
            shadowVector.x = 1
        }

        if(shadow.body.onFloor()) {
            shadow.coyote = true
            this.stateMachine.transition('moveS')
        }

        shadow.setAccelerationX(shadow.accelX * shadowVector.x)


        if (shadow.body.velocity.x >= 0) shadow.direction = 'right'
        else shadow.direction = 'left'

        // detection if death & transition to death
        if (shadow.hp <= 0) {
            shadow.coyote = true
            this.stateMachine.transition('deathS')
        }
    }
}

// Death State:
// Shadow is killed from age, and restarts game
class DeathShadowState extends State {
    enter(scene, shadow) {
        scene.scene.restart()
    }
}