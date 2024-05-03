#!/bin/bash

# Quick setup of the plugdev permissions for the when
# attaching it to your laptop (run it once).
#
# Source:
#   - https://developer.android.com/studio/run/device
#   - http://www.janosgyerik.com/adding-udev-rules-for-usb-debugging-android-devices/
#
lsusb | grep -i google | awk '{print "/dev/bus/usb/"$2"/"$4}' | tr -d ':' | xargs sudo chown "$USER:plugdev"
adb kill-server
adb devices
adb reverse tcp:3000 tcp:3000
