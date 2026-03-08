class Player extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture, frame, direction, hp) {
        super(scene, x, y, texture, frame)

        // add object to existing scene
        scene.add.existing(this)    // add to existing
        scene.physics.add.existing(this) // add physics to existing
    
        // properties
        this.name = 'player'
        this.accelX = 300.0 // maybe make velocity for more control
        this.accelY = -250.0
        this.maxVelocityX = 150
        this.maxVelocityY = 300
        this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY)
        this.setGravityY(300)

        this.direction = direction
        this.hp = hp
        this.initialDist = true
        this.coyoteTime = 2000
        this.coyote = true

        // physics
        //const sizeDiffW = 60
        //const sizeRateW = 1.92 // only for offset
        //const sizeDiffY = 30
        //const sizeRateY = 1.3 // only for offset
        this.setSize(this.width, this.height/2).setOffset(0, this.height/2)
        this.setDragX(200)
        console.log("called constructor play")

        // sound effects
        // jump sound
        this.jumpSound = scene.sound.add('jump-sound', {
            volume: game.settings.volume
        })


        // initialize state machine managing hero (initial state, possible states, state args[])
        scene.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            jump: new JumpState(),
            deathP: new DeathPState(),
        }, [scene, this]) // scene context
    }
}


// IdleState:
// Player is currently not moving
class IdleState extends State {
    // enter initial call
    enter (scene, player) {

    }

    // executes every call/frame
    execute(scene, player) {
        console.log('idle')
        let playerVector = new Phaser.Math.Vector2(0, 0)
        // movement transition
        if(keyLEFT.isDown || keyRIGHT.isDown) {
            this.stateMachine.transition('move')
        }

        player.setAccelerationX(player.accelX * playerVector.x)

        // jump
        if(keySPACE.isDown) {
            player.body.setVelocityY(player.accelY)
            player.coyote = false

            scene.curr_comm = 'JUMP'
            player.jumpSound.play()

            this.stateMachine.transition('jump')
        }

        // detection if death & transition to death
        if (player.hp <= 0) {
            this.stateMachine.transition('deathP')
        }
        
    }
}

// MoveState:
// Player is currently moving
class MoveState extends State {
    // executes every call/frame
    execute(scene, player) {
        // use destructuring to make a local copy of the keyboard object
        let playerVector = new Phaser.Math.Vector2(0, 0)
        console.log('move')
        
        
        if(keyLEFT.isDown) {
            player.direction = 'left'
            console.log('left')
            playerVector.x = -1
            scene.curr_comm = 'LEFT'
        } else if(keyRIGHT.isDown) {
            player.direction = 'right'
            console.log('right')
            playerVector.x = 1
            scene.curr_comm = 'RIGHT'
        }
        else {
            scene.curr_comm = 'NONE'
        }

        if(keySPACE.isDown || !player.body.onFloor()) {
            if(keySPACE.isDown) {
                player.body.setVelocityY(player.accelY)
                player.coyote = false
                scene.curr_comm = 'JUMP'
                player.jumpSound.play()
            }
            this.stateMachine.transition('jump')
        }

        player.setAccelerationX(player.accelX * playerVector.x)

        // check if the player is static relative to body
        if (player.body.velocity.x == 0 && player.body.accelerationX == 0) this.stateMachine.transition('idle')

        // detection if death & transition to death
        if (player.hp <= 0) {
            this.stateMachine.transition('deathP')
        }
    }
}

// JumpState:
// Player is currently jumping
class JumpState extends State {
    // executes every call/frame
    execute(scene, player) {
        console.log('jump')
        // use destructuring to make a local copy of the keyboard object
        let playerVector = new Phaser.Math.Vector2(0, 0)

        // coyote jump
        if(keySPACE.isDown && player.coyote) {
            player.body.setVelocityY(player.accelY)
            player.coyote = false
            scene.curr_comm = 'JUMP'
            player.jumpSound.play()
            
        }
        if (player.coyote) scene.time.delayedCall(player.coyoteTime, () => {
            player.coyote = false
        })
        
        
        if(keyLEFT.isDown) {
            player.direction = 'left'
            playerVector.x = -1
            scene.curr_comm = 'LEFT'
        } else if(keyRIGHT.isDown) {
            player.direction = 'right'
            playerVector.x = 1
            scene.curr_comm = 'RIGHT'
        }
        else {
            scene.curr_comm = 'NONE'
        }

        if(player.body.onFloor() || player.body.touching.down) {
            player.coyote = true
            this.stateMachine.transition('move')
        }

        player.setAccelerationX(player.accelX * playerVector.x)


        if (player.body.velocity.x >= 0) player.direction = 'right'
        else player.direction = 'left'

        // detection if death & transition to death
        if (player.hp <= 0) {
            player.coyote = true
            this.stateMachine.transition('deathP')
        }
    }
}

// Death State:
// Player is killed from age, and restarts game
class DeathPState extends State {
    enter(scene, player) {
        scene.scene.restart()
    }
}