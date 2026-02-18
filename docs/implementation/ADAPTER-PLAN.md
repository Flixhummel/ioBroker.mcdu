# ioBroker Adapter Implementation Plan

**Decision:** Build as native ioBroker adapter (instead of standalone service)

**Admin UI:** Using ioBroker's native JSON Config system - see **JSONCONFIG-PLAN.md** for complete schema and implementation details.

## Why Adapter-First?

✅ **Better for community:**
- Publishable on npm and ioBroker repository
- Standard configuration through ioBroker admin UI
- Other users can install and contribute easily

✅ **Better integration:**
- Native ioBroker state management
- Standard logging and error handling
- Automatic dependency management

✅ **Better UX:**
- All configuration in admin UI (no separate config files)
- Native JSON Config system (no custom React code needed!)
- Visual page and button mapping using table components
- Built-in state picker with tree browser
- Standard ioBroker installation workflow
- Professional UI with i18n support out of the box

---

## Adapter Structure

Based on ioBroker best practices and JSON Config system with multi-device and template support:

```
iobroker.mcdu/
├── admin/
│   ├── jsonConfig.json         # Complete admin UI definition (NO React!)
│   └── index_m.html            # Minimal wrapper (auto-generated)
├── lib/
│   ├── devices/
│   │   ├── mcdu-device.js      # Base device class
│   │   ├── usb-device.js       # USB HID communication
│   │   └── network-device.js   # Network/IP communication
│   ├── templates/
│   │   ├── template-engine.js  # Template rendering and mapping
│   │   ├── base-template.js    # Base template class
│   │   └── definitions/
│   │       ├── solar.js        # Solar panel template
│   │       ├── heating.js      # Heating control template
│   │       ├── weather.js      # Weather display template
│   │       └── room.js         # Generic room template
│   ├── display-renderer.js     # Display rendering logic
│   ├── page-manager.js         # Page system (multi-device aware)
│   ├── state-mapper.js         # Map ioBroker states to MCDU display
│   ├── device-discovery.js     # Network device search
│   ├── config-manager.js       # Import/export configurations
│   └── metadata-helper.js      # ioBroker metadata utilities
├── main.js                     # Adapter entry point
├── io-package.json             # Adapter metadata & configuration schema
├── package.json
├── README.md
└── test/
    ├── integration.js
    └── templates/
        └── template-tests.js
```

---

## Configuration Schema (io-package.json)

**Note:** This schema is automatically managed by the JSON Config UI defined in `admin/jsonConfig.json`. See **JSONCONFIG-PLAN.md** for the complete UI definition and **TEMPLATES-DESIGN.md** for template system architecture.

```json
{
  "common": {
    "name": "mcdu",
    "title": "MCDU Smart Home Controller",
    "desc": {
      "en": "Control your smart home with multiple MCDU devices using templates and ioBroker metadata",
      "de": "Steuere dein Smart Home mit mehreren MCDU-Geräten über Vorlagen und ioBroker-Metadaten"
    },
    "platform": "Javascript/Node.js",
    "mode": "daemon",
    "icon": "mcdu.png",
    "keywords": ["smart home", "mcdu", "aviation", "usb", "hid", "network", "templates"],
    "type": "hardware"
  },
  "native": {
    "devices": [
      {
        "name": "Main MCDU",
        "ip": "192.168.1.100",
        "port": 5000,
        "connectionType": "network",
        "enabled": true
      }
    ],
    "selectedDevice": 0,
    "displayBrightness": 50,
    "buttonBrightness": 50,
    "lightSensorEnabled": false,
    "lightSensorStateId": "",
    "pages": [
      {
        "deviceId": 0,
        "name": "SOLAR",
        "title": "SOLAR PANEL",
        "template": "solar",
        "templateMapping": {
          "currentPower": "solar.0.power.current",
          "homeConsumption": "solar.0.consumption.home",
          "gridExport": "solar.0.power.grid",
          "batteryCharge": "solar.0.battery.charge"
        },
        "lines": []
      },
      {
        "deviceId": 0,
        "name": "DATA",
        "title": "SYSTEM DATA",
        "template": "custom",
        "templateMapping": {},
        "lines": [
          {
            "label": "WEATHER",
            "stateId": "weather.0.current.temperature",
            "format": "{{value}}°C"
          }
        ]
      }
    ],
    "buttonMappings": [
      {
        "deviceId": 0,
        "button": "LSK_L1",
        "action": "toggle",
        "stateId": "lights.living-room",
        "value": ""
      }
    ]
  },
  "objects": [
    {
      "_id": "info",
      "type": "channel",
      "common": {
        "name": "Information"
      },
      "native": {}
    },
    {
      "_id": "info.connection",
      "type": "state",
      "common": {
        "role": "indicator.connected",
        "name": "Device connected",
        "type": "boolean",
        "read": true,
        "write": false,
        "def": false
      },
      "native": {}
    }
  ]
}
```

---

## Admin UI Features (JSON Config)

**See JSONCONFIG-PLAN.md for complete schema and implementation details.**

### Connection Tab
- USB Vendor ID (text input, default: 0x4098)
- USB Product ID (text input, default: 0xbe62)
- Display brightness (slider, 0-100%)
- Connection info and help text

### Pages Tab
- **Table component** for page management:
  - Add/edit/delete pages
  - Page name (6 chars max, e.g., DATA, MENU)
  - Page title (full title shown on display)
  - **Nested table** for lines (up to 6 per page):
    - Label text (left-aligned)
    - State ID picker (`objectId` component with native ioBroker state browser)
    - Format template ({{value}}, {{timestamp}}, etc.)

### Button Mappings Tab
- **Table component** for button-to-action mapping:
  - Button selector (dropdown: LSK_L1-L6, LSK_R1-R6, DIR, PROG, etc.)
  - Action type (dropdown: setState, toggle, navigate, script)
  - Target state picker (conditional, only for setState/toggle)
  - Value/Page/Script field (context-dependent)

### Advanced Tab
- Debug mode (checkbox)
- Display refresh interval (number input, ms)
- USB reconnect delay (number input, ms)

**Key Benefits:**
- ✅ NO custom React code - everything in `admin/jsonConfig.json`
- ✅ Native ioBroker components (tables, pickers, sliders)
- ✅ Built-in i18n support (en, de, and more)
- ✅ Automatic state management and validation
- ✅ Responsive design out of the box

---

## Implementation Phases

### Phase 0: Adapter Scaffolding (1-2 days)
- Run `npx @iobroker/create-adapter`
- Set up TypeScript + ESLint (NO React needed!)
- Create basic io-package.json schema with multi-device support
- Create initial `admin/jsonConfig.json` with devices tab (see JSONCONFIG-PLAN.md)

### Phase 1: Multi-Device Infrastructure (2-3 days)
- Implement device base class (`lib/devices/mcdu-device.js`)
- Create USB device driver (`lib/devices/usb-device.js`)
- Create network device driver (`lib/devices/network-device.js`)
- Implement device discovery (`lib/device-discovery.js`)
- Add device manager to handle multiple simultaneous connections
- Test device registration and switching

### Phase 2: Template System (3-4 days)
- Create template engine (`lib/templates/template-engine.js`)
- Design base template class (`lib/templates/base-template.js`)
- Implement template definitions:
  - Solar panel template (`lib/templates/definitions/solar.js`)
  - Heating control template (`lib/templates/definitions/heating.js`)
  - Weather display template (`lib/templates/definitions/weather.js`)
  - Generic room template (`lib/templates/definitions/room.js`)
- Create metadata helper (`lib/metadata-helper.js`) to leverage ioBroker object metadata
- Test template rendering and state mapping
- See **TEMPLATES-DESIGN.md** for detailed architecture

### Phase 3: Display and State Integration (2-3 days)
- Implement display rendering (lib/display-renderer.js)
- Create state-to-display mapping (lib/state-mapper.js)
- Implement multi-device page manager (lib/page-manager.js)
- Add brightness controls (display + buttons + light sensor support)
- Support template variables ({{value}}, {{timestamp}}, {{unit}}, etc.)
- Subscribe to relevant states based on active pages
- Handle automatic template field population using ioBroker metadata

### Phase 4: Configuration Management (1-2 days)
- Implement config export/import (`lib/config-manager.js`)
- Add sendto handlers for export/import buttons
- Validate imported configurations
- Handle version migration
- Test save/load workflow

### Phase 5: Admin UI (1-2 hours!)
- ✅ **Already defined in `admin/jsonConfig.json`** (see JSONCONFIG-PLAN.md)
- Test JSON Config UI in ioBroker admin:
  - Devices tab (add/edit/delete devices, network search)
  - Display Settings tab (brightness controls, light sensor)
  - Pages tab (template selection, template mapping, custom pages)
  - Button mappings tab
  - Configuration tab (export/import)
- Verify conditional visibility (template vs custom)
- Test objectId state picker with metadata filtering
- Add/refine i18n translations (en, de)
- NO coding required - just JSON configuration!

### Phase 6: Testing & Polish (2-3 days)
- Integration tests for multi-device scenarios
- Template rendering tests
- Device discovery tests
- Export/import tests
- Error handling and logging
- Documentation (README, template guide, inline help, JSON Config screenshots)
- Prepare for npm/GitHub publication

**Total:** ~3-4 weeks (includes template system and multi-device support)

---

## Adapter Entry Point (main.js)

```javascript
const TemplateEngine = require('./lib/templates/template-engine');
const DeviceManager = require('./lib/devices/device-manager');
const PageManager = require('./lib/page-manager');
const ConfigManager = require('./lib/config-manager');
const DeviceDiscovery = require('./lib/device-discovery');
const MetadataHelper = require('./lib/metadata-helper');

class MCDU extends utils.Adapter {
  constructor(options) {
    super({ ...options, name: 'mcdu' });
    this.deviceManager = null;
    this.pageManagers = new Map(); // One per device
    this.templateEngine = null;
    this.configManager = null;
    this.metadataHelper = null;
  }

  async onReady() {
    // Initialize template engine
    this.templateEngine = new TemplateEngine({
      adapter: this,
      metadataHelper: new MetadataHelper(this)
    });
    
    // Initialize device manager
    this.deviceManager = new DeviceManager({
      devices: this.config.devices,
      adapter: this
    });
    
    // Connect to all enabled devices
    await this.deviceManager.connectAll();
    
    // Initialize page managers for each device
    for (const device of this.deviceManager.getActiveDevices()) {
      const devicePages = this.config.pages.filter(p => p.deviceId === device.id);
      
      const pageManager = new PageManager({
        device: device,
        pages: devicePages,
        templateEngine: this.templateEngine,
        adapter: this
      });
      
      this.pageManagers.set(device.id, pageManager);
      
      // Handle button presses from this device
      device.on('button', (button) => {
        this.handleButton(device.id, button);
      });
      
      // Initial render
      await pageManager.renderCurrentPage();
    }
    
    // Subscribe to brightness control states
    if (this.config.lightSensorEnabled && this.config.lightSensorStateId) {
      this.subscribeForeignStates(this.config.lightSensorStateId);
    }
    
    // Subscribe to all states used in pages
    this.subscribeToPageStates();
    
    // Initialize config manager
    this.configManager = new ConfigManager({
      adapter: this
    });
    
    // Set up message handlers for admin UI
    this.setupMessageHandlers();
  }
  
  async onStateChange(id, state) {
    // Handle light sensor changes
    if (id === this.config.lightSensorStateId && this.config.lightSensorEnabled) {
      this.adjustBrightness(state.val);
      return;
    }
    
    // Update display on all devices showing this state
    for (const [deviceId, pageManager] of this.pageManagers) {
      await pageManager.updateState(id, state);
    }
  }
  
  handleButton(deviceId, button) {
    // Find button mapping for this device
    const mapping = this.config.buttonMappings.find(
      m => m.deviceId === deviceId && m.button === button.id
    );
    
    if (mapping) {
      this.executeAction(mapping);
    } else {
      // Default navigation behavior
      const pageManager = this.pageManagers.get(deviceId);
      if (pageManager) {
        pageManager.handleButton(button);
      }
    }
  }
  
  setupMessageHandlers() {
    this.on('message', async (obj) => {
      if (obj.command === 'searchDevices') {
        const discovery = new DeviceDiscovery();
        const devices = await discovery.scan();
        this.sendTo(obj.from, obj.command, devices, obj.callback);
      }
      
      if (obj.command === 'exportConfig') {
        const exportData = await this.configManager.exportConfig();
        this.sendTo(obj.from, obj.command, exportData, obj.callback);
      }
      
      if (obj.command === 'importConfig') {
        const result = await this.configManager.importConfig(obj.message);
        this.sendTo(obj.from, obj.command, result, obj.callback);
      }
    });
  }
  
  subscribeToPageStates() {
    const stateIds = new Set();
    
    for (const page of this.config.pages) {
      if (page.template === 'custom') {
        // Custom pages: subscribe to explicitly defined states
        for (const line of page.lines) {
          if (line.stateId) {
            stateIds.add(line.stateId);
          }
        }
      } else {
        // Template pages: get states from template mapping
        const states = this.templateEngine.getRequiredStates(page.template, page.templateMapping);
        states.forEach(id => stateIds.add(id));
      }
    }
    
    // Subscribe to all unique states
    for (const stateId of stateIds) {
      this.subscribeForeignStates(stateId);
    }
  }
  
  async adjustBrightness(luxValue) {
    // Calculate brightness based on ambient light
    // Simple algorithm: 0-100 lux -> 20-100% brightness
    const displayBrightness = Math.max(20, Math.min(100, (luxValue / 100) * 80 + 20));
    const buttonBrightness = Math.max(10, Math.min(100, (luxValue / 100) * 70 + 10));
    
    // Apply to all devices
    for (const device of this.deviceManager.getActiveDevices()) {
      await device.setDisplayBrightness(displayBrightness);
      await device.setButtonBrightness(buttonBrightness);
    }
  }
  
  async onUnload(callback) {
    try {
      // Disconnect all devices
      await this.deviceManager.disconnectAll();
      callback();
    } catch (e) {
      callback();
    }
  }
}

module.exports = MCDU;
```

---

## Summary of Integrated Requirements

### ✅ Multi-Device Support
- **Device discovery** - Network search for MCDU devices (`lib/device-discovery.js`)
- **Device registration** - Manual IP/port configuration
- **Device manager** - Handle multiple simultaneous connections
- **Per-device configuration** - Pages and buttons mapped to specific devices

### ✅ Template System
- **Template engine** - Render pages from templates (`lib/templates/template-engine.js`)
- **Template definitions** - Solar, Heating, Weather, Room templates
- **Metadata integration** - Use ioBroker function, room, type, role metadata
- **Smart suggestions** - Suggest appropriate states based on template fields
- **Validation** - Ensure mapped states match expected roles/types

### ✅ Configuration Save/Load
- **Config manager** - Export/import configurations (`lib/config-manager.js`)
- **sendto handlers** - Export and import via admin UI buttons
- **Version migration** - Handle configuration format updates

### ✅ Brightness Controls
- **Display brightness** - Separate control from button brightness
- **Button brightness** - Independent backlight control
- **Light sensor** - Automatic brightness adjustment based on ambient light
- **Light sensor state** - Subscribe to ioBroker state for lux values

### ✅ ioBroker Metadata Integration
- **Metadata helper** - Query and filter states by metadata (`lib/metadata-helper.js`)
- **Enum support** - Use room and function enums
- **Role-based filtering** - Find states by role (temperature, humidity, switch, etc.)
- **Unit handling** - Automatic unit formatting from metadata

### 🔮 Future: Notification Functions
- Architecture prepared for notification templates
- Event-driven display updates
- Support for alerts and system messages

---

## Next Steps

1. **Run create-adapter interactively** to scaffold the project:
   ```bash
   cd workspace/coding-projects/mcdu-smarthome
   npx @iobroker/create-adapter@latest
   ```

2. **Answer questions:**
   - Adapter name: `mcdu`
   - Title: "MCDU Smart Home Controller"
   - Language: TypeScript
   - Features: **JSON Config**, ESLint, tests (NO React!)
   - Category: hardware
   - Start mode: daemon

3. **Implement core systems** following implementation phases:
   - Phase 1: Multi-device infrastructure
   - Phase 2: Template system (see TEMPLATES-DESIGN.md)
   - Phase 3: Display and state integration
   - Phase 4: Configuration management

4. **Copy hardware code** from RESEARCH.md into `lib/devices/`

5. **Update io-package.json** with multi-device schema (see above)

6. **Create `admin/jsonConfig.json`** with complete UI definition (see JSONCONFIG-PLAN.md)
   - NO React coding required!
   - All UI defined in JSON

7. **Test end-to-end:**
   - Device discovery
   - Template page creation
   - Configuration export/import
   - Multi-device control

---

## Publishing

Once ready:
1. Push to GitHub: `https://github.com/YOUR_USERNAME/ioBroker.mcdu`
2. Publish to npm: `npm publish`
3. Submit to ioBroker repository: Create PR to [ioBroker/ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories)
4. Document templates and provide example configurations

