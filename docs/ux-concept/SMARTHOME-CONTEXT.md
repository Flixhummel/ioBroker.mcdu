# Smart Home Context: Gewerke & Use Cases

## Document Purpose
Complete catalog of smart home categories (Gewerke), devices, and use cases to inform MCDU UX design. This defines WHAT needs to be controlled and HOW users will interact with it.

---

## 1. Gewerke (Categories) Overview

### Complete Category List
1. **Licht** (Lighting)
2. **Heizung** (Heating/Climate)
3. **Energie** (Energy Management)
4. **Photovoltaik** (Solar/PV System)
5. **Multimedia** (Audio/Video/Entertainment)
6. **Sicherheit** (Security/Surveillance)
7. **Verschluss** (Locks/Access Control)
8. **Elektromobilität** (E-Mobility/Charging)
9. **Szenen** (Scenes/Automation)
10. **Pool** (Pool/Spa Control)
11. **Alarmanlage** (Alarm System)
12. **Anwesenheit** (Presence/Occupancy)
13. **System-Stati** (System Status/Health)

---

## 2. Detailed Gewerke Breakdown

### 2.1 Licht (Lighting)

**Device Types**:
- Dimmable lights (0-100%)
- Color lights (RGB/RGBW)
- Color temperature lights (warm/cool white)
- On/Off switches
- Light groups (multiple fixtures as one)
- Scenes (predefined lighting moods)

**Typical Devices per Room**:
- Wohnzimmer (Living Room): 4-6 lights
- Schlafzimmer (Bedroom): 2-4 lights
- Küche (Kitchen): 3-5 lights
- Bad (Bathroom): 2-3 lights
- Flur (Hallway): 2-4 lights
- Außen (Outdoor): 3-6 lights

**Data Points**:
- State: ON/OFF
- Brightness: 0-100%
- Color: RGB (if applicable)
- Color temperature: 2700K-6500K
- Power consumption: Watts

**Common Interactions**:
- Toggle on/off (instant)
- Set brightness level
- Set color/temperature
- Activate scene (multiple lights at once)
- "All off" command
- Timer (auto-off after X minutes)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Turn off bedroom light | 2-3 |
| 🔥 QUICK | Activate "Movie" scene | 2 |
| ℹ️ INFO | Check which lights are on | 2-3 |
| ⚙️ SET | Dim living room to 40% | 3-4 |
| ⚙️ SET | Change color to warm white | 4-5 |

---

### 2.2 Heizung (Heating/Climate)

**Device Types**:
- Thermostats (per room)
- Radiator valves (TRVs)
- Underfloor heating zones
- Central heating controller
- Window sensors (auto-off when open)
- Temperature sensors

**Typical Zones**:
- Wohnzimmer: 20-22°C
- Schlafzimmer: 18-20°C
- Kinderzimmer: 20-21°C
- Bad: 22-24°C
- Küche: 19-21°C
- Büro: 20-22°C

**Data Points**:
- Current temperature: °C
- Target temperature: °C
- Heating mode: Auto/Manual/Off/Eco/Comfort
- Valve position: 0-100%
- Window open status: Y/N
- Battery level: % (for TRVs)

**Common Interactions**:
- View current temperature
- Set target temperature
- Set mode (Comfort/Eco/Off)
- Boost heating (quick heat)
- Schedule override (vacation mode)
- Window detection on/off

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Set living room to 22°C | 4-5 |
| ℹ️ INFO | Check all room temps | 2-3 |
| ℹ️ INFO | Check heating status | 2 |
| ⚙️ SET | Set vacation mode (all 16°C) | 3-4 |
| ⚙️ SET | Boost bedroom heating | 3 |
| 📊 MONITOR | View temp history | 3-4 |

---

### 2.3 Energie (Energy Management)

**Data Sources**:
- Smart meter (grid import/export)
- Solar inverter (PV production)
- Battery storage (charge/discharge)
- Individual device consumption (smart plugs)
- Wallbox (EV charging power)

**Data Points**:
- Current power: Watts (+ = import, - = export)
- Total consumption today: kWh
- Total production today: kWh
- Grid import today: kWh
- Grid export today: kWh
- Battery level: %
- Battery charge/discharge: Watts
- Cost today: € (if available)
- Self-consumption rate: %

**Common Interactions**:
- View current power flow (real-time)
- Check today's consumption
- Check monthly totals
- View cost breakdown
- Compare to yesterday/last week
- Check self-sufficiency rate

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Check current power usage | 2 |
| ℹ️ INFO | View energy today (consumption) | 2-3 |
| ℹ️ INFO | Check grid import/export | 3 |
| ℹ️ INFO | View cost today | 3 |
| 📊 MONITOR | View hourly consumption graph | 4-5 |
| 📊 MONITOR | Compare week-over-week | 4-5 |

---

### 2.4 Photovoltaik (Solar/PV System)

**Data Sources**:
- Solar inverter
- Individual panel optimizers (if available)
- Weather forecast integration

**Data Points**:
- Current production: Watts
- Total production today: kWh
- Total production this month: kWh
- Total production this year: kWh
- Peak production today: Watts
- Panel efficiency: %
- Inverter status: OK/Warning/Error
- Estimated production today (forecast): kWh

**Common Interactions**:
- Check current PV production
- View today's total
- Check forecast vs actual
- Monitor inverter health
- View historical production

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Check PV production now | 2 |
| ℹ️ INFO | View production today | 2-3 |
| ℹ️ INFO | Check inverter status | 3 |
| 📊 MONITOR | View production graph (hourly) | 4 |
| 📊 MONITOR | Compare to forecast | 4 |

---

### 2.5 Multimedia (Audio/Video/Entertainment)

**Device Types**:
- Smart TVs
- Streaming devices (AppleTV, Fire TV)
- Audio receivers/amplifiers
- Multi-room audio (Sonos, etc.)
- Home theater systems
- Smart speakers

**Typical Zones**:
- Wohnzimmer: TV, receiver, speakers
- Schlafzimmer: TV, bedside speaker
- Küche: Radio, smart speaker
- Bad: Bluetooth speaker
- Garten: Outdoor speakers

**Data Points**:
- Power state: ON/OFF
- Volume: 0-100
- Source: HDMI1, Netflix, Spotify, etc.
- Playing: Title/artist (if available)
- Mute: Y/N

**Common Interactions**:
- Turn on/off
- Adjust volume
- Switch source
- Play/pause/skip
- Activate "Movie Mode" (scene)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Turn on living room TV | 2-3 |
| 🔥 QUICK | Adjust volume to 30 | 3-4 |
| ℹ️ INFO | Check what's playing | 2-3 |
| ⚙️ SET | Switch to HDMI2 | 3-4 |
| ⚙️ SET | Mute audio | 2-3 |

---

### 2.6 Sicherheit (Security/Surveillance)

**Device Types**:
- Security cameras (indoor/outdoor)
- Motion sensors
- Door/window sensors
- Glass break sensors
- Smoke detectors
- Water leak sensors

**Data Points**:
- Camera status: Online/Offline
- Motion detected: Y/N (timestamp)
- Recording: Y/N
- Battery level: % (wireless devices)
- Last triggered: timestamp
- Sensor status: OK/Open/Triggered

**Common Interactions**:
- View camera status (all cameras)
- Check motion events (last 24h)
- View live feed (not on MCDU - just status)
- Arm/disarm motion detection
- Check sensor battery levels

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Check security status | 2 |
| ℹ️ INFO | View motion events today | 3 |
| ℹ️ INFO | Check camera online status | 2-3 |
| 📊 MONITOR | Check sensor batteries | 3-4 |
| ⚙️ SET | Arm/disarm cameras | 3 |

---

### 2.7 Verschluss (Locks/Access Control)

**Device Types**:
- Smart door locks (main entrance, garage)
- Window locks (if motorized)
- Garage door opener
- Gate control (if applicable)
- Deadbolts

**Typical Locations**:
- Haustür (Main entrance)
- Hintertür (Back door)
- Garagentor (Garage door)
- Kellertür (Basement door)

**Data Points**:
- Lock state: Locked/Unlocked
- Battery level: %
- Last action: timestamp + user
- Jammed status: Y/N
- Auto-lock enabled: Y/N

**Common Interactions**:
- Lock/unlock doors
- Check lock status (all doors)
- View last unlock event
- Enable/disable auto-lock
- Temporarily unlock (5-min timer)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Unlock main door | 3 (with confirmation) |
| 🔥 QUICK | Lock all doors | 2-3 |
| ℹ️ INFO | Check which doors are unlocked | 2 |
| ℹ️ INFO | View last unlock time | 3 |
| ⚙️ SET | Set auto-lock timer | 4-5 |

---

### 2.8 Elektromobilität (E-Mobility/Charging)

**Device Types**:
- Wallbox (EV charger)
- Smart charging control
- Vehicle integration (if available)

**Data Points**:
- Charging status: Charging/Idle/Connected/Disconnected
- Current charge rate: kW
- Energy delivered today: kWh
- Vehicle battery level: % (if connected)
- Estimated range: km (if vehicle API available)
- Charging cost today: €
- Charging mode: Max/Eco/Solar-only
- Scheduled charge: timestamp

**Common Interactions**:
- Check charging status
- Start/stop charging
- Set charge mode (Max/Eco/PV-optimized)
- View energy delivered
- Check vehicle range
- Schedule charging (off-peak)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Check E-car range | 3-4 |
| 🔥 QUICK | Start/stop charging | 3 |
| ℹ️ INFO | Check charging status | 2 |
| ℹ️ INFO | View kWh charged today | 3 |
| ⚙️ SET | Set charge mode to PV-only | 4 |
| ⚙️ SET | Schedule charge for 02:00 | 5-6 |

---

### 2.9 Szenen (Scenes/Automation)

**Scene Types**:
- Time-based scenes (morning, evening, night)
- Activity scenes (movie, dinner, party, work)
- Departure/arrival scenes
- Weather-responsive scenes
- Season scenes

**Common Scenes**:
- **Good Morning**: Lights on (gradual), heating up, blinds open, coffee maker on
- **Good Night**: All lights off, doors locked, heating down, alarm armed
- **Movie Time**: Dim lights, TV on, sound system on, blinds closed
- **Away**: Lights off, heating eco, alarm armed, simulate presence
- **Arrive Home**: Lights on (entry), heating comfort, garage open
- **Dinner**: Dining lights on, background music, kitchen lights dim
- **Work Mode**: Office lights on, do-not-disturb, focus music

**Data Points**:
- Scene state: Active/Inactive
- Last activated: timestamp
- Devices involved: count
- Execution status: Success/Failed/Partial

**Common Interactions**:
- Activate scene (one-press)
- Deactivate scene
- View active scenes
- Create custom scene (via app, not MCDU)
- Schedule scene (time-based)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Activate "Good Night" scene | 2 |
| 🔥 QUICK | Activate "Movie Time" scene | 2 |
| ℹ️ INFO | Check active scenes | 2 |
| ℹ️ INFO | View scene device list | 3-4 |
| ⚙️ SET | Schedule "Wake Up" scene | 5-6 |

---

### 2.10 Pool (Pool/Spa Control)

**Device Types**:
- Pool pump
- Pool heater
- Chlorine/pH control
- Pool lights
- Cover control (if motorized)
- Water level sensor
- Temperature sensor

**Data Points**:
- Water temperature: °C
- Pump status: ON/OFF/Auto
- Heater status: ON/OFF
- Target temperature: °C
- Chlorine level: mg/L
- pH level: 7.0-7.6
- Pump runtime today: hours
- Filter status: OK/Needs Cleaning

**Common Interactions**:
- Check water temperature
- Turn pump on/off
- Set heater target temperature
- View chemical levels
- Control pool lights
- Check filter status

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Turn pool pump on | 3 |
| ℹ️ INFO | Check water temperature | 2-3 |
| ℹ️ INFO | View chlorine/pH levels | 3 |
| ⚙️ SET | Set pool heater to 26°C | 4 |
| 📊 MONITOR | Check pump runtime | 3 |

---

### 2.11 Alarmanlage (Alarm System)

**Device Types**:
- Alarm control panel
- Motion sensors (security mode)
- Door/window sensors
- Sirens (indoor/outdoor)
- Panic button

**Alarm Modes**:
- **Disarmed**: All sensors inactive
- **Home**: Perimeter sensors active (doors/windows), motion sensors inactive
- **Away**: All sensors active
- **Night**: Downstairs sensors active, upstairs inactive

**Data Points**:
- Alarm state: Disarmed/Home/Away/Night/Triggered
- Last armed: timestamp
- Armed by: user
- Sensor status: count ready / count faulted
- Recent events: last 10 triggers
- Battery backup: %

**Common Interactions**:
- Arm alarm (Home/Away/Night)
- Disarm alarm
- Check alarm status
- View recent events
- Check sensor readiness
- Silence alarm (during trigger)

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Arm alarm (Away mode) | 3-4 (with confirmation) |
| 🔥 QUICK | Disarm alarm | 3-4 (with PIN?) |
| ℹ️ INFO | Check alarm status | 2 |
| ℹ️ INFO | View recent triggers | 3 |
| 📊 MONITOR | Check sensor batteries | 3-4 |

---

### 2.12 Anwesenheit (Presence/Occupancy)

**Data Sources**:
- Smartphone tracking (WiFi, GPS, BLE)
- Motion sensors
- Door sensors
- Alarm system
- Manual override

**Data Points**:
- House occupied: Y/N
- Persons present: count (if trackable)
- Last motion detected: timestamp + room
- Presence mode: Home/Away/Vacation/Party
- Override: Manual/Auto
- Expected return: timestamp (if set)

**Common Interactions**:
- View current occupancy
- Check who's home (if tracking enabled)
- Set presence mode manually
- View last activity
- Set "Away" with return time

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Set presence to "Away" | 2-3 |
| ℹ️ INFO | Check who's home | 2 |
| ℹ️ INFO | View last motion activity | 3 |
| ⚙️ SET | Set vacation mode (7 days) | 4-5 |
| ⚙️ SET | Override to "Home" | 2-3 |

---

### 2.13 System-Stati (System Status/Health)

**Data Sources**:
- ioBroker host (CPU, RAM, disk)
- Network devices (router, switches, APs)
- Smart home devices (online/offline count)
- Backup status
- Database health
- Update availability

**Data Points**:
- ioBroker status: Running/Stopped/Error
- CPU usage: %
- RAM usage: %
- Disk usage: %
- Network status: OK/Degraded/Offline
- Devices online: count / total
- Devices offline: list
- Last backup: timestamp
- Updates available: count
- Errors/warnings: count

**Common Interactions**:
- Check overall system health
- View offline devices
- Check resource usage (CPU/RAM/Disk)
- View recent errors
- Check backup status
- View update status

**Use Cases**:
| Priority | Action | Expected Steps |
|----------|--------|----------------|
| 🔥 QUICK | Check system status | 2 |
| ℹ️ INFO | View offline devices | 3 |
| ℹ️ INFO | Check CPU/RAM usage | 3 |
| 📊 MONITOR | View error log | 3-4 |
| 📊 MONITOR | Check backup status | 3 |

---

## 3. Use Case Categorization by Speed

### 🔥 Schnell (Quick) - 1-3 button presses, <5 seconds
**Goal**: Instant control, no navigation required (or minimal)

| Use Case | Category | Target Steps |
|----------|----------|--------------|
| Activate "Good Night" scene | Szenen | 2 |
| Activate "Movie" scene | Szenen | 2 |
| Turn off bedroom light | Licht | 2-3 |
| Lock all doors | Verschluss | 2-3 |
| Check PV production now | Photovoltaik | 2 |
| Check current power usage | Energie | 2 |
| Check system status | System | 2 |
| Check alarm status | Alarmanlage | 2 |
| Set presence to "Away" | Anwesenheit | 2-3 |

**UX Principle**: Use function keys for direct jump, LSK1-3 for immediate actions.

---

### ℹ️ Info (Information) - 2-4 button presses, <10 seconds
**Goal**: View current states, check data, monitor

| Use Case | Category | Target Steps |
|----------|----------|--------------|
| Check which lights are on | Licht | 2-3 |
| View all room temps | Heizung | 2-3 |
| Check E-car range | Elektromobilität | 3-4 |
| View energy today | Energie | 2-3 |
| Check PV production today | Photovoltaik | 2-3 |
| Check charging status | Elektromobilität | 2 |
| View motion events today | Sicherheit | 3 |
| Check which doors unlocked | Verschluss | 2 |
| View active scenes | Szenen | 2 |
| Check who's home | Anwesenheit | 2 |
| View offline devices | System | 3 |

**UX Principle**: Function key → LSK to select view option → Display data.

---

### ⚙️ Einstellen (Configure/Set) - 3-6 button presses, <15 seconds
**Goal**: Adjust settings, set values, configure devices

| Use Case | Category | Target Steps |
|----------|----------|--------------|
| Set living room to 22°C | Heizung | 4-5 |
| Dim bedroom to 40% | Licht | 3-4 |
| Set alarm for 08:00 | Szenen | 5-6 |
| Adjust volume to 30 | Multimedia | 3-4 |
| Set charge mode to PV-only | Elektromobilität | 4 |
| Set pool heater to 26°C | Pool | 4 |
| Arm alarm (Away mode) | Alarmanlage | 3-4 |
| Set vacation mode | Anwesenheit | 4-5 |
| Schedule "Wake Up" scene | Szenen | 5-6 |

**UX Principle**: Function key → Navigate to device → Scratchpad entry → LSK to confirm.

---

### 📊 Überwachen (Monitor/Analyze) - 3-6 button presses, <20 seconds
**Goal**: View trends, history, graphs, detailed analysis

| Use Case | Category | Target Steps |
|----------|----------|--------------|
| View hourly energy graph | Energie | 4-5 |
| Compare week-over-week usage | Energie | 4-5 |
| View PV production graph | Photovoltaik | 4 |
| Check temp history | Heizung | 3-4 |
| View sensor battery levels | Sicherheit | 3-4 |
| Check pump runtime | Pool | 3 |
| View error log | System | 3-4 |
| Check backup status | System | 3 |
| View recent alarm triggers | Alarmanlage | 3 |

**UX Principle**: Function key → Info page → Select data view → Display graph/history.

---

## 4. Data Types & Interaction Patterns

### 4.1 Data Type Classification

| Data Type | Example | Input Method | Display Format |
|-----------|---------|--------------|----------------|
| **Boolean** | Light ON/OFF | LSK toggle | `LIGHT: ON` (green) |
| **Percentage** | Brightness 0-100% | Scratchpad + LSK | `BRIGHTNESS: 75%` |
| **Temperature** | 16-30°C | Scratchpad + LSK | `TARGET: 22.0°C` |
| **Enum** | Heating mode | LSK cycle | `MODE: COMFORT` |
| **Text** | Scene name | Scratchpad + LSK | `SCENE: GOOD NIGHT` |
| **Timestamp** | Last motion | Auto (display only) | `LAST: 14:32:15` |
| **Value + Unit** | Power in Watts | Auto (display only) | `POWER: 2340 W` |
| **Status** | Alarm state | LSK change | `ALARM: ARMED AWAY` (green) |
| **List** | Device selection | SLEW + LSK | Scrollable list |

### 4.2 Input Validation Rules

| Data Type | Validation | Example |
|-----------|------------|---------|
| **Temperature** | 16.0 - 30.0°C, 0.5°C steps | 22.5 ✅, 35.0 ❌ |
| **Percentage** | 0-100, integer | 75 ✅, 150 ❌ |
| **Time** | HH:MM 24h format | 08:30 ✅, 25:00 ❌ |
| **Scene name** | Max 20 characters | "GOOD NIGHT" ✅, "SUPER LONG..." ❌ |
| **Room name** | Must exist in database | "WOHNZIMMER" ✅, "ASDF" ❌ |

### 4.3 Interaction Patterns

**Pattern 1: Toggle (Boolean)**
```
Display:
  BEDROOM LIGHT
  STATE: ON  ← (LSK1L)
  
Press: LSK1L
Result: STATE: OFF  (toggles immediately)
```

**Pattern 2: Value Entry (Number)**
```
Display:
  LIVING ROOM
  TARGET: 21.0°C  ← (LSK2L)
  
Type: 22.5
Scratchpad: 22.5*
Press: LSK2L
Result: TARGET: 22.5°C  (green, heating adjusts)
```

**Pattern 3: Selection (Enum/List)**
```
Display:
  HEATING MODE
  < COMFORT  (LSK1L)
  < ECO      (LSK2L)
  < OFF      (LSK3L)
  
Press: LSK2L
Result: MODE: ECO  (selected, active)
```

**Pattern 4: View-Only (Status)**
```
Display:
  ENERGY STATUS
  CURRENT:  2340 W
  TODAY:    12.4 kWh
  COST:     2.48 €
  
(No LSKs needed, info display only)
```

---

## 5. Prioritization Matrix

### Most Frequent Use Cases (Daily)
1. Activate scenes (Good Night, Morning, Movie) - **Daily, multiple times**
2. Check energy/PV production - **Daily, 2-3 times**
3. Adjust lighting (on/off, dimming) - **Daily, multiple times**
4. Check/adjust heating - **Daily (winter), occasional (summer)**
5. Check E-car charging status - **Daily (EV owners)**
6. View system status - **Daily (tech users), weekly (normal users)**

### Occasional Use Cases (Weekly)
1. Lock/unlock specific doors - **Weekly (most use auto-lock)**
2. Adjust multimedia volume - **Weekly (prefer remote controls)**
3. Check security camera events - **Weekly or after alerts**
4. Set alarm modes - **Weekly (changes with schedule)**
5. Check sensor batteries - **Monthly**

### Rare Use Cases (Monthly/On-Demand)
1. Pool maintenance - **Seasonal (summer only)**
2. Vacation mode setup - **Few times per year**
3. Create new scenes - **Once, then rarely**
4. System troubleshooting - **As needed (errors)**

### UX Implication
**Function key mapping should prioritize**:
- Direct access to most frequent categories (Energie, Licht, Heizung, Szenen)
- Quick access menu (DIR) for top 6-10 actions
- Less frequent categories accessible via MENU

---

## 6. Smart Home-Specific Challenges

### Challenge 1: Variable Device Count
- **Aviation**: Fixed waypoints per flight (~20-30)
- **Smart Home**: Variable devices (10-100+ devices)
- **Solution**: Category-based navigation, search/filter function

### Challenge 2: Real-Time Updates
- **Aviation**: Data mostly static during flight phases
- **Smart Home**: Constant state changes (lights toggle, temps change)
- **Solution**: Auto-refresh pages, highlight changed values

### Challenge 3: Concurrent Control
- **Aviation**: Single pilot operating MCDU at a time
- **Smart Home**: Multiple control sources (app, voice, automation, MCDU)
- **Solution**: Show last-changed timestamp, "controlled by" indicator

### Challenge 4: No "Flight Plan" Equivalent
- **Aviation**: Clear beginning, middle, end (flight plan)
- **Smart Home**: Continuous operation, no linear flow
- **Solution**: Status-first design, scene-based "goals"

---

## 7. Key Takeaways for UX Design

### ✅ Smart Home Requirements
1. **13 Gewerke** need navigation structure
2. **100+ devices** require efficient browsing/searching
3. **4 speed tiers**: Quick (2 steps), Info (3 steps), Set (5 steps), Monitor (6 steps)
4. **Real-time data** needs auto-refresh or clear timestamps
5. **Multiple control sources** need conflict resolution
6. **Validation** required for temps, times, percentages
7. **Confirmation** needed for critical actions (unlock, alarm disarm)

### 🎯 Priority Actions (must be fast)
1. Scene activation (2 presses)
2. Energy/PV check (2 presses)
3. Light toggle (2-3 presses)
4. System status (2 presses)
5. Temperature check (2-3 presses)

### 📋 Design Principles
1. **Category-first navigation** (Gewerke = main menu)
2. **Status pages** for monitoring (not actions)
3. **Quick access** for top 10 actions (DIR key)
4. **Scratchpad** for all value entry
5. **LSK context** changes per page (soft keys)
6. **Color coding** for data states (white/green/amber/red)
7. **Minimal depth**: No more than 3 levels deep for any action

---

**Document Status**: ✅ Complete - Ready for mapping to MCDU functions
**Next Step**: Create MCDU-SMARTHOME-MAPPING.md with function key assignments
