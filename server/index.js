const { WebSocketServer } = require('ws')

const createWebSocketServer = (_port = 3000) =>
  Promise.resolve(new WebSocketServer({ port: _port }))
    .then(_wss => {
        _wss.on('connection', _ws => {
          console.log('Server: connected')
          // _ws.on('message', (_data) => {
          //   const msg = Buffer.from("Hello world!").toString()
          //   console.log('Server: sending', Buffer.from(_data).toString())
          //   _ws.send(_data)
          // })
          _ws.on('close', () => {
            console.log('Server: closed')
          })

          _ws.send('hello world!')

          _ws.on('message', (_data) => {
            console.log(`Just received {}`, _data)
          })
        })
        return _wss
      })



createWebSocketServer()
