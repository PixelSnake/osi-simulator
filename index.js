const NetworkAdapter = require('./networkadapter')
const AbstractChannel = require('./abstractchannel')

const channel = new AbstractChannel(.99)
const na = new NetworkAdapter(channel)
na.sendBinaryData([0, 1, 0, 0, 1, 0, 1, 1])
