# Getting Started with the ioBroker MCDU Adapter

> **Note:** This document was written during the initial scaffolding phase. The project has since evolved significantly. For current setup instructions, see the main [README](../README.md) and the [Page Configuration Guide](./PAGE-CONFIGURATION-GUIDE.md).

## Prerequisites

1. **Development machine** (Mac/Linux)
   - Node.js 12+ installed
   - npm installed
   - Git configured

2. **ioBroker test instance** (recommended)
   - LXC container, VM, or Docker
   - Running ioBroker installation with dev-server

3. **MQTT broker** (e.g., Mosquitto)
   - The adapter connects to the MCDU hardware via MQTT, not direct USB

## Development Setup

```bash
git clone https://github.com/Flixhummel/mcdu.git
cd mcdu
npm install
npm test          # Run all tests (mocha)
npm run lint      # ESLint
npm run check     # Lint + test combined
```

The adapter is pure JavaScript with no build step. `main.js` is the entry point.

The Admin UI uses ioBroker's JSON Config system (`admin/jsonConfig.json`), not React.

## Project Structure

```
iobroker.mcdu/
├── main.js                 # Adapter entry point
├── lib/                    # Core modules (mqtt, rendering, input, state, templates)
├── admin/
│   ├── jsonConfig.json     # Admin UI schema
│   └── mcdu.png            # Adapter icon
├── mcdu-client/            # Raspberry Pi MQTT-to-USB bridge
├── test/                   # Mocha tests
├── io-package.json         # Adapter metadata
└── package.json
```

## Configuration

The adapter is configured through the ioBroker Admin UI:

- **General Settings** -- MQTT broker address, performance tuning
- **Device & Pages** -- Per-device page configuration, default color, brightness step
- **Function Keys** -- Map 11 function keys to page navigation
- **Advanced & About** -- Debug logging, version info

The MQTT broker defaults to `localhost:1883`. Change this in the Admin UI to point to your broker.

## Testing with dev-server

Use ioBroker's `dev-server` for local testing against a real ioBroker instance. See the main [README](../README.md) for the full test workflow.

## Further Reading

- [Page Configuration Guide](./PAGE-CONFIGURATION-GUIDE.md) -- how to set up pages
- [Automation Quickstart](./AUTOMATION-QUICKSTART.md) -- scripting with 32 automation states
- [Architecture](./architecture/ARCHITECTURE-REVISION.md) -- system design
- [UX Concept](./ux-concept/UX-CONCEPT.md) -- cockpit UX patterns
- [ioBroker adapter development docs](https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/adapterdev.md)
