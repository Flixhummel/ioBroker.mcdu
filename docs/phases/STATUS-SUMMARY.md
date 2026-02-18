# MCDU Smart Home Controller - Status Summary

**Last Updated:** 2026-02-14 22:50 CET  
**Overall Status:** ✅ Phase 3a Complete - Production-Ready MQTT Client  

---

## Quick Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Hardware** | ✅ Verified | MCDU-32-CAPTAIN fully functional |
| **Node.js Driver** | ✅ Complete | mcdu.js with per-line colors + brightness |
| **RasPi MQTT Client** | ✅ Deployed | Running on Pi 1 Model B Rev 2 |
| **MQTT Integration** | ✅ Working | Broker: 10.10.5.149:1883 |
| **Display Control** | ✅ Working | Text + per-character colors (8 colors, multi-color segments per line) |
| **Button Events** | ✅ Working | All 73 buttons publishing to MQTT |
| **LED Control** | ✅ Working | 11 LEDs + brightness control (0-255) |
| **Auto-Start Service** | ✅ Working | systemd with restart on failure |
| **ioBroker Adapter** | ⏭️ Not Started | Phase 3b next |

---

## What You Can Do Right Now

### 1. Send Text to Display
```bash
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] \
  -t mcdu/display/line \
  -m '{"lineNumber":1,"text":"SMART HOME READY!    ","color":"green"}'
```

### 2. See Button Presses
```bash
mosquitto_sub -h 10.10.5.149 -p 1883 -u iobroker -P [password] \
  -t mcdu/buttons/event -v
```
Press any button on the MCDU → Event appears instantly!

### 3. Control LEDs
```bash
# Turn on RDY indicator
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] \
  -t mcdu/leds/single \
  -m '{"name":"RDY","state":true}'

# Adjust screen brightness
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] \
  -t mcdu/leds/single \
  -m '{"name":"SCREEN_BACKLIGHT","brightness":255}'
```

### 4. Full Display Page Example
```bash
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] \
  -t mcdu/display/set -m '{
  "lines": [
    {"text":"SMART HOME MCDU      ","color":"white"},
    {"text":"                     ","color":"white"},
    {"text":"<LIGHTS      STATUS> ","color":"amber"},
    {"text":"<CLIMATE       TEMP> ","color":"amber"},
    {"text":"<SECURITY     ALARM> ","color":"amber"},
    {"text":"                     ","color":"white"},
    {"text":"SYSTEM READY         ","color":"green"},
    {"text":"                     ","color":"white"},
    {"text":"                     ","color":"white"},
    {"text":"                     ","color":"white"},
    {"text":"                     ","color":"white"},
    {"text":"                     ","color":"white"},
    {"text":"<PREV         NEXT>  ","color":"green"},
    {"text":"                     ","color":"white"}
  ]
}'
```

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR MAC / PC                        │
│                                                         │
│  mosquitto_pub / mosquitto_sub                          │
│  (Send commands, monitor events)                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ MQTT (10.10.5.149:1883)
                   │
        ┌──────────▼──────────┐
        │   MQTT Broker       │
        │   (Mosquitto)       │
        └──────────┬──────────┘
                   │
                   │ MQTT Topics
                   │ mcdu/display/*
                   │ mcdu/leds/*
                   │ mcdu/buttons/event
                   │ mcdu/status/*
                   │
        ┌──────────▼──────────────────────────┐
        │  Raspberry Pi 1 Model B Rev 2       │
        │  IP: 10.10.2.190                    │
        │                                     │
        │  ┌───────────────────────────────┐  │
        │  │  mcdu-client.js               │  │
        │  │  (systemd service)            │  │
        │  │                               │  │
        │  │  • MQTT client                │  │
        │  │  • Display rendering          │  │
        │  │  • Button polling (50Hz)      │  │
        │  │  • LED control                │  │
        │  └───────────┬───────────────────┘  │
        │              │                      │
        │              │ USB HID              │
        │              ▼                      │
        │  ┌───────────────────────────────┐  │
        │  │  mcdu.js (hardware driver)    │  │
        │  └───────────┬───────────────────┘  │
        └──────────────┼──────────────────────┘
                       │
                       │ USB
                       ▼
            ┌──────────────────────┐
            │   MCDU-32-CAPTAIN    │
            │   (Hardware)         │
            │                      │
            │  • 14×24 Display     │
            │  • 73 Buttons        │
            │  • 11 LEDs           │
            └──────────────────────┘
```

---

## Project Timeline

### Completed Phases ✅

**Phase 1: Hardware Testing** (2h - 2026-02-14)
- Protocol reverse-engineered
- All hardware verified (display, buttons, LEDs)
- Python test scripts created
- Documentation: HARDWARE-TEST-RESULTS.md

**Phase 2: Node.js Driver** (4h - 2026-02-14)
- CRITICAL BREAKTHROUGH: Full-screen buffer approach
- mcdu.js driver complete (10.7KB)
- All 8 colors working
- API documentation
- Documentation: PHASE2-COMPLETE.md, PROTOCOL-FINDINGS.md

**Phase 2.5: Physical Mapping** (20min - 2026-02-14)
- 73 buttons mapped to standard MCDU labels
- button-map.json created
- LED discovery: Names match protocol exactly
- Documentation: PHASE2.5-COMPLETE.md, BUTTON-MAPPING.md

**Phase 3: Architecture Decision** (30min - 2026-02-14)
- Analyzed Lovelace, Zigbee, Tasmota patterns
- MQTT-based hybrid architecture approved
- RasPi = "dumb terminal", ioBroker = "smart server"
- Documentation: ARCHITECTURE-DECISION.md (12.6KB)

**Phase 3a: RasPi MQTT Client** (3h - 2026-02-14)
- **Specification:** PHASE3A-SPEC.md (21.5KB) - Contract-first design
- **Implementation:** mcdu-client.js (~550 lines)
- **Deployment:** Raspberry Pi 1 Model B Rev 2
- **Bugs Fixed:** 5 critical issues resolved
- **Status:** Production-ready, running as systemd service
- **Documentation:** PHASE3A-COMPLETE.md, PHASE3A-LESSONS-LEARNED.md

### Current Phase ⏸️

**Phase 3b: ioBroker Adapter** (Not Started)
- Template system (pre-built MCDU pages)
- State subscriptions (ioBroker → MCDU)
- Button handlers (MCDU → ioBroker)
- JSON Config UI
- Multi-MCDU support

**Estimated Time:** 2-3 days  
**Prerequisites:** All met ✅

---

## Technical Specs

### Hardware
- **Device:** WINWING MCDU-32-CAPTAIN
- **Vendor ID:** 0x4098
- **Product ID:** 0xbb36
- **Display:** 14 lines × 24 characters, 8 colors
- **Buttons:** 73 (12 LSK, 12 function, 26 letters, 10 numbers, 13 control)
- **LEDs:** 11 (9 indicators + 2 backlights)
- **Connection:** USB HID

### Raspberry Pi
- **Model:** Raspberry Pi 1 Model B Rev 2
- **CPU:** ARMv6 @ 700MHz (single-core)
- **RAM:** 512MB
- **OS:** Raspberry Pi OS Lite (Legacy, 32-bit)
- **Node.js:** v10.24.1 (last ARMv6-compatible version)
- **IP:** 10.10.2.190

### MQTT Broker
- **Software:** Mosquitto
- **IP:** 10.10.5.149
- **Port:** 1883
- **Authentication:** Username/password (iobroker)
- **Topics:** 9 (6 subscribe, 3 publish)

### Performance
- **CPU Usage:** 20-30% idle, <80% under load
- **Memory:** ~60MB
- **Button Latency:** <100ms (press → MQTT publish)
- **Display Latency:** <50ms (MQTT receive → hardware)
- **Button Poll Rate:** 50Hz (optimized for Pi 1)
- **Display Throttle:** 100ms (max 10 updates/sec)
- **LED Throttle:** 50ms (max 20 updates/sec)

---

## Available Colors

- `white` - Default
- `amber` - Navigation/headings
- `cyan` - Information
- `green` - Success/active
- `magenta` - Special
- `red` - Warnings/errors
- `yellow` - Cautions
- `grey` / `gray` - Inactive

---

## Available LEDs

**Indicators:**
- `FAIL` - System failure indicator
- `FM` - Flight mode 
- `MCDU` - MCDU status
- `MENU` - Menu active
- `FM1` - Flight mode 1
- `IND` - Index
- `RDY` - Ready status
- `STATUS` - Status indicator
- `FM2` - Flight mode 2

**Backlights:**
- `BACKLIGHT` - Button backlight (0-255)
- `SCREEN_BACKLIGHT` - Display backlight (0-255)

---

## File Structure

```
mcdu-smarthome/
├── PROGRESS.md                      # Project timeline
├── STATUS-SUMMARY.md                # This file
├── PHASE3A-SPEC.md                  # MQTT contract spec
├── PHASE3A-COMPLETE.md              # Implementation summary
├── PHASE3A-LESSONS-LEARNED.md       # Bugs & learnings
├── MQTT-TEST-COMMANDS.md            # Testing guide
├── ARCHITECTURE-DECISION.md         # Phase 3 design
│
├── mcdu-client/                     # RasPi MQTT Client (Phase 3a)
│   ├── mcdu-client.js               # Main client (~550 lines)
│   ├── package.json                 # Dependencies
│   ├── config.env.template          # Configuration template
│   ├── mcdu-client.service          # systemd service
│   ├── install-nodejs-armv6.sh      # Node.js installer for ARMv6
│   ├── install.sh                   # Automated setup
│   ├── README.md                    # Documentation
│   ├── PI-SETUP.md                  # Deployment guide
│   └── lib/
│       ├── mcdu.js                  # Hardware driver (Phase 2)
│       ├── button-map.json          # Button mapping (Phase 2.5)
│       └── ...
│
├── nodejs-test/                     # Phase 2 development
│   ├── mcdu.js                      # Original driver
│   ├── demo.js                      # Interactive demo
│   ├── button-map.json              # Button mapping
│   └── ...
│
└── prototype/                       # Phase 1 (Python tests)
    └── tests/
        ├── button_test_final.py
        ├── led_test.py
        └── ...
```

---

## What's Next?

### Option 1: Proceed to Phase 3b (ioBroker Adapter)
**Scope:** Build ioBroker adapter that uses the MQTT client  
**Time:** 2-3 days  
**Features:**
- Template system for pre-built pages
- State mapping (ioBroker objects → MCDU)
- Button handlers (MCDU → ioBroker actions)
- JSON Config UI
- Multi-MCDU support

**Prerequisites:** All met ✅

### Option 2: Production Optimization
**Quick wins:**
- Remove debug logging (keep log.debug only)
- Add log rotation
- Create deployment package
- Write troubleshooting guide

**Time:** 1-2 hours

### Option 3: Integration with Existing Systems
**Current client works with:**
- Node-RED (via MQTT)
- Home Assistant (via MQTT)
- Any MQTT-capable system

**Example:** Node-RED flow to display sensor data on MCDU

---

## Success Metrics ✅

### Phase 3a Goals (All Met)
- ✅ RasPi client runs on Pi 1 Model B Rev 2
- ✅ MQTT broker connection stable
- ✅ All MQTT topics working
- ✅ Display control functional (text + colors)
- ✅ Button events publishing
- ✅ LED control working (boolean + brightness)
- ✅ Auto-start on boot
- ✅ Error recovery (auto-reconnect)
- ✅ Performance acceptable (<80% CPU)
- ✅ Complete documentation
- ✅ All bugs fixed

### Overall Project Goals
- ✅ Hardware protocol understood
- ✅ Working Node.js driver
- ✅ Physical button/LED mapping complete
- ✅ MQTT integration working
- ⏭️ ioBroker adapter (Phase 3b)
- ⏭️ Template system (Phase 3b)
- ⏭️ Multi-MCDU support (Phase 3b)

---

## Total Time Investment

| Phase | Time | Status |
|-------|------|--------|
| Phase 1: Hardware Testing | 2h | ✅ Complete |
| Phase 2: Node.js Driver | 4h | ✅ Complete |
| Phase 2.5: Physical Mapping | 20min | ✅ Complete |
| Phase 3: Architecture | 30min | ✅ Complete |
| Phase 3a: RasPi Client | 3h | ✅ Complete |
| **Total** | **~11h** | **3a DONE** |
| Phase 3b: ioBroker Adapter | 2-3 days | ⏭️ Not Started |

---

## Repository

**GitHub:** https://github.com/Flixhummel/kira  
**Path:** `workspace/coding-projects/mcdu-smarthome/`  
**Branch:** `main`  
**Latest Commit:** `9c6f29b` - Fix per-line color support

---

## Contact & Support

**Hardware:** WINWING MCDU-32-CAPTAIN  
**Software:** Node.js v10.24.1, MQTT (Mosquitto)  
**Platform:** Raspberry Pi OS Lite (Legacy, Debian Buster)  
**MQTT Broker:** 10.10.5.149:1883 (iobroker)

---

## Quick Start (For New Users)

1. **Flash Pi:** Raspberry Pi OS Lite (Legacy, 32-bit)
2. **Install Node.js:** Run `install-nodejs-armv6.sh` on Pi
3. **Deploy Client:** Copy mcdu-client/ to `/home/pi/`
4. **Configure:** Edit `config.env` (set MQTT broker)
5. **Install Service:** Run `install.sh`
6. **Test:** `mosquitto_pub` to send display updates

Full guide: `mcdu-client/PI-SETUP.md`

---

**Status:** ✅ **PHASE 3A COMPLETE - PRODUCTION-READY**  
**Next:** Phase 3b (ioBroker Adapter) or Integration Testing

---

**EOF**
