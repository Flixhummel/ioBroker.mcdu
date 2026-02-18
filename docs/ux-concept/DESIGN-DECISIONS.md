# UX Design Decisions

**Date:** 2026-02-14  
**Status:** Active Decisions

---

## 1. Function Key Mapping Flexibility

**Decision:** Function key assignments are **USER-CONFIGURABLE**, not hardcoded.

**Rationale:**
- Different users have different priorities
- Some users need ENERGIE frequently, others SICHERHEIT
- Quick access keys should reflect individual usage patterns
- Airline MCDUs have fixed layouts because pilots are trained; smart homes vary by household

**Implementation Requirements:**
- Default mapping provided as **recommendation** (FUEL→ENERGIE, DIR→QUICK, etc.)
- ioBroker Admin UI allows remapping function keys
- Configuration stored in adapter settings
- Changes take effect immediately (published via MQTT)
- RasPi client receives new mapping, updates behavior

**UX Impact:**
- Documentation shows "default" mapping but mentions customization
- User flows in INTERACTION-EXAMPLES.md use default mapping
- Setup wizard could ask user priorities and suggest mapping

**Technical Note:**
Phase 3b (ioBroker adapter) must implement:
```javascript
// Default mapping (can be overridden)
const functionKeyMap = {
  "FUEL": "energie",
  "DIR": "quick",
  "PROG": "status",
  "PERF": "szenen",
  // ... user can customize via admin UI
}
```

---

## 2. LSK Context Sensitivity

**Decision:** LSK button actions are **context-dependent**, not fixed.

**Rationale:**
- Aviation MCDU pattern: LSK function depends on what's displayed next to it
- Allows 12 dynamic actions per page (LSK1L-6L/R)
- More flexible than fixed button assignments

**Implementation:**
- Display manager shows action labels next to LSK positions
- Button handler looks up current page context
- Same LSK can toggle light on one page, navigate to sub-menu on another

---

## 3. Scratchpad for All Data Entry

**Decision:** Follow aviation pattern - **never modify data directly**.

**Rationale:**
- Prevents accidental changes
- User sees what they're about to enter before committing
- CLR key provides easy undo
- Familiar to anyone who's used a real MCDU

**Implementation:**
- Line 13-14 reserved for scratchpad
- Keyboard input goes to scratchpad first
- LSK press moves data from scratchpad to target field
- Invalid entries stay in scratchpad with error indicator

---

## 4. Color Coding Standards

**Decision:** Follow aviation color conventions with smart home adaptations.

**Mapping:**
- **White (W):** Default text, current values, normal state
- **Amber (A):** Modifiable fields, caution states (battery low, etc.)
- **Green (G):** Active states, confirmed actions, success feedback
- **Magenta (M):** Predicted/future values (energy forecast, scheduled temps)
- **Red (R):** Alerts, failures, security alarms
- **Yellow (Y):** Warnings, advisories
- **Cyan (E):** Special indicators, secondary information

**Note:** Blue not in our 8-color palette - use White for titles/labels.

---

## 5. Standard Function Availability

**Decision:** Core functions available **from any page**.

**Always Active:**
- **BRT/DIM:** Display brightness (hardware-level)
- **CLR:** Clear scratchpad / Back / Cancel
- **MENU:** Jump to main menu
- **OVFY:** Confirm current action

**Rationale:**
- User shouldn't get "stuck" in a page
- Brightness adjustment shouldn't require navigation
- CLR as universal "undo" provides safety

---

## 6. LED Thematic Assignment

**Decision:** LEDs have **semantic meaning** + user customization.

**Recommended Defaults:**
- **FAIL:** Security alarm active (red LED)
- **RDY:** System normal/ready (green LED)
- **MCDU:** MCDU client online
- **FM1/FM2/IND/MSG:** User-definable (house occupied, guests, maintenance mode, etc.)

**Implementation:**
- ioBroker adapter publishes LED states via MQTT
- User can map LED to any boolean state
- Example: FM1 = "Guests present", lights up when guest mode active

---

## 7. Quick Access Customization

**Decision:** QUICK page (DIR key) has **user-configurable shortcuts**.

**Rationale:**
- Most-used actions vary by household
- Should be fastest path to frequent tasks
- 12 slots available (LSK1L-6L/R)

**Default Suggestions:**
- Left (Actions): Good Night, All Off, Movie Mode, Start Charging, etc.
- Right (Info): PV Status, Energy Today, Temperature Overview, etc.

**Implementation:**
- Admin UI: Drag-drop to assign actions/info to QUICK slots
- Configuration synced to RasPi via MQTT template updates

---

## 8. Navigation Breadcrumbs

**Decision:** Display shows **current location** in title line.

**Format:** `CATEGORY > PAGE > SUBPAGE`

**Examples:**
- `ENERGIE`
- `ENERGIE > PV`
- `KLIMA > WOHNZIMMER`
- `EINSTELLUNGEN > SYSTEM > NETZWERK`

**Rationale:**
- User knows where they are
- CLR = go back one level
- MENU = jump to top level

---

## 9. Multi-MCDU Coordination

**Decision:** Each MCDU is **independent** but can sync state.

**Behavior:**
- Kitchen MCDU shows kitchen-relevant pages by default
- Bedroom MCDU shows bedroom-relevant pages
- But both can access all functions
- State changes (e.g., light toggle) reflected on all MCDUs

**Implementation:**
- Each RasPi has unique deviceId (mcdu/kitchen, mcdu/bedroom)
- ioBroker publishes state updates to all devices
- Function key mapping can differ per MCDU

---

## 10. Confirmation for Critical Actions

**Decision:** Potentially destructive actions require **OVFY confirmation**.

**Requires Confirmation:**
- "All Lights Off"
- "Alarm Arm/Disarm"
- "Factory Reset"
- "Delete Scene"

**No Confirmation Needed:**
- Toggle single light
- Adjust temperature
- View status
- Navigate pages

**UX Pattern:**
```
[User presses LSK for "All Off"]
Display:
BESTÄTIGEN?
ALLE LICHTER AUS
< ABBRUCH    AUSFÜHREN >
     (LSK1L)      (LSK1R or OVFY)
```

---

## Future Decisions (To Be Determined)

- **Voice Feedback:** Should MCDU speak confirmations? (accessibility)
- **Haptic Feedback:** Vibration on button press? (hardware limitation)
- **Remote Access:** Control MCDU via phone app?
- **Multi-Language:** German/English/other language support?
- **Themes:** Dark/light mode or custom color schemes?

---

**Last Updated:** 2026-02-14  
**Review Needed:** Before Phase 3b implementation
