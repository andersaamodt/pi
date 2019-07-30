
const config = require('../configuration')
const Kefir = require('kefir')
const Gpio = require('onoff').Gpio

// pins connected to hoppers (dispense):
const pin17 = new Gpio(17, 'out')
// const pin18 = new Gpio(18, 'out') // prev used for hardware test

// pins attached to hopper empty reader // 22 - hopper 1
const pin22 = new Gpio(22, 'in', 'both') // hopperOneCam
const pin23 = new Gpio(23, 'in', 'both')

// pin attached to goal light
const pin4 = new Gpio(4, 'out')

// pins attached to motor (for safety if motor stays on we can kill)

// XXX - information on empty hoppers
pin22.watch((err, value) => {
    if (value == 0){
        pin17.writeSync(0)
    }
})

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


var emit
var dispenseStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).skipDuplicates()
  .filter(ev => ev.resourceId === config.resourceId)
  .filter( ev => ev.type === 'resource-used' )
  .map(ev => (ev.amount || 1))

module.exports = function( ev ){
    emit(ev)
}

bitPepsi(dispenseStream)

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
        .onValue(beer)
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
function processVend(hopperState) {
    let hs = (hopperState[0], hopperState[1])
    switch (hs) {
        case (0, 0):
            break
        case (1, 0):
            console.log('vending, not in groove')
            break
        case (0, 1):
            console.log('in groove, motor off -- !! bad state')
            pin17.writeSync(1) // can hopper
            break
        case (1, 1):
            console.log('vending, in groove')
            break
    }
}
