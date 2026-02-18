# MCDU Template System Design

**Purpose:** Provide pre-built, opinionated page layouts that automatically map to ioBroker's metadata structure, making it easy to create common smart home displays without manual configuration.

---

## Core Philosophy

### 🎯 Leverage ioBroker Metadata

**Don't reinvent the wheel** - ioBroker already has rich metadata on every object:

- **`common.function`** - What the device does (e.g., "Light", "Heating", "Weather")
- **`common.room`** - Where it is (e.g., "Living room", "Bedroom")
- **`common.type`** - Data type (number, boolean, string)
- **`common.role`** - Semantic role (e.g., "temperature", "humidity", "switch")
- **`common.states`** - Valid values for enums (e.g., {0: "OFF", 1: "ON"})
- **`common.unit`** - Unit of measurement (e.g., "°C", "W", "%")

Templates use this metadata to:
1. **Suggest appropriate states** when user selects a template
2. **Auto-format values** with correct units
3. **Provide semantic labels** based on role
4. **Validate mappings** (e.g., temperature field needs a temperature role)

### 🧩 Flexible but Opinionated

Templates are **flexible** (users can override any mapping) but **opinionated** (they suggest the best default layout and formatting).

**Example:** Solar template has predefined fields (current power, home consumption, grid export, battery charge), but users can map any ioBroker state to these fields - not just solar.0.* objects.

---

## Template Architecture

### Base Template Class

All templates extend `BaseTemplate`:

```javascript
// lib/templates/base-template.js

class BaseTemplate {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.fields = config.fields; // Required fields for this template
    this.layout = config.layout; // Display layout definition
  }
  
  /**
   * Get suggested states based on ioBroker metadata
   * @param {Object} metadata - MetadataHelper instance
   * @param {Object} filters - Optional filters (room, function)
   * @returns {Object} field -> [suggested state IDs]
   */
  getSuggestedStates(metadata, filters = {}) {
    const suggestions = {};
    
    for (const field of this.fields) {
      suggestions[field.id] = metadata.findStates({
        role: field.expectedRole,
        function: field.expectedFunction,
        room: filters.room,
        type: field.expectedType
      });
    }
    
    return suggestions;
  }
  
  /**
   * Validate a mapping
   * @param {Object} mapping - User's field -> state mapping
   * @param {Object} metadata - MetadataHelper instance
   * @returns {Object} { valid: boolean, errors: [] }
   */
  validateMapping(mapping, metadata) {
    const errors = [];
    
    for (const field of this.fields) {
      if (field.required && !mapping[field.id]) {
        errors.push(`Field "${field.id}" is required`);
        continue;
      }
      
      if (mapping[field.id]) {
        const stateObj = metadata.getObject(mapping[field.id]);
        
        // Check role compatibility
        if (field.expectedRole && stateObj.common.role !== field.expectedRole) {
          errors.push(`Field "${field.id}" expects role "${field.expectedRole}", got "${stateObj.common.role}"`);
        }
        
        // Check type compatibility
        if (field.expectedType && stateObj.common.type !== field.expectedType) {
          errors.push(`Field "${field.id}" expects type "${field.expectedType}", got "${stateObj.common.type}"`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Render the template with given mapping and current state values
   * @param {Object} mapping - field -> state ID
   * @param {Object} stateValues - state ID -> current value
   * @param {Object} metadata - MetadataHelper instance
   * @returns {Array} Array of display lines
   */
  render(mapping, stateValues, metadata) {
    const lines = [];
    
    for (const layoutLine of this.layout) {
      const fieldId = layoutLine.fieldId;
      const stateId = mapping[fieldId];
      
      if (!stateId) {
        // Field not mapped, show placeholder
        lines.push({
          label: layoutLine.label,
          value: '---',
          color: 'dim'
        });
        continue;
      }
      
      const value = stateValues[stateId];
      const stateObj = metadata.getObject(stateId);
      
      // Format value based on template format or metadata
      const formattedValue = this.formatValue(
        value,
        layoutLine.format || '{{value}}{{unit}}',
        stateObj
      );
      
      lines.push({
        label: layoutLine.label,
        value: formattedValue,
        color: layoutLine.color || 'white'
      });
    }
    
    return lines;
  }
  
  /**
   * Format a value using template string and metadata
   */
  formatValue(value, formatString, stateObj) {
    if (value === null || value === undefined) {
      return '---';
    }
    
    // Handle boolean states
    if (stateObj.common.type === 'boolean') {
      if (stateObj.common.states) {
        return stateObj.common.states[value ? 1 : 0] || (value ? 'ON' : 'OFF');
      }
      return value ? 'ON' : 'OFF';
    }
    
    // Handle enum states
    if (stateObj.common.states && typeof value === 'number') {
      return stateObj.common.states[value] || value.toString();
    }
    
    // Replace template variables
    let formatted = formatString
      .replace('{{value}}', this.formatNumber(value, stateObj))
      .replace('{{unit}}', stateObj.common.unit || '')
      .replace('{{name}}', stateObj.common.name || '')
      .replace('{{timestamp}}', new Date().toLocaleTimeString());
    
    return formatted.trim();
  }
  
  /**
   * Format numeric value with appropriate precision
   */
  formatNumber(value, stateObj) {
    if (typeof value !== 'number') {
      return value.toString();
    }
    
    // Determine precision based on unit or role
    let decimals = 0;
    
    if (stateObj.common.unit === '°C' || stateObj.common.unit === '°F') {
      decimals = 1;
    } else if (stateObj.common.role?.includes('percentage') || stateObj.common.unit === '%') {
      decimals = 0;
    } else if (stateObj.common.role?.includes('power') || stateObj.common.unit === 'W') {
      decimals = value > 1000 ? 0 : 1;
    } else if (stateObj.common.role?.includes('humidity')) {
      decimals = 0;
    } else {
      decimals = value > 100 ? 0 : 1;
    }
    
    return value.toFixed(decimals);
  }
}

module.exports = BaseTemplate;
```

---

## Template Field Schema

Each template defines its required fields:

```javascript
{
  id: 'currentPower',           // Unique field identifier
  name: 'Current Power',        // Human-readable name
  description: 'Current solar panel power output',
  required: true,               // Is this field mandatory?
  expectedRole: 'value.power',  // Expected ioBroker role
  expectedType: 'number',       // Expected data type
  expectedFunction: null,       // Expected function (null = any)
  expectedUnit: 'W',            // Expected unit (for validation)
  defaultFormat: '{{value}}W'   // Default format string
}
```

---

## Template Definitions

### 1. Solar Panel Template

**Use case:** Display solar panel production, consumption, and battery data

**File:** `lib/templates/definitions/solar.js`

```javascript
const BaseTemplate = require('../base-template');

class SolarTemplate extends BaseTemplate {
  constructor() {
    super({
      id: 'solar',
      name: 'Solar Panel Display',
      description: 'Display solar power production, consumption, and battery status',
      fields: [
        {
          id: 'currentPower',
          name: 'Current Power',
          description: 'Current solar panel power output',
          required: true,
          expectedRole: 'value.power',
          expectedType: 'number',
          expectedUnit: 'W',
          defaultFormat: '{{value}}W'
        },
        {
          id: 'homeConsumption',
          name: 'Home Consumption',
          description: 'Current home power consumption',
          required: true,
          expectedRole: 'value.power',
          expectedType: 'number',
          expectedUnit: 'W',
          defaultFormat: '{{value}}W'
        },
        {
          id: 'gridExport',
          name: 'Grid Export',
          description: 'Power exported to grid (negative = import)',
          required: false,
          expectedRole: 'value.power',
          expectedType: 'number',
          expectedUnit: 'W',
          defaultFormat: '{{value}}W'
        },
        {
          id: 'batteryCharge',
          name: 'Battery Charge',
          description: 'Battery charge level',
          required: false,
          expectedRole: 'value.battery',
          expectedType: 'number',
          expectedUnit: '%',
          defaultFormat: '{{value}}%'
        },
        {
          id: 'batteryPower',
          name: 'Battery Power',
          description: 'Battery charge/discharge power',
          required: false,
          expectedRole: 'value.power',
          expectedType: 'number',
          expectedUnit: 'W',
          defaultFormat: '{{value}}W'
        },
        {
          id: 'dailyYield',
          name: 'Daily Yield',
          description: 'Total energy produced today',
          required: false,
          expectedRole: 'value.power.consumption',
          expectedType: 'number',
          expectedUnit: 'kWh',
          defaultFormat: '{{value}}kWh'
        }
      ],
      layout: [
        {
          fieldId: 'currentPower',
          label: 'SOLAR',
          color: 'green'
        },
        {
          fieldId: 'homeConsumption',
          label: 'HOME',
          color: 'white'
        },
        {
          fieldId: 'gridExport',
          label: 'GRID',
          color: 'cyan',
          format: '{{value}}W'
        },
        {
          fieldId: 'batteryCharge',
          label: 'BATT',
          color: 'yellow',
          format: '{{value}}%'
        },
        {
          fieldId: 'batteryPower',
          label: 'BATT PWR',
          color: 'yellow'
        },
        {
          fieldId: 'dailyYield',
          label: 'TODAY',
          color: 'green'
        }
      ]
    });
  }
}

module.exports = SolarTemplate;
```

---

### 2. Heating Control Template

**Use case:** Display and control heating system

**File:** `lib/templates/definitions/heating.js`

```javascript
const BaseTemplate = require('../base-template');

class HeatingTemplate extends BaseTemplate {
  constructor() {
    super({
      id: 'heating',
      name: 'Heating Control',
      description: 'Display and control heating system',
      fields: [
        {
          id: 'currentTemp',
          name: 'Current Temperature',
          required: true,
          expectedRole: 'value.temperature',
          expectedType: 'number',
          expectedUnit: '°C'
        },
        {
          id: 'targetTemp',
          name: 'Target Temperature',
          required: true,
          expectedRole: 'level.temperature',
          expectedType: 'number',
          expectedUnit: '°C'
        },
        {
          id: 'mode',
          name: 'Heating Mode',
          required: false,
          expectedRole: 'level.mode.thermostat',
          expectedType: 'number'
        },
        {
          id: 'valvePosition',
          name: 'Valve Position',
          required: false,
          expectedRole: 'value.valve',
          expectedType: 'number',
          expectedUnit: '%'
        },
        {
          id: 'power',
          name: 'Heating Power',
          required: false,
          expectedRole: 'switch.power',
          expectedType: 'boolean'
        }
      ],
      layout: [
        {
          fieldId: 'currentTemp',
          label: 'CURRENT',
          color: 'white',
          format: '{{value}}°C'
        },
        {
          fieldId: 'targetTemp',
          label: 'TARGET',
          color: 'cyan',
          format: '{{value}}°C'
        },
        {
          fieldId: 'mode',
          label: 'MODE',
          color: 'yellow'
        },
        {
          fieldId: 'valvePosition',
          label: 'VALVE',
          color: 'white',
          format: '{{value}}%'
        },
        {
          fieldId: 'power',
          label: 'POWER',
          color: 'green'
        }
      ]
    });
  }
}

module.exports = HeatingTemplate;
```

---

### 3. Weather Display Template

**Use case:** Display weather information

**File:** `lib/templates/definitions/weather.js`

```javascript
const BaseTemplate = require('../base-template');

class WeatherTemplate extends BaseTemplate {
  constructor() {
    super({
      id: 'weather',
      name: 'Weather Display',
      description: 'Display current weather conditions',
      fields: [
        {
          id: 'temperature',
          name: 'Temperature',
          required: true,
          expectedRole: 'value.temperature',
          expectedType: 'number',
          expectedUnit: '°C'
        },
        {
          id: 'humidity',
          name: 'Humidity',
          required: false,
          expectedRole: 'value.humidity',
          expectedType: 'number',
          expectedUnit: '%'
        },
        {
          id: 'pressure',
          name: 'Pressure',
          required: false,
          expectedRole: 'value.pressure',
          expectedType: 'number',
          expectedUnit: 'hPa'
        },
        {
          id: 'windSpeed',
          name: 'Wind Speed',
          required: false,
          expectedRole: 'value.speed.wind',
          expectedType: 'number',
          expectedUnit: 'km/h'
        },
        {
          id: 'condition',
          name: 'Condition',
          required: false,
          expectedRole: 'weather.state',
          expectedType: 'string'
        },
        {
          id: 'forecast',
          name: 'Forecast',
          required: false,
          expectedRole: 'weather.title.forecast',
          expectedType: 'string'
        }
      ],
      layout: [
        {
          fieldId: 'temperature',
          label: 'TEMP',
          color: 'white',
          format: '{{value}}°C'
        },
        {
          fieldId: 'humidity',
          label: 'HUMIDITY',
          color: 'cyan',
          format: '{{value}}%'
        },
        {
          fieldId: 'pressure',
          label: 'PRESSURE',
          color: 'white',
          format: '{{value}}hPa'
        },
        {
          fieldId: 'windSpeed',
          label: 'WIND',
          color: 'white',
          format: '{{value}}km/h'
        },
        {
          fieldId: 'condition',
          label: 'NOW',
          color: 'yellow'
        },
        {
          fieldId: 'forecast',
          label: 'FORECAST',
          color: 'green'
        }
      ]
    });
  }
}

module.exports = WeatherTemplate;
```

---

### 4. Generic Room Template

**Use case:** Display room status (temperature, humidity, lights, heating)

**File:** `lib/templates/definitions/room.js`

```javascript
const BaseTemplate = require('../base-template');

class RoomTemplate extends BaseTemplate {
  constructor() {
    super({
      id: 'room-generic',
      name: 'Generic Room',
      description: 'Display room status and controls',
      fields: [
        {
          id: 'temperature',
          name: 'Temperature',
          required: true,
          expectedRole: 'value.temperature',
          expectedType: 'number',
          expectedUnit: '°C'
        },
        {
          id: 'humidity',
          name: 'Humidity',
          required: false,
          expectedRole: 'value.humidity',
          expectedType: 'number',
          expectedUnit: '%'
        },
        {
          id: 'lights',
          name: 'Lights',
          required: false,
          expectedRole: 'switch.light',
          expectedType: 'boolean'
        },
        {
          id: 'heating',
          name: 'Heating',
          required: false,
          expectedRole: 'level.temperature',
          expectedType: 'number',
          expectedUnit: '°C'
        },
        {
          id: 'window',
          name: 'Window Status',
          required: false,
          expectedRole: 'sensor.window',
          expectedType: 'boolean'
        },
        {
          id: 'motion',
          name: 'Motion Sensor',
          required: false,
          expectedRole: 'sensor.motion',
          expectedType: 'boolean'
        }
      ],
      layout: [
        {
          fieldId: 'temperature',
          label: 'TEMP',
          color: 'white',
          format: '{{value}}°C'
        },
        {
          fieldId: 'humidity',
          label: 'HUMIDITY',
          color: 'cyan',
          format: '{{value}}%'
        },
        {
          fieldId: 'lights',
          label: 'LIGHTS',
          color: 'yellow'
        },
        {
          fieldId: 'heating',
          label: 'HEATING',
          color: 'green',
          format: '{{value}}°C'
        },
        {
          fieldId: 'window',
          label: 'WINDOW',
          color: 'white'
        },
        {
          fieldId: 'motion',
          label: 'MOTION',
          color: 'cyan'
        }
      ]
    });
  }
  
  /**
   * Override getSuggestedStates to filter by room
   */
  getSuggestedStates(metadata, filters = {}) {
    // Room templates REQUIRE a room filter
    if (!filters.room) {
      return {};
    }
    
    return super.getSuggestedStates(metadata, filters);
  }
}

module.exports = RoomTemplate;
```

---

## Template Engine

**File:** `lib/templates/template-engine.js`

```javascript
const SolarTemplate = require('./definitions/solar');
const HeatingTemplate = require('./definitions/heating');
const WeatherTemplate = require('./definitions/weather');
const RoomTemplate = require('./definitions/room');

class TemplateEngine {
  constructor(config) {
    this.adapter = config.adapter;
    this.metadataHelper = config.metadataHelper;
    
    // Register all available templates
    this.templates = new Map();
    this.registerTemplate(new SolarTemplate());
    this.registerTemplate(new HeatingTemplate());
    this.registerTemplate(new WeatherTemplate());
    this.registerTemplate(new RoomTemplate());
  }
  
  registerTemplate(template) {
    this.templates.set(template.id, template);
  }
  
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }
  
  getAllTemplates() {
    return Array.from(this.templates.values());
  }
  
  /**
   * Get suggested state mappings for a template
   */
  async getSuggestedMappings(templateId, filters = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }
    
    return template.getSuggestedStates(this.metadataHelper, filters);
  }
  
  /**
   * Validate a page's template mapping
   */
  validatePage(page) {
    if (page.template === 'custom') {
      // Custom pages don't use templates
      return { valid: true, errors: [] };
    }
    
    const template = this.getTemplate(page.template);
    if (!template) {
      return {
        valid: false,
        errors: [`Unknown template: ${page.template}`]
      };
    }
    
    return template.validateMapping(page.templateMapping, this.metadataHelper);
  }
  
  /**
   * Render a page using its template
   */
  async renderPage(page, stateValues) {
    if (page.template === 'custom') {
      // Custom page: use lines directly
      return this.renderCustomPage(page, stateValues);
    }
    
    const template = this.getTemplate(page.template);
    if (!template) {
      throw new Error(`Template "${page.template}" not found`);
    }
    
    return template.render(page.templateMapping, stateValues, this.metadataHelper);
  }
  
  /**
   * Render a custom (non-template) page
   */
  renderCustomPage(page, stateValues) {
    const lines = [];
    
    for (const line of page.lines) {
      const value = stateValues[line.stateId];
      const stateObj = this.metadataHelper.getObject(line.stateId);
      
      // Use simple formatting for custom pages
      let formatted = line.format || '{{value}}';
      formatted = formatted.replace('{{value}}', value !== undefined ? value.toString() : '---');
      
      if (stateObj?.common.unit) {
        formatted = formatted.replace('{{unit}}', stateObj.common.unit);
      }
      
      lines.push({
        label: line.label,
        value: formatted,
        color: 'white'
      });
    }
    
    return lines;
  }
  
  /**
   * Get all state IDs required by a page
   */
  getRequiredStates(templateId, mapping) {
    if (templateId === 'custom') {
      return [];
    }
    
    const template = this.getTemplate(templateId);
    if (!template) {
      return [];
    }
    
    return Object.values(mapping).filter(id => id);
  }
}

module.exports = TemplateEngine;
```

---

## Metadata Helper

**File:** `lib/metadata-helper.js`

```javascript
class MetadataHelper {
  constructor(adapter) {
    this.adapter = adapter;
    this.objectCache = new Map();
  }
  
  /**
   * Get ioBroker object with metadata
   */
  async getObject(stateId) {
    if (this.objectCache.has(stateId)) {
      return this.objectCache.get(stateId);
    }
    
    const obj = await this.adapter.getForeignObjectAsync(stateId);
    this.objectCache.set(stateId, obj);
    return obj;
  }
  
  /**
   * Find states matching criteria
   * @param {Object} criteria - { role, function, room, type }
   * @returns {Array} Array of state IDs
   */
  async findStates(criteria) {
    const allObjects = await this.adapter.getForeignObjectsAsync('*', 'state');
    const matches = [];
    
    for (const [id, obj] of Object.entries(allObjects)) {
      // Check role
      if (criteria.role && obj.common.role !== criteria.role) {
        continue;
      }
      
      // Check type
      if (criteria.type && obj.common.type !== criteria.type) {
        continue;
      }
      
      // Check function
      if (criteria.function) {
        const enums = await this.getEnums(id);
        if (!enums.functions.includes(criteria.function)) {
          continue;
        }
      }
      
      // Check room
      if (criteria.room) {
        const enums = await this.getEnums(id);
        if (!enums.rooms.includes(criteria.room)) {
          continue;
        }
      }
      
      matches.push(id);
    }
    
    return matches;
  }
  
  /**
   * Get enums (functions, rooms) for a state
   */
  async getEnums(stateId) {
    const result = {
      functions: [],
      rooms: []
    };
    
    // Get function enums
    const functionEnums = await this.adapter.getForeignObjectsAsync('enum.functions.*', 'enum');
    for (const [id, enumObj] of Object.entries(functionEnums)) {
      if (enumObj.common.members && enumObj.common.members.includes(stateId)) {
        result.functions.push(enumObj.common.name);
      }
    }
    
    // Get room enums
    const roomEnums = await this.adapter.getForeignObjectsAsync('enum.rooms.*', 'enum');
    for (const [id, enumObj] of Object.entries(roomEnums)) {
      if (enumObj.common.members && enumObj.common.members.includes(stateId)) {
        result.rooms.push(enumObj.common.name);
      }
    }
    
    return result;
  }
  
  /**
   * Get all available rooms
   */
  async getRooms() {
    const roomEnums = await this.adapter.getForeignObjectsAsync('enum.rooms.*', 'enum');
    return Object.values(roomEnums).map(e => ({
      id: e._id,
      name: e.common.name
    }));
  }
  
  /**
   * Get all available functions
   */
  async getFunctions() {
    const functionEnums = await this.adapter.getForeignObjectsAsync('enum.functions.*', 'enum');
    return Object.values(functionEnums).map(e => ({
      id: e._id,
      name: e.common.name
    }));
  }
}

module.exports = MetadataHelper;
```

---

## How Templates Work: Complete Flow

### 1. User Selects Template in Admin UI

1. User creates new page
2. Selects "Solar Panel" from template dropdown
3. Template mapping panel appears with predefined fields

### 2. Adapter Suggests States

```javascript
// When template is selected, adapter calls:
const suggestions = await templateEngine.getSuggestedMappings('solar', {
  room: null // or specific room if room template
});

// Returns:
{
  currentPower: ['solar.0.power.current', 'inverter.0.power'],
  homeConsumption: ['solar.0.consumption.home', 'meter.0.consumption'],
  gridExport: ['solar.0.power.grid'],
  batteryCharge: ['solar.0.battery.charge', 'battery.0.soc']
}
```

### 3. User Maps Fields

User selects from suggestions or manually picks states:
- Current Power → `solar.0.power.current`
- Home Consumption → `solar.0.consumption.home`
- Grid Export → `solar.0.power.grid`
- Battery Charge → `solar.0.battery.charge`

### 4. Adapter Validates Mapping

```javascript
const validation = templateEngine.validatePage(page);
if (!validation.valid) {
  // Show errors in UI
  console.error(validation.errors);
}
```

### 5. Adapter Renders Page

```javascript
// Get current state values
const stateValues = {
  'solar.0.power.current': 3500,
  'solar.0.consumption.home': 2800,
  'solar.0.power.grid': 700,
  'solar.0.battery.charge': 85
};

// Render page
const lines = await templateEngine.renderPage(page, stateValues);

// Returns:
[
  { label: 'SOLAR', value: '3500W', color: 'green' },
  { label: 'HOME', value: '2800W', color: 'white' },
  { label: 'GRID', value: '700W', color: 'cyan' },
  { label: 'BATT', value: '85%', color: 'yellow' }
]
```

### 6. Display on MCDU

PageManager sends rendered lines to MCDU device with correct formatting and colors.

---

## Benefits of This Approach

### ✅ **Don't Reinvent the Wheel**
- Leverages ioBroker's existing metadata structure
- Uses enums (rooms, functions) already configured in ioBroker
- Respects data types, roles, and units

### ✅ **Smart Suggestions**
- Templates suggest appropriate states based on role and function
- Users can override if needed (flexibility)
- Validation prevents mapping errors

### ✅ **Opinionated but Flexible**
- Pre-built layouts for common scenarios (solar, heating, weather)
- Custom template for complete control
- Easy to add new templates

### ✅ **Maintainable**
- Template definitions are simple JavaScript classes
- Easy to add new templates without changing core code
- Clear separation: templates define what, engine handles how

### ✅ **User-Friendly**
- No manual layout configuration for common cases
- Automatic formatting with units
- Visual feedback with colors

---

## Future Enhancements

### Notification Templates
Support for notification/alert pages:
- Emergency alerts (fire, water leak)
- Doorbell notifications
- Security system events

### Dynamic Templates
Templates that adapt based on available states:
- Auto-detect solar inverter type
- Support different heating system types
- Room templates that show only available sensors

### Template Marketplace
- Community-contributed templates
- Import/export template definitions
- Template versioning

---

## Summary

The template system provides:
1. **Pre-built page layouts** for common scenarios (solar, heating, weather, rooms)
2. **Smart state suggestions** based on ioBroker metadata (role, function, room, type)
3. **Automatic formatting** with units and colors
4. **Validation** to prevent configuration errors
5. **Flexibility** to override any mapping or use custom pages

All while **respecting ioBroker's existing structure** and **not reinventing the wheel**. 🎯
