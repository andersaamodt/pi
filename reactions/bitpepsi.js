
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
const pin10 = new Gpio(10, 'out')
const pin11 = new Gpio(11, 'out')
const pin12 = new Gpio(12, 'out')

const pin13 = new Gpio(13, 'in', 'both')
const pin14 = new Gpio(14, 'in', 'both')
const pin15 = new Gpio(15, 'in', 'both')
const pin16 = new Gpio(16, 'in', 'both')
const pin17 = new Gpio(17, 'in', 'both')

const pin18 = new Gpio(18, 'out')
const pin19 = new Gpio(19, 'out')
const pin20 = new Gpio(20, 'out')
const pin21 = new Gpio(21, 'out')
const pin22 = new Gpio(22, 'out')
const pin23 = new Gpio(23, 'out')
const pin24 = new Gpio(24, 'out')
const pin25 = new Gpio(25, 'out')

setLow(pin2)
setLow(pin3)
setLow(pin4)
setLow(pin5)
setLow(pin6)
setLow(pin7)
setLow(pin8)
setLow(pin9)
setLow(pin10)
setLow(pin11)
setLow(pin12)
// setLow(pin13)
// setLow(pin14)
// setLow(pin15)
// setLow(pin16)
// setLow(pin17)
setLow(pin18)
setLow(pin19)
setLow(pin20)
setLow(pin21)
setLow(pin22)
setLow(pin23)
setLow(pin24)
setLow(pin25)

var emit
var dispenseStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).skipDuplicates()
  .filter(ev => ev.resourceId === config.resourceId)
  .filter( ev => ev.type === 'resource-used' )
  .onValue(vend)

function setLow(pin){
    pin.writeSync(0)
}

function highLow(pin){
    console.log('pin triggered')
    pin.writeSync(1)
    setTimeout( ()=> {
        pin.writeSync(0)
    }, 1000)
}

function vend(usedEv){
    console.log("vending:", usedEv)
    switch (usedEv.notes){
        case 'A':
            highLow(pin4)
            break
        case 'B':
            highLow(pin5)
            break
        case 'C':
            highLow(pin6)
            break
        case 'D':
            highLow(pin7)
            break
        case 'E':
            highLow(pin8)
            break
    }
}

module.exports = function( ev ){
    emit(ev)
}

function checkHopper1 () {
    const promise17 = new Promise((resolve, reject)=> {
        pin17.read((err, value) => {
            if (err) {
                return reject()
            }
            resolve(value)
        })
    })

    const promise22 = new Promise((resolve, reject)=> {
        pin22.read((err, value) => {
            if (err) {
                return reject()
            }
            resolve(value)
        })
    })

    return Promise.all([promise17, promise22])
}

// Stages of Vend


// bitPepsi(dispenseStream)
// payment logic recieves stream of payments and ensures payouts are spaced out
function bitPepsi(paymentStream) {
    var heartbeat
    const _beat = {}
    const heartStream = Kefir.stream(beat => {
        heartbeat = setInterval(beat.emit, 1000, {
            isHeartbeat: true
        })
        _beat['emit'] = beat.emit
    })
    const timingLayer = Kefir
        .merge([paymentStream, heartStream])
        .scan((status, timingEvent) => {
            if (timingEvent.isHeartbeat) {
                if (status.wait > 0) {
                    status.trigger = false
                    status.wait -= 1;
                } else if (status.pending >= 1) {
                    status.trigger = true;
                    status.pending -= 1
                    status.wait = 12
                } else {
                    clearInterval(heartbeat)
                    heartbeat = false;
                }
                return status
            } else {
                if (timingEvent >= 1 && status.wait < 1){
                    status.trigger = true
                    status.pending -= 1
                    status.wait += 7
                }
                status.pending += timingEvent
                if (!heartbeat) {
                    heartbeat = setInterval(_beat.emit, 1000, {
                        isHeartbeat: true
                    });
                }
                return status
            }
        }, {
            trigger: false,
            wait: 0,
            pending: 0
        })

    const outputStream = timingLayer
        .filter(status => status.trigger)
        .onValue(vend)
}



function beer(){
    console.log('triggering 17 motor, 4 light')
    pin17.writeSync(1)
    pin4.writeSync(1)

    let vendInterval = setInterval(()=>{
        checkHopper1()
            .then(processVend)
            .catch(console.log)
    }, 50 )

    setTimeout(()=>{
        console.log('')
        pin17.writeSync(0)
        pin4.writeSync(0)
        clearInterval(vendInterval)
    }, 999)
}

// [pin17, pin22]
// [motor, groove]
// function processVend(hopperState) {
//     let hs = (hopperState[0], hopperState[1])
//     switch (hs) {
//         case (0, 0):
//             break
//         case (1, 0):
//             console.log('vending, not in groove')
//             break
//         case (0, 1):
//             console.log('in groove, motor off -- !! bad state')
//             pin17.writeSync(1) // can hopper
//             break
//         case (1, 1):
//             console.log('vending, in groove')
//             break
//     }
// }
