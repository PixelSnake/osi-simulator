const Channel = require('./channel')
const TimerService = require('./timerservice')

module.exports = class AbstractChannel {
    constructor() {
        this.tickCounter = 0
        this.sendingSymbolLength = 2

        this.decodedRecvBuffer = []
        this.recvBuffer = []
        this.sendBuffer = []
        this.upstream = new Channel(.99)

        TimerService.registerChannel(this)
    }

    connectDownstream(c) {
        this.downstream = c.upstream
        console.log('downstream linked')
    }

    write(data) {
        // manchester code
        for (let i = 0; i < data.length; ++i) {
            for (let x = 0; x < this.sendingSymbolLength; ++x) {
                const d = data[i]
                const amp = x < this.sendingSymbolLength / 2 ? d === 1 ? 1 : 0 : d === 1 ? 0 : 1
                this.sendBuffer.push(amp)
            }
        }
    }

    read(numBytes) {
        //console.log('reading', numBytes)

        const tolerance = .2
        const possibleValues = [0, 1]
        let recvWithoutNoise = []
        let data = []
        let lastSymbol
        let symbolBegin = 0
        let currentBitLength
        let i
        let successfullyDecodedBits = 0

        for (i = 0; i < this.recvBuffer.length && data.length < numBytes; ++i) {
            const amp = this.recvBuffer[i]
            let bit

            for (let v = 0; v < possibleValues.length; ++v) {
                if (amp > v - tolerance && amp < v + tolerance) {
                    bit = v
                    break
                }
            }

            //console.log(bit, data.length, this.decodedRecvBuffer.length)
            recvWithoutNoise.push(bit)

            if (i === 0) {
                lastSymbol = bit
                continue
            }

            // amplitude switch has happened
            if (currentBitLength === undefined && lastSymbol !== bit) {
                currentBitLength = i - symbolBegin
            }

            if (currentBitLength !== undefined && i === symbolBegin + 2 * currentBitLength) {
                // this is the symbol end position
                let bits = recvWithoutNoise.slice(symbolBegin, i)

                if (bits.length !== this.sendingSymbolLength) throw new Error()

                let first = bits[0]
                let last = bits[bits.length - 1]
                if (first === last) throw new Error()

                for (let i = 0; i < this.sendingSymbolLength; ++i) {
                    if (i < this.sendingSymbolLength / 2 && bits[i] !== first) throw new Error()
                    if (i >= this.sendingSymbolLength / 2 && bits[i] !== last) throw new Error()
                }

                data.push(first)
                successfullyDecodedBits += i - symbolBegin
                symbolBegin = i
                currentBitLength = undefined
            }

            lastSymbol = bit
        }

        //console.log('data:', [...this.decodedRecvBuffer, ...data].join())

        this.recvBuffer.splice(0, successfullyDecodedBits)

        if (this.decodedRecvBuffer.length + data.length < numBytes) {
            this.decodedRecvBuffer.push(...data)
            return []
        } else {
            const decoded = this.decodedRecvBuffer
            this.decodedRecvBuffer = []
            return [...decoded, ...data]
        }
    }

    tick() {
        this.tickCounter++

        this.writeTick()

        const upAmplitude = this.upstream.getAmplitude()
        //console.log('[->]', upAmplitude)

        if (this.downstream) {
            const downAmplitude = this.downstream.getAmplitude()
            this.recvBuffer.push(downAmplitude)
            //console.log('[<-]', downAmplitude)
        }
    }

    writeTick() {
        if (this.sendBuffer.length < 1) return

        const a = this.sendBuffer[0]
        this.sendBuffer.splice(0, 1)

        //console.log('writing', a)

        this.upstream.setAmplitude(a)
    }
}
