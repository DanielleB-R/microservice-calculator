const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const {Stack, List} = require('immutable')
const isNumber = require('lodash.isnumber')
const {json, createError} = require('micro')

const nrp = new NRP({
  port: 6379,
  scope: 'calculator'
})

const precedence = {
  '^': 3,
  '*': 2,
  '/': 2,
  '-': 1,
  '+': 1,
  '(': 0
}

const pop = (stack) => [stack.peek(), stack.pop()]

const transferBracketOperators = (stack, output) => {
  if (stack.size <= 0) {
    throw createError(400, 'Stack underflow')
  }

  const [operator, st1] = pop(stack)
  if (operator === '(') {
    return [st1, output]
  }
  return transferBracketOperators(st1, output.push(operator))
}

const resolvePrecedence = (operator, stack, output) => {
  const opPrecedence = precedence[operator]
  const stackPrecedence = precedence[stack.peek()] || 0
  if (opPrecedence < stackPrecedence) {
    const [stackOp, st1] = pop(stack)
    return resolvePrecedence(operator, st1, output.push(stackOp))
  }
  if (opPrecedence === stackPrecedence) {
    const [stackOp, st1] = pop(stack)
    return [st1.push(operator), output.push(stackOp)]
  }
  if (opPrecedence > stackPrecedence) {
    return [stack.push(operator), output]
  }
}

const exhaustStack = (stack, output) => {
  if (stack.size <= 0) {
    return output
  }
  return exhaustStack(stack.pop(), output.push(stack.peek()))
}

const convertInfix = (tokens) => {
  const [finalStack, finalOutput] = tokens.reduce(([stack, output], token) => {
    if (isNumber(token)) {
      return [stack, output.push(token)]
    }
    if (token === '(') {
      return [stack.push(token), output]
    }
    if (token === ')') {
      return transferBracketOperators(stack, output)
    }
    return resolvePrecedence(token, stack, output)
  }, [Stack(), List()])

  return exhaustStack(finalStack, finalOutput)
}

nrp.on(eventNames.infixTokensAvailable, ({id, tokens}) => {
  const rpnTokens = convertInfix(tokens)
  nrp.emit(eventNames.rpnTokensCalculated, {id, tokens: rpnTokens})
})

module.exports = () => 'OK'
