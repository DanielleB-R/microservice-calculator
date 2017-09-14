const fetch = require('node-fetch')
const {createError, text} = require('micro')

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

module.exports = pipe(text, callTokenize, callInfix, callRpn)
