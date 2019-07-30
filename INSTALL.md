Instructions to set up fobtap raspberry pi. This requires a running setup of ao.

### 0. Materials
- Raspberry Pi (we are using Pi3 for the wireless)
- rfid reader: 125Khz USB RFID Contactless Proximity Sensor Smart ID Card Reader EM4100
- Something to control with the gpio pins: door, bitpepsi

### 1. Set up raspbian on a microsd card
Download the raspbian lite image from there site (https://www.raspberrypi.org/downloads/). Unzip it then write to your micro sd card.  A good way to determine which drive is your sd card is by running `sudo fdisk -l` before and after plugging it in. Use that drive in the of= (output file) of the dd command.

- `unzip 2018-04-18-raspbian-stretch-lite.zip`
- `sudo dd bs=4M if=2018-04-18-raspbian-stretch-lite.img of=/dev/mmcblk0 conv=fsync`

After this command finishes you should have a bootable microsd card that can go into the pi. After it boots it is good to run the following commands. The default username and password for raspbian is pi:raspberry.

- `sudo apt-get update`
- `sudo apt update`

### 2. Setup wifi (optional)
Add the following to /etc/network/interfaces

```
auto lo

iface lo inet loopback
iface eth0 inet dhcp

allow-hotplug wlan0
auto wlan0


iface wlan0 inet dhcp
        wpa-ssid "ssid"
        wpa-psk "password"
```

### 3. Setup SSH

- `sudo raspi-config `

A configuration window will open: Select Interfacing Options , Navigate to and select SSH , Choose Yes, Select Ok, Choose Finish

- sudo systemctl enable ssh
- sudo systemctl start ssh

Search the network:
- `sudo nmap -sS -p 22 192.168.0.0/24`


### 4. Install node

- `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash`
- `nvm install stable`
- `source .bashrc`



### 5. Initialize fobtap

- `sudo apt-get install git`
- `git clone https://github.com/dctrl-ao/fobtap.git`
- `cd fobtap`
- `npm install`
- `node initialize.js`

At this point it will bring up a command prompt asking for information about the "resource" you are about to set up. You need to tell it the location of your ao server, you also need a valid member username and password to authorize the resources creation.



### 6. Setup fobtap as a service

Add the following to /etc/systemd/system/fobtap.Service

```
[Unit]
Description=fobtap-daemon
After=network.target

[Service]
User=pi
ExecStart=/path/to/node/bin/node /home/pi/fobtap/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
- `sudo systemctl enable fobtap.service`
- `sudo systemctl start fobtap.service`
- `systemctl status fobtap.service`

### 7. Rename your Raspberry Pi's Hostname (e.g. pi@hostname)

First, log onto your Pi and open a terminal window. Your Pi's name is in a file called 'hostname' in the /etc directory. Edit that file as superuser with:

    `sudo nano /etc/hostname`

This file contains only one line - the name of your Pi.  Change the name to whatever you like, but only use the letters 'a' to 'z' (upper or lower), digits '0' to '9', and the dash '-'.

Save the file using Ctrl+x, then Y followed by Enter.

There is a second file that also contains the hostname, but it is only there as a workaround for some software.  Therefore you should also edit that file:

    sudo nano /etc/hosts

Find the line starting with 127.0.0.1, and change the name following it to your new hostname.  Save the file using Ctrl+x, then Y followed by Enter.

Once you have rebooted your Pi, all other computers on your network should see it with the new hostname.  On the Pi itself, you can check your hostname by issuing the following command in a terminal window:

    hostname
### 8. Change Password of your Raspberry Pi
type `passwd`
enter the default password `raspberry` and replace with a strong password (we reccomend using Keepass to generate a strong password)
