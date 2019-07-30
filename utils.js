const uuidV1 = require('uuid/v1')
const request = require('superagent')
const cryptoUtils = require('./crypto')

function auth(admin, name, secret, callback){

    let session = uuidV1()
    let sessionKey = cryptoUtils.createHash(session + cryptoUtils.createHash(secret))
    let token = cryptoUtils.hmacHex(session, sessionKey)

    request
        .post(admin + 'session')
        .set('Authorization', token)
        .set('Session', session)
        .set('name', name)
        .end((err,res)=>{
            if (err) {
                console.log({err})
                return callback(err)
            }
            callback(null, token)
        })
}

module.exports = {
    auth
}
