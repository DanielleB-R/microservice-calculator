const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const {List} = require('immutable')
const {createError} = require('micro')
const cond = require('lodash.cond')

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

const charIn = (str) => (c) => str.includes(c)

const tokenize = (expression) => {
  const [tokens, inProgress] = Array.from(expression).reduce(([tokens, inProgress], c) => (
    cond([
      [
        charIn(whitespaceChars),
        () => [tokens, inProgress]
      ],
      [
        charIn(operatorChars),
        () => [pushIntIfNecessary(tokens, inProgress).push(c), '']
      ],
      [
        charIn(numericChars),
        () => [tokens, inProgress + c]
      ],
      [
        () => true,
        () => {
          throw new Error(
            `Character ${c} not a valid part of an arithmetic expression`
          )
        }
      ]
    ])(c)
  ), [List(), ''])

  return pushIntIfNecessary(tokens, inProgress)
}

nrp.on(eventNames.calculationReceived, ({id, expr}) => {
  try {
    const tokens = tokenize(expr)
    nrp.emit(eventNames.infixTokensAvailable, {id, tokens})
  } catch (err) {
    nrp.emit(eventNames.calculationErrored, {id, message: err.message})
  }
})

module.exports = () => 'OK'
