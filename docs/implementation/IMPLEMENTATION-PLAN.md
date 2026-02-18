# MCDU ioBroker Adapter - Implementation Plan

**Version:** 1.0  
**Date:** 2026-02-16  
**Status:** Ready for Implementation  
**Author:** Kira Holt (Architecture Analysis)

---

## 🎯 Executive Summary

This document provides a **detailed implementation roadmap** for building the ioBroker MCDU adapter with authentic aviation-style input system integration.

**Scope:**
- ioBroker adapter foundation (admin UI, MQTT client, state management)
- Input system integration (scratchpad, state machine, validation)
- Page rendering system with editable fields
- Button event handling with context-aware actions
- Confirmation system (soft/hard confirmations)

**Timeline:** 3-4 weeks (15-20 working days)

**Prerequisites:**
- ✅ MQTT client operational (Phase 3a complete)
- ✅ Architecture documents finalized
- ✅ UX patterns defined

---

## 📊 Architecture Analysis Summary

### Existing Components

**✅ Complete (Phase 3a):**
- `mcdu-client/` - RasPi MQTT client
  - `lib/mcdu.js` - Hardware driver (node-hid)
  - `lib/display-manager.js` - Display state cache
  - `lib/led-controller.js` - LED state management
  - `lib/mqtt-handler.js` - MQTT pub/sub
  - `mcdu-client.js` - Main orchestrator

**📋 Defined (Architecture Docs):**
- Page configuration system (IOBROKER-ADAPTER-ARCHITECTURE.md)
- Input mode state machine (ARCHITECTURE-REVISION.md)
- UX interaction patterns (UX-CONCEPT.md)
- MQTT protocol (PHASE3A-SPEC.md)

**🚧 To Be Built (This Plan):**
- ioBroker adapter (`iobroker.mcdu/`)
- Input system classes
- Validation engine
- Confirmation dialogs
- Page renderer

---

## 🗂️ File Structure (Adapter Directory)

```
iobroker.mcdu/                      # Adapter root (new directory)
│
├── admin/                          # Admin UI (JSON Config)
│   ├── index_m.html                # Main admin page
│   ├── jsonConfig.json             # JSON Config specification
│   ├── custom.css                  # Custom styling
│   └── i18n/
│       ├── en/
│       │   └── translations.json
│       └── de/
│           └── translations.json
│
├── lib/                            # Core adapter logic
│   ├── input/                      # Input system (NEW)
│   │   ├── InputModeManager.js     # State machine (normal→input→edit→confirm)
│   │   ├── ScratchpadManager.js    # Line 14 buffer management
│   │   ├── ValidationEngine.js     # Multi-level validation
│   │   └── ConfirmationDialog.js   # Soft/hard confirmation logic
│   │
│   ├── rendering/                  # Display rendering
│   │   ├── PageRenderer.js         # Render page config → MQTT display
│   │   ├── LineFormatter.js        # Format lines with colors, alignment
│   │   └── ColorRules.js           # Evaluate dynamic color rules
│   │
│   ├── mqtt/                       # MQTT communication
│   │   ├── MqttClient.js           # MQTT connection wrapper
│   │   ├── DisplayPublisher.js     # Publish display updates
│   │   └── ButtonSubscriber.js     # Subscribe to button events
│   │
│   ├── state/                      # State management
│   │   ├── StateManager.js         # ioBroker state tree management
│   │   ├── RuntimeState.js         # Current page, mode, scratchpad
│   │   └── PageCache.js            # Cache rendered pages
│   │
│   └── templates/                  # Template system
│       ├── TemplateLoader.js       # Load pre-built templates
│       └── templates/
│           ├── home-automation.json
│           ├── climate-control.json
│           └── lighting.json
│
├── main.js                         # Adapter entry point
├── io-package.json                 # Adapter metadata + native config
├── package.json                    # npm dependencies
├── README.md                       # User documentation
├── LICENSE                         # MIT License
└── .eslintrc.json                  # Linting rules

```

---

## 🔧 Component Breakdown

### 1. InputModeManager.js (State Machine)

**Purpose:** Manage input mode transitions (normal → input → edit → confirm)

**Responsibilities:**
- Track current mode (`normal`, `input`, `edit`, `confirm`)
- Handle keypad character input (0-9, A-Z)
- Manage scratchpad content
- Handle LSK press context (copy vs insert)
- Handle CLR key (context-aware clearing)

**Key Methods:**
```javascript
class InputModeManager {
    constructor(adapter, scratchpadManager, validationEngine)
    
    // State transitions
    async enterInputMode(char)
    async enterEditMode(field, currentValue)
    async enterConfirmMode(confirmationConfig)
    async exitToNormal()
    
    // Key handlers
    async handleKeyInput(char)           // 0-9, A-Z, special chars
    async handleCLR()                    // Context-aware clear
    async handleLSK(side, lineNumber)   // Copy or insert
    async handleOVFY()                   // Confirm action
    
    // Getters
    getMode()
    getScratchpad()
    getSelectedField()
}
```

**Integration Points:**
- `main.js` - Creates instance, passes adapter reference
- `ButtonSubscriber.js` - Routes keypad events to handleKeyInput
- `ScratchpadManager.js` - Delegates scratchpad rendering
- `ValidationEngine.js` - Validates input before insert
- `ConfirmationDialog.js` - Displays confirmation prompts

---

### 2. ScratchpadManager.js (Line 14 Buffer)

**Purpose:** Manage Line 14 scratchpad display and state

**Responsibilities:**
- Store scratchpad content (typed characters)
- Render scratchpad to Line 14 with asterisk (*) indicator
- Apply validation colors (green/red/amber)
- Handle scratchpad clear
- Preserve scratchpad across page navigation (optional)

**Key Methods:**
```javascript
class ScratchpadManager {
    constructor(adapter, displayPublisher)
    
    // Content management
    append(char)
    clear()
    get()
    set(value)
    
    // Rendering
    async render(color = 'white')      // Render "value*" to Line 14
    async renderPlaceholder()          // Show "____" when empty
    async renderError(message)         // Show error below scratchpad
    
    // Validation state
    setValid(isValid)                  // Changes asterisk color
    getValid()
}
```

**Integration Points:**
- `InputModeManager.js` - Calls append/clear/render methods
- `DisplayPublisher.js` - Publishes Line 14 MQTT updates
- `PageRenderer.js` - Reserves Line 14, doesn't overwrite

---

### 3. ValidationEngine.js (Multi-Level Validation)

**Purpose:** Validate scratchpad input against field rules

**Responsibilities:**
- Level 2: Format validation (numeric, time, text patterns)
- Level 3: Range validation (min/max, step constraints)
- Level 4: Business logic validation (custom rules)
- Generate human-readable error messages

**Key Methods:**
```javascript
class ValidationEngine {
    constructor(adapter)
    
    // Validation levels
    validateFormat(value, inputType)          // Returns {valid, error}
    validateRange(value, rules)               // Returns {valid, error}
    async validateBusinessLogic(field, value) // Returns {valid, error}
    
    // Complete validation chain
    async validate(value, field)              // Runs all levels
    
    // Custom validators
    registerCustomValidator(name, fn)
    
    // Error messages
    getErrorMessage(errorCode, context)
}
```

**Validation Rules (from field config):**
```javascript
{
    editable: true,
    inputType: "numeric",        // "numeric" | "text" | "time" | "select"
    validation: {
        required: false,
        min: 16.0,
        max: 30.0,
        step: 0.5,
        maxLength: 20,
        pattern: "^[0-9.]+$",
        custom: "validateHeatingTarget"  // Custom validator name
    }
}
```

**Integration Points:**
- `InputModeManager.js` - Calls validate() before insert
- `ScratchpadManager.js` - Displays validation errors
- Custom validators in `main.js` or separate module

---

### 4. ConfirmationDialog.js (Soft/Hard Confirmations)

**Purpose:** Display confirmation prompts for critical actions

**Responsibilities:**
- Render soft confirmation (LSK or OVFY accepts)
- Render hard confirmation (OVFY only)
- Handle confirmation response (accept/cancel)
- Support countdown timers (optional)

**Key Methods:**
```javascript
class ConfirmationDialog {
    constructor(adapter, displayPublisher)
    
    // Show confirmations
    async showSoft(title, details, onConfirm, onCancel)
    async showHard(title, warning, details, onConfirm, onCancel)
    async showCountdown(title, details, seconds, onConfirm, onCancel)
    
    // Handle responses
    async handleResponse(key)           // LSK, OVFY, or CLR
    
    // Cancel
    async cancel()
    
    // Check if active
    isActive()
}
```

**Confirmation Levels:**
- **None:** Toggle light, view info (immediate execution)
- **Soft:** Activate scene, delete item (LSK or OVFY confirms)
- **Hard:** Disarm alarm, unlock door (OVFY only)

**Integration Points:**
- `InputModeManager.js` - Enters confirm mode, delegates to this class
- `ButtonSubscriber.js` - Routes OVFY/LSK/CLR to handleResponse
- `PageRenderer.js` - Temporarily overrides display with dialog

---

### 5. PageRenderer.js (Display Rendering)

**Purpose:** Render page configuration to MQTT display format

**Responsibilities:**
- Read page config from native storage
- Render 14 lines with data from ioBroker states
- Apply color rules (dynamic based on value)
- Handle editable field indicators (brackets, arrows)
- Reserve Line 14 for scratchpad
- Cache rendered pages

**Key Methods:**
```javascript
class PageRenderer {
    constructor(adapter, displayPublisher, lineFormatter)
    
    // Render full page
    async renderPage(pageId)                // Render all 14 lines
    async renderLine(pageId, lineNumber)    // Render single line
    
    // Data fetching
    async fetchDataForLine(lineConfig)      // Get ioBroker state value
    
    // Edit indicators
    addEditIndicator(content, isEditable, isActive)
    
    // Color rules
    evaluateColorRules(value, colorRules)
    
    // Cache
    getCachedPage(pageId)
    invalidateCache(pageId)
}
```

**Rendering Pipeline:**
```
Page Config → Fetch Data → Format Lines → Apply Colors → Add Indicators → MQTT Publish
```

**Integration Points:**
- `main.js` - Calls renderPage on page switch
- `StateManager.js` - Triggers renderLine on data change
- `InputModeManager.js` - Adds edit indicators for selected field
- `DisplayPublisher.js` - Publishes MQTT display/set messages

---

### 6. MqttClient.js (MQTT Wrapper)

**Purpose:** Manage MQTT connection and subscriptions

**Responsibilities:**
- Connect to broker with credentials
- Subscribe to button event topics
- Handle reconnection
- Provide pub/sub interface

**Key Methods:**
```javascript
class MqttClient {
    constructor(adapter, config)
    
    // Connection
    async connect()
    async disconnect()
    
    // Publish
    async publish(topic, payload, options)
    
    // Subscribe
    async subscribe(topic, handler)
    async unsubscribe(topic)
    
    // Status
    isConnected()
}
```

**Integration Points:**
- `main.js` - Creates instance in onReady()
- `DisplayPublisher.js` - Uses publish method
- `ButtonSubscriber.js` - Uses subscribe method

---

### 7. StateManager.js (ioBroker State Tree)

**Purpose:** Create and manage ioBroker object tree

**Responsibilities:**
- Create object structure on adapter start
- Subscribe to data source changes
- Update runtime state (currentPage, mode, scratchpad)
- Handle control commands (switchPage, goBack, refresh)

**Key Methods:**
```javascript
class StateManager {
    constructor(adapter)
    
    // Setup
    async setupObjectTree()
    async createPageObjects(pageConfig)
    async createRuntimeObjects()
    
    // Subscriptions
    async subscribeToDataSources(pages)
    async subscribeToControlStates()
    
    // State updates
    async setRuntimeState(key, value)
    async getRuntimeState(key)
    
    // Event handlers
    async onStateChange(id, state)
}
```

**Object Tree Structure:**
```
mcdu.0
├── info/
│   ├── connection          # MQTT connection status
│   └── devicesOnline       # Connected MCDUs
├── devices/
│   └── mcdu-pi-1/
│       ├── online
│       └── lastSeen
├── pages/
│   ├── nav-main/
│   │   ├── active
│   │   └── lines/
│   │       └── 1/
│   │           ├── display
│   │           ├── leftButton
│   │           └── rightButton
│   └── [other pages...]
├── runtime/
│   ├── currentPage         # Active page ID
│   ├── previousPage        # For back navigation
│   ├── mode                # "normal" | "input" | "edit" | "confirm"
│   ├── scratchpad          # Input buffer content
│   ├── scratchpadValid     # Validation status
│   └── selectedLine        # Currently editing line (if any)
└── control/
    ├── switchPage          # Write page ID to switch
    ├── goBack              # Trigger back navigation
    └── refresh             # Re-render display
```

**Integration Points:**
- `main.js` - Calls setupObjectTree() on start
- `PageRenderer.js` - Reads page objects for rendering
- `InputModeManager.js` - Updates runtime state
- All components read/write ioBroker states

---

## 📅 Implementation Phases

### Phase 1: Adapter Foundation (Week 1, Days 1-5)

**Goal:** Basic ioBroker adapter with MQTT connection and simple display rendering

#### Day 1: Project Setup
- [ ] Create `iobroker.mcdu/` directory structure
- [ ] Initialize `package.json` (dependencies: `mqtt`, `@iobroker/adapter-core`)
- [ ] Create `io-package.json` with native config structure
- [ ] Create basic `main.js` skeleton (extends utils.Adapter)
- [ ] Setup ESLint configuration

**Deliverable:** Adapter installs in ioBroker, shows in admin UI

---

#### Day 2: MQTT Client + State Tree
- [ ] Implement `lib/mqtt/MqttClient.js`
  - Connect to broker
  - Handle reconnection
  - Pub/sub interface
- [ ] Implement `lib/state/StateManager.js`
  - Create object tree (info, devices, pages, runtime, control)
  - Subscribe to control states (switchPage, goBack)
- [ ] Test MQTT connection from `main.js`

**Deliverable:** Adapter connects to MQTT, creates object tree

---

#### Day 3: Display Rendering (Basic)
- [ ] Implement `lib/rendering/LineFormatter.js`
  - Format text (alignment, padding)
  - Color mapping
- [ ] Implement `lib/mqtt/DisplayPublisher.js`
  - Publish `mcdu/display/set` messages
  - Publish `mcdu/display/line` messages
- [ ] Implement `lib/rendering/PageRenderer.js` (basic version)
  - Render static labels
  - Fetch data from ioBroker states
  - Format 14 lines

**Deliverable:** Can render a hardcoded page to MCDU display

---

#### Day 4: Button Event Handling (Basic)
- [ ] Implement `lib/mqtt/ButtonSubscriber.js`
  - Subscribe to `mcdu/buttons/event`
  - Parse button events
  - Route to handlers
- [ ] Add button handlers in `main.js`
  - LSK navigation (basic page switch)
  - Function key handlers (placeholder)
- [ ] Test button → page navigation flow

**Deliverable:** Pressing LSK switches between pages

---

#### Day 5: Page Configuration System
- [ ] Implement page config loading from `native.pages`
- [ ] Extend `PageRenderer.js` to support:
  - Dynamic data sources (ioBroker states)
  - Color rules evaluation
  - Multiple pages
- [ ] Test multi-page navigation
- [ ] Add scratchpad placeholder (Line 14 reserved, shows "____")

**Deliverable:** Multi-page navigation works, data displays dynamically

**🎉 Phase 1 Milestone:** Basic adapter functional, can display pages and handle navigation

---

### Phase 2: Input System (Week 2, Days 6-10)

**Goal:** Implement scratchpad, state machine, and basic validation

#### Day 6: Scratchpad System
- [ ] Implement `lib/input/ScratchpadManager.js`
  - Content buffer (append, clear, get, set)
  - Render to Line 14 with asterisk
  - Color feedback (white/green/red)
- [ ] Integrate with `DisplayPublisher.js`
- [ ] Test keypad → scratchpad → Line 14 display

**Deliverable:** Typing on keypad shows in scratchpad

---

#### Day 7: Input Mode State Machine
- [ ] Implement `lib/input/InputModeManager.js`
  - Mode tracking (normal, input, edit, confirm)
  - `handleKeyInput()` - Transition normal → input
  - `handleCLR()` - Clear scratchpad or exit mode
  - `getMode()`, `getScratchpad()` getters
- [ ] Extend `ButtonSubscriber.js` to route keypad events
- [ ] Test mode transitions (type → CLR → type again)

**Deliverable:** State machine works, modes transition correctly

---

#### Day 8: LSK Copy/Insert Logic
- [ ] Extend `InputModeManager.js`:
  - `handleLSK()` - Context-aware (copy vs insert)
  - `copyToScratchpad()` - Field value → scratchpad
  - `insertFromScratchpad()` - Scratchpad → field
- [ ] Add field detection (check if line has editable field)
- [ ] Test copy flow (LSK on field → value in scratchpad)
- [ ] Test insert flow (type value → LSK on field → value updates)

**Deliverable:** Can copy field values to scratchpad and insert back

---

#### Day 9: Validation Engine (Basic)
- [ ] Implement `lib/input/ValidationEngine.js`
  - `validateFormat()` - Numeric, time, text patterns
  - `validateRange()` - Min/max, step constraints
  - `getErrorMessage()` - Human-readable errors
- [ ] Integrate with `InputModeManager.js`
  - Validate scratchpad before insert
  - Show error in scratchpad (red asterisk)
  - Reject invalid input
- [ ] Test validation (out of range, invalid format)

**Deliverable:** Invalid input rejected with clear error messages

---

#### Day 10: Visual Feedback & Edit Indicators
- [ ] Extend `PageRenderer.js`:
  - Add edit indicators (brackets, arrows) for editable fields
  - Highlight active field (when in edit mode)
  - Show green color for user-set values
- [ ] Extend `ScratchpadManager.js`:
  - `renderError()` - Show error on Line 13
  - Temporary success messages
- [ ] Test visual feedback for all modes

**Deliverable:** Clear visual indicators for editable fields and edit state

**🎉 Phase 2 Milestone:** Complete input system works end-to-end (type → validate → insert → display)

---

### Phase 3: Advanced Features (Week 3, Days 11-15)

**Goal:** Confirmation system, business logic validation, edge cases

#### Day 11: Confirmation System
- [ ] Implement `lib/input/ConfirmationDialog.js`
  - `showSoft()` - LSK or OVFY confirms
  - `showHard()` - OVFY only
  - `handleResponse()` - Accept/cancel
- [ ] Extend `InputModeManager.js`:
  - Enter confirm mode
  - Route OVFY/LSK to ConfirmationDialog
- [ ] Test soft confirmation (activate scene)
- [ ] Test hard confirmation (disarm alarm)

**Deliverable:** Confirmation dialogs work, prevent accidental critical actions

---

#### Day 12: Business Logic Validation
- [ ] Extend `ValidationEngine.js`:
  - `validateBusinessLogic()` - Custom validators
  - `registerCustomValidator()` - Plugin system
- [ ] Add example custom validators:
  - `validateHeatingTarget` (heating < cooling)
  - `validateScheduleTime` (not in past)
- [ ] Test cross-field validation
- [ ] Document how to add custom validators

**Deliverable:** Complex validation rules work (e.g., heating vs cooling)

---

#### Day 13: Special Keys & Edge Cases
- [ ] Implement OVFY key handling (separate from LSK)
- [ ] Implement double-CLR emergency exit
- [ ] Implement MENU key (always to HAUPTMENÜ)
- [ ] Handle timeout for edit mode (auto-cancel after 60s)
- [ ] Handle MQTT disconnect during input (graceful degradation)
- [ ] Test all edge cases

**Deliverable:** Robust handling of special keys and error conditions

---

#### Day 14: Color Rules & Dynamic Display
- [ ] Implement `lib/rendering/ColorRules.js`
  - Evaluate condition expressions (>, <, ==, etc.)
  - Support complex rules (AND, OR)
- [ ] Extend `PageRenderer.js`:
  - Apply color rules dynamically
  - Support multi-color segments per line
- [ ] Test color rules with live data (temperature thresholds)

**Deliverable:** Display colors change dynamically based on values

---

#### Day 15: Polish & Error Handling
- [ ] Add debug logging throughout adapter
- [ ] Improve error messages (user-friendly)
- [ ] Add recovery mechanisms:
  - Auto-reconnect MQTT
  - Re-render on state desync
  - Cache invalidation
- [ ] Memory leak testing (run for 1 hour, check memory)
- [ ] Performance optimization (reduce state reads)

**Deliverable:** Adapter stable, no memory leaks, good error handling

**🎉 Phase 3 Milestone:** Production-ready input system with all features

---

### Phase 4: Admin UI & Testing (Week 4, Days 16-20)

**Goal:** JSON Config UI, testing, documentation

#### Day 16: JSON Config UI (Part 1)
- [ ] Create `admin/jsonConfig.json`:
  - General settings (MQTT, display)
  - Pages accordion with line table
  - Template loader
- [ ] Test in ioBroker admin UI
- [ ] Fix layout/styling issues

**Deliverable:** Basic admin UI works, can configure MQTT

---

#### Day 17: JSON Config UI (Part 2)
- [ ] Complete pages configuration:
  - Editable fields toggle
  - Validation rules UI
  - Color rules UI
- [ ] Add "Quick Access" configuration tab
- [ ] Add device status display tab
- [ ] Test page configuration workflow

**Deliverable:** Complete admin UI, can configure all features

---

#### Day 18: Template System
- [ ] Implement `lib/templates/TemplateLoader.js`
- [ ] Create template files:
  - `home-automation.json` (basic smart home)
  - `climate-control.json` (multi-room climate)
  - `lighting.json` (light control)
- [ ] Add template preview images (base64)
- [ ] Test template loading (admin UI → adapter)

**Deliverable:** Users can load pre-built templates

---

#### Day 19: Integration Testing
- [ ] End-to-end test scenarios:
  1. Install adapter → Configure → Render page
  2. Type value → Validate → Insert → Verify ioBroker state
  3. Activate scene → Soft confirm → Execute
  4. Disarm alarm → Hard confirm (OVFY) → Execute
  5. Invalid input → Error → Correct → Success
- [ ] Test with multiple pages (10+ pages)
- [ ] Test with long lists (scrolling)
- [ ] Test MQTT reconnect scenarios

**Deliverable:** All core workflows tested and working

---

#### Day 20: Documentation & Packaging
- [ ] Write comprehensive README.md:
  - Features overview
  - Installation instructions
  - Configuration guide
  - Example pages
  - Troubleshooting
- [ ] Add JSDoc comments to all classes
- [ ] Create CHANGELOG.md
- [ ] Prepare for ioBroker repository submission:
  - Update `io-package.json` metadata
  - Add screenshots
  - Create demo configuration

**Deliverable:** Adapter ready for public release

**🎉 Phase 4 Milestone:** Complete, tested, documented adapter ready for production

---

## 🧪 Testing Strategy

### Unit Tests

**Test Framework:** Mocha + Chai

**Coverage Goals:**
- `ValidationEngine.js`: 90%+ (all validation rules)
- `InputModeManager.js`: 85%+ (all state transitions)
- `LineFormatter.js`: 90%+ (formatting edge cases)
- `ColorRules.js`: 85%+ (condition evaluation)

**Example Test:**
```javascript
describe('ValidationEngine', () => {
    it('should reject numeric value below minimum', async () => {
        const engine = new ValidationEngine();
        const field = {
            inputType: 'numeric',
            validation: { min: 16, max: 30 }
        };
        const result = await engine.validate('10', field);
        expect(result.valid).to.be.false;
        expect(result.error).to.equal('MINIMUM 16');
    });
});
```

---

### Integration Tests

**Test Scenarios:**

**1. Complete Input Flow**
```
1. Navigate to editable field
2. Type value in scratchpad
3. Press LSK to insert
4. Verify:
   - ioBroker state updated
   - Display shows new value (green)
   - Scratchpad cleared
```

**2. Validation Flow**
```
1. Type invalid value (out of range)
2. Press LSK
3. Verify:
   - Error shown (red)
   - Value not written to state
   - Scratchpad stays (red asterisk)
4. Type valid value
5. Press LSK
6. Verify success
```

**3. Confirmation Flow**
```
1. Trigger critical action (e.g., unlock door)
2. Verify confirmation dialog appears
3. Press OVFY (or cancel)
4. Verify action executes (or cancels)
```

---

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Adapter installs without errors
- [ ] Admin UI loads correctly
- [ ] MQTT connects to broker
- [ ] Display renders first page
- [ ] Buttons generate events
- [ ] LEDs respond to state changes

**Input System:**
- [ ] Keypad typing shows in scratchpad
- [ ] CLR clears scratchpad
- [ ] LSK copies field value to scratchpad
- [ ] LSK inserts scratchpad into field
- [ ] Invalid input rejected with error
- [ ] Valid input accepted and saved

**Navigation:**
- [ ] Function keys switch pages (if configured)
- [ ] MENU returns to HAUPTMENÜ
- [ ] CLR goes back one level
- [ ] SLEW navigates pages
- [ ] Double-CLR emergency exit works

**Confirmation:**
- [ ] Soft confirmation shows (scene activation)
- [ ] Hard confirmation requires OVFY (alarm disarm)
- [ ] Cancel works (CLR or LSK NEIN)
- [ ] Countdown confirmation works (if implemented)

**Edge Cases:**
- [ ] MQTT reconnects after disconnect
- [ ] Scratchpad survives page navigation (optional)
- [ ] Edit mode times out after 60s
- [ ] Multiple rapid button presses handled
- [ ] Long lists scroll correctly

---

## ⚠️ Risk Assessment

### Technical Risks

**Risk 1: Performance on ioBroker**
- **Issue:** ioBroker may have slow state reads
- **Impact:** Display rendering lag (>500ms)
- **Mitigation:** 
  - Implement aggressive caching (PageCache.js)
  - Batch state reads
  - Throttle render calls (max 10/sec)
  - Test on real ioBroker system early (Day 5)

**Risk 2: MQTT Message Rate**
- **Issue:** Rapid button presses flood MQTT broker
- **Impact:** Broker overload, dropped messages
- **Mitigation:**
  - Client-side throttling (already in mcdu-client.js)
  - Adapter-side queuing (process events in order)
  - QoS 1 for critical messages

**Risk 3: Memory Leaks**
- **Issue:** Event listeners not cleaned up
- **Impact:** Adapter crashes after hours of operation
- **Mitigation:**
  - Careful event listener management
  - Test with memory profiler (Day 15)
  - Run 24h stability test before release

**Risk 4: Complex Validation Logic**
- **Issue:** Custom validators difficult to implement
- **Impact:** Users can't create complex validation rules
- **Mitigation:**
  - Provide well-documented examples
  - Create validator library (common patterns)
  - Support simple expression syntax (no JS code)

---

### Integration Risks

**Risk 5: MQTT Protocol Mismatch**
- **Issue:** Adapter expects different format than client sends
- **Impact:** Display doesn't update, buttons don't work
- **Mitigation:**
  - Follow PHASE3A-SPEC.md strictly
  - Add schema validation on adapter side
  - Test with real mcdu-client early (Day 4)

**Risk 6: ioBroker Object Tree Conflicts**
- **Issue:** Another adapter uses same state IDs
- **Impact:** State collisions, unexpected behavior
- **Mitigation:**
  - Use unique namespace (`mcdu.0.*`)
  - Don't modify other adapters' states
  - Document state tree clearly

---

### UX Risks

**Risk 7: Confusing Edit Indicators**
- **Issue:** Users don't know which fields are editable
- **Impact:** Poor UX, support requests
- **Mitigation:**
  - Clear visual indicators (brackets, arrows, colors)
  - Include tutorial page in default config
  - Comprehensive documentation

**Risk 8: Validation Errors Too Technical**
- **Issue:** Error messages like "Invalid pattern match"
- **Impact:** Users don't understand what's wrong
- **Mitigation:**
  - Human-readable error messages (German + English)
  - Show valid range/format in error
  - Examples in documentation

---

## 📝 Dependencies

### npm Packages

```json
{
  "dependencies": {
    "@iobroker/adapter-core": "^3.1.6",
    "mqtt": "^5.0.0"
  },
  "devDependencies": {
    "@iobroker/testing": "^4.1.0",
    "mocha": "^10.2.0",
    "chai": "^4.3.0",
    "eslint": "^8.50.0"
  }
}
```

---

## 🎓 Knowledge Transfer

### Documentation for Developers

**After implementation, create:**
1. **DEVELOPER.md** - Architecture overview, how to extend
2. **API.md** - Public API for custom validators, templates
3. **CONTRIBUTING.md** - How to contribute (PRs, issues)

**After implementation, update:**
1. **README.md** - User guide (installation, configuration)
2. **CHANGELOG.md** - Version history

---

## ✅ Success Criteria

### MVP (Minimum Viable Product)
- ✅ Adapter installs and starts
- ✅ MQTT connection works
- ✅ Display renders pages with dynamic data
- ✅ Buttons trigger actions (navigation, toggle)
- ✅ Basic input works (scratchpad, insert)
- ✅ Basic validation (format, range)
- ✅ Admin UI allows configuration

### Production-Ready
- ✅ All MVP criteria
- ✅ Complete input system (copy, insert, edit modes)
- ✅ Multi-level validation (format, range, business logic)
- ✅ Confirmation dialogs (soft, hard)
- ✅ Edit indicators and visual feedback
- ✅ Special keys (OVFY, double-CLR, MENU)
- ✅ Edge case handling (timeouts, disconnects)
- ✅ Template system
- ✅ Comprehensive documentation

### Best-in-Class
- ✅ All production-ready criteria
- ✅ Auto-complete for text fields
- ✅ History/undo for edited values
- ✅ Voice feedback (TTS for confirmations)
- ✅ Advanced validation (cross-field dependencies)
- ✅ User profiles (different validation per user)
- ✅ Performance: <100ms render time, <50ms button latency

---

## 📊 Progress Tracking

**Use this checklist to track implementation:**

```markdown
## Phase 1: Foundation (Days 1-5)
- [ ] Day 1: Project setup
- [ ] Day 2: MQTT + State tree
- [ ] Day 3: Display rendering (basic)
- [ ] Day 4: Button events (basic)
- [ ] Day 5: Page configuration system

## Phase 2: Input System (Days 6-10)
- [ ] Day 6: Scratchpad system
- [ ] Day 7: State machine
- [ ] Day 8: LSK copy/insert
- [ ] Day 9: Validation engine (basic)
- [ ] Day 10: Visual feedback

## Phase 3: Advanced (Days 11-15)
- [ ] Day 11: Confirmation system
- [ ] Day 12: Business logic validation
- [ ] Day 13: Special keys & edge cases
- [ ] Day 14: Color rules
- [ ] Day 15: Polish & error handling

## Phase 4: UI & Testing (Days 16-20)
- [ ] Day 16: JSON Config (part 1)
- [ ] Day 17: JSON Config (part 2)
- [ ] Day 18: Template system
- [ ] Day 19: Integration testing
- [ ] Day 20: Documentation & packaging
```

---

## 🚀 Next Steps

1. **Review this plan** with stakeholders
2. **Set up development environment:**
   - Install ioBroker test instance
   - Install Mosquitto MQTT broker
   - Install dependencies
3. **Start Phase 1, Day 1** (project setup)
4. **Daily check-ins** to track progress
5. **Weekly demos** to stakeholders (after each phase)

---

## 📚 References

**Architecture Documents:**
- `IOBROKER-ADAPTER-ARCHITECTURE.md` - Base adapter architecture
- `ARCHITECTURE-REVISION.md` - Input system extensions
- `UX-CONCEPT.md` - Complete UX patterns
- `PHASE3A-SPEC.md` - MQTT protocol (client side)

**Existing Code:**
- `mcdu-client/` - RasPi MQTT client (reference implementation)
- `mcdu-client/lib/mcdu.js` - Hardware driver

**External Resources:**
- ioBroker Adapter Development: https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/adapterdev.md
- JSON Config: https://github.com/ioBroker/adapter-react-v5/blob/master/SCHEMA.md
- MQTT.js: https://github.com/mqttjs/MQTT.js

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-16  
**Status:** ✅ Ready for Implementation  
**Estimated Completion:** 2026-03-15 (4 weeks from 2026-02-16)

---

**END OF IMPLEMENTATION PLAN**
