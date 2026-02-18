# Phase 2: MQTT Keypad Protocol Extension

**Version:** 1.0  
**Date:** 2026-02-16  
**Status:** ✅ Implemented  
**Author:** Kira Holt (subagent)

---

## Overview

This document extends the MQTT protocol (from PHASE3A-SPEC.md) with keypad input support for the MCDU Input System (Phase 2).

**New Topic:** `mcdu/buttons/keypad`

**Purpose:** Transmit keypad character input (0-9, A-Z, special chars) from MCDU hardware to ioBroker adapter.

---

## MQTT Topic

### Topic Pattern

```
<topicPrefix>/buttons/keypad
```

**Default:** `mcdu/buttons/keypad`

**QoS:** 1 (at least once delivery)

**Retain:** false (ephemeral events)

---

## Message Format

### Payload Structure (JSON)

```json
{
  "key": "KEY_5",
  "state": "pressed",
  "deviceId": "mcdu-pi-1",
  "timestamp": 1708087234567
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Key identifier (see Key Mappings below) |
| `state` | string | Yes | Key state: `"pressed"` or `"released"` |
| `deviceId` | string | Yes | MCDU device identifier |
| `timestamp` | number | Yes | Unix timestamp in milliseconds |

---

## Key Mappings

### Numeric Keys (0-9)

| Hardware Key | MQTT Key | Character |
|--------------|----------|-----------|
| 0 | `KEY_0` | `'0'` |
| 1 | `KEY_1` | `'1'` |
| 2 | `KEY_2` | `'2'` |
| 3 | `KEY_3` | `'3'` |
| 4 | `KEY_4` | `'4'` |
| 5 | `KEY_5` | `'5'` |
| 6 | `KEY_6` | `'6'` |
| 7 | `KEY_7` | `'7'` |
| 8 | `KEY_8` | `'8'` |
| 9 | `KEY_9` | `'9'` |

### Alphabetic Keys (A-Z)

| Hardware Key | MQTT Key | Character |
|--------------|----------|-----------|
| A | `KEY_A` | `'A'` |
| B | `KEY_B` | `'B'` |
| ... | ... | ... |
| Z | `KEY_Z` | `'Z'` |

### Special Characters

| Hardware Key | MQTT Key | Character | Description |
|--------------|----------|-----------|-------------|
| . (Decimal) | `KEY_DOT` | `'.'` | Decimal point |
| / (Slash) | `KEY_SLASH` | `'/'` | Forward slash |
| Space | `KEY_SPACE` | `' '` | Space character |
| + (Plus) | `KEY_PLUS` | `'+'` | Plus sign |
| - (Minus) | `KEY_MINUS` | `'-'` | Minus sign |
| _ (Underscore) | `KEY_UNDERSCORE` | `'_'` | Underscore |

**Note:** Special keys (CLR, DEL, OVFY) are handled via the existing `mcdu/buttons/event` topic, NOT the keypad topic.

---

## Example Messages

### Example 1: Numeric Input

User presses "5" on numeric keypad:

```json
{
  "key": "KEY_5",
  "state": "pressed",
  "deviceId": "mcdu-pi-1",
  "timestamp": 1708087234567
}
```

Adapter behavior:
- Appends `'5'` to scratchpad
- Scratchpad Line 14 updates: `"5*"`

---

### Example 2: Decimal Number Input

User types "22.5":

**Message 1:** (Press '2')
```json
{"key": "KEY_2", "state": "pressed", "deviceId": "mcdu-pi-1", "timestamp": 1708087234500}
```

**Message 2:** (Press '2')
```json
{"key": "KEY_2", "state": "pressed", "deviceId": "mcdu-pi-1", "timestamp": 1708087234650}
```

**Message 3:** (Press '.')
```json
{"key": "KEY_DOT", "state": "pressed", "deviceId": "mcdu-pi-1", "timestamp": 1708087234800}
```

**Message 4:** (Press '5')
```json
{"key": "KEY_5", "state": "pressed", "deviceId": "mcdu-pi-1", "timestamp": 1708087234950}
```

Scratchpad progression:
- After message 1: `"2*"`
- After message 2: `"22*"`
- After message 3: `"22.*"`
- After message 4: `"22.5*"`

---

### Example 3: Time Input

User types "08:30":

**Messages:**
```json
{"key": "KEY_0", "state": "pressed", ...}
{"key": "KEY_8", "state": "pressed", ...}
{"key": "KEY_SLASH", "state": "pressed", ...}  // If no colon key, use slash
{"key": "KEY_3", "state": "pressed", ...}
{"key": "KEY_0", "state": "pressed", ...}
```

Scratchpad: `"08/30*"` → Validation converts `/` to `:` if time field.

---

### Example 4: Text Input (Scene Name)

User types "GUTE NACHT":

**Messages:**
```json
{"key": "KEY_G", "state": "pressed", ...}
{"key": "KEY_U", "state": "pressed", ...}
{"key": "KEY_T", "state": "pressed", ...}
{"key": "KEY_E", "state": "pressed", ...}
{"key": "KEY_SPACE", "state": "pressed", ...}
{"key": "KEY_N", "state": "pressed", ...}
{"key": "KEY_A", "state": "pressed", ...}
{"key": "KEY_C", "state": "pressed", ...}
{"key": "KEY_H", "state": "pressed", ...}
{"key": "KEY_T", "state": "pressed", ...}
```

Scratchpad: `"GUTE NACHT*"`

---

## Integration with Existing Protocol

### Topics Overview

| Topic | Purpose | Phase |
|-------|---------|-------|
| `mcdu/buttons/event` | LSK, function keys, CLR, OVFY | Phase 1 |
| `mcdu/buttons/keypad` | Keypad character input | Phase 2 (NEW) |
| `mcdu/display/set` | Full display update | Phase 1 |
| `mcdu/display/line` | Single line update | Phase 1 |
| `mcdu/devices/status` | Device heartbeat | Phase 1 |

**No conflicts:** Keypad events use separate topic, existing protocol unchanged.

---

## Client Implementation Notes

### RasPi MQTT Client (`mcdu-client`)

**Keypad Event Detection:**

```javascript
// In lib/mcdu.js (hardware driver)
mcdu.on('keypad', (key) => {
  // Map hardware key to MQTT key name
  const mqttKey = mapHardwareKey(key);
  
  // Publish to MQTT
  mqttClient.publish('mcdu/buttons/keypad', JSON.stringify({
    key: mqttKey,
    state: 'pressed',
    deviceId: config.deviceId,
    timestamp: Date.now()
  }), { qos: 1 });
});

function mapHardwareKey(hardwareKey) {
  // Example mapping (depends on hardware)
  if (hardwareKey >= 0 && hardwareKey <= 9) {
    return `KEY_${hardwareKey}`;
  } else if (hardwareKey >= 10 && hardwareKey <= 35) {
    const letter = String.fromCharCode(65 + (hardwareKey - 10)); // A-Z
    return `KEY_${letter}`;
  } else if (hardwareKey === 36) {
    return 'KEY_DOT';
  }
  // ... etc.
}
```

**Throttling:** No throttling needed for keypad (human typing speed is naturally limited).

---

## Adapter Implementation

### Subscription

```javascript
// In lib/mqtt/ButtonSubscriber.js
await this.mqttClient.subscribe('buttons/keypad', this.handleKeypadEvent.bind(this));
```

### Event Handling

```javascript
async handleKeypadEvent(topic, message) {
  const event = JSON.parse(message.toString());
  const { key, state } = event;
  
  // Only process press events (ignore release)
  if (state !== 'pressed') return;
  
  // Map MQTT key to character
  const char = this.keypadMap.get(key);
  
  // Delegate to InputModeManager
  await this.inputModeManager.handleKeyInput(char);
}
```

---

## Security Considerations

**Input Validation:**
- Adapter validates key names (whitelist approach)
- Unknown keys logged but ignored
- No arbitrary code execution risk

**Message Rate Limiting:**
- Human typing speed (~10 chars/sec max)
- No rate limiting needed at protocol level
- Scratchpad has built-in length limit (20 chars)

**Replay Attack Protection:**
- Not critical (keypad input is non-sensitive)
- Timestamps used for debugging, not security

---

## Testing Protocol

### Unit Tests (Client Side)

```javascript
// Test 1: Numeric key press
test('Numeric keypad publishes correct message', () => {
  mcdu.simulateKeyPress(5);
  
  expect(mqtt.lastPublished).toEqual({
    topic: 'mcdu/buttons/keypad',
    payload: {
      key: 'KEY_5',
      state: 'pressed',
      deviceId: 'mcdu-pi-1',
      timestamp: expect.any(Number)
    }
  });
});
```

### Integration Tests (Adapter Side)

```javascript
// Test 2: Keypad event handling
test('Adapter handles keypad event', async () => {
  const event = {
    key: 'KEY_5',
    state: 'pressed',
    deviceId: 'mcdu-pi-1',
    timestamp: Date.now()
  };
  
  await buttonSubscriber.handleKeypadEvent('buttons/keypad', Buffer.from(JSON.stringify(event)));
  
  expect(scratchpadManager.getContent()).toBe('5');
});
```

### End-to-End Tests

```
Test Scenario: Type temperature value
1. User presses: 2, 2, ., 5
2. MQTT messages sent: KEY_2, KEY_2, KEY_DOT, KEY_5
3. Adapter receives all 4 messages
4. Scratchpad updates: "2*" → "22*" → "22.*" → "22.5*"
5. Scratchpad Line 14 renders: "22.5*"

Expected result: ✅ Scratchpad shows "22.5*" in white color
```

---

## Debugging

### MQTT Monitor

Subscribe to keypad topic:
```bash
mosquitto_sub -h localhost -t 'mcdu/buttons/keypad' -v
```

Output:
```
mcdu/buttons/keypad {"key":"KEY_2","state":"pressed","deviceId":"mcdu-pi-1","timestamp":1708087234567}
mcdu/buttons/keypad {"key":"KEY_2","state":"pressed","deviceId":"mcdu-pi-1","timestamp":1708087234650}
mcdu/buttons/keypad {"key":"KEY_DOT","state":"pressed","deviceId":"mcdu-pi-1","timestamp":1708087234800}
```

### Adapter Logs

```javascript
this.adapter.log.debug(`Keypad: ${key} ${state} (${timestamp})`);
```

Output:
```
[DEBUG] Keypad: KEY_5 pressed (1708087234567)
[DEBUG] Scratchpad append: "5" → "5"
[DEBUG] Rendering scratchpad Line 14: "5*" (white)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-16 | Initial specification for Phase 2 input system |

---

## References

- **PHASE3A-SPEC.md** - MQTT protocol foundation (Phase 1)
- **ARCHITECTURE-REVISION.md** - Input system architecture
- **UX-CONCEPT.md** - Input interaction patterns
- **IMPLEMENTATION-PLAN.md** - Implementation roadmap

---

**Document Status:** ✅ Complete - Production-Ready Specification  
**Implementation Status:** ✅ Implemented in Phase 2  
**Next Phase:** Phase 3 - Confirmation System & Business Logic Validation

---

**END OF SPECIFICATION**
