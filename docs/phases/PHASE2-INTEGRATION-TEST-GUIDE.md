# Phase 2: Integration Test Guide

**Purpose:** Verify Phase 1 + Phase 2 integration works correctly  
**Date:** 2026-02-16  
**Estimated Time:** 15-20 minutes

---

## Prerequisites

✅ **Phase 1 working:**
- MQTT broker running
- mcdu-client connected
- Adapter displays pages
- LSK navigation works

✅ **Phase 2 code deployed:**
- All new files in `lib/input/`
- Updated files (`PageRenderer.js`, `ButtonSubscriber.js`, `main.js`)
- No syntax errors

---

## Test Suite

### Test 1: Scratchpad Display (2 minutes)

**Goal:** Verify Line 14 shows scratchpad placeholder

**Steps:**
1. Start adapter: `npm start`
2. Check logs for: `✅ Input system initialized`
3. Look at MCDU display Line 14

**Expected Result:**
```
Line 14: ____________________  (placeholder, 20 underscores)
Color: White
```

**If Failed:**
- Check: `this.scratchpadManager` initialized in `main.js`
- Check: `pageRenderer.setScratchpadManager()` called
- Check: MQTT connection active

---

### Test 2: Keypad Character Input (3 minutes)

**Goal:** Verify typing on keypad shows in scratchpad

**Steps:**
1. Publish test MQTT message:
   ```bash
   mosquitto_pub -h localhost -t 'mcdu/buttons/keypad' -m '{
     "key": "KEY_5",
     "state": "pressed",
     "deviceId": "test",
     "timestamp": 1708087234567
   }'
   ```

2. Check MCDU Line 14

**Expected Result:**
```
Line 14: 5*__________________
Color: White
```

**If Failed:**
- Check: ButtonSubscriber subscribed to `buttons/keypad` topic
- Check: `keypadMap` contains `KEY_5` → `'5'`
- Check: `inputModeManager.handleKeyInput()` called
- Check adapter logs for: `Keypad: KEY_5 pressed`

**Repeat for multiple characters:**
```bash
# Type "22.5"
mosquitto_pub ... -m '{"key": "KEY_2", "state": "pressed", ...}'
mosquitto_pub ... -m '{"key": "KEY_2", "state": "pressed", ...}'
mosquitto_pub ... -m '{"key": "KEY_DOT", "state": "pressed", ...}'
mosquitto_pub ... -m '{"key": "KEY_5", "state": "pressed", ...}'
```

**Expected Result:**
```
Line 14: 22.5*_______________
```

---

### Test 3: CLR Key Clears Scratchpad (2 minutes)

**Goal:** Verify CLR clears scratchpad

**Steps:**
1. Type characters (as in Test 2) so scratchpad = `"22.5*"`
2. Publish CLR button event:
   ```bash
   mosquitto_pub -h localhost -t 'mcdu/buttons/event' -m '{
     "button": "CLR",
     "action": "press",
     "deviceId": "test",
     "timestamp": 1708087234567
   }'
   ```

**Expected Result:**
```
Line 14: ____________________  (cleared)
Adapter log: "Scratchpad cleared"
```

**If Failed:**
- Check: ButtonSubscriber routes CLR to `handleCLRKey()`
- Check: `inputModeManager.handleCLR()` called
- Check: Scratchpad has content before CLR

---

### Test 4: Edit Indicators on Editable Field (4 minutes)

**Goal:** Verify editable fields show arrow indicator

**Setup:**
Create test page in adapter config:
```json
{
  "id": "test-page",
  "name": "TEST",
  "lines": [
    {
      "row": 2,
      "display": {
        "type": "datapoint",
        "source": "system.adapter.mcdu.0.alive",
        "label": "ALIVE",
        "editable": true,
        "inputType": "text"
      }
    }
  ]
}
```

**Steps:**
1. Restart adapter (loads new page config)
2. Navigate to `test-page`
3. Check Line 2

**Expected Result:**
```
Line 2: ALIVE true ←  (arrow indicator at end)
Color: Amber (editable)
```

**If Failed:**
- Check: `field.editable = true` in config
- Check: `addEditIndicator()` called in `renderDatapoint()`
- Check: `isEditActive()` returns false (not editing yet)

---

### Test 5: Copy Field to Scratchpad (5 minutes)

**Goal:** Verify LSK copies field value to scratchpad

**Steps:**
1. On `test-page`, Line 2 shows: `ALIVE true ←`
2. Scratchpad is empty
3. Press LSK2L (left button for row 2):
   ```bash
   mosquitto_pub -h localhost -t 'mcdu/buttons/event' -m '{
     "button": "LSK2L",
     "action": "press",
     "deviceId": "test",
     "timestamp": 1708087234567
   }'
   ```

**Expected Result:**
```
Line 2: [true]  (brackets indicate edit mode)
Color: Amber
Line 14: true*  (scratchpad now has value)
Color: Amber (editing existing value)
Runtime state:
  - mode: 'edit'
  - selectedLine: 2
Adapter log: "Mode: NORMAL → EDIT (value copied to scratchpad)"
```

**If Failed:**
- Check: `inputModeManager.handleLSK('left', 2)` called
- Check: Scratchpad was empty before LSK
- Check: Field has `editable: true`
- Check: Field has `source` (data source to read)

---

### Test 6: Insert Scratchpad to Field (5 minutes)

**Goal:** Verify LSK inserts scratchpad value into field

**Setup:**
Use writable state for testing:
```json
{
  "row": 3,
  "display": {
    "type": "datapoint",
    "source": "mcdu.0.runtime.scratchpad",  // Writable state
    "label": "TEST",
    "editable": true,
    "inputType": "text"
  }
}
```

**Steps:**
1. Type in scratchpad: `"HELLO"`
2. Scratchpad shows: `HELLO*`
3. Press LSK3L (for row 3)

**Expected Result:**
```
Line 3: TEST HELLO ✓  (green flash)
Line 13: ✓ GESPEICHERT  (success message, 2 seconds)
Line 14: ____  (scratchpad cleared)
Runtime state:
  - mode: 'normal'
  - scratchpad: ''
Adapter log: "Value written to mcdu.0.runtime.scratchpad: HELLO"
Adapter log: "Mode: INPUT → NORMAL (insert successful)"
```

**If Failed:**
- Check: Validation passed (scratchpad green, not red)
- Check: Field source is writable
- Check: `insertFromScratchpad()` called
- Check: `setForeignStateAsync()` called

---

### Test 7: Validation Rejects Invalid Input (4 minutes)

**Goal:** Verify validation prevents invalid input

**Setup:**
Numeric field with range:
```json
{
  "row": 4,
  "display": {
    "type": "datapoint",
    "source": "mcdu.0.runtime.scratchpad",
    "label": "TEMP",
    "editable": true,
    "inputType": "numeric",
    "validation": {
      "min": 16,
      "max": 30
    }
  }
}
```

**Steps:**
1. Type invalid value: `"35"` (out of range)
2. Press LSK4L

**Expected Result:**
```
Line 4: TEMP [previous value]  (unchanged)
Line 13: ❌ MAXIMUM 30  (error message, red, 3 seconds)
Line 14: 35*  (RED asterisk)
Runtime state:
  - mode: 'input' (stays in input mode)
  - scratchpad: '35' (not cleared)
Adapter log: "Validation failed: MAXIMUM 30"
```

**If Failed:**
- Check: ValidationEngine validates range
- Check: `validateRange()` called
- Check: `scratchpadManager.setValid(false, 'MAXIMUM 30')`

---

### Test 8: Mode Transitions (3 minutes)

**Goal:** Verify state machine transitions correctly

**Steps:**
1. Initial: Mode = `'normal'`, scratchpad = `''`
2. Type `"5"` → Mode = `'input'`, scratchpad = `'5'`
3. Type `"0"` → Mode = `'input'`, scratchpad = `'50'`
4. Press CLR → Mode = `'input'`, scratchpad = `''` (cleared)
5. Press LSK (empty scratchpad, editable field) → Mode = `'edit'`, scratchpad = `'[field value]'`
6. Press CLR → Mode = `'edit'`, scratchpad = `''`
7. Press CLR → Mode = `'normal'`

**Expected Logs:**
```
[INFO] Mode: NORMAL → INPUT
[INFO] Scratchpad append: "5" → "5"
[INFO] Scratchpad append: "0" → "50"
[INFO] Scratchpad cleared
[INFO] Mode: NORMAL → EDIT (value copied to scratchpad)
[INFO] Scratchpad cleared
[INFO] Mode: EDIT → NORMAL
```

**If Failed:**
- Check: InputModeManager state transitions
- Check: `runtime.mode` state updated
- Check logs for mode changes

---

## Quick Debug Commands

### Check MQTT Topics

**Monitor all MCDU topics:**
```bash
mosquitto_sub -h localhost -t 'mcdu/#' -v
```

**Monitor keypad only:**
```bash
mosquitto_sub -h localhost -t 'mcdu/buttons/keypad' -v
```

**Monitor display updates:**
```bash
mosquitto_sub -h localhost -t 'mcdu/display/#' -v
```

### Check ioBroker States

**View runtime state:**
```bash
iobroker state get mcdu.0.runtime.mode
iobroker state get mcdu.0.runtime.scratchpad
iobroker state get mcdu.0.runtime.scratchpadValid
iobroker state get mcdu.0.runtime.selectedLine
```

### Adapter Logs

**Tail adapter logs:**
```bash
tail -f /opt/iobroker/log/iobroker.$(date +%Y-%m-%d).log | grep mcdu
```

**Or in ioBroker:**
```bash
iobroker logs --watch mcdu
```

---

## Common Issues & Solutions

### Issue 1: Scratchpad Not Showing

**Symptoms:** Line 14 shows page content instead of scratchpad

**Solution:**
```javascript
// In main.js, check:
this.pageRenderer.setScratchpadManager(this.scratchpadManager);

// In PageRenderer.js, check Line 14 logic:
if (row === 14) {
  if (this.scratchpadManager) {
    const display = this.scratchpadManager.getDisplay();
    const color = this.scratchpadManager.getColor();
    return { text: this.padOrTruncate(display, this.columns), color: color };
  }
}
```

---

### Issue 2: Keypad Events Not Received

**Symptoms:** Typing doesn't update scratchpad

**Check:**
1. MQTT subscription active:
   ```javascript
   await this.mqttClient.subscribe('buttons/keypad', this.handleKeypadEvent.bind(this));
   ```

2. Keypad map contains key:
   ```javascript
   const char = this.keypadMap.get('KEY_5');  // Should return '5'
   ```

3. InputModeManager injected:
   ```javascript
   this.buttonSubscriber.setInputModeManager(this.inputModeManager);
   ```

---

### Issue 3: LSK Doesn't Copy/Insert

**Symptoms:** LSK press does nothing

**Check:**
1. InputModeManager handles LSK:
   ```javascript
   await this.inputModeManager.handleLSK(side, row);
   ```

2. Field configuration has:
   ```json
   {
     "editable": true,
     "source": "some.state.id"
   }
   ```

3. State exists and is readable:
   ```bash
   iobroker state get some.state.id
   ```

---

### Issue 4: Validation Not Working

**Symptoms:** Invalid input accepted

**Check:**
1. ValidationEngine instantiated:
   ```javascript
   this.validationEngine = new ValidationEngine(this);
   ```

2. ValidationEngine injected:
   ```javascript
   this.inputModeManager = new InputModeManager(this, scratchpad, validationEngine);
   ```

3. Field has validation rules:
   ```json
   {
     "validation": {
       "min": 16,
       "max": 30
     }
   }
   ```

---

## Success Criteria

✅ **All tests passed:**
- Scratchpad displays on Line 14
- Keypad characters appear in scratchpad
- CLR clears scratchpad
- Edit indicators show on editable fields
- LSK copies field to scratchpad
- LSK inserts scratchpad to field
- Validation rejects invalid input
- Mode transitions correctly

✅ **No errors in logs**

✅ **MQTT messages flow correctly**

✅ **State updates reflect in ioBroker**

---

## Next Steps After Testing

1. **If all tests pass:**
   - Mark Phase 2 as ✅ COMPLETE
   - Proceed to Phase 3 (Confirmation System)
   - Document any edge cases discovered

2. **If tests fail:**
   - Document failing test case
   - Check debug commands above
   - Review implementation vs test expectations
   - Fix bugs and re-run tests

3. **Integration with real MCDU hardware:**
   - Update mcdu-client to publish keypad events
   - Test with physical button presses
   - Fine-tune validation rules based on UX

---

**Test Guide Version:** 1.0  
**Date:** 2026-02-16  
**Status:** Ready for Testing

---

**END OF TEST GUIDE**
