const cors = require('cors')
const express = require('express')
const { prop, curry, } = require('ramda')
const { logger } = require('./get-logger')

const logRequestInfo = (_req, _res, _next) => {
  const headers = prop('headers', _req)
  const host = prop('host', headers)
  const hasBody = _req._body
  logger.info(`[${_req.method}] ${_req.url} from ${host}`)
  logger.info(`[headers] ${JSON.stringify(_req.rawHeaders)}`)
  logger.info(`[body]    ${hasBody ? JSON.stringify(_req.body) : ''}`)
  _next()
}

const setRequestsLoggingInfo = _app => {
  _app.use(logRequestInfo)
  return Promise.resolve(_app)
}

const addRouterToApp = curry((_path, _getRouterFxn, _app) => {
  return _getRouterFxn()
    .then(_router => _app.use(_path, _router))
    .then(_ => _app)
})

const setBodyParser = _app => {
  _app.use(express.json())
  return Promise.resolve(_app)
}

const setCors = _app => {
  _app.use(cors({
    origin: '*',
    methods: ['POST', 'GET'],
    credentials: true
  }))

  return Promise.resolve(_app)
}

const applyRoutesToApp = curry((_routes, _app) => {
  _routes.map(({ type, route, fxn }) => _app[type](route, fxn))
  return Promise.resolve(_app)
})

const defaultErrorHandler = (_err, _req, _res, _next) => {
  logger.warn('Default error handler')
  logger.error(_err)
  _res.status(500).send({})
}

const applyDefaultErrorHandler = _app => {
  logger.debug('Applyng default error handler...')
  _app.use(defaultErrorHandler)

  return Promise.resolve(_app)
}

module.exports = {
  setCors,
  setBodyParser,
  logRequestInfo,
  addRouterToApp,
  applyRoutesToApp,
  setRequestsLoggingInfo,
  applyDefaultErrorHandler,
}
