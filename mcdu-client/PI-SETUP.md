# Raspberry Pi Setup Guide

**Target:** Raspberry Pi (any model with USB host port)
**IP:** YOUR_PI_IP (replace with your Pi's actual IP)
**User:** pi

---

## Step 1: Transfer Files to Pi

From your Mac:

```bash
# Copy the mcdu-client folder to Pi
scp -r mcdu-client/ pi@YOUR_PI_IP:/home/pi/
```

---

## Step 2: SSH into Pi

```bash
ssh pi@YOUR_PI_IP
# Password: mcdu
```

---

## Step 3: Install Node.js v12 (ARMv6)

The NodeSource repository doesn't support ARMv6, so we install from official binaries:

```bash
cd /home/pi/mcdu-client

# Make install script executable
chmod +x install-nodejs-armv6.sh

# Run installation (downloads Node.js v12.22.12 from nodejs.org)
./install-nodejs-armv6.sh

# Verify
node --version  # Should show v12.22.12
npm --version   # Should show 6.14.16
```

**What this script does:**
1. Downloads Node.js v12.22.12 ARMv6 tarball from nodejs.org
2. Extracts to /usr/local
3. Verifies installation

**Manual alternative (if script fails):**
```bash
wget https://nodejs.org/dist/v12.22.12/node-v12.22.12-linux-armv6l.tar.xz
tar -xJf node-v12.22.12-linux-armv6l.tar.xz
cd node-v12.22.12-linux-armv6l
sudo cp -R * /usr/local/
cd ..
rm -rf node-v12.22.12-linux-armv6l*
```

---

## Step 4: Install MCDU Client

```bash
cd /home/pi/mcdu-client

# Install npm dependencies
npm install

# Create config file
cp config.env.template config.env

# Edit config (set MQTT broker IP)
nano config.env
```

**Minimum config.env:**
```bash
MQTT_BROKER=mqtt://YOUR_BROKER_IP:1883  # Your MQTT broker IP
```

---

## Step 5: Test in Mock Mode (No Hardware)

```bash
# Test MQTT connectivity without MCDU connected
MOCK_MODE=true node mcdu-client.js

# Should see:
# [INFO] MQTT connected
# [INFO] Starting mock button events (every 5 seconds)
```

**In another terminal (on Mac or Pi):**
```bash
# Subscribe to button events
mosquitto_sub -h YOUR_PI_IP -t mcdu/buttons/event -v

# Send test display update
mosquitto_pub -h YOUR_PI_IP -t mcdu/display/line -m '{"lineNumber":1,"text":"HELLO MCDU","color":"amber"}'
```

---

## Step 6: Test with Hardware

```bash
# Connect MCDU via USB
# Check it's detected:
lsusb | grep 4098
# Should show: Bus 001 Device XXX: ID 4098:bb36

# Run client
node mcdu-client.js

# Should see:
# [INFO] MCDU device connected
# [INFO] Display initialized
# [INFO] Button reading started (50Hz)
```

**Test display:**
```bash
mosquitto_pub -h YOUR_PI_IP -t mcdu/display/line -m '{
  "lineNumber": 1,
  "text": "RASPBERRY PI ONLINE ",
  "color": "green"
}'
```

**Test buttons:**
```bash
# Monitor button events
mosquitto_sub -h YOUR_PI_IP -t mcdu/buttons/event -v

# Press physical buttons on MCDU, should see:
# mcdu/buttons/event {"button":"LSK1L","action":"press","timestamp":...}
```

**Test LEDs:**
```bash
mosquitto_pub -h YOUR_PI_IP -t mcdu/leds/set -m '{
  "leds": {
    "RDY": true,
    "FAIL": false,
    "BACKLIGHT": true,
    "SCREEN_BACKLIGHT": true
  }
}'
```

---

## Step 7: Install as Service (Auto-Start)

```bash
cd /home/pi/mcdu-client

# Install systemd service
sudo cp mcdu-client.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mcdu-client
sudo systemctl start mcdu-client

# Check status
sudo systemctl status mcdu-client

# View logs
sudo journalctl -u mcdu-client -f
```

---

## Troubleshooting

### "Cannot find module 'mqtt'"
```bash
cd /home/pi/mcdu-client
npm install
```

### "HID device not found"
```bash
# Check USB
lsusb | grep 4098

# Try unplugging/replugging MCDU
# Check permissions
ls -l /dev/hidraw*
```

### "MQTT connection refused"
```bash
# Check broker is running (on broker machine)
systemctl status mosquitto

# Test from Pi
mosquitto_pub -h YOUR_BROKER_IP -t test -m "hello"
```

### High CPU on Pi 1
```bash
# Edit config.env, reduce polling rate
BUTTON_POLL_RATE=30
DISPLAY_THROTTLE=200
```

---

## Quick Reference

**Start client manually:**
```bash
cd /home/pi/mcdu-client
node mcdu-client.js
```

**Start client with debug logging:**
```bash
LOG_LEVEL=debug node mcdu-client.js
```

**Start in mock mode:**
```bash
MOCK_MODE=true node mcdu-client.js
```

**Restart service:**
```bash
sudo systemctl restart mcdu-client
```

**View logs:**
```bash
sudo journalctl -u mcdu-client -f
```

---

## Next Steps

After Pi is working:
1. Configure the ioBroker MCDU adapter to connect to the same MQTT broker
2. Set up pages and function keys in the Admin UI
3. Test end-to-end: button presses on hardware should navigate pages, display should update
