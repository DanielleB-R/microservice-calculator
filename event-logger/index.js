const NRP = require('node-redis-pubsub')
const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})


nrp.on('*', (data, channel) => {
  console.log(`${channel}: ${JSON.stringify(data)}`)
})

module.exports = () => 'OK'
