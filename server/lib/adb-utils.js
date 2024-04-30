const R = require('ramda')
const adb = require('adbkit')
const config = require('../config.json')
const { logger } = require('./get-logger')
const { KEY_DEVICE, KEY_PACKAGE_NAME, KEY_ID } = require('./schemas/keys')

const adbClient = adb.createClient({ host: '127.0.0.1' })

const getPackageName = () =>
  config[KEY_DEVICE][KEY_PACKAGE_NAME]

const getDeviceId = () =>
  config[KEY_DEVICE][KEY_ID]

const getActivityOpts = () => {
  const packageName = getPackageName()
  return ({
    action: 'android.intent.action.MAIN',
    component: `${packageName}/${packageName}.MainActivity`
  })
}

const getAdbClient = () =>
  Promise.resolve(adbClient)

const adbCallback = R.curry((_resolve, _reject, _err) =>
  _err === null ? _resolve() : _reject(_err)
)

const startActivity = (_client, _id, _opts) =>
  new Promise((resolve, reject) =>
    _client.startActivity(_id, _opts, adbCallback(resolve, reject))
  )

const shell = (_client, _id, _command) =>
  new Promise((resolve, reject) =>
    _client.shell(_id, _command, adbCallback(resolve, reject))
  )

const startDeviceApp = () =>
  new Promise(resolve => {
    let timeoutId = null
    const start = () => {
      const id = getDeviceId()
      const opts = getActivityOpts()

      logger.info(`Starting android activity on ${id}...`)

      return startActivity(adbClient, id, opts)
        .then(_ => logger.debug('Activity started!') || clearTimeout(timeoutId))
    }

    timeoutId = setTimeout(start, 500)

    return resolve()
  })

const stopDeviceApp = () =>
  shell(adbClient, getDeviceId(), `am force-stop ${getPackageName}`)
    .then(_ => logger.debug('Activity killed!'))

module.exports = {
  getAdbClient,
  stopDeviceApp,
  startDeviceApp
}
