# MCDU ↔ Smart Home Mapping

## Document Purpose
Systematic mapping of MCDU hardware functions (buttons, keys, LEDs) to smart home control concepts. This document defines the conceptual translation from aviation to home automation.

---

## 1. Function Key Mapping

### Primary Function Keys (Direct Category Access)

| MCDU Key | Aviation Function | Smart Home Mapping | Rationale |
|----------|-------------------|-------------------|-----------|
| **FUEL** | Fuel predictions, consumption | **ENERGIE** (Energy) | Direct analog: Fuel = Energy |
| **DIR** | Direct-to waypoint | **QUICK** (Quick Access) | Fast access to common actions |
| **PROG** | Flight progress monitoring | **STATUS** (System Status) | Monitor current state |
| **PERF** | Performance (speeds, weights) | **SZENEN** (Scenes) | Performance = Predefined setups |
| **INIT** | Initialization, setup | **EINSTELLUNGEN** (Settings) | System configuration |
| **DATA** | Navigation database | **GERÄTE** (Device Catalog) | Browse all devices |
| **F-PLN** | Flight plan | **ZEITPLAN** (Schedules) | Automation timelines |
| **RAD** | Radio navigation (VOR/ADF) | **KLIMA** (Climate/Heating) | Manual tuning analog |
| **SEC** | Secondary flight plan | **SICHERHEIT** (Security) | SEC = Security (lucky coincidence!) |
| **ATC** | ATC communications | **MELDUNGEN** (Messages/Notifications) | System communications |
| **MENU** | MCDU menu / settings | **HAUPTMENÜ** (Main Menu) | All categories |
| **AIRPORT** | Airport information | **RÄUME** (Rooms/Zones) | Location-specific info |

### Additional Button Mapping

| MCDU Button | Aviation Function | Smart Home Function |
|-------------|------------------|---------------------|
| **BRT** | Brightness up | Increase MCDU display brightness |
| **DIM** | Brightness down | Decrease MCDU display brightness |
| **CLR** | Clear scratchpad / Delete / Back | Clear input / Go back / Cancel |
| **OVFY** | Overfly / Confirm | Confirm action / Execute |
| **SLEW ←** | Previous page (same level) | Previous page / Previous device |
| **SLEW →** | Next page (same level) | Next page / Next device |
| **SLEW ↑** | Scroll up | Scroll up in lists |
| **SLEW ↓** | Scroll down | Scroll down in lists |
| **LSK1L-6L** | Line Select Keys Left | Context-dependent actions (labels shown) |
| **LSK1R-6R** | Line Select Keys Right | Context-dependent actions (labels shown) |

### Keyboard Usage

| Input Type | Keys Used | Smart Home Example |
|------------|-----------|-------------------|
| **Room names** | A-Z | "WOHNZIMMER", "KUECHE" |
| **Device names** | A-Z | "STEHLAMPE", "THERMOSTAT" |
| **Scene names** | A-Z | "ABEND", "FILM" |
| **Numbers** | 0-9 | Temperature "22", Brightness "75" |
| **Decimals** | 0-9 + "." | Temp "22.5", Energy "12.4" |
| **Time** | 0-9 + ":" | Schedule "08:30" |

---

## 2. Detailed Function Key Concepts

### **ENERGIE** (formerly FUEL)

**Purpose**: Energy management - the "fuel" of the smart home

**Page Structure**:
```
ENERGIE                 1/3
AKTUELL:    2340 W
HEUTE:      12.4 kWh
KOSTEN:     2.48 €
---
NETZ:       +340 W  ← (LSK3L: Details)
PV:         2500 W  ← (LSK4L: PV page)
BATTERIE:   -500 W  ← (LSK5L: Battery page)
< INDEX            
```

**Sub-pages**:
1. **Overview** (above)
2. **PV Details** (production, forecast, inverter status)
3. **Grid** (import/export, cost breakdown)
4. **Battery** (charge level, charge/discharge rate)
5. **History** (daily/weekly graphs - text representation)

**Navigation**:
- Press **ENERGIE** → Main energy overview
- LSK4L → PV detail page
- SLEW → to cycle through sub-pages

**Key Data**:
- Current power flow (W)
- Today's consumption/production (kWh)
- Grid import/export status
- PV production
- Battery state

---

### **QUICK** (formerly DIR)

**Purpose**: Direct access to most frequent actions - no navigation required

**Page Layout**:
```
QUICK ACCESS            1/1
< GUTE NACHT           (LSK1L)
< ALLES AUS            (LSK2L)
< FILM MODUS           (LSK3L)
< WZ 22°C              (LSK4L)
< LADEN START          (LSK5L)
< ALARM SCHARF         (LSK6L)

> PV STATUS             (LSK1R)
> ENERGIE HEUTE         (LSK2R)
> SYSTEM STATUS         (LSK3R)
> TEMP ÜBERSICHT        (LSK4R)
> AUTO STATUS           (LSK5R)
> WER ZUHAUSE           (LSK6R)
```

**Left side**: Quick **Actions** (execute immediately or with confirmation)
**Right side**: Quick **Info** (jump to status pages)

**Customizable**: User can configure which actions appear here (via app/config)

**Usage**:
- Press **QUICK** → See favorite actions
- Press LSK → Execute immediately (or confirm if critical)
- No scratchpad needed for these

**Examples**:
- LSK1L ("GUTE NACHT") → Activates Good Night scene, display shows "✓ SZENE AKTIV"
- LSK1R ("PV STATUS") → Jumps to PV detail page

---

### **STATUS** (formerly PROG)

**Purpose**: Real-time status dashboard - the "progress" of the smart home

**Page Layout**:
```
SYSTEM STATUS           1/4
ONLINE:     42/45 GERÄTE
ALARM:      UNSCHARF
ANWESEND:   2 PERSONEN
---
LICHT AN:   3          (LSK3L: List)
HEIZUNG:    AUTO       (LSK4L: Temps)
ENERGIE:    +340 W     (LSK5L: Details)
< INDEX                WEITER>
```

**Sub-pages**:
1. **System Overview** (above)
2. **Active Scenes** (which scenes are running)
3. **Recent Events** (last 10 actions/triggers)
4. **Alerts/Warnings** (errors, low batteries, etc.)

**Auto-refresh**: This page updates every 5 seconds (indicated by timestamp)

**Usage**:
- Press **STATUS** → See current house state at a glance
- LSK → Drill into specific category
- SLEW → Next status page

---

### **SZENEN** (formerly PERF)

**Purpose**: Scene management - analogous to performance presets

**Page Layout**:
```
SZENEN                  1/2
AKTIV:      FILM MODUS
SEIT:       19:32
---
< GUTE NACHT           (LSK3L)
< GUTEN MORGEN         (LSK4L)
< FILM MODUS           (LSK5L: Active)
< ABWESEND             (LSK6L)
< INDEX          ZEITPLAN>
```

**Sub-pages**:
1. **Scene List** (activate scenes)
2. **Scheduled Scenes** (timers, automation)
3. **Scene Details** (which devices involved)

**Interaction**:
- Press LSK next to scene name → Activates scene
- Active scene shows in **green** with checkmark
- Multiple scenes can be active simultaneously
- Press active scene LSK again → Deactivates

**Example Flow**:
```
Press: SZENEN
Press: LSK5L (FILM MODUS)
Display: 
  SZENE AKTIVIERT
  FILM MODUS    ✓
  12 GERÄTE GESTEUERT
  
[Lights dim, TV on, blinds close]
Press: CLR (to return to scene list)
```

---

### **EINSTELLUNGEN** (formerly INIT)

**Purpose**: System initialization and configuration

**Page Layout**:
```
EINSTELLUNGEN           1/3
HAUS:       FAMILIE H.
STANDORT:   ZUHAUSE
MODUS:      NORMAL
---
< SPRACHE              (LSK3L)
< EINHEITEN            (LSK4L)
< NETZWERK             (LSK5L)
< SICHERUNG            (LSK6L)
< INDEX            WEITER>
```

**Sub-pages**:
1. **System Info** (house name, location, mode)
2. **Preferences** (language, units, display)
3. **Network** (WiFi, ioBroker connection)
4. **Backup/Restore** (system backup status)
5. **Updates** (software update availability)

**Usage**:
- Press **EINSTELLUNGEN** → System configuration
- Mostly read-only on MCDU (detailed config via app)
- Key settings: Language, units (°C/°F), backup status

---

### **GERÄTE** (formerly DATA)

**Purpose**: Device catalog - browse all smart home devices

**Page Layout**:
```
GERÄTE                  1/2
KATEGORIE:  ALLE
---
 WOHNZIMMER
< STEHLAMPE      ON    (LSK1L)
< DECKENLAMPE    OFF   (LSK2L)
< THERMOSTAT     21.5  (LSK3L)
 KÜCHE
< DECKENLICHT    ON    (LSK4L)
↓ MEHR               FILTER>
```

**Navigation**:
- SLEW ↓ → Scroll through device list
- LSK next to device → Device detail page
- LSK6R ("FILTER>") → Filter by room/category

**Device Detail Page**:
```
GERÄTE > STEHLAMPE      1/1
NAME:       STEHLAMPE WZ
RAUM:       WOHNZIMMER
TYP:        LICHT DIMMBAR
---
STATUS:     ON         (LSK3L: Toggle)
HELLIGKEIT: 75%        (LSK4L: Edit)
LEISTUNG:   12 W
< ZURÜCK
```

**Search Function**:
```
GERÄTE > SUCHE          1/1
NAME: [     ]←         (LSK1L)

[Type: LAMPE in scratchpad]
[Press: LSK1L]

Result: Shows all devices with "LAMPE" in name
```

**Usage**:
- Press **GERÄTE** → Browse all devices
- SLEW to scroll
- LSK to select device
- Edit values via scratchpad

---

### **ZEITPLAN** (formerly F-PLN)

**Purpose**: Schedules and automation timelines - the "flight plan" of the smart home

**Page Layout**:
```
ZEITPLAN                1/2
HEUTE:      5 TERMINE
AKTIV:      3
---
 06:30  GUTEN MORGEN    (LSK1L)
 08:00  HEIZUNG AB      (LSK2L)
 19:00  ABEND LICHT     (LSK3L)
*22:30  GUTE NACHT      (LSK4L: Manual)
↓ MEHR           BEARBEITEN>
```

**Indicators**:
- `*` = Manually triggered (not by schedule)
- Time = Next scheduled execution
- No time = One-time executed

**Sub-pages**:
1. **Today's Schedule** (above)
2. **This Week** (weekly view)
3. **Edit Schedule** (add/remove, via app mostly)

**Usage**:
- Press **ZEITPLAN** → See today's automation
- LSK next to event → View/edit details
- Add new events (limited on MCDU, better via app)

**Event Detail**:
```
ZEITPLAN > GUTEN MORGEN 1/1
ZEIT:       06:30
WOCHENTAGE: MO-FR
SZENE:      GUTEN MORGEN
AKTIV:      JA         (LSK4L: Toggle)
< ZURÜCK          LÖSCHEN*
```

---

### **KLIMA** (formerly RAD NAV)

**Purpose**: Climate control - analogous to manual radio tuning

**Page Layout**:
```
KLIMA                   1/3
MODUS:      AUTO
SOLLWERT:   21.0°C
---
 WOHNZIMMER     22.0°C  (LSK3L)
 SCHLAFZIMMER   19.5°C  (LSK4L)
 KÜCHE          20.0°C  (LSK5L)
 KINDERZIMMER   21.0°C  (LSK6L)
< INDEX              MEHR>
```

**Room Detail**:
```
KLIMA > WOHNZIMMER      1/1
IST:        21.8°C
SOLL:       [  .  ]°C  (LSK2L: Edit)
VENTIL:     45%
MODUS:      AUTO       (LSK4L: Change)
FENSTER:    GESCHL.
< ZURÜCK
```

**Interaction**:
- Press LSK next to room → Room detail
- Type temperature in scratchpad (e.g., "22.5")
- Press LSK2L → Sets target temperature
- Press LSK4L → Cycles mode (AUTO/KOMFORT/ECO/AUS)

**Modes**:
- AUTO: Follow schedule
- KOMFORT: Set temp (user-defined comfort)
- ECO: Lower temp (energy saving)
- AUS: Heating off

**Usage**:
- Press **KLIMA** → Temperature overview
- Quick adjustment: LSK to room → Type temp → LSK to set

---

### **SICHERHEIT** (formerly SEC F-PLN)

**Purpose**: Security system - fortunate that SEC already means security!

**Page Layout**:
```
SICHERHEIT              1/3
ALARM:      UNSCHARF
KAMERAS:    4/4 ONLINE
BEWEGUNG:   KEINE
---
< KAMERA STATUS        (LSK3L)
< EREIGNISSE           (LSK4L)
< SENSOREN             (LSK5L)
< ALARM SCHARF         (LSK6L: Action)
< INDEX
```

**Sub-pages**:
1. **Overview** (above)
2. **Camera Status** (online/offline, last motion)
3. **Recent Events** (last 24h motion/door events)
4. **Sensor Health** (battery levels, faults)
5. **Alarm Control** (arm/disarm with confirmation)

**Alarm Arming**:
```
SICHERHEIT > ALARM      1/1
STATUS:     UNSCHARF
---
< SCHARF ZUHAUSE       (LSK3L)
< SCHARF ABWESEND      (LSK4L)
< SCHARF NACHT         (LSK5L)

[Press LSK4L - Arm Away]

BESTÄTIGEN?
< JA                   (LSK5L)
< NEIN                 (LSK6L)

[Press LSK5L - Confirm]

ALARM: SCHARF ABWESEND ✓
```

**Event Log**:
```
SICHERHEIT > EREIGNISSE 1/1
HEUTE:      3 BEWEGUNGEN
---
 14:32  BEWEGUNG FLUR
 12:15  TÜR OFFEN EINGANG
 08:45  BEWEGUNG GARTEN
↓ MEHR
< ZURÜCK
```

---

### **MELDUNGEN** (formerly ATC COMM)

**Purpose**: System messages and notifications - analogous to ATC communications

**Page Layout**:
```
MELDUNGEN               1/2
NEU:        2
WARNUNGEN:  1
---
!19:34  BATTERIE SENSOR (LSK1L: Amber)
 18:45  SZENE AKTIV     (LSK2L)
 14:20  LADEN FERTIG    (LSK3L)
 12:30  SYSTEM UPDATE   (LSK4L)
↓ MEHR             LÖSCHEN>
```

**Message Types**:
- `!` Red = Critical (error, failure)
- `!` Amber = Warning (low battery, attention needed)
- ` ` White = Info (normal events, confirmations)
- `✓` Green = Success (task completed)

**Message Detail**:
```
MELDUNGEN > BATTERIE    1/1
ZEIT:       19:34
GERÄT:      FENSTERKONTAKT
RAUM:       WOHNZIMMER
---
BATTERIE NIEDRIG
AKTUELL:    15%
WECHSELN ERFORDERLICH

< ZURÜCK        BESTÄTIGEN*
```

**Actions**:
- Press LSK next to message → View details
- Press "BESTÄTIGEN*" (LSK6R) → Acknowledge message (removes from list)
- Press "LÖSCHEN>" (LSK6R on main) → Clear all read messages

**Auto-Clear**: Info messages auto-clear after 24h, warnings remain until acknowledged

---

### **HAUPTMENÜ** (formerly MCDU MENU)

**Purpose**: Root menu - access all categories

**Page Layout**:
```
HAUPTMENÜ               1/2
---
< ENERGIE              (LSK1L)
< KLIMA                (LSK2L)
< LICHT                (LSK3L)
< SICHERHEIT           (LSK4L)
< SZENEN               (LSK5L)
< ZEITPLAN             (LSK6L)

> PHOTOVOLTAIK          (LSK1R)
> MULTIMEDIA            (LSK2R)
> VERSCHLUSS            (LSK3R)
> E-MOBILITÄT           (LSK4R)
> POOL                  (LSK5R)
> RÄUME                 (LSK6R)
                   WEITER>
```

**Page 2**:
```
HAUPTMENÜ               2/2
---
< GERÄTE               (LSK1L)
< ALARMANLAGE          (LSK2L)
< ANWESENHEIT          (LSK3L)
< STATUS               (LSK4L)
< MELDUNGEN            (LSK5L)
< EINSTELLUNGEN        (LSK6L)

> QUICK ACCESS          (LSK1R)
> INFO                  (LSK2R)
< ZURÜCK
```

**Usage**:
- Press **MENU** → See all categories
- Press LSK → Jump to category
- SLEW → to page 2

**Alternative**: Some categories accessible via direct function keys, others only via MENU

---

### **RÄUME** (formerly AIRPORT)

**Purpose**: Room/zone-specific information - analogous to airport info

**Page Layout**:
```
RÄUME                   1/2
AUSWAHL: [ ]←          (LSK1L: Enter room name)
---
 WOHNZIMMER
  LICHT:      2/3 AN
  TEMP:       22.0°C
  BEWEGUNG:   14:32
 SCHLAFZIMMER           (LSK5L: Details)
  LICHT:      0/2 AN
  TEMP:       19.5°C
↓ MEHR
```

**Room Detail**:
```
RÄUME > WOHNZIMMER      1/2
GERÄTE:     12
LICHT:      2/3 AN
TEMP:       22.0°C (21.5°)
FENSTER:    GESCHL.
---
< GERÄTELISTE          (LSK5L)
< ALLE LICHT AUS       (LSK6L)
< ZURÜCK
```

**Quick Actions per Room**:
- All lights off
- Set temperature
- View device list
- Check window status

**Usage**:
- Press **RÄUME** → Room overview
- LSK to select room
- See room-specific status and devices
- Quick room-level actions

---

## 3. LED Mapping

### LED Thematic Assignments

| LED Name | Aviation Meaning | Smart Home Meaning | Color | State |
|----------|-----------------|-------------------|-------|-------|
| **FAIL** | System failure | Security alarm triggered | RED | Blink=triggered, Solid=needs attention |
| **MCDU** | MCDU online | MCDU connection OK | GREEN | Solid=connected, Off=offline |
| **FM1** | Flight Manager 1 | ioBroker Host 1 online | GREEN | Solid=online, Off=offline |
| **FM2** | Flight Manager 2 | ioBroker Host 2 online (if HA setup) | GREEN | Solid=online, Off=offline |
| **IND** | Independent mode | Manual override active | AMBER | Solid=manual mode |
| **RDY** | Ready | System ready | GREEN | Solid=all systems operational |
| **DSPY** | Display | New message/notification | AMBER | Blink=unread message |
| **OFST** | Offset mode | Automation running | GREEN | Solid=automation active |
| **MSG** | Message waiting | Critical alert | RED | Blink=needs attention |
| **CLR** | Clearance received | Scene active | GREEN | Solid=scene running |
| **EXEC** | Execute mode | Pending action | AMBER | Blink=confirm needed |

### LED Usage Examples

**Scenario 1: Normal Operation**
```
MCDU:  ●  (Green - connected)
FM1:   ●  (Green - ioBroker online)
RDY:   ●  (Green - system ready)
CLR:   ●  (Green - scene "Good Night" active)
Others: Off
```

**Scenario 2: Security Alert**
```
FAIL:  ⚠  (Red blinking - alarm triggered!)
MSG:   ⚠  (Red blinking - critical alert)
MCDU:  ●  (Green - connected)
FM1:   ●  (Green - online)
Others: Off
```

**Scenario 3: Pending Confirmation**
```
EXEC:  ⚠  (Amber blinking - action needs confirm)
MCDU:  ●  (Green - connected)
FM1:   ●  (Green - online)
RDY:   ●  (Green - ready)
Others: Off
```

**Scenario 4: New Message**
```
DSPY:  ⚠  (Amber blinking - unread notification)
MCDU:  ●  (Green - connected)
FM1:   ●  (Green - online)
RDY:   ●  (Green - ready)
Others: Off
```

---

## 4. Special Functions

### Brightness Control (BRT/DIM)

**Aviation**: Adjust MCDU display brightness for day/night
**Smart Home**: Same - adjust MCDU display brightness

**Behavior**:
- Immediate effect (no navigation away from current page)
- 5-10 brightness levels
- Auto-dim after sunset? (Optional)
- BRT: Increase brightness one step
- DIM: Decrease brightness one step
- Hold: Continuous adjust

---

### Clear Key (CLR)

**Aviation**: Multi-function - clear scratchpad, delete, go back
**Smart Home**: Same behavior

**Context-dependent behavior**:

1. **Scratchpad has data**: CLR → Clear scratchpad
   ```
   Scratchpad: "22.5*"
   Press: CLR
   Result: Scratchpad empty
   ```

2. **Scratchpad empty, on editable field**: CLR → Delete field (copy "DELETE" to scratchpad)
   ```
   SOLL: 22.0°C ←
   Scratchpad: (empty)
   Press: CLR
   Scratchpad: "DELETE*"
   Press: LSK → Field cleared
   ```

3. **Scratchpad empty, on page**: CLR → Go back to previous page
   ```
   On: KLIMA > WOHNZIMMER
   Press: CLR
   Result: Return to KLIMA main page
   ```

4. **Double-press**: CLR CLR → Cancel operation / Return to main menu
   ```
   Anywhere in system
   Press: CLR CLR (quickly)
   Result: Return to last main page or STATUS
   ```

---

### Overfly/Confirm Key (OVFY)

**Aviation**: Confirm action, bypass waypoint
**Smart Home**: Confirm critical actions

**Usage**:

**Scenario 1: Scene Activation (optional confirm)**
```
On: SZENEN page
Press: LSK3L (GUTE NACHT)
Display: SZENE STARTEN?
         < JA (LSK5L)  NEIN> (LSK6R)

Alternative:
Press: OVFY → Confirms immediately (bypass prompt)
```

**Scenario 2: Critical Action (required confirm)**
```
On: SICHERHEIT > ALARM
Press: LSK4L (SCHARF ABWESEND)
Display: ALARM SCHARF?
         DRÜCKE OVFY

Press: OVFY → Arms alarm
```

**Scenario 3: Execute Pending Changes**
```
After multiple edits:
Display: 3 ÄNDERUNGEN
         DRÜCKE OVFY ZUM SPEICHERN

Press: OVFY → Saves all changes
```

**General rule**: OVFY = "Yes, I'm sure" or "Execute now"

---

### SLEW Keys (Navigation)

**Aviation**: Navigate between pages, scroll lists
**Smart Home**: Same

**Behavior**:

| Key | Context | Action |
|-----|---------|--------|
| SLEW ← | Main category page | Previous category (circular) |
| SLEW → | Main category page | Next category (circular) |
| SLEW ↑ | Long list (>14 lines) | Scroll up one line |
| SLEW ↓ | Long list (>14 lines) | Scroll down one line |
| Hold SLEW | Any | Continuous scroll/navigation |

**Examples**:

```
On: ENERGIE page
Press: SLEW → → Cycles through: ENERGIE → PV → GRID → BATTERIE → ENERGIE

On: GERÄTE list (50 devices)
Press: SLEW ↓ (hold) → Scrolls down through list
```

**Scroll indicators**:
```
GERÄTE                  1/4  ← Page indicator
...
...
↓ MEHR                      ← Scroll indicator (more below)
```

---

## 5. Keyboard Usage Strategy

### Alphanumeric Entry

**A-Z Keys**: Used for text entry (room names, device names, scene names)

**Use cases**:
1. Search devices: Type "LAMPE" → Filter device list
2. Select room: Type "WOHNZ" → Autocomplete to "WOHNZIMMER"
3. Enter scene name: Type "FILM" → Search scenes

**Input Method**:
- Type on keyboard → Appears in scratchpad
- Press LSK next to field → Data transferred
- Invalid entry → Rejected with error message

**Auto-complete**:
- After 3+ characters, MCDU suggests matches
- Press LSK to accept suggestion
- Continue typing to refine

**Example**:
```
GERÄTE > SUCHE
NAME: [     ]←         (LSK1L)

[Type: WOH]
Scratchpad: "WOH*"

Display updates:
VORSCHLÄGE:
< WOHNZIMMER           (LSK2L)
< WOHNZIMMER DECKE     (LSK3L)

Press: LSK2L → "WOHNZIMMER*" in scratchpad
Press: LSK1L → Searches for "WOHNZIMMER"
```

---

### Numeric Entry

**0-9 Keys**: Used for numbers (temp, brightness, time)

**Formats**:
- **Integer**: `75` (brightness %)
- **Decimal**: `22.5` (temperature °C)
- **Time**: `08:30` (HH:MM)
- **Date**: `14.02` (DD.MM)

**Validation**:
- Real-time as you type
- Invalid format → Red scratchpad
- Out of range → Amber warning

**Example**:
```
KLIMA > WOHNZIMMER
SOLL: [  .  ]°C ←      (LSK2L)

[Type: 35]
Scratchpad: "35*" (RED - out of range)
Error: "TEMP BEREICH 16-30°C"

[CLR]
[Type: 22.5]
Scratchpad: "22.5*" (GREEN - valid)

[Press: LSK2L]
Result: SOLL: 22.5°C (set successfully)
```

---

## 6. Special Smart Home Considerations

### Multi-State Devices

Some devices have more than ON/OFF:

**Blinds/Shutters**:
```
VERSCHLUSS > ROLLADEN    1/1
POSITION:   50%        (LSK2L: Set %)
---
< AUF (100%)           (LSK3L)
< HALB (50%)           (LSK4L)
< ZU (0%)              (LSK5L)
< STOPP                (LSK6L: If moving)
```

**Dimmable Lights**:
```
LICHT > STEHLAMPE       1/1
STATUS:     AN         (LSK2L: Toggle)
HELLIGKEIT: [   ]%     (LSK3L: Edit)
---
< 25%                  (LSK4L: Preset)
< 50%                  (LSK5L: Preset)
< 100%                 (LSK6L: Preset)
```

---

### Grouped Devices

Control multiple devices as one:

**Light Groups**:
```
LICHT > WOHNZIMMER ALLE 1/1
GERÄTE:     3
STATUS:     2 AN, 1 AUS
---
< ALLE AN              (LSK3L)
< ALLE AUS             (LSK4L)
< EINZELN              (LSK5L: List)
```

**Heating Zones**:
```
KLIMA > OBERGESCHOSS    1/1
RÄUME:      4
Ø TEMP:     20.5°C
SOLL:       [  .  ]°C  (LSK2L: Set all)
---
< EINZELN              (LSK5L: Per room)
```

---

### Conditional Actions

Some actions depend on state:

**Vacation Mode**:
```
EINSTELLUNGEN > MODUS   1/1
AKTUELL:    NORMAL
---
< URLAUB               (LSK3L)

[Press LSK3L]

URLAUB MODUS
VON:    [  .  ]        (LSK1L: Date)
BIS:    [  .  ]        (LSK2L: Date)
---
AKTIONEN:
- HEIZUNG ECO 16°C
- ALARM SCHARF
- LICHT SIMULATION
< BESTÄTIGEN*          (LSK6L)
```

**Scene with Parameters**:
```
SZENEN > WECKER         1/1
ZEIT:   [  :  ]        (LSK1L: HH:MM)
TAGE:   MO-FR          (LSK2L: Select)
---
AKTIONEN:
- LICHT FADE IN 15MIN
- HEIZUNG 21°C
- RADIO AN
< SPEICHERN*           (LSK6L)
```

---

## 7. Error Handling & Feedback

### Error Message Format

```
[Page content]
...
...
FEHLER: [MESSAGE]      (Line 13, RED/AMBER)
[Scratchpad]           (Line 14)
```

### Common Error Messages

| Error | Cause | Resolution |
|-------|-------|------------|
| `UNGÜLTIGE EINGABE` | Invalid format | Check format, re-enter |
| `BEREICH 16-30°C` | Temp out of range | Enter value 16-30 |
| `GERÄT NICHT GEFUNDEN` | Device doesn't exist | Check device name/ID |
| `GERÄT OFFLINE` | Device not reachable | Check device, wait, retry |
| `BESTÄTIGUNG NÖTIG` | Critical action needs OVFY | Press OVFY to confirm |
| `SYSTEM BESCHÄFTIGT` | Processing previous command | Wait a moment |
| `KEINE BERECHTIGUNG` | Action not allowed (if auth enabled) | Check user rights |

### Success Feedback

**Visual**:
- Value changes to green
- Checkmark icon ✓ appears
- Scratchpad clears
- LED indicator (if applicable)

**Example**:
```
Before:
SOLL: 21.0°C

[Type: 22.5]
[Press: LSK]

After:
SOLL: 22.5°C ✓  (GREEN, briefly flashes)
```

**Confirmation Messages** (brief, 2-3 seconds):
```
✓ SZENE AKTIV
✓ TEMPERATUR GESETZT
✓ GERÄTE AUSGESCHALTET
✓ ALARM SCHARF
```

---

## 8. Navigation Best Practices

### Depth Limit: Maximum 3 Levels

**Level 1**: Function key (category)
**Level 2**: Sub-page or device list
**Level 3**: Device detail or action confirmation

**Example**:
```
Level 1: Press KLIMA
Level 2: Press LSK (WOHNZIMMER)
Level 3: Edit temperature
---
Total: 3 levels deep (acceptable)
```

**Anti-pattern** (too deep):
```
Press MENU → Press LICHT → Press RÄUME → Press WOHNZIMMER → Press STEHLAMPE → Edit
---
5 levels deep! Too much navigation.
```

**Solution**: Use direct function keys or QUICK ACCESS for common paths.

---

### Breadcrumb Navigation

**Always show path**:
```
KLIMA > WOHNZIMMER      1/1
```

**Multiple levels**:
```
GERÄTE > LICHT > STEHLAMPE  1/1
```

**Back navigation**:
- Press CLR → Go back one level
- Press CLR CLR → Return to category main page
- Press < ZURÜCK (LSK) → Explicit back button

---

### Circular Navigation

**On main pages, SLEW wraps around**:
```
ENERGIE → (SLEW →) → KLIMA → (SLEW →) → LICHT → ... → (SLEW →) → ENERGIE
```

**Benefit**: No dead-ends, easy to cycle through categories

---

## 9. Integration Points

### Data Source: ioBroker

**State Reading**:
- MCDU reads from ioBroker states (e.g., `hm-rega.0.12345.STATE`)
- Polling interval: 1-5 seconds (depending on page)
- Real-time updates on STATUS page

**State Writing**:
- User action → MCDU sends setState to ioBroker
- Confirmation received → Visual feedback
- Timeout (5s) → Error message

**Example Flow**:
```
User: [Types 22.5] [Press LSK]
MCDU → ioBroker: setState('hm-rega.0.12345.SET_TEMPERATURE', 22.5)
ioBroker → Device: Set temperature
Device → ioBroker: Ack (success)
ioBroker → MCDU: Confirmation
MCDU → User: ✓ TEMPERATUR GESETZT (green)
```

---

### Adapter Architecture

**MCDU Client** (USB-connected hardware):
- Reads button presses
- Updates display content
- Controls LEDs
- Sends events to ioBroker adapter

**ioBroker Adapter** (Node.js):
- Receives events from MCDU Client
- Translates to ioBroker actions
- Fetches state data
- Formats display pages
- Sends display updates to MCDU Client

**Data Flow**:
```
MCDU Hardware
    ↕ (USB Serial)
MCDU Client (Node.js)
    ↕ (WebSocket/TCP)
ioBroker Adapter
    ↕ (State read/write)
ioBroker Core
    ↕ (Device protocols)
Smart Home Devices
```

---

## 10. Summary: Key Mappings

### Quick Reference Table

| MCDU Element | Smart Home Function | Primary Use Case |
|--------------|-------------------|------------------|
| **ENERGIE** | Energy management | Check power usage, PV production |
| **QUICK** | Quick access menu | Fast scene activation, quick info |
| **STATUS** | System status | Monitor house state at a glance |
| **SZENEN** | Scene control | Activate predefined scenes |
| **EINSTELLUNGEN** | System settings | Configuration, preferences |
| **GERÄTE** | Device catalog | Browse/control individual devices |
| **ZEITPLAN** | Schedules | View/edit automation timelines |
| **KLIMA** | Climate control | Adjust room temperatures |
| **SICHERHEIT** | Security | Cameras, alarm, sensors |
| **MELDUNGEN** | Notifications | System messages, alerts |
| **HAUPTMENÜ** | Main menu | Access all categories |
| **RÄUME** | Room overview | Room-based device control |
| **LSK1-6 L/R** | Soft keys | Context-dependent actions (labels shown) |
| **SLEW ←→↑↓** | Navigation | Page/list navigation |
| **CLR** | Clear/Back | Clear input, go back, cancel |
| **OVFY** | Confirm | Execute critical actions |
| **BRT/DIM** | Brightness | Adjust MCDU display brightness |
| **A-Z** | Text entry | Device names, search, scenes |
| **0-9** | Number entry | Temp, brightness, time values |
| **LEDs** | Status indicators | Alarm, messages, system health |

---

**Document Status**: ✅ Complete - Ready for detailed UX design
**Next Step**: Create UX-CONCEPT.md with interaction patterns and display layouts
