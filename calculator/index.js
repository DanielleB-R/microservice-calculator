const fetch = require('node-fetch')
const {createError, text, send} = require('micro')
const uuid = require('uuid/v4')
const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

const pipe = (...fns) => (x) => (
  fns.reduce(
    (prev, f) => prev.then(f),
    Promise.resolve(x)
  )
)

const callTokenize = async (expr) => {
  const response = await fetch('http://localhost:3212', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: expr
  })
  if (!response.ok) {
    throw createError(response.status, await response.text())
  }

  return response.json()
}

const callExternal = (port) => async (tokens) => {
  const response = await fetch(`http://localhost:${port}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tokens)
  })
  if (!response.ok) {
    throw createError(response.status, await response.text())
  }

  return response.json()
}

const callInfix = callExternal(3211)
const callRpn = callExternal(3210)

const beginCalculation = (id) => (
  nrp.emit(eventNames.calculationReceived, {id})
)

const endCalculation = (id) => async (result) => (
  nrp.emit(eventNames.calculationCompleted, {id, result})
)

module.exports = async (req, res) => {
  const expr = await text(req)
  const calculationId = uuid()
  await beginCalculation(calculationId)
  pipe(callTokenize, callInfix, callRpn, endCalculation(calculationId))(expr)
  send(res, 200, {id: calculationId})
}
