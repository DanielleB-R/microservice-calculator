const {createError, text, send} = require('micro')
const uuid = require('uuid/v4')
const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

const beginCalculation = (id, expr) => (
  nrp.emit(eventNames.calculationReceived, {id, expr})
)

module.exports = async (req) => {
  const expr = await text(req)
  const calculationId = uuid()
  beginCalculation(calculationId, expr)
  return {id: calculationId}
}
