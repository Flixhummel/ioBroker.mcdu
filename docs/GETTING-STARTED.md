# Getting Started with ioBroker.mcdu

This guide walks you through installing and connecting both components of the MCDU smart home system.

## Architecture Overview

```
┌──────────────────┐        MQTT        ┌──────────────────┐       USB HID      ┌──────────────┐
│   ioBroker       │ ◄────────────────► │   mcdu-client    │ ◄────────────────► │  MCDU-32-    │
│   Adapter        │                    │   (Raspberry Pi) │                    │  CAPTAIN     │
│   (iobroker.mcdu)│                    │                  │                    │  (Hardware)  │
└──────────────────┘                    └──────────────────┘                    └──────────────┘
         │                                       │
         │  Runs on your ioBroker server         │  Runs on a Raspberry Pi
         │  Handles pages, rendering, logic      │  USB HID ↔ MQTT bridge (no logic)
```

**Two components to install:**

1. **ioBroker Adapter** (`iobroker.mcdu`) -- runs on your ioBroker server, handles page rendering, navigation, and automation states
2. **MCDU Client** (`mcdu-client`) -- runs on a Raspberry Pi with the MCDU plugged in via USB, bridges USB HID to MQTT

Both communicate over MQTT. You need a running MQTT broker (e.g., Mosquitto) accessible to both.

## Prerequisites

- A running **ioBroker** installation
- An **MQTT broker** (e.g., Mosquitto) reachable by both ioBroker and the Pi
- A **Raspberry Pi** with the WinWing MCDU-32-CAPTAIN connected via USB
- **Node.js 12+** on the Pi

---

## 1. Install the ioBroker Adapter

### Option A: Via Admin UI (from npm)

1. Open the ioBroker Admin UI
2. Go to the **Adapters** tab
3. Search for **mcdu**
4. Click **Install**
5. An instance `mcdu.0` is created automatically

This is the recommended method for stable releases.

### Option B: Via Admin UI (from GitHub)

Use this for pre-release or development versions:

1. Open the ioBroker Admin UI
2. Go to the **Adapters** tab
3. Click the **GitHub/Octocat icon** (top left)
4. Switch to the **Custom** tab
5. Paste the repository URL:
   ```
   https://github.com/Flixhummel/ioBroker.mcdu
   ```
6. Click **Install**

### Option C: Via CLI

```bash
cd /opt/iobroker
iobroker add mcdu
```

Or install from npm first, then add:

```bash
npm install iobroker.mcdu
iobroker add mcdu
```

### Configure the Adapter

1. Open the Admin UI and go to **Instances**
2. Click the wrench icon on `mcdu.0`
3. Configure at minimum:
   - **MQTT Broker Address** -- IP/hostname of your MQTT broker (e.g., `mqtt://10.10.5.50:1883`)
4. Save and close -- the adapter will start and connect to MQTT

The Admin UI has four configuration tabs:

- **General Settings** -- MQTT broker address, performance tuning
- **Device & Pages** -- per-device page configuration, default color, brightness step
- **Function Keys** -- map 11 function keys to page navigation
- **Advanced & About** -- debug logging, version info

---

## 2. Install the MCDU Client (Raspberry Pi)

The mcdu-client is the USB HID bridge that runs on the Pi next to the physical MCDU hardware.

> For the full step-by-step guide with troubleshooting, see [`mcdu-client/QUICKSTART.md`](../mcdu-client/QUICKSTART.md).
> For a deployment checklist, see [`mcdu-client/DEPLOYMENT-CHECKLIST.md`](../mcdu-client/DEPLOYMENT-CHECKLIST.md).

### Essential Steps

**a) Install system dependencies:**

```bash
sudo apt update
sudo apt install -y nodejs npm
node --version   # Should be v12 or higher
```

**b) Transfer project files to the Pi:**

```bash
# From your dev machine
scp -r mcdu-client/ pi@YOUR_PI_IP:~/mcdu-client
```

Or clone the repository directly on the Pi.

**c) Install Node.js dependencies:**

```bash
cd ~/mcdu-client
npm install
```

**d) Configure:**

```bash
cp config.env.template config.env
nano config.env
```

Set at minimum:

```bash
MQTT_BROKER=mqtt://YOUR_BROKER_IP:1883
MQTT_TOPIC_PREFIX=mcdu
```

**e) Set up USB permissions:**

Create a udev rule so the client can access the MCDU without root:

```bash
sudo tee /etc/udev/rules.d/99-winwing.rules << 'EOF'
SUBSYSTEM=="usb", ATTR{idVendor}=="4098", MODE="0666"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="4098", MODE="0666"
EOF
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Also add your user to the `input` group:

```bash
sudo usermod -a -G input $USER
# Log out and back in for the group change to take effect
```

**f) Test run:**

```bash
node mcdu-client.js
```

You should see:
```
✓ Connected to MCDU-32-CAPTAIN
✓ Hardware initialized
✓ Connected to MQTT broker
=== Ready ===
```

Press `Ctrl+C` to stop.

**g) Install as systemd service:**

```bash
sudo cp mcdu-client.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mcdu-client
sudo systemctl start mcdu-client
```

Check status:

```bash
sudo systemctl status mcdu-client
```

---

## 3. Verify End-to-End

Once both components are running:

1. **Check adapter connection** in ioBroker:
   - In the Admin UI, go to **Objects**
   - Navigate to `mcdu.0.info.connection` -- should be `true`

2. **Check mcdu-client logs:**
   ```bash
   journalctl -u mcdu-client -f
   ```

3. **Press a button on the MCDU:**
   - You should see a button event in the mcdu-client logs
   - In ioBroker, the corresponding button state under `mcdu.0.devices.{deviceId}.buttons.*` should update

4. **Check the display:**
   - The MCDU display should show the configured home page with status bar and content

If something isn't working, check:
- MQTT broker is reachable from both ioBroker and the Pi
- Topic prefix matches in both adapter config and `config.env`
- The MCDU is detected via USB: `lsusb | grep 4098` (should show `ID 4098:bb36`)

---

## Further Reading

- [Page Configuration Guide](./PAGE-CONFIGURATION-GUIDE.md) -- how to set up pages and navigation
- [Automation Quickstart](./AUTOMATION-QUICKSTART.md) -- scripting with 32 automation states
- [Architecture](./architecture/ARCHITECTURE-REVISION.md) -- system design
- [UX Concept](./ux-concept/UX-CONCEPT.md) -- cockpit UX patterns
- [mcdu-client README](../mcdu-client/README.md) -- MQTT topics, display protocol, troubleshooting
- [ioBroker adapter development docs](https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/adapterdev.md)
