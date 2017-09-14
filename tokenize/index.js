const {List} = require('immutable')
const {createError, text} = require('micro')

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

module.exports = async (req) => tokenize(await text(req))
