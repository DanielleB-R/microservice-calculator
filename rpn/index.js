const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const isNumber = require('lodash.isnumber')
const {createError, json} = require('micro')
const {Stack} = require('immutable')

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

const binaryOperators = {
  '+': (op1, op2) => op2 + op1,
  '-': (op1, op2) => op2 - op1,
  '*': (op1, op2) => op2 * op1,
  '/': (op1, op2) => op2 / op1,
  '^': (op1, op2) => op2 ** op1
}

const pop = (stack) => [stack.peek(), stack.pop()]

const evaluateRpn = (tokens) => {
  const finalStack = tokens.reduce((stack, token) => {
    if (isNumber(token)) {
      return stack.push(token)
    }

    if (token in binaryOperators) {
      if (stack.size < 2) {
        throw createError(400, 'Stack underflow')
      }
      const [op1, st1] = pop(stack)
      const [op2, st2] = pop(st1)
      return st2.push(binaryOperators[token](op1, op2))
    }

    throw createError(400, `Unknown token ${token}`)
  }, Stack())

  if (finalStack.size > 1) {
    throw createError(400, `Multiple values (${JSON.stringify(finalStack.toJS())}) remaining on stack`)
  }

  return finalStack.peek()
}

nrp.on(eventNames.rpnTokensCalculated, ({id, tokens}) => {
  try {
    const result = evaluateRpn(tokens)
    nrp.emit(eventNames.calculationCompleted, {id, result})
  } catch (err) {
    nrp.emit(eventNames.calculationErrored, {id, message: err.message})
  }
})

module.exports = () => 'OK'
