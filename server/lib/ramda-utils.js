const R = require('ramda')

const createErrorFromAnything = _anything => {
  switch (R.type(_anything)) {
    case 'Error':
      return _anything
    case 'String':
      return new Error(_anything)
    default:
      return new Error(JSON.stringify(_anything))
  }
}

const rejectIfNil = R.curry((_err, _thing) =>
  R.isNil(_thing)
    ? Promise.reject(createErrorFromAnything(_err))
    : Promise.resolve(_thing)
)

module.exports = {
  rejectIfNil
}
