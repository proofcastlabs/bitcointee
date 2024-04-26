const {
  setCors,
  setBodyParser,
  addRouterToApp,
  setRequestsLoggingInfo,
  applyDefaultErrorHandler,
} = require('./app-utils')
const express = require('express')
const { getRoutes } = require('./routes/v1/get-routes')
const { rejectIfNil } = require('./ramda-utils')

module.exports.getApp = _ws =>
  rejectIfNil('Invalid ws instance:', _ws)
    .then(_ => express())
    .then(setCors)
    .then(setBodyParser)
    .then(setRequestsLoggingInfo)
    .then(addRouterToApp('/v1', getRoutes(_ws)))
    .then(applyDefaultErrorHandler)
