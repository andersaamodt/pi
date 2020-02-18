
const config = require('../configuration')
const Kefir = require('kefir')
const Gpio = require('onoff').Gpio

const pin2 = new Gpio(2, 'out')
const pin3 = new Gpio(3, 'out')
const pin4 = new Gpio(4, 'out')
const pin5 = new Gpio(5, 'out')
const pin6 = new Gpio(6, 'out')
const pin7 = new Gpio(7, 'out')
const pin8 = new Gpio(8, 'out')
const pin9 = new Gpio(9, 'out')

pin2.writeSync(1)
pin3.writeSync(1)
pin4.writeSync(1)
pin5.writeSync(1)
pin6.writeSync(1)
pin7.writeSync(1)
pin8.writeSync(1)
pin9.writeSync(1)

var emit
var dispenseStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).skipDuplicates()
  .filter(ev => ev.resourceId === config.resourceId)
  .filter( ev => ev.type === 'resource-used' )
  .onValue(vend)

function setLow(pin){
    pin.writeSync(1)
}

function highLow(pin){
    console.log('pin triggered')
    pin.writeSync(0)
    setTimeout( ()=> {
        pin.writeSync(1)
    }, 1000)
}

function highLowLonger(pin){
    console.log('mp pin triggered')
    pin.writeSync(0)
    setTimeout( ()=> {
        pin.writeSync(1)
    }, 3000)
}


function vend(usedEv){
    console.log("vending:", usedEv)
    switch (usedEv.notes.toUpperCase()){
        case 'A1':
            highLow(pin7)
            break
        case 'A2':
            highLow(pin6)
            break
        case 'A3':
            highLow(pin5)
            break
        case 'B1':
            highLowLonger(pin9)
            highLow(pin7)
            break
        case 'B2':
            highLowLonger(pin9)
            highLow(pin6)
            break
        case 'B3':
            highLowLonger(pin9)
            highLow(pin5)
            break
        case 'C1':
            highLowLonger(pin8)
            highLow(pin7)
            break
        case 'C2':
            highLowLonger(pin8)
            highLow(pin6)
            break
        case 'C3':
            highLowLonger(pin8)
            highLow(pin5)
            break
        case 'C4':
            highLowLonger(pin8)
            highLow(pin4)
            break
        case 'C5':
            highLowLonger(pin8)
            highLow(pin3)
            break
        case 'C6':
            highLowLonger(pin8)
            highLow(pin2)
            break
    }
}

module.exports = function( ev ){
    emit(ev)
}
