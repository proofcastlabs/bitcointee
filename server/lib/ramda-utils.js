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

const mapAll = R.curry((_promiseFn, _list) =>
  Promise.resolve(R.type(_list) === 'Array' ? _list : [_list])
    .then(_ => Promise.all(_list.map(_promiseFn)))
)

const importAsync = R.memoizeWith(R.identity, async (_lib, _name) => {
  const lib = await import(_lib)
  console.log(lib)
  return ({
    [_name]: lib
  })
})


module.exports = {
  mapAll,
  importAsync,
  rejectIfNil,
}
