const NetworkAdapter = require('./networkadapter')
const AbstractChannel = require('./abstractchannel')

const channel1 = new AbstractChannel(.9)
const na1 = new NetworkAdapter(channel1, 'NA1')

const channel2 = new AbstractChannel(.9)
const na2 = new NetworkAdapter(channel2, 'NA2')

na1.connect(na2)

const data = []
const message = 'Hello World!'
for (let i = 0; i < message.length; ++i) {
    let binStr = message.charCodeAt(i).toString(2)
    for (let b = 0; b <= 8 - binStr.length; ++b) {
        binStr = '0' + binStr
    }
    for (let j = 0; j < binStr.length; ++j) {
        data.push(parseInt(binStr[j]))
    }
}

na1.sendBinaryData(data)
function recv() {
    const msg = na2.receiveBinaryData(data.length)
    if (!msg) {
        setTimeout(() => {
            recv()
        }, 1000)
    }
}
recv()
