const Channel = require('./channel')
const TimerService = require('./timerservice')

module.exports = class AbstractChannel {
    constructor() {
        this.buffer = []
        this.channel = new Channel(.99)

        TimerService.registerChannel(this)
    }

    write(data) {

    }

    read(numBytes) {

    }

    tick() {
        const a = this.channel.getAmplitude()
        this.buffer.push(a)
        console.log(a)
    }
}
