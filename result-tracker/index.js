const Redis = require('ioredis')
const {createError, json} = require('micro')
const url = require('url')
const flow = require('lodash.flow')
const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const redis = new Redis()
const STATE_HASH = 'calculation.state'
const RESULT_HASH = 'calculation.result'

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

nrp.on(eventNames.calculationReceived, async ({id}) => {
  await redis.hset(STATE_HASH, id, 'pending')
})

nrp.on(eventNames.calculationCompleted, async ({id, result}) => {
  await redis.hset(STATE_HASH, id, 'complete')
  await redis.hset(RESULT_HASH, id, result)
})

const getCalculationId = (req) => url.parse(req.url, true).query.id || null
const retrieveCalculation = async (id) => {
  if (id === null) {
    throw createError(400, 'Id Required')
  }

  const state = await redis.hget(STATE_HASH, id)
  if (state === null) {
    throw createError(404, 'Not Found')
  }
  if (state !== 'complete') {
    return {state}
  }

  const result = await redis.hget(RESULT_HASH, id)
  return {state, result}
}

const methodHandlers = {
  GET: flow([getCalculationId, retrieveCalculation])
}

module.exports = (req) => {
  const handler = methodHandlers[req.method]
  if (!handler) {
    throw createError(405, 'Method not allowed')
  }
  return handler(req)
}
