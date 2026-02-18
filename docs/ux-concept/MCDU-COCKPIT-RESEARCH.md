# MCDU Cockpit Research: Real Aviation Operation

## Document Purpose
Deep dive into how a real Airbus A320/A330 MCDU is operated to inform smart home UX design with airline-level precision and usability.

---

## 1. MCDU Hardware Overview

### Physical Layout (WinWing MCDU-32-CAPTAIN)
- **Display**: 14-line alphanumeric display (approx. 24 characters per line)
- **LSK (Line Select Keys)**: 6 pairs (LSK1L-LSK6L/R) - 12 total
- **Function Keys**: DIR, PROG, PERF, INIT, DATA, FPLN, RAD, FUEL, SEC, ATC, MENU, AIRPORT
- **Alphanumeric Keyboard**: A-Z letters
- **Numeric Keypad**: 0-9
- **Special Keys**: SLEW (4-way navigation), BRT/DIM (brightness), OVFY (overfly/confirm), CLR (clear)
- **LEDs**: 11 indicator lights (FAIL, MCDU, FM1, FM2, IND, RDY, DSPY, OFST, MSG, CLR, EXEC)

### Display Technology
- **Monochrome or color**: Modern MCDUs use color coding
- **Character-based**: Not pixel-based graphics - works with text and symbols
- **Color coding standards**:
  - **White (W)**: Normal data, titles, current values
  - **Amber (A)**: Caution, modifiable data that needs attention
  - **Blue (B)**: Titles, labels, non-modifiable text
  - **Green (G)**: Active mode, confirmed data, pilot-entered data
  - **Magenta (M)**: Flight plan data, predicted values
  - **Red (R)**: Warnings, failures
  - **Yellow (Y)**: Advisories
  - **Cyan/E**: Special indications

---

## 2. Core MCDU Operating Principles

### 2.1 The Scratchpad Concept

**THE MOST FUNDAMENTAL MCDU CONCEPT**

The scratchpad is a temporary workspace at the bottom of the display (typically line 14).

**How it works**:
1. **Type data** using the keyboard → appears in scratchpad
2. **Press LSK** next to where you want it → data moves from scratchpad to that field
3. **Successful**: Scratchpad clears, data appears in field (usually green)
4. **Invalid**: Data stays in scratchpad, field may show error

**Example flow**:
```
[Display shows:]
FUEL PREDICTION
FROM: EDDM    DIST: 235NM
TO  : [    ]←  DIST: ---NM
              (LSK2L here)

[Pilot types:] EDDF
[Scratchpad shows:] EDDF*

[Pilot presses:] LSK2L
[Result:]
TO  : EDDF   DIST: 235NM  (data accepted)
[Scratchpad clears]
```

**Key principles**:
- **NEVER** modify data directly - always via scratchpad
- **One operation** at a time (scratchpad can only hold one entry)
- **CLR key** clears scratchpad if you make a mistake
- **Asterisk (*)** in scratchpad = "ready to insert"

### 2.2 LSK (Line Select Key) Usage Patterns

**Six pairs of keys**: LSK1L/R through LSK6L/R

**Usage depends on what's displayed next to them**:

1. **Data field with box/dashes** [`----`] or [`    `]:
   - Type data in scratchpad → Press LSK → Data fills field

2. **Option to select** (e.g., `< TAKEOFF`):
   - Press LSK → Navigate to that page

3. **Existing data** (green/magenta text):
   - Press LSK → **Copies** data to scratchpad (for verification or modification)

4. **Title/Action** (e.g., `*DELETE`):
   - Press LSK → Executes action

5. **Toggle indicator** (arrows, asterisks):
   - Press LSK → Toggles state or cycles through options

**Visual indicators**:
- `<` Left LSK selects this option
- `>` Right LSK selects this option
- `[ ]` Empty field, awaits input
- `----` Dashes indicate "no data yet"
- `*` Asterisk = modifiable or executable
- Small arrows `↑↓` = more data available (use SLEW to scroll)

### 2.3 Navigation Hierarchy

**MCDU operates as a tree structure**:

```
ROOT (MCDU MENU)
├── FMGC (Flight Management)
│   ├── INIT
│   │   ├── INIT A (from/to, cost index, cruise FL)
│   │   └── INIT B (weights, fuel)
│   ├── F-PLN (Flight Plan)
│   │   ├── Waypoint list
│   │   ├── DEPARTURE (runway, SID)
│   │   ├── ARRIVAL (STAR, approach)
│   │   └── Lateral Revision
│   ├── PERF (Performance)
│   │   ├── TAKEOFF
│   │   ├── CLIMB
│   │   ├── CRUISE
│   │   └── DESCENT
│   ├── DATA (Navigation database)
│   │   ├── WAYPOINTS
│   │   ├── NAVAIDS
│   │   └── AIRPORTS
│   ├── PROG (Progress)
│   │   └── Current position, ETA, fuel predictions
│   ├── DIR (Direct-to)
│   │   └── Quick navigation shortcuts
│   └── RAD NAV (Radio Navigation)
│       └── Manual tuning
├── ATC (Air Traffic Control)
│   └── CPDLC communications
├── MCDU MENU
│   └── System settings
└── AIRPORT
    └── Airport information
```

**Key navigation patterns**:

1. **Direct access**: Press function key (e.g., INIT) → Go directly to that page
2. **Breadcrumb navigation**: Pages show "parent" option to go back (e.g., `<INDEX`)
3. **Sub-page indicators**: Page numbers shown (e.g., `1/3` at top-right)
4. **SLEW keys**: Navigate between pages in same category (← → for siblings, ↑↓ for scrolling)
5. **Menu tree**: MENU key returns to root menu

### 2.4 Data Entry Methods

**Method 1: Direct keyboard entry** (most common)
- Type waypoint, runway, frequency, etc. → appears in scratchpad
- Press LSK next to field → data inserted

**Method 2: Selection from list**
- LSK next to option → selects it
- Example: Selecting a runway from departure list

**Method 3: Copy and modify**
- Press LSK next to existing data → copies to scratchpad
- Edit scratchpad → Press same or different LSK → updates

**Method 4: Toggle/Increment**
- Press LSK repeatedly → cycles through options
- Example: Flap settings (1+F, 2, 3, FULL)

**Method 5: Database lookup**
- Type partial ID → MCDU shows matches
- Select from list with LSK

---

## 3. Function Key Meanings (Airbus A320)

### **INIT** (Initialization)
**Purpose**: Set up flight parameters before departure

**Pages**:
- **INIT A**: FROM/TO airports, cost index, cruise FL, flight number
- **INIT B**: Zero Fuel Weight (ZFW), Center of Gravity (CG), Block Fuel

**Typical usage**:
1. Enter FROM/TO (e.g., "EDDM/EDDF")
2. Enter Cost Index (0-999, typically 20-50)
3. Enter Cruise FL (e.g., "FL350" or "350")
4. Go to INIT B → Enter ZFW and fuel

**Smart home analog**: System initialization, house setup

---

### **F-PLN** (Flight Plan)
**Purpose**: Build, view, and modify the route

**Key functions**:
- **View waypoint list**: Sequential route points
- **Select DEPARTURE**: Choose runway + SID (Standard Instrument Departure)
- **Select ARRIVAL**: Choose STAR (Standard Terminal Arrival) + approach
- **Insert waypoints**: Add/remove points
- **Lateral Revision**: Modify routing
- **Delete discontinuities**: Remove gaps in flight plan

**Navigation pattern**:
```
F-PLN → Waypoint list
Press LSK1L (FROM airport) → DEPARTURE page
  Select runway → Select SID
  Press INSERT* → Return to F-PLN
Press LSK6L (TO airport) → ARRIVAL page
  Select approach → Select STAR
  Press INSERT* → Return to F-PLN
```

**Smart home analog**: Schedules, scenes, automation routines

---

### **DIR** (Direct-To)
**Purpose**: Quick navigation to a specific waypoint, bypassing flight plan

**Usage**:
- Type waypoint ID in scratchpad
- Press LSK next to "DIR TO"
- Confirm with LSK next to `*INSERT`

**Smart home analog**: Quick access menu, favorites, scene activation

---

### **PROG** (Progress)
**Purpose**: Monitor flight progress in real-time

**Displays**:
- Current position (lat/long or waypoint)
- Next waypoint, distance, ETA
- Fuel predictions (fuel at destination, reserves)
- Wind information
- Vertical deviation

**Smart home analog**: Status dashboard, current states, energy usage

---

### **PERF** (Performance)
**Purpose**: Set performance parameters for each flight phase

**Pages**:
- **TAKE OFF**: V1, VR, V2 speeds, flaps, thrust setting, runway condition
- **CLIMB**: Speed, altitude constraints
- **CRUISE**: Speed, optimum FL, step climbs
- **DESCENT**: Speed schedule, approach speed

**Workflow**:
- Before takeoff: Set speeds, flaps, trim
- In flight: Monitor optimum altitude, adjust as needed

**Smart home analog**: Performance settings, device configurations, optimization

---

### **DATA** (Database)
**Purpose**: Access navigation database (waypoints, navaids, airports, runways)

**Functions**:
- Look up waypoint info (coordinates, freq)
- View airport details (runways, frequencies, elevation)
- Check navaid information (VOR, NDB frequencies)

**Usage**:
- Press DATA → Select category (WPT, NAVAID, ARPT)
- Type ID → View details

**Smart home analog**: Device catalog, configuration library, logs

---

### **RAD NAV** (Radio Navigation)
**Purpose**: Manual tuning of VOR, ADF, ILS frequencies

**Functions**:
- Manual frequency entry for VOR1, VOR2, ADF1, ADF2
- ILS tuning (usually auto-tuned via F-PLN)
- Enable/disable auto-tuning

**Typical display**:
```
RAD NAV
VOR1/FREQ: 115.30 (auto-tuned)
VOR2/FREQ: [  .  ]←  (manual entry)
ADF1/FREQ: [   .  ]
```

**Smart home analog**: Manual device control, override automation

---

### **FUEL PRED** (Fuel Prediction)
**Purpose**: Calculate fuel at waypoints, destination, alternate

**Displays**:
- Fuel at each waypoint in F-PLN
- Estimated fuel at destination
- Reserve fuel
- Extra time/fuel available

**Smart home analog**: Energy predictions, battery estimates

---

### **SEC F-PLN** (Secondary Flight Plan)
**Purpose**: Build alternate route without affecting active F-PLN

**Usage**:
- Create "what-if" routing
- Copy to active F-PLN when needed
- Useful for ATC reroutes

**Smart home analog**: Draft scenes, test automation, backup schedules

---

### **ATC COMM** (ATC Communication)
**Purpose**: CPDLC (Controller-Pilot Data Link Communication)

**Functions**:
- Send/receive text messages to/from ATC
- Request clearances (altitude, route changes)
- Receive instructions
- Log communication

**Smart home analog**: System messages, notifications, alerts

---

### **MCDU MENU**
**Purpose**: System settings, preferences, utilities

**Functions**:
- FMGC settings
- Display options
- Database status
- Software version

**Smart home analog**: Settings menu, system configuration

---

### **AIRPORT**
**Purpose**: Quick access to airport information

**Displays**:
- Runways (length, heading, elevation)
- Frequencies (tower, ground, ATIS)
- Airport elevation, coordinates
- Available approaches

**Smart home analog**: Location-based info, room details

---

## 4. Standard Operations & Workflows

### 4.1 Brightness Control (BRT/DIM)
- **Discrete button**, not via scratchpad
- Immediate effect on display backlight
- Often has day/night modes
- No navigation away from current page

**Smart home application**: Critical! MCDU brightness must work instantly.

### 4.2 Clear (CLR) Key Functions

**Three behaviors depending on context**:

1. **Scratchpad has data**: CLR → clears scratchpad
2. **Scratchpad empty, cursor on field**: CLR → deletes field content (copies "DELETE" to scratchpad)
3. **Double-press**: CLR CLR → go back / cancel operation

**Smart home application**: Back/Cancel/Clear multi-function key

### 4.3 Overfly/Confirm (OVFY)
- Used to confirm critical actions
- Bypass warnings (with caution)
- Confirm modifications

**Smart home application**: Confirm button for scene activation, critical changes

### 4.4 SLEW Keys (4-way navigation)
- **Left/Right**: Navigate between pages in same category
- **Up/Down**: Scroll within page (if content exceeds 14 lines)
- **Hold**: Continuous scroll
- **Press**: Single step

**Smart home application**: Essential for navigating long device lists, logs

---

## 5. Color Coding & Visual Feedback

### Standard Color Meanings (Airbus)

| Color | Meaning | Example Use |
|-------|---------|-------------|
| **White** | Normal display, current values | Active waypoint, current FL |
| **Green** | Pilot-entered data, active confirmation | User-modified speeds, confirmed entries |
| **Cyan/Blue** | Titles, labels, non-modifiable | Page headers, field labels |
| **Magenta** | Computed/predicted data, flight plan | ETA, predicted fuel, F-PLN waypoints |
| **Amber** | Caution, data needs attention | Modifiable field highlighting, advisories |
| **Red** | Warnings, errors | Invalid entry, system failure |
| **Yellow** | Less critical advisory | Database out of date |

**Smart home application**:
- White: Normal device states, temperatures
- Green: User-set values, active scenes
- Cyan: Labels, category titles
- Magenta: Predicted values (energy forecast, PV production)
- Amber: Devices needing attention (low battery, offline)
- Red: Errors, security alerts
- Yellow: Warnings (high energy use)

### Visual Feedback Patterns

**Successful operation**:
1. Data entered in scratchpad (green with asterisk)
2. LSK pressed → data moves to field (green)
3. Scratchpad clears
4. Brief flash or highlight confirms acceptance

**Failed operation**:
1. Data entered in scratchpad
2. LSK pressed → scratchpad stays (amber or red)
3. Error message may appear
4. Audible alert (beep)

**Waiting/Processing**:
- "WAIT" message
- Flashing indicator
- Dimmed unavailable options

---

## 6. Error Handling & Validation

### MCDU Validation Philosophy
**"Validate early, prevent errors"**

**Pre-validation**:
- Keyboard restricted by context (e.g., only numbers for frequency)
- Invalid characters rejected immediately
- Format checked before accepting to scratchpad

**Format validation**:
- Runway: 2 digits + optional L/C/R (e.g., "25L")
- Frequency: 3 digits.2 decimals (e.g., "115.30")
- Waypoint: 5 characters max, alphanumeric
- Altitude: FL + 3 digits or 5 digits + ft

**Examples**:
- User types "99" for runway → rejected (no runway 99)
- User types "ABCDEFG" for waypoint → rejected (max 5 chars)
- User types "FL500" for cruise → accepted but amber (too high)

### Error Messages

**Format**:
```
[Page content above]
...
...
ERROR: INVALID ENTRY     (Line 13, amber or red)
[Scratchpad]             (Line 14)
```

**Common messages**:
- `NOT IN DATABASE`
- `INVALID ENTRY`
- `FORMAT ERROR`
- `ENTRY OUT OF RANGE`
- `WAIT` (processing)
- `CHECK TAKE OFF DATA` (amber advisory)

**Smart home application**:
- Validate room names, device IDs
- Check temperature ranges (16-30°C)
- Prevent invalid time formats
- Clear error messages with context

---

## 7. Workflow Example: Pre-Flight MCDU Setup

### Complete A320 MCDU Setup Sequence
*(based on flight EDDM→EDDF)*

**1. INIT A Page**
```
Press: INIT
Display:
  CO RTE------------------ 1/4
  FROM/TO    [    ]/[    ]
  ALTN       [    ]
  FLT NBR    [       ]
  COST INDEX [  ]
  CRZ FL     [     ]
  
Type: EDDM/EDDF
Press: LSK1L (next to FROM/TO)
Result: FROM/TO    EDDM/EDDF  (green)

Type: EDDK
Press: LSK2L (next to ALTN)

Type: 25
Press: LSK4L (next to COST INDEX)

Type: 350
Press: LSK5L (next to CRZ FL)
Result: CRZ FL     FL350  (green)
```

**2. INIT B Page**
```
Press: SLEW Right (or LSK next to INIT B→)
Display:
  INIT-------------------- 2/4
  ZFW/ZFWCG  [  . ]/[ .  ]
  BLOCK      [  .  ]
  
Type: 62.5/25
Press: LSK1L
Result: ZFW/ZFWCG  62.5/25.0  (green)

Type: 8.5
Press: LSK2L
Result: BLOCK      8.5  (green)
```

**3. F-PLN: Select Departure**
```
Press: F-PLN
Display: (waypoint list)
  EDDM
  -----
  (empty)
  EDDF
  
Press: LSK1L (next to EDDM)
Display: DEPARTURE page
  RWY    26L  26R  08L  08R
  
Press: LSK for 26L
Display: (SID list for 26L)
  GIVMI2T
  SONEB1L
  
Press: LSK next to GIVMI2T
Press: LSK next to *INSERT
Result: Returns to F-PLN, now populated with SID waypoints
```

**4. F-PLN: Select Arrival**
```
On F-PLN page:
Press: LSK6L (next to EDDF)
Display: ARRIVAL page
  APPR   ILS25  ILS07
  
Press: LSK for ILS25
Display: (STAR list)
  TEBAM1H
  NETTO1H
  
Press: LSK for TEBAM1H
Press: *INSERT
Result: F-PLN complete with departure, enroute, STAR, approach
```

**5. Remove Discontinuities**
```
On F-PLN:
Press: SLEW Down (scroll through waypoints)
Find: -----F-PLN DISCONTINUITY-----

Press: CLR (to get "DELETE" in scratchpad)
Press: LSK next to discontinuity line
Result: Discontinuity removed
```

**6. PERF: Takeoff Speeds**
```
Press: PERF
Display:
  TAKE OFF------------- 1/3
  V1         [   ]
  VR         [   ]
  V2         [   ]
  FLAPS      [ ]
  THS        [ . ]
  
Type: 135
Press: LSK1L (V1)

Type: 140
Press: LSK2L (VR)

Type: 145
Press: LSK3L (V2)

Type: 1
Press: LSK4L (FLAPS)
Result: FLAPS      1+F  (green)

Type: UP0.5
Press: LSK5L (THS)
Result: THS        UP0.5  (green)
```

**Total: ~25 button presses, ~8 scratchpad entries, ~3 minutes**

---

## 8. Key Takeaways for Smart Home UX

### ✅ **DO adopt from aviation**:
1. **Scratchpad concept**: Temporary workspace for all data entry
2. **LSK pattern**: Context-sensitive keys for navigation and data entry
3. **Direct function keys**: One press to jump to major categories
4. **Color coding**: Consistent visual language for data states
5. **Validation before acceptance**: Prevent errors early
6. **Clear error messages**: Tell user exactly what's wrong
7. **Undo/Clear**: Easy way to cancel or go back
8. **Hierarchical navigation**: Logical tree structure
9. **Minimal button presses**: Optimize for speed (2-4 presses for common tasks)

### ❌ **DON'T copy unnecessarily**:
1. **Aviation jargon**: Use smart home language (not "FROM/TO", but "Scene/Room")
2. **Complex flight plan logic**: Smart home doesn't need discontinuities
3. **Performance calculations**: Unless relevant (energy optimization)
4. **Database lookup complexity**: Keep device search simple

### 🎯 **Smart Home Adaptations**:
1. **LSK as "soft keys"**: Context changes based on page
2. **Function keys map to Gewerke** (categories): ENERGY → FUEL, CLIMATE → RAD, etc.
3. **PROG → STATUS**: Real-time monitoring
4. **DIR → QUICK ACCESS**: One-press scene activation
5. **MENU → MAIN MENU**: Settings and system
6. **DATA → DEVICE CATALOG**: Browse all devices
7. **Scratchpad for all input**: Type room name, temperature, scene name, etc.

---

## 9. Efficiency Metrics

### Real MCDU Performance Benchmarks

**Typical pilot tasks**:
| Task | Button Presses | Time |
|------|----------------|------|
| Enter FROM/TO airports | 10-15 | 15 seconds |
| Select departure runway + SID | 4-6 | 10 seconds |
| Select approach + STAR | 4-6 | 10 seconds |
| Enter takeoff speeds (V1/VR/V2) | 15-20 | 20 seconds |
| Direct-to waypoint | 8-10 | 10 seconds |
| Check fuel prediction | 2-3 | 5 seconds |

**Smart home goals** (match or beat aviation):
| Task | Target Presses | Target Time |
|------|----------------|-------------|
| Turn off bedroom light | 2-3 | 3 seconds |
| Activate "Good Night" scene | 2 | 2 seconds |
| Check E-car range | 3-4 | 4 seconds |
| Set wake-up alarm | 5-6 | 8 seconds |
| View PV production today | 2-3 | 3 seconds |
| Adjust living room temp to 22°C | 4-5 | 6 seconds |

**Efficiency principle**: Most common tasks should be 2-4 button presses max.

---

## 10. Sources & References

**Primary research**:
1. FlyByWire A32NX MCDU Documentation (https://docs.flybywiresim.com/)
2. Aerofly FS A320 MCDU Programming Guide
3. X-Plane Airbus MCDU Manual (PDF)
4. Real-world pilot training videos (YouTube)
5. Airbus A320 FCOM (Flight Crew Operating Manual) excerpts

**Key concepts validated**:
- Scratchpad-first workflow
- LSK context sensitivity  
- Function key direct access
- Color coding standards
- Validation and error handling

---

**Document Status**: ✅ Complete - Ready for UX mapping phase
**Next Step**: Create SMARTHOME-CONTEXT.md with Gewerke and use cases
