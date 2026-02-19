# MCDU Smart Home Controller - Documentation

Complete project documentation for the MCDU (Multipurpose Control and Display Unit) smart home adapter.

**Current Status (2026-02-19):** Adapter Phase 3 (Business Logic) complete. 109 tests passing. Phases 4 (Admin UI) and 5 (Hardware Deployment) remain.

## Documentation Structure

### `/architecture/`
Architecture decisions and system design:
- **ARCHITECTURE.md** - Overall system architecture
- **ARCHITECTURE-DECISION.md** - Why ioBroker adapter approach
- **ARCHITECTURE-REVISION.md** - Multi-device architecture redesign
- **IOBROKER-ADAPTER-ARCHITECTURE.md** - Detailed adapter architecture

### `/implementation/`
Implementation plans and technical designs:
- **IMPLEMENTATION-PLAN.md** - Step-by-step implementation guide (Phases 1-5)
- **JSONCONFIG-PLAN.md** - Admin UI configuration design
- **TEMPLATES-DESIGN.md** - Page template system
- **ADAPTER-PLAN.md** - Original adapter planning

### `/research/`
Research, requirements, and analysis:
- **RESEARCH.md** - Initial research findings
- **REFERENCES.md** - API references and external docs
- **ADAPTER-CREATOR-COMPARISON.md** - Tool comparison
- **requirements.md** - Project requirements

### `/phases/`
Phase-by-phase delivery reports:
- **PROGRESS.md** - Overall progress tracking (start here for status)
- **STATUS-SUMMARY.md** - Current status with architecture diagram and module overview
- **PHASE1-DELIVERY-REPORT.md** - Hardware + MQTT client
- **PHASE2-DELIVERY-REPORT.md** - Button mapping + protocols
- **PHASE2-SUMMARY.md** - Phase 2 summary
- **PHASE3A-SPEC.md** - MQTT protocol specification
- **PHASE3A-COMPLETE.md** - Phase 3A completion
- **PHASE3A-COMPLETED.md** - Phase 3A final status
- **PHASE3A-LESSONS-LEARNED.md** - Bugs and learnings from 3A
- **PHASE4-DELIVERY-REPORT.md** - Admin UI and automation states
- **PHASE-4.1-IMPLEMENTATION-SUMMARY.md** - Extended automation (32 new states)
- **DEPLOYMENT-COMPLETE.md** - Deployment status
- **READY-FOR-PUBLISHING.md** - Publishing checklist

### `/ux-concept/`
UX design and user experience documentation:
- **UX-CONCEPT.md** - Authentic MCDU cockpit UX patterns
- Scratchpad system, input modes, LSK behavior
- Visual feedback, validation, state machines

### Root Documentation
- **GETTING-STARTED.md** - Quick start guide
- **AUTOMATION-QUICKSTART.md** - Home automation setup
- **INTEGRATION-SUMMARY.md** - Integration overview
- **MQTT-TEST-COMMANDS.md** - MQTT testing commands
- **MULTI-COLOR-FEATURE.md** - Multi-color display feature
- **PAGE-CONFIGURATION-GUIDE.md** - Page configuration reference

## Quick Links

- **Current Status:** [phases/PROGRESS.md](./phases/PROGRESS.md)
- **Start Here:** [GETTING-STARTED.md](./GETTING-STARTED.md)
- **Architecture Overview:** [architecture/ARCHITECTURE-REVISION.md](./architecture/ARCHITECTURE-REVISION.md)
- **Implementation Plan:** [implementation/IMPLEMENTATION-PLAN.md](./implementation/IMPLEMENTATION-PLAN.md)
- **UX Design:** [ux-concept/UX-CONCEPT.md](./ux-concept/UX-CONCEPT.md)

## Technical Documentation

Main repository README: [../README.md](../README.md)

For adapter code documentation, see:
- `/lib/` - Core library modules (mqtt, rendering, input, state, templates)
- `/mcdu-client/` - Raspberry Pi client
- `/admin/` - Admin UI configuration
- `/test/unit/` - Unit tests (109 tests)
