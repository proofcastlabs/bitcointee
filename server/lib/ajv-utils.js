const R = require('ramda')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const { ERROR_SCHEMA_VALIDATION_FAILED } = require('./errors')

// Keep it global for efficiency reasons
// https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization
const ajv = new Ajv()
addFormats(ajv)

const getValidationFunction = R.memoizeWith(JSON.stringify, _schema =>
  Promise.resolve(ajv.compile(_schema))
)

const handleValidationError = _validationError => {
  const error = _validationError.errors.reduce(
    (_acc, _cur) => _acc + `${_cur.instancePath} ${_cur.message}\n`,
    `${ERROR_SCHEMA_VALIDATION_FAILED}:\n`
  )

  return Promise.reject(new Error(error))
}

const validateJsonAsyncSchema = R.curry((_validationFunction, _json) =>
  _validationFunction(_json)
    .then(_ => _json)
    .catch(handleValidationError)
)

const validateJsonSyncSchema = R.curry((_validationFunction, _json) =>
  Promise.resolve(_validationFunction(_json))
    .then(_valid =>
      _valid ? _json : Promise.reject(new Ajv.ValidationError(_validationFunction.errors))
    )
    .catch(handleValidationError)
)

const validateJson = R.curry((_schema, _json) =>
  getValidationFunction(_schema).then(_validate =>
    _schema.$async
      ? validateJsonAsyncSchema(_validate, _json)
      : validateJsonSyncSchema(_validate, _json)
  )
)

module.exports = {
  getValidationFunction,
  validateJson
}
