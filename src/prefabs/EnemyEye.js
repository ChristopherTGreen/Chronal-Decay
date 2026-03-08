class EnemyEye extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, texture, frame, direction, target) {
        super(scene, x, y, texture, frame)

        // add object to existing scene
        scene.add.existing(this)    // add to existing
        scene.physics.add.existing(this) // add physics to existing
    
        // properties
        this.accelX = 125.0
        this.accelY = 50.0

        this.direction = direction
        this.firing = false
        this.trackingDist = 40 // tracking distance for both x/y (optional, good if the collision process removes the setVelocity to zero, and disabling firing)
        this.trackingMOE = 20 // margin of error for tracking dist, in which it starts going back and forth within this area (sensitive due to being tied to vel)
        this.firingRange = 200
        this.firingLimitR = 50
        this.hp = 100.0
        this.target = target

        // physics
        this.setImmovable(true)
        this.body.setAllowGravity(false)
        this.setDragX(100)
        this.setDragY(25)
        console.log("called constructor")

        // initialize state machine managing eye enemy (initial state, possible states, state args[])
        scene.eyeFSM = new StateMachine('chase', {
            patrol: new PatrolState(),
            chase: new ChaseState(),
            charge: new ChargeState(),
            fire: new FireState()
        }, [scene, this, this.target]) // scene context
    }
}

// PatrolState
// Patrols the map, has a chance of finding the enemy if close enough
class PatrolState extends State {
    // WIP
}

// ChaseState
// Chases the closest player-like entity
class ChaseState extends State {
    // executes every call/frame
    execute(scene, enemy, target) {
        // x movement
        // direction found through boolean
        const directionX = (target.x > enemy.x) ? 1 : -1
        const distanceX = Math.abs(target.x - enemy.x)
        const distance = Math.abs(Math.pow(Math.pow(target.x - enemy.x, 2) + Math.pow(target.y - enemy.y, 2), 1/2))

        const avoidRate = 8
        const avoidPlayerRate = 4
        
        let enemyVector = new Phaser.Math.Vector2(0, 0)

        // aligns itself with enemy on the x axis, before slowing down
        // secondary condition, if player is too close, will cancel 
        if (distance > enemy.trackingDist && distanceX < enemy.trackingMOE * avoidPlayerRate*2) {
            // if outside zone, close in, if too close, pull away
            if (distanceX < enemy.trackingMOE * avoidPlayerRate) enemyVector.x = (directionX > 0) ? 1 : -1
            else enemyVector.x = (directionX > 0) ? 1 : -1
        }

        enemy.body.setAccelerationX(enemy.accelX * enemyVector.x)

        // y movement
        // finds distance on the y
        // very similar to soldierbike, but will always try to be high up slightly
        // note: two cases, player or cycle, player means less vertical height, cycle means more height (doesn't stop moving from distance)
        const distanceY = target.y - enemy.y

        // aligns itself with enemy above or below, relative to player's y axis, and closest position
        if (distance > enemy.trackingDist && enemy.y < target.y && distanceY + (1 + Math.abs(enemy.body.acceleration.y/10)) > enemy.trackingMOE*avoidRate) {
            console.log("eye: going roughly above target, downwards")
            enemyVector.y = 1
        }
        else if (distance > enemy.trackingDist && distanceY < enemy.trackingMOE * avoidPlayerRate){
            console.log("eye: too low, rising")
            enemyVector.y = -1
        }

        enemy.body.setAccelerationY(enemy.accelY * enemyVector.y)
        
        // detection to fire & charge weapon
        // if (distance < enemy.firingRange && distance > enemy.firingLimitR && !enemy.firing) {
        //     enemy.firing = true
        //     // wait 500ms to fire (if still alive)
        //     scene.time.delayedCall(1200, () => {
        //         if (enemy && enemy.active) this.stateMachine.transition('fire')
        //     })
        // }
    }
}

// ChargeState
// Charges it's main weapon, in this time period, it has limited movement speed and direction
class ChargeState extends State {
    // WIP
}

// FireState
// Fires it's main weapon, tracking the enemy while firing for a duration of time at even more limited speed
class FireState extends State {
    // wip
}