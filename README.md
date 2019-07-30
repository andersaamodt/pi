The dctrl-fobtap repo is designed to run on a raspberry pi which is connected to a rfid fob reader
(ie: 125khz USB Contactless Proximity Card ID Reader RFID EM4100 EM4102 TK4100).

### Install Instructions
Setup a 
// Todo: how to setup rasp Pi

To setup run 
- `git clone git@github.com:dctrl-ao/fobtap.git` 
- `sudo node initialize.js`

This will start a terminal prompt to initialize your pi tap point. You need to know: 
- Where the dctrl-ao server is located.
- The name of the new "resource" you are creating with this tap point.
- (Optionally) you can set a value that will be charged to the member when they tap here. Default 0
- (Optionally) The type of pin reaction you want to trigger.*
- Your dctrl-ao hackername/password

The pi will create a resource in dctrl-ao. It will display who has tapped recently and keep a record. The two default pin reactions were designed for controlling a door mag lock and an override of a 1960's vending machine. 
