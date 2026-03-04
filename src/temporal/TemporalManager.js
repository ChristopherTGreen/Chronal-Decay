class TemporalManager {
    constructor() {
        this.history = [] // history of past commands (maybe find way to save memory)
    }

    record(action, data) {
        this.history.push({
            frame: this.scene.game.loop.frame,
            action: action,
            data: data
        })
    }

    getCommandsForFrame(frame) {
        // return all actions that have happened on a specific frame
        return this.history.filter(cmd => cmd.frame === frame)
    }
}