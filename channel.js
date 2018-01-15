module.exports = class Channel {
    constructor(snr) {
        this.amplitude = 0
        this.snr = snr
    }

    setAmplitude(a) {
        this.amplitude = a
    }

    getAmplitude() {
        return this.amplitude + (Math.pow(Math.random() * 2, 4) * (1 - this.snr))
    }
}
