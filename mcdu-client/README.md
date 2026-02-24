# MCDU MQTT Client

Hardware bridge between WINWING MCDU-32-CAPTAIN and MQTT broker. Acts as a "dumb terminal" — no business logic, just USB HID ↔ MQTT.

## Architecture

```
┌─────────────────┐      MQTT       ┌──────────────────┐      USB HID     ┌──────────────┐
│   ioBroker      │ ◄─────────────► │  mcdu-client.js  │ ◄──────────────► │  MCDU-32-    │
│   Adapter       │                 │                  │                  │  CAPTAIN     │
└─────────────────┘                 └──────────────────┘                  └──────────────┘
```

## Hardware Support

- **macOS**: `node-hid` backend (IOHIDManager → SET_REPORT control transfers) ✓
- **Linux/Raspberry Pi**: `usb` backend (libusb → controlTransfer) ✓

> **Critical:** The WinWing firmware requires SET_REPORT control transfers, NOT interrupt OUT writes. Linux hidraw/libusb default to interrupt OUT and are silently ignored by the firmware.

## Quick Start

### macOS (development)

```bash
cd mcdu-client
npm install
node mcdu-client.js
```

`config.env` is loaded automatically. Edit it to set the MQTT broker address.

### Raspberry Pi (production)

```bash
cd /home/pi/mcdu-client
npm install
sudo systemctl enable mcdu-client
sudo systemctl start mcdu-client
sudo journalctl -u mcdu-client -f
```

## Configuration

Edit `config.env`:

```bash
MQTT_BROKER=mqtt://YOUR_BROKER_IP:1883   # MQTT broker address
MQTT_TOPIC_PREFIX=mcdu                 # Topic prefix (default: mcdu)
MQTT_CLIENT_ID=mcdu-client-mac         # Client ID (auto-derived from hostname if blank)
```

`config.env` is loaded via dotenv at startup. On Raspberry Pi, the systemd `EnvironmentFile=` takes precedence over `config.env`.

## Display Protocol (WinWing Firmware)

### Critical constraints

1. **One-shot init**: The firmware only accepts `0xf0` init packets **once per USB power cycle**. After a software close/reopen the init is silently ignored. Open the device once and never close it.

2. **40ms between display packets**: The firmware needs 40ms between consecutive `0xf2` display packets. Sending faster causes rendering to be unreliable or silently dropped.

3. **ASCII only**: All character bytes sent to the display MUST be ≤ 0x7F. The firmware silently drops the entire display frame if any byte > 0x7F is encountered — with no error, no acknowledgement, display just freezes. This is handled in two layers:
   - **Adapter** (`lib/rendering/PageRenderer.sanitizeAscii()`): sanitizes status bar / breadcrumb text
   - **Client** (`lib/mcdu.js sanitizeAscii()`): sanitizes all line content in `setLine()` and `_setLineSegments()`
   Any direct test scripts that write to the display must also ensure ASCII-only output.

4. **LEDs after display**: Always write LED state after the display update, not before.

### Startup sequence

```
1. Open HID device once
2. initDisplay()       — 17 × 0xf0 packets, 10ms between each
3. wait 200ms          — firmware settle
4. clear()             — 16 × 0xf2 WHITE+spaces → WinWing logo disappears
5. Connect MQTT        — in parallel with settle wait
6. wait ~3s total      — firmware fully settled
7. Receive display/set → updateDisplay() → setAllLEDs()
```

## MQTT Topics

All topics are prefixed with `{MQTT_TOPIC_PREFIX}/{deviceId}/`.

### Client receives (adapter → client)

| Topic | Purpose |
|-------|---------|
| `display/set` | Full display update (14 lines, retained) |
| `display/line` | Single line update |
| `leds/set` | Set all LEDs |
| `leds/single` | Set single LED |
| `status/ping` | Health check request |

### Client publishes (client → adapter)

| Topic | Purpose |
|-------|---------|
| `buttons/event` | Button press events |
| `status/online` | Online announcement (LWT) |
| `status/pong` | Health check response |

## Troubleshooting

### Display stuck on WinWing boot screen after software restart

The firmware ignores init packets after the first USB power cycle. **Physical unplug/replug required** to reset firmware state. This is by design — the client is meant to run as a persistent service that opens the device once.

### Display freezes when navigating pages

The WinWing firmware silently drops the entire display frame when any character byte > 0x7F is encountered. The display stays frozen on the previous page with no error message.

Non-ASCII characters can appear in two places:
- **Status bar / breadcrumb**: page names like "Hauptmenü" → sanitized by `PageRenderer.sanitizeAscii()` in the adapter
- **Line content**: button labels like "Zurück" → sanitized by `mcdu.sanitizeAscii()` in `setLine()` before writing

If display freezing recurs, look for `[DISPLAY] NON-ASCII char at line X col Y` in the client log — this means a character bypassed `setLine()` and will cause a frame drop.

### Display renders correctly on Mac but not on Linux/Pi

On Linux, verify the `usb` npm package is installed and that the udev rule grants access:
```bash
# Should show the MCDU
lsusb | grep 4098

# Check udev rule exists
cat /etc/udev/rules.d/99-winwing.rules
```

### Colors not rendering (text appears white)

Known issue: color encoding for some colors (GREEN, MAGENTA, RED, YELLOW) appears broken. A temporary hack in `lib/mcdu.js` forces all text to WHITE. This does not affect navigation or display content.

### HID device not found

```bash
lsusb | grep 4098
# Should show: Bus 001 Device 005: ID 4098:bb36 WinWing MCDU
```

### MQTT connection refused

```bash
mosquitto_pub -h YOUR_BROKER_IP -t test -m "hello"
```

## File Structure

```
mcdu-client/
├── mcdu-client.js        # Main entry point
├── lib/
│   ├── mcdu.js           # USB HID driver (dual Mac/Linux backend)
│   └── button-map.json   # Button ID → name mapping
├── config.env            # Local config (gitignored on Pi, committed for Mac)
├── config.env.template   # Config template
└── mcdu-client.service   # systemd service file
```

## License

MIT — Felix Hummel
