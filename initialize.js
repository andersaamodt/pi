const colors = require('colors')
const prompt = require('prompt')
const request = require('superagent')
const uuidV1 = require('uuid/v1')
const uuidV4 = require('uuid/v4')
const fs = require('fs')
const cryptoUtils = require('./crypto')
const utils = require('./utils')

prompt.delimiter = colors.red("(>-_-<)")
prompt.start()

prompt.get([{
    name: 'admin',
    default: 'localhost:8003/',
    description: colors.white( 'Provide the root ip of dctrl-admin.'),
    type: 'string',
    required: true,
  },{
    name: 'name',
    default: '',
    description: colors.white( 'Provide a name for the new resource.'),
    type: 'string',
    required: true,
  }, {
      name: 'charged',
      default: 0,
      description: colors.white( 'How much should be charged on tap? (CAD).'),
      type: 'number',
      required: true,
  },{
      name: 'reaction',
      default: 'door',
      description: colors.white( 'What type of pin response: currently available: door, bitpepsi.'),
      type: 'string',
      required: true,
  }, {
      name: 'hackername',
      default: 'rhodes',
      description: colors.white( 'Your dctrl hackername'),
      type: 'string',
      required: true
  }, {
      name: 'secret',
      default: '1235',
      hidden: true,
      description: colors.white( 'please type your password'),
      type: 'string',
      required: true,
  }], function (err, promptData) {

      utils.auth(promptData.admin, promptData.hackername, promptData.secret, (err, token)=>{
          if (err) {
              console.log('authentication failed, try again?')
              return prompt.stop()
          }

          createResource(promptData.admin, token, promptData.name, promptData.charged, (err, resourceInfo)=> {

              if (err){
                  console.log('creation failed, odd...')
                  console.log(err)
                  return prompt.stop()
              }

              console.log(colors.yellow("Going to guess which keyboard is the reader"))
              fs.readdir("/dev/input/by-id", function(err, items) {
                  console.log(colors.yellow("found input: ", items[0]))
                  console.log({promptData})
                  let str = "module.exports = " + JSON.stringify({
                      brainLocation: promptData.admin,
                      resourceId: resourceInfo.resourceId,
                      secret: resourceInfo.rawSecret,
                      reaction: promptData.reaction,
                      fobReader: "/dev/input/by-id/" + items[0] // ls /dev/input/by-id
                  })
                  fs.writeFileSync(__dirname + '/configuration.js', str)
                  console.log(colors.green( 'SUCCESS!!@#$@#@!' ))
              })
          })
      })
})

function createResource(admin, token, name, charged, callback){
    let resourceId = uuidV4()
    let rawSecret = uuidV4()
    let secret = cryptoUtils.createHash(rawSecret)
    let newResource = {
        type: 'resource-created',
        resourceId,
        name,
        charged,
        trackStock: true,
        secret
    }
    console.log('attempting to create new resource:', name)

    request
        .post(admin + 'events')
        .set('Authorization', token)
        .send(newResource)
        .end((err, res)=> {
            if (err) return callback(err)
            newResource.rawSecret = rawSecret
            callback(null, newResource)
        })
}
