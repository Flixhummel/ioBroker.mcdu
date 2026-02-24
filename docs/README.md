# MCDU Smart Home Controller - Documentation

Complete project documentation for the ioBroker MCDU adapter (v0.1.0 pre-release).

## Documentation Structure

### Root Documentation
- **[PAGE-CONFIGURATION-GUIDE.md](./PAGE-CONFIGURATION-GUIDE.md)** - Page configuration reference (start here for page setup)
- **[AUTOMATION-QUICKSTART.md](./AUTOMATION-QUICKSTART.md)** - Home automation scripting with 32 automation states
- **[MQTT-TEST-COMMANDS.md](./MQTT-TEST-COMMANDS.md)** - MQTT testing commands for manual debugging
- **[MULTI-COLOR-FEATURE.md](./MULTI-COLOR-FEATURE.md)** - Multi-color display segments (per-character colors)
- **[GETTING-STARTED.md](./GETTING-STARTED.md)** - Original scaffolding notes (historical)

### `/architecture/`
Architecture decisions and system design:
- **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** - Overall system architecture
- **[ARCHITECTURE-DECISION.md](./architecture/ARCHITECTURE-DECISION.md)** - Why ioBroker adapter approach
- **[ARCHITECTURE-REVISION.md](./architecture/ARCHITECTURE-REVISION.md)** - Multi-device architecture redesign
- **[IOBROKER-ADAPTER-ARCHITECTURE.md](./architecture/IOBROKER-ADAPTER-ARCHITECTURE.md)** - Detailed adapter architecture

### `/research/`
Research, requirements, and analysis:
- **[RESEARCH.md](./research/RESEARCH.md)** - Initial research findings
- **[REFERENCES.md](./research/REFERENCES.md)** - API references and external docs
- **[ADAPTER-CREATOR-COMPARISON.md](./research/ADAPTER-CREATOR-COMPARISON.md)** - Tool comparison
- **[requirements.md](./research/requirements.md)** - Project requirements

### `/ux-concept/`
UX design and user experience documentation:
- **[UX-CONCEPT.md](./ux-concept/UX-CONCEPT.md)** - Authentic MCDU cockpit UX patterns
- Scratchpad system, input modes, LSK behavior
- Visual feedback, validation, state machines

## Quick Links

- **Page Setup:** [PAGE-CONFIGURATION-GUIDE.md](./PAGE-CONFIGURATION-GUIDE.md)
- **Architecture Overview:** [architecture/ARCHITECTURE-REVISION.md](./architecture/ARCHITECTURE-REVISION.md)
- **UX Design:** [ux-concept/UX-CONCEPT.md](./ux-concept/UX-CONCEPT.md)

## Technical Documentation

Main repository README: [../README.md](../README.md)

For adapter code documentation, see:
- `/lib/` - Core library modules (mqtt, rendering, input, state, templates)
- `/mcdu-client/` - Raspberry Pi client ([README](../mcdu-client/README.md), [Pi Setup](../mcdu-client/PI-SETUP.md))
- `/admin/` - Admin UI configuration (jsonConfig)
