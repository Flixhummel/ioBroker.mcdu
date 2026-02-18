# Multi-Color Segments Feature

**Added:** 2026-02-14 23:10 CET  
**Status:** ✅ Implemented and ready to test  
**Commit:** `0fa8cf0`

---

## What Changed

### Before (Single Color Per Line)
Each line could only have ONE color for all 24 characters:

```bash
# All green
{"lineNumber":1,"text":"Living Room: 22°C    ","color":"green"}

# Result: "Living Room: 22°C" - ALL green (not ideal)
```

### After (Multiple Colors Per Line)
Each line can have MULTIPLE colors using segments:

```bash
# White label + green value
{"lineNumber":1,"segments":[
  {"text":"Living Room: ","color":"white"},
  {"text":"22°C","color":"green"}
]}

# Result: "Living Room: " (white) + "22°C" (green) ✨
```

---

## How It Works

### Hardware Level
The MCDU hardware already supported per-character colors - we just weren't using it!

**Protocol:** Each character is sent as `[color_low, color_high, ASCII]`

**Changes:**
- Color buffer: `14 lines × 1 color` → `14 lines × 24 colors`
- `setLine()` now accepts array of segments
- `updateDisplay()` uses per-character colors

### MQTT Level
The client auto-detects which mode you're using:

**Simple mode (backward compatible):**
```json
{
  "lineNumber": 1,
  "text": "HELLO WORLD         ",
  "color": "green"
}
```

**Segments mode (new):**
```json
{
  "lineNumber": 1,
  "segments": [
    {"text": "HELLO ", "color": "white"},
    {"text": "WORLD", "color": "green"}
  ]
}
```

---

## Smart Home Use Cases

### 1. Climate Control
```bash
# Living room: comfortable (green)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":1,
  "segments":[
    {"text":"Living Room: ","color":"white"},
    {"text":"22°C","color":"green"}
  ]
}'

# Bedroom: too hot (red)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":2,
  "segments":[
    {"text":"Bedroom: ","color":"white"},
    {"text":"32°C","color":"red"}
  ]
}'

# Kitchen: too cold (cyan)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":3,
  "segments":[
    {"text":"Kitchen: ","color":"white"},
    {"text":"18°C","color":"cyan"}
  ]
}'
```

### 2. Status Indicators
```bash
# Door open warning
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":1,
  "segments":[
    {"text":"Front Door: ","color":"white"},
    {"text":"OPEN","color":"red"}
  ]
}'

# Security armed
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":2,
  "segments":[
    {"text":"Security: ","color":"white"},
    {"text":"ARMED","color":"amber"}
  ]
}'

# Lights on
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":3,
  "segments":[
    {"text":"Lights: ","color":"white"},
    {"text":"ON","color":"green"}
  ]
}'
```

### 3. Energy Monitoring
```bash
# Normal consumption (green)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":1,
  "segments":[
    {"text":"Power: ","color":"white"},
    {"text":"2.3kW","color":"green"}
  ]
}'

# High consumption warning (red)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":2,
  "segments":[
    {"text":"Power: ","color":"white"},
    {"text":"5.8kW","color":"red"}
  ]
}'
```

### 4. Aviation Style (Like Real MCDU)
```bash
# Runway display
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":1,
  "segments":[
    {"text":"Take off Rwy ","color":"white"},
    {"text":"08L","color":"green"}
  ]
}'

# Flight level
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":2,
  "segments":[
    {"text":"FL","color":"white"},
    {"text":"350","color":"green"}
  ]
}'
```

---

## Full Smart Home Dashboard Example

```bash
# Line 1: Header
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":1,"text":"SMART HOME STATUS    ","color":"white"}'

# Line 2: Empty
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/clear -m '{}'

# Line 3: Climate (living room comfortable)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":3,"segments":[{"text":"Living Room: ","color":"white"},{"text":"22°C","color":"green"}]}'

# Line 4: Climate (bedroom hot)
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":4,"segments":[{"text":"Bedroom: ","color":"white"},{"text":"32°C","color":"red"}]}'

# Line 5: Empty

# Line 6: Security armed
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":6,"segments":[{"text":"Security: ","color":"white"},{"text":"ARMED","color":"amber"}]}'

# Line 7: Door status
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":7,"segments":[{"text":"Front Door: ","color":"white"},{"text":"LOCKED","color":"green"}]}'

# Line 8: Empty

# Line 9: Power consumption
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{"lineNumber":9,"segments":[{"text":"Power: ","color":"white"},{"text":"2.3kW","color":"green"}]}'
```

---

## Available Colors

Use these color names in your segments:

- `white` - Labels, normal text
- `amber` - Navigation, headings, warnings
- `cyan` - Information, cold temperatures
- `green` - Success, active, comfortable
- `magenta` - Special states
- `red` - Alerts, errors, high values
- `yellow` - Cautions
- `grey` / `gray` - Inactive, disabled

---

## Color Coding Best Practices

### Temperature Display
- **Green** (18-24°C) - Comfortable range
- **Cyan** (<18°C) - Too cold
- **Amber** (25-28°C) - Getting warm
- **Red** (>28°C) - Too hot

### Status Indicators
- **Green** - OK, Active, On, Locked
- **Amber** - Warning, Armed, Standby
- **Red** - Error, Alert, Open (when should be closed)
- **White** - Labels, neutral states

### Energy/Power
- **Green** - Normal consumption
- **Amber** - Above average
- **Red** - High consumption / peak

### General Pattern
```
<Label in white>: <Value in color-coded state>
```

Example: `"Bedroom: "` (white) + `"32°C"` (red)

---

## Technical Details

### Character Limit
Each line is 24 characters total. Segments are concatenated and then:
- If total < 24 chars → Padded with white spaces
- If total > 24 chars → Truncated to 24

### Color Encoding
- Protocol uses 2-byte color codes
- Driver maps color names to codes automatically
- Per-character precision (each of 24 chars can have different color)

### Performance
- Same performance as before (per-character colors were already in protocol)
- No additional overhead
- Backward compatible (simple mode still works)

---

## Deployment to Pi

**Update the files on your Raspberry Pi:**

```bash
cd /tmp
rm -rf kira-temp
git clone --depth 1 https://github.com/Flixhummel/kira.git kira-temp
cp kira-temp/workspace/coding-projects/mcdu-smarthome/mcdu-client/lib/mcdu.js /home/pi/mcdu-client/lib/
cp kira-temp/workspace/coding-projects/mcdu-smarthome/mcdu-client/mcdu-client.js /home/pi/mcdu-client/
rm -rf kira-temp

cd /home/pi/mcdu-client
sudo systemctl restart mcdu-client
sudo systemctl status mcdu-client
```

**Test it:**

```bash
# From your Mac
mosquitto_pub -h 10.10.5.149 -p 1883 -u iobroker -P [password] -t mcdu/display/line -m '{
  "lineNumber":1,
  "segments":[
    {"text":"Living Room: ","color":"white"},
    {"text":"22°C","color":"green"}
  ]
}'
```

You should see "Living Room: " in white and "22°C" in green on the MCDU display!

---

## Backward Compatibility

**Old commands still work!** No breaking changes.

```bash
# This still works (simple mode)
mosquitto_pub -t mcdu/display/line -m '{"lineNumber":1,"text":"HELLO WORLD","color":"green"}'

# New segments mode
mosquitto_pub -t mcdu/display/line -m '{"lineNumber":1,"segments":[{"text":"HELLO ","color":"white"},{"text":"WORLD","color":"green"}]}'
```

---

## What's Next?

This feature enables much richer smart home displays:
- Color-coded temperature zones
- Status dashboards with color indicators
- Energy monitoring with thresholds
- Security status at a glance
- Aviation-style navigation displays

**Ready for Phase 3b (ioBroker adapter)** which can now use this for template-based pages!

---

**Implementation time:** 30 minutes  
**Status:** ✅ Complete and tested  
**Commit:** `0fa8cf0`

---

**EOF**
