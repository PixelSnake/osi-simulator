module.exports = class Channel {
    constructor(snr) {
        this.amplitude = 0
        this.snr = snr
    }

    setAmplitude(a) {
        this.amplitude = a
    }

    getAmplitude() {
        return this.amplitude + ((Math.random() - .5) * (1 - this.snr))
    }
}
