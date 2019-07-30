
const Gpio = require('onoff').Gpio
const pin22 = new Gpio(22, 'in', 'both') // hopperOneCam
const pin23 = new Gpio(23, 'in', 'both')
pin23.watch((err, value) => {
    console.log("pin22: ", {value})
    if (value == 0){
        console.log('pin 22 watch setting motor low')
        pin17.writeSync(0)
    }
})

pin22.watch((err, value) => {
    console.log("pin23: ", {value})
})

