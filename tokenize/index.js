const fetch = require('node-fetch')
const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const {List} = require('immutable')
const {createError, text} = require('micro')

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

const whitespaceChars = ' \t\n'
const operatorChars = '(+-*/^)'
const numericChars = '0123456789'

const pushIntIfNecessary = (tokens, inProgress) => {
  return inProgress.length > 0
    ? tokens.push(parseInt(inProgress))
    : tokens
}

const tokenize = (expression) => {
  const [tokens, inProgress] = Array.from(expression).reduce(([tokens, inProgress], c) => {
    if (whitespaceChars.includes(c)) {
      return [tokens, inProgress]
    }
    if (operatorChars.includes(c)) {
      return [
        pushIntIfNecessary(tokens, inProgress).push(c),
        ''
      ]
    }
    if (numericChars.includes(c)) {
      return [tokens, inProgress + c]
    }

    throw createError(400, `Character ${c} not a valid part of an arithmetic expression`)
  }, [List(), ''])

  return pushIntIfNecessary(tokens, inProgress)
}

const pipe = (...fns) => (x) => (
  fns.reduce(
    (prev, f) => prev.then(f),
    Promise.resolve(x)
  )
)


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

const endCalculation = (id) => async (result) => (
  nrp.emit(eventNames.calculationCompleted, {id, result})
)

nrp.on(eventNames.calculationReceived, ({id, expr}) => {
  const tokens = tokenize(expr)
  pipe(callInfix, callRpn, endCalculation(id))(tokens)
})

module.exports = () => 'OK'
