class EnemyEye extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture, frame, direction, target, shadTarget) {
        super(scene, x, y, texture, frame)

        // add object to existing scene
        scene.add.existing(this)    // add to existing
        scene.physics.add.existing(this) // add physics to existing
        
    
        // speed properties
        this.accelX = 75.0
        this.accelY = 35.0
        this.maxSpeedX = 75
        this.maxSpeedY = 35
        this.setMaxVelocity(this.maxSpeedX, this.maxSpeedY)
        this.slowingRadiusX = this.maxSpeedX / 1.0
        this.slowingRadiusY = this.maxSpeedY / 1.0

        // properties
        this.direction = direction
        this.firing = false
        this.firingRange = 30
        this.firingLimitR = 50
        this.hp = 100.0
        this.target = target
        this.shadTarget = shadTarget
        this.shadRatio = 4 // division or sensitivity applied to distance to increase chance of chasing shadow
        this.targetGivenLoc = new Phaser.Math.Vector2(target.x, target.y)

        this.found = false // variable for determining which state if in watchState, should transition to

        // behavior properties (more modular, more non-deterministic or behavioral)
        this.sensitivity = 5
        this.trackingDist = 40 // tracking distance for both x/y (optional, good if the collision process removes the setVelocity to zero, and disabling firing)
        this.trackingMOE = 10 // margin of error for tracking dist, in which it starts going back and forth within this area (sensitive due to being tied to vel)
        this.watchingProb = 0.25 // likely hood to enter watching state when locating player
        this.guidingMargin = 250.0 // margin of error for patrolling with semi-guidance tips
        this.freqTips = 15000.0 // frequency of tips in ms

        // behavioral distance properties
        this.overshootDist = 100.0 // overshoot distance, until waiting for new information
        this.detectionDist = 25.0 // detection distance to move to chase
        this.loseDist = 100.0 // detection distance to lose track

        // timer
        this.timer = 0

        // physics
        this.setImmovable(true)
        this.body.setAllowGravity(false)
        this.setDragX(100)
        this.setDragY(50)
        //console.log("called constructor")

        // initialize state machine managing eye enemy (initial state, possible states, state args[])
        scene.eyeFSM = new StateMachine('patrol', {
            patrol: new PatrolState(),
            watch: new WatchState(),
            chase: new ChaseState(),
            charge: new ChargeState(),
            fire: new FireState()
        }, [scene, this, this.target]) // scene context
    }

    chargeAttack(dur) {

    }
}

// PatrolState
// 1) Patrols the map, has a chance of finding the enemy if close enough
// 2) Switches to chase if player is in abstract world
// 3) Will occasionally watch, waiting, observing, if it reaches location soon enough, and overshoots
class PatrolState extends State {
    // executes upon entering
    enter(scene, enemy, target) {
        //console.log('patrol')
    }

    // executes every call/frame
    execute(scene, enemy, target) {
        // update current position of target location
        enemy.timer += scene.curr_delta
        if (enemy.timer > enemy.freqTips) {
            enemy.timer = 0
            //console.log("new position")
            // randomly given location for a hint (think alien isolation kind of)
            enemy.targetGivenLoc = new Phaser.Math.Vector2(target.x + Phaser.Math.Between(-enemy.guidingMargin, enemy.guidingMargin), target.y + Phaser.Math.Between(-enemy.guidingMargin, enemy.guidingMargin))
        }

        let enemyVector = new Phaser.Math.Vector2(0, 0)

        // detection
        const directionX = (enemy.targetGivenLoc.x > enemy.x) ? 1 : -1
        const directionY = (enemy.targetGivenLoc.y > enemy.y) ? 1 : -1

        const distance = Math.abs(Math.pow(Math.pow(enemy.targetGivenLoc.x  - enemy.x, 2) + Math.pow(enemy.targetGivenLoc.y - enemy.y, 2), 1/2))
        const distanceX = Math.abs(enemy.targetGivenLoc.x - enemy.x)
        const distanceY = Math.abs(enemy.targetGivenLoc.y - enemy.y)

        // slowdown calculation to prevent overshooting, and movement
        if (distanceX < enemy.slowingRadiusX) {
            enemyVector.x = directionX * (enemy.accelX * (distanceX / enemy.slowingRadiusX))
        }
        else if (distanceX > enemy.trackingMOE) enemyVector.x = directionX * enemy.accelX
        if (distanceY < enemy.slowingRadiusY) {
            enemyVector.y = directionY * (enemy.accelY * (distanceY / enemy.slowingRadiusY))
        }
        else if (distanceY > enemy.trackingMOE) enemyVector.y = directionY * enemy.accelY

        if (distance <= enemy.trackingMOE) {
            this.stateMachine.transition('watch')
        }

        //console.log(enemy.targetGivenLoc)
        enemy.body.setAcceleration(enemyVector.x, enemyVector.y)

        const playerDistance = Math.abs(Math.pow(Math.pow(target.x  - enemy.x, 2) + Math.pow(target.y - enemy.y, 2), 1/2))

        if (playerDistance < enemy.detectionDist || scene.manager.mode === 'STATIC' || scene.manager.mode === 'REPLAY') {
            enemy.found = true
            const watchRand = Phaser.Math.Between(0, 100)

            if (watchRand > enemy.watchingProb * 100) this.stateMachine.transition('chase')
            else this.stateMachine.transition('watch')
        }
    }
}
// WatchState
// 1) Watches from a position, not moving, waiting for a new location hint, or player to stumble into them
// 2) Switches to chase if player is in abstract world
class WatchState extends State {
    // executes upon entering
    enter(scene, enemy, target) {
        enemy.timer = Phaser.Math.Between(enemy.timer/2.0, enemy.timer)
        
        //console.log('watch')
    }

    // executes every call/frame
    execute(scene, enemy, target) {
        // update current position of target location
        enemy.timer += scene.curr_delta
        if (enemy.timer > enemy.freqTips) {
            enemy.timer = 0
            //console.log("new position")
            // randomly given location for a hint (think alien isolation kind of)
            enemy.targetGivenLoc = new Phaser.Math.Vector2(target.x + Phaser.Math.Between(-enemy.guidingMargin, enemy.guidingMargin), target.y + Phaser.Math.Between(-enemy.guidingMargin, enemy.guidingMargin))

            if (!enemy.found) this.stateMachine.transition('patrol')
            else this.stateMachine.transition('chase')
        }

        let enemyVector = new Phaser.Math.Vector2(0, 0)

        // detection
        const directionX = (enemy.targetGivenLoc.x > enemy.x) ? 1 : -1
        const directionY = (enemy.targetGivenLoc.y > enemy.y) ? 1 : -1

        const distance = Math.abs(Math.pow(Math.pow(enemy.targetGivenLoc.x  - enemy.x, 2) + Math.pow(enemy.targetGivenLoc.y - enemy.y, 2), 1/2))

        if (distance > enemy.overshootDist) {
            enemy.body.setAcceleration(enemyVector.x, enemyVector.y)
        }
    }
}



// ChaseState
// 1) Chases the closest player-like entity
// 2) Will get into firing range, to transition into charge
// 3) If in physical world, can lose player
class ChaseState extends State {
    // executes upon entering
    enter(scene, enemy, target) {
        
        
        //console.log('chase')
    }
    
    // executes every call/frame
    execute(scene, enemy, target) {
        // closest target
        if (scene.manager.mode == 'REPLAY' && enemy.shadTarget.visible) {
            enemy.targetGivenLoc.x = enemy.shadTarget.x
            enemy.targetGivenLoc.y = enemy.shadTarget.y
        }
        else {
            enemy.targetGivenLoc.x = target.x
            enemy.targetGivenLoc.y = target.y
        }


        let enemyVector = new Phaser.Math.Vector2(0, 0)

        // detection
        const directionX = (enemy.targetGivenLoc.x > enemy.x) ? 1 : -1
        const directionY = (enemy.targetGivenLoc.y > enemy.y) ? 1 : -1

        const distance = Math.abs(Math.pow(Math.pow(enemy.targetGivenLoc.x  - enemy.x, 2) + Math.pow(enemy.targetGivenLoc.y - enemy.y, 2), 1/2))
        const distanceX = Math.abs(enemy.targetGivenLoc.x - enemy.x)
        const distanceY = Math.abs(enemy.targetGivenLoc.y - enemy.y)



        // slowdown calculation to prevent overshooting, and movement
        if (distanceX < enemy.slowingRadiusX) {
            enemyVector.x = directionX * (enemy.accelX * (distanceX / enemy.slowingRadiusX))
        }
        else if (distanceX > enemy.trackingMOE) enemyVector.x = directionX * enemy.accelX
        if (distanceY < enemy.slowingRadiusY) {
            enemyVector.y = directionY * (enemy.accelY * (distanceY / enemy.slowingRadiusY))
        }
        else if (distanceY > enemy.trackingMOE) enemyVector.y = directionY * enemy.accelY

        enemyVector.x = (enemyVector.x - enemy.body.velocity.x) * enemy.sensitivity
        enemyVector.y = (enemyVector.y - enemy.body.velocity.y) * enemy.sensitivity

        enemy.body.setAcceleration(enemyVector.x, enemyVector.y)

        if ((scene.manager.mode == 'IDLE' || scene.manager.mode == 'RECORDING') && distance > enemy.loseDist) {
            enemy.found = false
            //console.log('lost target, continuing patrol')
            this.stateMachine.transition('patrol')
        }

        
        if (!enemy.firing && distance <= enemy.firingRange) {
            // this will determine firing range?
            enemy.firing = true
            this.stateMachine.transition('charge')
        }
    }
}

// ChargeState
// Charges it's main weapon, in this time period, it has limited movement speed and direction
class ChargeState extends State {
    // executes upon entering
    enter(scene, enemy, target) {
        const str = 65
        const dur = 3000
        scene.distort(str, dur)
        scene.time.delayedCall(dur * 2, () => {
            enemy.firing = false
        })

        scene.time.delayedCall(dur, () => {
            scene.sound.play('wave-sound', {
                volume: game.settings.volume * 1.1,
                rate: 2500.0/dur // 5 sec / target (#) sec
            })
            this.stateMachine.transition('fire')
        })

        scene.sound.play('charge-sound', {
            volume: game.settings.volume * 1.1,
            rate: 5000.0/dur // 5 sec / target (#) sec
        })
        
        //console.log('chase')
    }

    // executes every call/frame
    execute(scene, enemy, target) {
        if (scene.manager.mode == 'REPLAY' && Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.shadTarget.x, enemy.shadTarget.y) * enemy.shadRatio > Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y)) {
            enemy.targetGivenLoc.x = enemy.shadTarget.x
            enemy.targetGivenLoc.y = enemy.shadTarget.y
        }
        else {
            enemy.targetGivenLoc.x = target.x
            enemy.targetGivenLoc.y = target.y
        }


        let enemyVector = new Phaser.Math.Vector2(0, 0)

        // detection
        const directionX = (enemy.targetGivenLoc.x > enemy.x) ? 1 : -1
        const directionY = (enemy.targetGivenLoc.y > enemy.y) ? 1 : -1

        const distance = Math.abs(Math.pow(Math.pow(enemy.targetGivenLoc.x  - enemy.x, 2) + Math.pow(enemy.targetGivenLoc.y - enemy.y, 2), 1/2))
        const distanceX = Math.abs(enemy.targetGivenLoc.x - enemy.x)
        const distanceY = Math.abs(enemy.targetGivenLoc.y - enemy.y)



        // slowdown calculation to prevent overshooting, and movement
        if (distanceX < enemy.slowingRadiusX) {
            enemyVector.x = directionX * (enemy.accelX * (distanceX / enemy.slowingRadiusX))
        }
        else if (distanceX > enemy.trackingMOE) enemyVector.x = directionX * enemy.accelX
        if (distanceY < enemy.slowingRadiusY) {
            enemyVector.y = directionY * (enemy.accelY * (distanceY / enemy.slowingRadiusY))
        }
        else if (distanceY > enemy.trackingMOE) enemyVector.y = directionY * enemy.accelY

        enemyVector.x = (enemyVector.x - enemy.body.velocity.x) * enemy.sensitivity
        enemyVector.y = (enemyVector.y - enemy.body.velocity.y) * enemy.sensitivity

        enemy.body.setAcceleration(enemyVector.x / 2.0, enemyVector.y / 2.0)
    }
}

// FireState
// Fires it's main weapon, tracking the enemy while firing for a duration of time at even more limited speed
class FireState extends State {
    // executes upon entering
    enter(scene, enemy, target) {
        scene.enemyProj.start()
        
        //console.log('fire')
    }

    // executes every call/frame
    execute(scene, enemy, target) {
        let enemyVector = new Phaser.Math.Vector2(0, 0)

        enemy.body.setAcceleration(enemyVector.x, enemyVector.y)

        if (enemy.firing == false) {
            scene.enemyProj.stop()
            //console.log('stopping anim')
            this.stateMachine.transition('chase')
        }
    }
}