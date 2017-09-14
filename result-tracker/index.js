const Redis = require('ioredis')
const {createError, json} = require('micro')
const url = require('url')
const flow = require('lodash.flow')

const redis = new Redis()
const STATE_HASH = 'calculation.state'
const RESULT_HASH = 'calculation.result'

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

const updateCalculation = async (jsonPromise) => {
  const body = await jsonPromise
  if (!('id' in body)) {
    throw createError(400, 'Id Required')
  }
  if (body.state) {
    await redis.hset(STATE_HASH, body.id, body.state)
  }
  if (body.result) {
    await redis.hset(RESULT_HASH, body.id, body.result)
  }
  return {id: body.id}
}

const methodHandlers = {
  POST: flow([json, updateCalculation]),
  GET: flow([getCalculationId, retrieveCalculation])
}

module.exports = (req) => {
  const handler = methodHandlers[req.method]
  if (!handler) {
    throw createError(405, 'Method not allowed')
  }
  return handler(req)
}
