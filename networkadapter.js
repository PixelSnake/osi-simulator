module.exports = class Layer1 {
    constructor(channel, name) {
        //this.generatorPolynom = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0]
        this.generatorPolynom = [1, 1, 0, 1, 0, 1]
        this.channel = channel
        this.name = name
    }

    // connects to another networkadapter
    connect(na) {
        na.channel.connectDownstream(this.channel)
        this.channel.connectDownstream(na.channel)
    }

    polynomDivision(dividend, divisor) {
      const len = divisor.length
      let pos = 0
      let takeLen = len
      let rest = []
      let result = []

      while (pos < dividend.length) {
          //console.log(dividend.join(''), ':', divisor.join(''), pos, takeLen)
          //console.log(rest.join(''), dividend.slice(pos, pos + takeLen).join(''))
        const divPart = [...rest, ...dividend.slice(pos, pos + takeLen)]
        pos += takeLen
        result = []

        for (let i = 0; i < len; ++i) {
          result.push(divPart[i] ^ divisor[i])
        }

        //console.log(divPart.join(''), 'xor', divisor.join(''), '=', result.join(''))

        let numZeros;
        for (numZeros = 0; numZeros < len; ++numZeros) {
          if (result[numZeros] === 1) break
        }

        let numDown = Math.min(numZeros, dividend.length - pos);
        takeLen = numDown
        rest = result.slice(numDown, numDown + result.length)
      }

      return result
    }

    sendBinaryData(data) {
        const poly = this.generatorPolynom
        const n = poly.length - 1
        let divData = [...data]

        for (let i = 0; i < n; ++i) {
            divData.push(0)
        }

        let rest = this.polynomDivision(divData, poly)
        rest = rest.slice(rest.length - n, rest.length)
        //console.log('original data:', data)
        //console.log('sent data:    ', [...data, ...rest].join(''))

        this.channel.write([...data, ...rest])
    }

    receiveBinaryData(_numBytes) {
        let poly = this.generatorPolynom
        const n = poly.length - 1

        const numBytes = _numBytes + n
        let data

        try {
            data = this.channel.read(numBytes)
        } catch (e) {
            return
        }

        if (data.length < 1) {
            console.log(`[${this.name}] No data:`, data)
            return
        }
        //console.log('received data:', data.join(''))

        let rest = this.polynomDivision(data, poly)
        rest = rest.slice(rest.length - n, rest.length)

        let valid = true
        for (let i = 0; i < rest.length; ++i) {
          if (rest[i] === 1) {
            valid = false
            break
          }
        }

        if (!valid) {
          console.log(`[${this.name}] Data transmission failed`)
          return
        }

        const message = data.slice(0, data.length - n)

        let _message = ''
        for (let i = 0; i < message.length; i += 8) {
          const c = parseInt(message.slice(i, i + 8).join(''), 2)
          _message += String.fromCharCode(c)
        }

        console.log(_message)
        return _message
    }
}
