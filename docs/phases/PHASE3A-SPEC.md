# Phase 3a: RasPi MQTT Client - Contract-First Specification

**Status**: Draft for implementation  
**Target Platform**: Raspberry Pi 1 Model B Rev 2 (ARMv6, 512MB RAM)  
**Node.js Version**: v12.x (last ARMv6-compatible version)  
**Created**: 2026-02-14  

---

## Overview

This specification defines the **MQTT-based RasPi client** (`mcdu-client.js`) that acts as a "dumb terminal" bridge between:
- **Hardware**: WINWING MCDU-32-CAPTAIN (via node-hid)
- **MQTT Broker**: Mosquitto (Felix's existing broker)
- **ioBroker Adapter**: (Phase 3b, not yet built)

**Design Principles**:
- **Contract-first**: MQTT topics/formats defined before implementation
- **Testable**: Works standalone with mosquitto_pub/sub (no ioBroker required)
- **Lightweight**: Optimized for Pi 1 Model B Rev 2 (ARMv6, single-core)
- **Stateless**: No business logic - pure hardware bridge
- **Cached**: Display/LED state cached locally for efficiency

---

## 1. MQTT Topic Structure

All topics under base prefix: `mcdu/` (configurable via `MCDU_TOPIC_PREFIX` env var)

### 1.1 Command Topics (Subscribe - RasPi receives)

| Topic | QoS | Retained | Purpose |
|-------|-----|----------|---------|
| `mcdu/display/set` | 1 | Yes | Full display update (14 lines) |
| `mcdu/display/line` | 1 | Yes | Single line update |
| `mcdu/display/clear` | 1 | No | Clear display |
| `mcdu/leds/set` | 1 | Yes | Set all LEDs |
| `mcdu/leds/single` | 1 | Yes | Set single LED |
| `mcdu/status/ping` | 0 | No | Health check request |

### 1.2 Event Topics (Publish - RasPi sends)

| Topic | QoS | Retained | Purpose |
|-------|-----|----------|---------|
| `mcdu/buttons/event` | 1 | No | Button press/release events |
| `mcdu/status/online` | 1 | Yes | Client online status (LWT) |
| `mcdu/status/pong` | 0 | No | Health check response |
| `mcdu/status/error` | 1 | No | Hardware errors |

---

## 2. Message Formats (JSON Schemas)

### 2.1 Display Full Update (`mcdu/display/set`)

**Purpose**: Set all 14 lines at once (most common use case)

```json
{
  "lines": [
    {"text": "LINE 1 TEXT HERE      ", "color": "white"},
    {"text": "LINE 2 TEXT HERE      ", "color": "amber"},
    {"text": "LINE 3 TEXT HERE      ", "color": "cyan"},
    {"text": "LINE 4 TEXT HERE      ", "color": "green"},
    {"text": "LINE 5 TEXT HERE      ", "color": "magenta"},
    {"text": "LINE 6 TEXT HERE      ", "color": "red"},
    {"text": "LINE 7 TEXT HERE      ", "color": "yellow"},
    {"text": "LINE 8 TEXT HERE      ", "color": "grey"},
    {"text": "LINE 9 TEXT HERE      ", "color": "white"},
    {"text": "LINE 10 TEXT HERE     ", "color": "white"},
    {"text": "LINE 11 TEXT HERE     ", "color": "white"},
    {"text": "LINE 12 TEXT HERE     ", "color": "white"},
    {"text": "LINE 13 TEXT HERE     ", "color": "white"},
    {"text": "LINE 14 TEXT HERE     ", "color": "white"}
  ],
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
{
  lines: Array<{
    text: string;      // Exactly 24 chars (padded with spaces)
    color: "white" | "amber" | "cyan" | "green" | "magenta" | "red" | "yellow" | "grey";
  }>;  // Must be exactly 14 elements
  timestamp?: number;  // Unix milliseconds (optional, for debugging)
}
```

**Validation**:
- `lines` array must have exactly 14 elements
- Each `text` must be exactly 24 characters (auto-pad with spaces if shorter, truncate if longer)
- Invalid colors default to "white"

---

### 2.2 Display Single Line (`mcdu/display/line`)

**Purpose**: Update one line

**Mode 1: Simple (single color for entire line)**
```json
{
  "lineNumber": 1,
  "text": "UPDATED LINE TEXT    ",
  "color": "amber",
  "timestamp": 1708012800000
}
```

**Mode 2: Segments (multiple colors per line)**
```json
{
  "lineNumber": 1,
  "segments": [
    {"text": "Living Room: ", "color": "white"},
    {"text": "22°C", "color": "green"}
  ],
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
// Simple mode:
{
  lineNumber: number;  // 1-14
  text: string;        // Exactly 24 chars (padded/truncated)
  color: "white" | "amber" | "cyan" | "green" | "magenta" | "red" | "yellow" | "grey";
  timestamp?: number;
}

// Segments mode:
{
  lineNumber: number;  // 1-14
  segments: Array<{
    text: string;
    color: "white" | "amber" | "cyan" | "green" | "magenta" | "red" | "yellow" | "grey";
  }>;
  timestamp?: number;
}
```

**Validation**:
- `lineNumber` must be 1-14 (out of range = ignore)
- Simple mode: `text` padded/truncated to 24 chars
- Segments mode: Combined segment text truncated to 24 chars, remaining padded with white spaces
- Invalid color defaults to "white"
- If both `text` and `segments` provided, `segments` takes precedence

---

### 2.3 Display Clear (`mcdu/display/clear`)

**Purpose**: Clear all lines (blank display)

```json
{
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
{
  timestamp?: number;
}
```

**Behavior**: Sets all 14 lines to 24 spaces, color white

---

### 2.4 LEDs Set All (`mcdu/leds/set`)

**Purpose**: Set all 11 LEDs at once

**Boolean mode (on/off):**
```json
{
  "leds": {
    "FAIL": true,
    "FM": false,
    "MCDU": true,
    "RDY": true,
    "BACKLIGHT": true,
    "SCREEN_BACKLIGHT": true
  },
  "timestamp": 1708012800000
}
```

**Brightness mode (0-255):**
```json
{
  "leds": {
    "RDY": 255,
    "BACKLIGHT": 200,
    "SCREEN_BACKLIGHT": 255,
    "FAIL": 0
  },
  "timestamp": 1708012800000
}
```

**Mixed mode (boolean + numeric):**
```json
{
  "leds": {
    "RDY": true,
    "SCREEN_BACKLIGHT": 255,
    "BACKLIGHT": 128,
    "FAIL": false
  }
}
```

**Schema**:
```typescript
{
  leds: {
    FAIL?: boolean | number;  // boolean: true=255, false=0; number: 0-255
    FM?: boolean | number;
    MCDU?: boolean | number;
    MENU?: boolean | number;
    FM1?: boolean | number;
    IND?: boolean | number;
    RDY?: boolean | number;
    STATUS?: boolean | number;
    FM2?: boolean | number;
    BACKLIGHT?: boolean | number;
    SCREEN_BACKLIGHT?: boolean | number;
  };
  timestamp?: number;
}
```

**Validation**:
- Unknown LED names ignored
- Missing LEDs retain current state (cached)
- Boolean: `true` = 255, `false` = 0
- Number: Clamped to 0-255 range
- Invalid values default to `0` (off)

---

### 2.5 LEDs Single (`mcdu/leds/single`)

**Purpose**: Set one LED (faster for single changes)

**Option 1: Boolean state (on/off)**
```json
{
  "name": "RDY",
  "state": true,
  "timestamp": 1708012800000
}
```

**Option 2: Numeric brightness (0-255)**
```json
{
  "name": "SCREEN_BACKLIGHT",
  "brightness": 255,
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
{
  name: string;  // One of 11 LED names
  state?: boolean;  // true = 255, false = 0
  brightness?: number;  // 0-255 (overrides state if both present)
  timestamp?: number;
}
```

**Validation**:
- Unknown `name` ignored
- Invalid `state` defaults to `false`
- `brightness` clamped to 0-255 range
- If both `state` and `brightness` provided, `brightness` takes precedence

---

### 2.6 Button Event (`mcdu/buttons/event`)

**Purpose**: Report button press/release

```json
{
  "button": "LSK1L",
  "action": "press",
  "timestamp": 1708012800123
}
```

**Schema**:
```typescript
{
  button: string;  // One of 73 button names from button-map.json
  action: "press" | "release";
  timestamp: number;  // Unix milliseconds (always included)
}
```

**Button Names**: See `nodejs-test/button-map.json` for all 73 names
- Line Select Keys: `LSK1L`, `LSK1R`, ..., `LSK6L`, `LSK6R`
- Function Keys: `DIR`, `PROG`, `PERF`, `INIT`, `FPLN`, `RAD`, `FUEL`, `SEC`, `ATC`, `MENU`, `AIRPORT`
- Letters: `A` - `Z`
- Numbers: `0` - `9`
- Control: `OVFY`, `CLR`, `BRT`, `DIM`, `SLEW_UP`, `SLEW_DOWN`, `SLEW_LEFT`, `SLEW_RIGHT`, `DOT`, `PLUSMINUS`, `SLASH`, `SPACE`

---

### 2.7 Status Online (`mcdu/status/online`)

**Purpose**: Last Will and Testament (LWT) for connection status

```json
{
  "status": "online",
  "hostname": "raspberrypi",
  "clientId": "mcdu-client-raspberrypi",
  "version": "1.0.0",
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
{
  status: "online" | "offline";
  hostname?: string;
  clientId?: string;
  version?: string;
  timestamp?: number;
}
```

**LWT Configuration**:
- Topic: `mcdu/status/online`
- QoS: 1
- Retained: Yes
- Payload (on disconnect): `{"status":"offline","timestamp":...}`

---

### 2.8 Status Ping/Pong (`mcdu/status/ping` / `mcdu/status/pong`)

**Purpose**: Health check mechanism

**Ping** (sent by ioBroker):
```json
{
  "requestId": "uuid-1234",
  "timestamp": 1708012800000
}
```

**Pong** (sent by RasPi):
```json
{
  "requestId": "uuid-1234",
  "uptime": 86400,
  "buttonsSent": 1234,
  "displaysRendered": 567,
  "timestamp": 1708012800123
}
```

---

### 2.9 Status Error (`mcdu/status/error`)

**Purpose**: Report hardware errors

```json
{
  "error": "HID device disconnected",
  "code": "DEVICE_DISCONNECTED",
  "timestamp": 1708012800000
}
```

**Schema**:
```typescript
{
  error: string;      // Human-readable error
  code?: string;      // Machine-readable error code
  stack?: string;     // Stack trace (optional)
  timestamp: number;
}
```

---

## 3. RasPi Client Architecture

### 3.1 File Structure

```
mcdu-client.js           # Main entry point (~500 lines)
├── MQTT setup
├── HID device connection
├── Display state cache
├── LED state cache
├── Button event handling
└── Graceful shutdown

mcdu.js                  # Hardware driver (from Phase 2, reused as-is)

button-map.json          # Button mapping (from Phase 2.5)

config.env               # Configuration (not committed to git)
```

---

### 3.2 Configuration (Environment Variables)

```bash
# MQTT Broker
MQTT_BROKER=mqtt://192.168.1.100:1883
MQTT_USERNAME=mcdu-client
MQTT_PASSWORD=secret123
MQTT_TOPIC_PREFIX=mcdu

# MQTT Client
MQTT_CLIENT_ID=mcdu-client-raspberrypi
MQTT_KEEPALIVE=60

# Hardware
MCDU_VENDOR_ID=0x4098
MCDU_PRODUCT_ID=0xbb36

# Performance (Pi 1 optimizations)
BUTTON_POLL_RATE=50        # Hz (reduced from 100Hz for Pi 1)
DISPLAY_THROTTLE=100       # ms (max 10 updates/sec)
LED_THROTTLE=50            # ms (max 20 updates/sec)

# Logging
LOG_LEVEL=info             # debug|info|warn|error
LOG_BUTTONS=false          # Log every button event (noisy)
```

---

### 3.3 Core Components

#### 3.3.1 MQTT Client

```javascript
const mqtt = require('mqtt');

const client = mqtt.connect(process.env.MQTT_BROKER, {
  clientId: process.env.MQTT_CLIENT_ID || 'mcdu-client',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  keepalive: parseInt(process.env.MQTT_KEEPALIVE) || 60,
  clean: true,
  will: {
    topic: 'mcdu/status/online',
    payload: JSON.stringify({status: 'offline', timestamp: Date.now()}),
    qos: 1,
    retain: true
  }
});
```

#### 3.3.2 Display State Cache

```javascript
// Cache current display state (avoid redundant HID writes)
const displayCache = {
  lines: Array(14).fill(null).map(() => ({
    text: '                        ', // 24 spaces
    color: 'white'
  })),
  dirty: false,
  lastUpdate: 0
};
```

#### 3.3.3 LED State Cache

```javascript
// Cache current LED state
const ledCache = {
  FAIL: false,
  FM: false,
  MCDU: false,
  MENU: false,
  FM1: false,
  IND: false,
  RDY: false,
  STATUS: false,
  FM2: false,
  BACKLIGHT: true,      // Default on
  SCREEN_BACKLIGHT: true // Default on
};
```

#### 3.3.4 Display Update with Throttling

```javascript
const DISPLAY_THROTTLE = parseInt(process.env.DISPLAY_THROTTLE) || 100; // ms
let lastDisplayUpdate = 0;

function updateDisplay() {
  const now = Date.now();
  if (now - lastDisplayUpdate < DISPLAY_THROTTLE) {
    return; // Throttle
  }
  
  mcdu.updateDisplay(); // Sends cached state to hardware
  lastDisplayUpdate = now;
}
```

#### 3.3.5 Button Event Handler

```javascript
const BUTTON_POLL_RATE = parseInt(process.env.BUTTON_POLL_RATE) || 50; // Hz
const LOG_BUTTONS = process.env.LOG_BUTTONS === 'true';

mcdu.startButtonReading((button, action) => {
  if (LOG_BUTTONS) {
    console.log(`Button: ${button} ${action}`);
  }
  
  client.publish('mcdu/buttons/event', JSON.stringify({
    button,
    action,
    timestamp: Date.now()
  }), {qos: 1});
}, BUTTON_POLL_RATE);
```

---

### 3.4 Message Handlers

#### 3.4.1 Display Full Update

```javascript
client.on('message', (topic, message) => {
  if (topic === 'mcdu/display/set') {
    const data = JSON.parse(message.toString());
    
    // Validate
    if (!Array.isArray(data.lines) || data.lines.length !== 14) {
      console.error('Invalid display/set: lines must be array of 14');
      return;
    }
    
    // Update cache
    data.lines.forEach((line, i) => {
      displayCache.lines[i] = {
        text: padOrTruncate(line.text, 24),
        color: validateColor(line.color)
      };
      mcdu.setLine(i + 1, displayCache.lines[i].text, displayCache.lines[i].color);
    });
    
    // Render (throttled)
    updateDisplay();
  }
});
```

#### 3.4.2 Display Single Line

```javascript
if (topic === 'mcdu/display/line') {
  const data = JSON.parse(message.toString());
  
  // Validate
  if (data.lineNumber < 1 || data.lineNumber > 14) {
    console.error('Invalid lineNumber:', data.lineNumber);
    return;
  }
  
  // Update cache
  const idx = data.lineNumber - 1;
  displayCache.lines[idx] = {
    text: padOrTruncate(data.text, 24),
    color: validateColor(data.color)
  };
  mcdu.setLine(data.lineNumber, displayCache.lines[idx].text, displayCache.lines[idx].color);
  
  // Render (throttled)
  updateDisplay();
}
```

#### 3.4.3 LEDs Set All

```javascript
if (topic === 'mcdu/leds/set') {
  const data = JSON.parse(message.toString());
  
  // Update cache (merge with existing state)
  Object.keys(data.leds).forEach(led => {
    if (ledCache.hasOwnProperty(led)) {
      ledCache[led] = !!data.leds[led];
    }
  });
  
  // Send to hardware
  mcdu.setAllLEDs(ledCache);
}
```

---

### 3.5 Graceful Shutdown

```javascript
function shutdown() {
  console.log('Shutting down...');
  
  // Clear display
  mcdu.clear();
  
  // Turn off all LEDs except backlights
  mcdu.setAllLEDs({
    FAIL: false,
    FM: false,
    MCDU: false,
    MENU: false,
    FM1: false,
    IND: false,
    RDY: false,
    STATUS: false,
    FM2: false,
    BACKLIGHT: true,
    SCREEN_BACKLIGHT: true
  });
  
  // Publish offline status
  client.publish('mcdu/status/online', JSON.stringify({
    status: 'offline',
    timestamp: Date.now()
  }), {qos: 1, retain: true}, () => {
    client.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## 4. Performance Optimizations (Pi 1 Model B Rev 2)

### 4.1 Button Polling

- **Standard**: 100Hz (10ms interval)
- **Pi 1 Optimized**: 50Hz (20ms interval)
- **Rationale**: Single-core ARMv6 @ 700MHz struggles with 100Hz + MQTT + display rendering

### 4.2 Display Throttling

- **Max update rate**: 100ms (10 updates/sec)
- **Rationale**: Display writes are expensive (1008 bytes split into 16 HID reports)
- **Behavior**: Multiple MQTT updates within 100ms = only last one rendered

### 4.3 LED Throttling

- **Max update rate**: 50ms (20 updates/sec)
- **Rationale**: LEDs change less frequently than display, but faster than display updates

### 4.4 MQTT QoS Strategy

- **Commands (subscribe)**: QoS 1 (at least once delivery)
- **Button events (publish)**: QoS 1 (important, must not lose)
- **Status messages**: QoS 0 (best effort, not critical)

### 4.5 Memory Management

- **No dynamic arrays**: Pre-allocate display/LED caches at startup
- **No string concatenation in hot path**: Use Buffer operations
- **Lazy JSON parsing**: Only parse messages for subscribed topics

---

## 5. Testing Strategy

### 5.1 Phase 1: MQTT Connectivity (No MCDU)

**Goal**: Verify MQTT client works on Pi 1

```bash
# Terminal 1: Start client (mock mode, no HID)
MOCK_MODE=true node mcdu-client.js

# Terminal 2: Send test display update
mosquitto_pub -h localhost -t mcdu/display/set -m '{"lines":[{"text":"TEST LINE 1","color":"amber"},...]}'

# Terminal 3: Monitor button events
mosquitto_sub -h localhost -t mcdu/buttons/event -v
```

**Success criteria**:
- Client connects to broker
- Receives display/set messages (logs them)
- Publishes mock button events every 5 seconds

---

### 5.2 Phase 2: Hardware Integration (MCDU Connected)

**Goal**: Verify HID driver works on Pi 1

```bash
# Terminal 1: Start client (full mode)
node mcdu-client.js

# Terminal 2: Send display update
mosquitto_pub -h localhost -t mcdu/display/set -m '{"lines":[...]}'

# Terminal 3: Monitor button events (press physical buttons)
mosquitto_sub -h localhost -t mcdu/buttons/event -v

# Terminal 4: Control LEDs
mosquitto_pub -h localhost -t mcdu/leds/set -m '{"leds":{"RDY":true,"FAIL":false}}'
```

**Success criteria**:
- Display updates appear on MCDU screen
- Physical button presses generate MQTT events
- LEDs respond to MQTT commands
- No memory leaks (run for 1 hour, check `htop`)

---

### 5.3 Phase 3: Performance Testing

**Goal**: Verify Pi 1 can handle load

```bash
# Stress test: Rapid display updates (10/sec for 60 seconds)
for i in {1..600}; do
  mosquitto_pub -h localhost -t mcdu/display/line -m "{\"lineNumber\":1,\"text\":\"UPDATE $i\",\"color\":\"white\"}"
  sleep 0.1
done

# Monitor CPU/memory
htop
```

**Success criteria**:
- CPU < 80% average
- Memory stable (no growth)
- Button events still responsive (<200ms latency)
- No dropped MQTT messages

---

### 5.4 Phase 4: Stability Testing

**Goal**: Verify 24/7 operation

```bash
# Run for 24 hours
nohup node mcdu-client.js > /dev/null 2>&1 &

# Send test messages every 5 minutes
watch -n 300 'mosquitto_pub -h localhost -t mcdu/display/line -m "{\"lineNumber\":14,\"text\":\"ALIVE $(date +%H:%M)\",\"color\":\"green\"}"'

# Monitor uptime/errors
tail -f /var/log/mcdu-client.log
```

**Success criteria**:
- Client stays connected for 24 hours
- No memory leaks
- No HID device disconnects
- MQTT reconnects automatically if broker restarts

---

## 6. Error Handling

### 6.1 HID Device Disconnected

```javascript
mcdu.on('error', (err) => {
  console.error('HID error:', err);
  
  // Publish error
  client.publish('mcdu/status/error', JSON.stringify({
    error: err.message,
    code: 'DEVICE_DISCONNECTED',
    timestamp: Date.now()
  }), {qos: 1});
  
  // Attempt reconnect every 5 seconds
  setTimeout(() => {
    try {
      mcdu.connect();
      console.log('Reconnected to MCDU');
    } catch (e) {
      console.error('Reconnect failed:', e);
    }
  }, 5000);
});
```

### 6.2 MQTT Broker Disconnected

```javascript
client.on('offline', () => {
  console.warn('MQTT offline, will auto-reconnect...');
  // mqtt.js handles reconnection automatically
});

client.on('reconnect', () => {
  console.log('MQTT reconnecting...');
});

client.on('connect', () => {
  console.log('MQTT connected');
  
  // Re-publish online status
  client.publish('mcdu/status/online', JSON.stringify({
    status: 'online',
    hostname: require('os').hostname(),
    clientId: process.env.MQTT_CLIENT_ID,
    version: '1.0.0',
    timestamp: Date.now()
  }), {qos: 1, retain: true});
  
  // Re-subscribe to topics
  client.subscribe(['mcdu/display/#', 'mcdu/leds/#', 'mcdu/status/ping'], {qos: 1});
});
```

### 6.3 Invalid JSON

```javascript
client.on('message', (topic, message) => {
  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (e) {
    console.error('Invalid JSON on', topic, ':', message.toString());
    return; // Ignore
  }
  
  // Process data...
});
```

---

## 7. Logging

### 7.1 Log Levels

```javascript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const log = {
  debug: (msg) => ['debug'].includes(LOG_LEVEL) && console.log('[DEBUG]', msg),
  info: (msg) => ['debug', 'info'].includes(LOG_LEVEL) && console.log('[INFO]', msg),
  warn: (msg) => ['debug', 'info', 'warn'].includes(LOG_LEVEL) && console.warn('[WARN]', msg),
  error: (msg) => console.error('[ERROR]', msg)
};
```

### 7.2 Example Logs

```
[INFO] MQTT connected to mqtt://192.168.1.100:1883
[INFO] MCDU device connected (VID:0x4098 PID:0xbb36)
[INFO] Display initialized (14 lines × 24 chars)
[INFO] Button reading started (50Hz)
[DEBUG] Display update (10ms since last)
[DEBUG] Button: LSK1L press
[WARN] Display throttled (update too fast)
[ERROR] HID device disconnected
[INFO] Reconnected to MCDU
```

---

## 8. Deployment

### 8.1 Pi Setup

```bash
# Install Node.js v12 (last ARMv6 version)
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be v12.x

# Install dependencies
cd /home/pi/mcdu-client
npm install mqtt node-hid
```

### 8.2 Systemd Service

```ini
# /etc/systemd/system/mcdu-client.service
[Unit]
Description=MCDU MQTT Client
After=network.target mosquitto.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/mcdu-client
EnvironmentFile=/home/pi/mcdu-client/config.env
ExecStart=/usr/bin/node /home/pi/mcdu-client/mcdu-client.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable mcdu-client
sudo systemctl start mcdu-client
sudo systemctl status mcdu-client

# View logs
sudo journalctl -u mcdu-client -f
```

---

## 9. Implementation Checklist

- [ ] **Setup**
  - [ ] Create `mcdu-client.js` skeleton
  - [ ] Copy `mcdu.js` and `button-map.json` from Phase 2
  - [ ] Create `config.env` template
  - [ ] Install dependencies (`mqtt`, `node-hid`)

- [ ] **MQTT Client**
  - [ ] Connect to broker with LWT
  - [ ] Subscribe to command topics
  - [ ] Publish online status on connect

- [ ] **Display Handling**
  - [ ] Implement `displayCache`
  - [ ] Handle `mcdu/display/set` (full update)
  - [ ] Handle `mcdu/display/line` (single line)
  - [ ] Handle `mcdu/display/clear`
  - [ ] Implement throttling (100ms)

- [ ] **LED Handling**
  - [ ] Implement `ledCache`
  - [ ] Handle `mcdu/leds/set` (all LEDs)
  - [ ] Handle `mcdu/leds/single`
  - [ ] Implement throttling (50ms)

- [ ] **Button Handling**
  - [ ] Start button polling (50Hz)
  - [ ] Publish events to `mcdu/buttons/event`
  - [ ] Add optional logging

- [ ] **Error Handling**
  - [ ] HID disconnect/reconnect
  - [ ] MQTT offline/reconnect
  - [ ] Invalid JSON gracefully ignored
  - [ ] Publish errors to `mcdu/status/error`

- [ ] **Testing**
  - [ ] Phase 1: MQTT connectivity (mock mode)
  - [ ] Phase 2: Hardware integration
  - [ ] Phase 3: Performance testing
  - [ ] Phase 4: Stability testing (24h)

- [ ] **Deployment**
  - [ ] Test on Pi 1 Model B Rev 2
  - [ ] Create systemd service
  - [ ] Document deployment steps

- [ ] **Documentation**
  - [ ] Add README.md to mcdu-client/
  - [ ] Document config.env options
  - [ ] Create troubleshooting guide

---

## 10. Next Steps (Phase 3b)

After Phase 3a is complete and tested:
1. ioBroker adapter development
2. Template system implementation
3. JSON Config UI
4. End-to-end integration testing

**Target**: mcdu-client.js runs independently, testable with mosquitto CLI before ioBroker adapter exists.

---

**EOF**
