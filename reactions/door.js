
const config = require('../configuration')
const Gpio = require('onoff').Gpio
const pin = new Gpio(17, 'out')
const Kefir = require('kefir')

var openStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).skipDuplicates()
  .filter(ev => ev.resourceId === config.resourceId)
  .filter(ev => ev.type === 'resource-used')
  .onValue(door)

module.exports = function( ev ){
    emit(ev)
}

function door(){
    console.log('door ')
    pin.writeSync(1)
    setTimeout(()=>{
        pin.writeSync(0)
    }, 12345)
}
