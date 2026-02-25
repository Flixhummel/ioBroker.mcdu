# ioBroker jsonConfig Capabilities Research

**Date:** 2026-02-19
**Sources:**
- [jsonConfig README](https://github.com/ioBroker/ioBroker.admin/blob/master/packages/jsonConfig/README.md)
- [jsonConfig Demo Adapter](https://github.com/mcm4iob/ioBroker.jsonconfig-demo)
- [Custom Component Template](https://github.com/ioBroker/ioBroker.admin-component-template)
- [smoothed adapter example](https://app.unpkg.com/iobroker.smoothed@1.1.0/files/admin/jsonConfig.json)

---

## 1. Complete Widget Type Reference

### Structure/Container Types
| Type | Description | Min Admin |
|------|-------------|-----------|
| `tabs` | Tab container with navigation | - |
| `panel` | Panel/section container, can be collapsible | - |
| `accordion` | Collapsible item list (add/delete/reorder) | 6.6.0 |
| `table` | Editable data table (add/delete/reorder) | - |

### Input Types
| Type | Description | Key Props |
|------|-------------|-----------|
| `text` | Single/multi-line text | maxLength, trim, validateJson, minRows/maxRows |
| `number` | Numeric input | min, max, step, unit |
| `password` | Masked input | repeat, visible |
| `checkbox` | Boolean toggle | - |
| `select` | Dropdown | options (array), multiple (7.6.5+) |
| `autocomplete` | Text with suggestions | options, freeSolo |
| `slider` | Range selector | min, max, step |
| `color` | Color picker | noClearButton |
| `datePicker` | Date selector | - |
| `timePicker` | Time selector | format, views, timeSteps |
| `cron` | CRON expression builder | complex, simple |
| `chips` | Comma-separated → array | delimiter |
| `jsonEditor` | JSON/JSON5 editor modal | validateJson, json5, readOnly |
| `yamlEditor` | YAML editor | validateYaml (7.7.30+) |

### Object/State Selection
| Type | Description | Key Props |
|------|-------------|-----------|
| `objectId` | Select ioBroker object | types, root, customFilter, filterFunc |
| `instance` | Select adapter instance | adapter, adapters, onlyEnabled, long/short |
| `user` | Select system user | short |
| `room` | Select from enum.room | short, allowDeactivate |
| `func` | Select from enum.func | short, allowDeactivate |

### Backend Communication (sendTo)
| Type | Description | Key Props |
|------|-------------|-----------|
| `sendTo` | Button triggering backend command | command, jsonData, data, useNative, showProcess |
| `selectSendTo` | Dropdown from backend | command, jsonData, manual, multiple, alsoDependsOn |
| `autocompleteSendTo` | Autocomplete from backend | command, jsonData, freeSolo, alsoDependsOn |
| `textSendTo` | Read-only from backend | command, container (div/text/html) |
| `imageSendTo` | Image from backend base64 | command, width, height |

### Display/Static Types
| Type | Description |
|------|-------------|
| `staticText` | Static label text |
| `staticLink` | Clickable link or button |
| `staticImage` | Display image |
| `staticInfo` | Formatted info (7.3.3+) |
| `header` | Section heading (h1-h5) |
| `divider` | Horizontal separator |
| `alive` | Instance status indicator |
| `pattern` | Template-interpolated read-only text |
| `qrCode` | QR code display (7.0.18+) |
| `infoBox` | Closable info panel (7.6.19+) |

### Action Types
| Type | Description |
|------|-------------|
| `setState` | Button setting instance state |
| `state` | Display/control ioBroker state (7.1.0+) |

### Special Types
| Type | Description |
|------|-------------|
| `custom` | Custom React component (Admin 6+) |
| `ip` | IP address input |
| `port` | Port with conflict check |
| `interface` | Network interface selector |
| `coordinates` | Lat/lon picker |
| `certificate` / `certificates` | Cert selectors |
| `oauth2` | OAuth2 auth button (6.17.18+) |
| `license` / `checkLicense` | License handling |
| `uuid` | Display ioBroker UUID |
| `language` | UI language selector |
| `file` / `fileSelector` | File browser/selector |
| `iframe` / `iframeSendTo` | Embedded webpage (7.7.28+) |
| `deviceManager` | Device manager (dm-utils) |
| `checkDocker` | Docker check (7.8.0+) |

---

## 2. Expression Syntax (hidden / disabled / validator)

### Available Variables
- `data` — current config object (or row data in table context)
- `originalData` — unchanged config
- `globalData` — full config (in table/accordion context, access parent data)
- `arrayIndex` — row index (table/accordion context)
- `_system` — system configuration
- `_alive` — instance running status (boolean)
- `_common` — instance common settings
- `_socket` — admin socket
- `_instance` — instance number

### Supported Operators
- `===`, `!==` — equality/inequality
- `&&`, `||` — logical AND/OR
- `!` — negation (**NOTE: our MEMORY.md says `!` doesn't work, but the official docs list it. May work in newer admin versions or may have been fixed. Test carefully.**)
- Comparison: `<`, `>`, `<=`, `>=`
- String/array methods: `.includes()`, `.length`
- Ternary: `condition ? a : b`

### Expression Examples
```json
"hidden": "data.myType === 1"
"hidden": "data.protocol === true && data.lex"
"disabled": "!data.myType"
"validator": "data.myNumber >= 1 && data.myNumber <= 10"
```

### Known Limitations (from our project experience)
- **No `!` negation in older admin versions** — use `=== false` or `=== ''` instead
- **No `pattern` on text type** — `pattern` is a separate widget type, not a text property
- **No nested panel paths in table context** — table columns cannot reference `data.nested.path`
- **No JS functions in expressions** — only simple expressions, not function bodies (except in `validator` and `filterFunc`)
- **Table row context**: Inside table items, `data` refers to the ROW data, not the global config. Use `globalData` to access the parent config.

---

## 3. objectID Widget — Deep Dive

### Properties
```json
{
  "type": "objectId",
  "label": "Select a state",
  "types": ["state"],           // Filter: state, channel, device, adapter, instance, meta, chart, folder, enum
  "root": "0_userdata",         // Only show this subtree
  "customFilter": {             // Object property filter
    "common": {
      "custom": true            // Only objects with custom settings
    }
  },
  "filterFunc": "obj.common && obj.common.type === 'boolean'"  // JS filter function
}
```

### How It Stores Data
- Stores the full object ID string (e.g., `hue.0.lights.lamp1.on`) in `native.{attrName}`
- The value is a plain string

### Usage in Table Columns
- objectId CAN be used as a column type in tables
- Example from smoothed adapter: objectId used inside accordion items (not directly in table columns, but the pattern works)

### Relevance to MCDU
- **LED→state mapping**: Use `objectId` with `types: ["state"]` to let users select which ioBroker state controls each LED
- **Function key→page mapping**: Use `select` or `autocompleteSendTo` for page selection
- Inside accordion items, each LED/key config can have an objectId picker

---

## 4. Table Widget — Deep Dive

### Properties
```json
{
  "type": "table",
  "items": [
    { "type": "text", "attr": "name", "width": "30%", "title": "Name" },
    { "type": "select", "attr": "color", "width": "20%", "title": "Color",
      "options": [{"value": "red", "label": "Red"}, {"value": "green", "label": "Green"}] },
    { "type": "number", "attr": "brightness", "width": "20%", "title": "Brightness",
      "min": 0, "max": 100 },
    { "type": "checkbox", "attr": "enabled", "width": "10%", "title": "Active" }
  ],
  "noDelete": false,
  "uniqueColumns": ["name"],
  "showSecondAddAt": 5,
  "clone": true,
  "export": true,
  "import": true
}
```

### Column Types Supported in Table
- text, number, checkbox, select, color, objectId, autocomplete, instance, password

### Table Row Data Access
- Inside table: `data.columnAttr` refers to current row
- `globalData.tableName` — access the full table array
- `arrayIndex` — current row index

### Limitations
- Complex nested objects in cells not well supported
- Cannot have sub-tables (no table-in-table)
- No accordion inside table cells

---

## 5. Accordion Widget — Deep Dive

### Properties
```json
{
  "type": "accordion",
  "titleAttr": "name",
  "items": [
    { "type": "text", "attr": "name", "label": "Name" },
    { "type": "objectId", "attr": "stateId", "label": "State", "types": ["state"] },
    { "type": "select", "attr": "action", "label": "Action",
      "options": [{"value": "toggle", "label": "Toggle"}, {"value": "set", "label": "Set"}] }
  ],
  "clone": true,
  "noDelete": false
}
```

### Key Features
- Items are collapsible sections
- Each section contains the defined input fields
- Title shown from `titleAttr` attribute
- Add/delete/clone/reorder supported
- Better than table for complex per-item configs (more screen space)

### Relevance to MCDU
- Ideal for page line configurations (already using this)
- Good for LED mapping configs (each LED = one accordion item with objectId + color + mode)

---

## 6. Custom Components

### When to Use
- When jsonConfig native widgets cannot achieve the desired UX
- Examples: drag-and-drop, visual layout editors, real-time preview

### How It Works
1. Create React/TypeScript component using the [admin-component-template](https://github.com/ioBroker/ioBroker.admin-component-template)
2. Build with Vite into `admin/custom/customComponents.js`
3. Reference in jsonConfig.json:
```json
{
  "type": "custom",
  "i18n": true,
  "url": "custom/customComponents.js",
  "name": "McduAdapter/Components/LedMapper",
  "bundlerType": "module"
}
```

### Requirements
- Admin 7+ (for bundlerType: "module")
- React component must follow ioBroker conventions
- Must handle `onChange`, `data`, `socket` props
- Build step required (Vite/TypeScript)

### Effort Assessment
- **jsonConfig-only**: Zero build step, pure JSON, instant iteration
- **Custom component**: Requires React setup, build pipeline, more testing
- **Recommendation**: Start with jsonConfig native widgets. Only go custom if the UX absolutely requires it (e.g., visual MCDU layout preview, drag-and-drop key mapping).

---

## 7. Native Config Storage Patterns

### Simple Values
```json
"native": {
  "mqttBroker": "mqtt://localhost:1883",
  "displayThrottle": 100
}
```

### Arrays of Objects (table/accordion data)
```json
"native": {
  "pages": [
    {
      "name": "Main",
      "lines": [
        { "row": 1, "left": { "label": "TEMP", "display": "", "button": "page:climate" } }
      ]
    }
  ],
  "ledMappings": [
    { "ledId": "LED_1", "stateId": "hue.0.lights.lamp1.on", "color": "green", "mode": "on_off" }
  ],
  "functionKeys": {
    "DIR": "page:directory",
    "PROG": "page:programming",
    "PERF": "page:performance"
  }
}
```

### Per-Device Config (our pattern)
- Stored as JSON string in ioBroker state `devices.{deviceId}.config.pages`
- Loaded/saved via sendTo commands
- Migration from native.pages on first device connect

### Key Consideration
- ioBroker's `native` config is a flat-ish JSON object
- Deeply nested structures work but can be hard to edit via jsonConfig
- For very complex configs, consider storing as JSON string in a state (our current approach for pages)

---

## 8. Recommendations for MCDU PRP

### For LED→State Mapping
Use **accordion** with objectId picker per LED:
```json
{
  "type": "accordion",
  "titleAttr": "ledName",
  "items": [
    { "type": "text", "attr": "ledName", "label": "LED Name", "readOnly": true },
    { "type": "objectId", "attr": "stateId", "label": "ioBroker State", "types": ["state"] },
    { "type": "select", "attr": "color", "label": "Color",
      "options": ["green", "amber", "red", "white"] },
    { "type": "select", "attr": "mode", "label": "Mode",
      "options": ["on_off", "blink", "value_threshold"] }
  ]
}
```

### For Function Key→Page Mapping
Use **table** with select columns:
```json
{
  "type": "table",
  "items": [
    { "type": "text", "attr": "key", "title": "Button", "readOnly": true },
    { "type": "autocompleteSendTo", "attr": "page", "title": "Target Page",
      "command": "getPageList" }
  ]
}
```

### For Page Line Editor (current)
Keep **accordion** with left/right line model — already implemented.

### Custom Component: Only If Needed
Consider custom component ONLY for:
- Visual MCDU display preview (showing how the page will look)
- Drag-and-drop page ordering
- Interactive button-to-page assignment overlay

These are nice-to-have, not blockers. Start with native jsonConfig widgets.
