class TimerService {
    constructor() {
        this.interval = 1
        this.tickRunning = false
        this.channels = []

        this.tick()
    }

    registerChannel(c) {
        this.channels.push(c)
    }

    tick() {
        if (this.tickRunning) {
            console.log('tick() already running, skipping this tick')
            return
        } else {
            setTimeout(() => this.tick(), this.interval)
        }
        this.tickRunning = true

        this.channels.forEach(c => c.tick())

        this.tickRunning = false
    }
}

module.exports = new TimerService()
