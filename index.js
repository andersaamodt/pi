
const config = require('./configuration')
const request = require('superagent')
const cryptoUtils = require('./crypto')
const fobtapStream = require('./fobtapStream')
const utils = require('./utils')
const reaction = require('./reactions/' + config.reaction)
const io = require('socket.io-client')

utils.auth(config.brainLocation, config.resourceId, config.secret, (err, token)=> {
  if (err) {
      throw new Error("Unable to authenticate");
  }

  fobtapStream
    .throttle(2345, {trailing: false})
    .onValue(fob => {
        request
            .post(config.brainLocation + 'fobtap')
            .set('Authorization', token )
            .send({
                fob,
                resourceId: config.resourceId
            })
            .end( (err, res) => {
                if (err) {
                    console.log({err})
                } else {
                    console.log('fobtap registered!')
                }
            })
    })

  const socket = io('ws://' + config.brainLocation)
  socket.on('connect', ()=> {
      console.log("attempting socket auth ")
      socket.emit('authentication', { token })
      socket.on('authenticated', () => {
          console.log('Connected with authentication!!!!*!~!!*~!~!~*~~')
          socket.on('eventstream', reaction)
      })

      socket.on("disconnect", function() {
          console.log('removing listeners')
          throw new Error('socket disconnected')
      })
  })
})
