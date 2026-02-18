# MCDU Smart Home Controller - Documentation

Complete project documentation for the MCDU (Multipurpose Control and Display Unit) smart home adapter.

## 📁 Documentation Structure

### `/architecture/`
Architecture decisions and system design:
- **ARCHITECTURE.md** - Overall system architecture
- **ARCHITECTURE-DECISION.md** - Why ioBroker adapter approach
- **ARCHITECTURE-REVISION.md** - Multi-device architecture redesign
- **IOBROKER-ADAPTER-ARCHITECTURE.md** - Detailed adapter architecture

### `/implementation/`
Implementation plans and technical designs:
- **IMPLEMENTATION-PLAN.md** - Step-by-step implementation guide
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
- **PHASE1-DELIVERY-REPORT.md** - Hardware + MQTT client
- **PHASE2-DELIVERY-REPORT.md** - Button mapping + protocols
- **PHASE2-SUMMARY.md** - Phase 2 summary
- **PHASE3A-SPEC.md** - MQTT protocol specification
- **PHASE3A-COMPLETE.md** - Phase 3A completion
- **PHASE4-DELIVERY-REPORT.md** - Automation states
- **PHASE-4.1-IMPLEMENTATION-SUMMARY.md** - Extended automation
- **DEPLOYMENT-COMPLETE.md** - Deployment status
- **PROGRESS.md** - Overall progress tracking
- **STATUS-SUMMARY.md** - Current status
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

## 🚀 Quick Links

- **Start Here:** [GETTING-STARTED.md](./GETTING-STARTED.md)
- **Architecture Overview:** [architecture/ARCHITECTURE-REVISION.md](./architecture/ARCHITECTURE-REVISION.md)
- **Latest Implementation Plan:** [implementation/IMPLEMENTATION-PLAN.md](./implementation/IMPLEMENTATION-PLAN.md)
- **UX Design:** [ux-concept/UX-CONCEPT.md](./ux-concept/UX-CONCEPT.md)

## 📊 Project Status

See [phases/READY-FOR-PUBLISHING.md](./phases/READY-FOR-PUBLISHING.md) for current status and publishing checklist.

## 🔧 Technical Documentation

Main repository README: [../README.md](../README.md)

For adapter code documentation, see:
- `/lib/` - Core library modules
- `/mcdu-client/` - Raspberry Pi client
- `/admin/` - Admin UI configuration
