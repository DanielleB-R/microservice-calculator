const NRP = require('node-redis-pubsub')
const eventNames = require('../event-names')

const {Stack, List} = require('immutable')
const isNumber = require('lodash.isnumber')
const {json, createError} = require('micro')
const cond = require('lodash.cond')

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
  return operator === '('
    ? [st1, output]
    : transferBracketOperators(st1, output.push(operator))
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
  return stack.size > 0
    ? exhaustStack(stack.pop(), output.push(stack.peek()))
    : output
}

const equals = (target) => (value) => value === target

const convertInfix = (tokens) => {
  const [finalStack, finalOutput] = tokens.reduce(([stack, output], token) => (
    cond([
      [isNumber, (token) => [stack, output.push(token)]],
      [equals('('), (token) => [stack.push(token), output]],
      [equals(')'), () => transferBracketOperators(stack, output)],
      [() => true, (token) => resolvePrecedence(token, stack, output)]
    ])(token)
  ), [Stack(), List()])

  return exhaustStack(finalStack, finalOutput)
}

nrp.on(eventNames.infixTokensAvailable, ({id, tokens}) => {
  try {
    const rpnTokens = convertInfix(tokens)
    nrp.emit(eventNames.rpnTokensCalculated, {id, tokens: rpnTokens})
  } catch (err) {
    nrp.emit(eventNames.calculationErrored, {id, message: err.message})
  }
})

module.exports = () => 'OK'
