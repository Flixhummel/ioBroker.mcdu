# Getting Started: Creating the ioBroker MCDU Adapter

## Prerequisites

1. **Development machine** (Mac/Linux)
   - Node.js 18+ installed
   - npm 9+ installed
   - Git configured

2. **ioBroker test instance** (optional but recommended)
   - Raspberry Pi, VM, or Docker container
   - Running ioBroker installation for testing

---

## Step 1: Scaffold the Adapter

Run the official ioBroker adapter creator:

```bash
cd /Users/kiraholt/.openclaw/workspace/coding-projects/mcdu-smarthome
npx @iobroker/create-adapter@latest
```

**Answer the questions:**

```
? Adapter name: mcdu
? Title: MCDU Smart Home Controller  
? Description: Control your smart home with a WinWing MCDU flight control unit
? Keywords: smart home, mcdu, aviation, usb, hid
? Category: hardware
? Programming language: TypeScript
? Use ESLint: Yes
? Use Prettier: Yes
? Admin UI type: React
? Include settings page: Yes
? Include extra tab: Yes (for live MCDU preview)
? Include custom datapoint options: No
? Start mode: daemon
? License: MIT
? Author name: Felix Hummel
? Author email: hummelimages@gmail.com
? Author GitHub username: Flixhummel
```

This creates:
```
iobroker.mcdu/
├── admin/              # React-based admin UI
├── src/                # TypeScript source
├── io-package.json     # Adapter metadata
├── package.json
└── ...
```

---

## Step 2: Install Dependencies

```bash
cd iobroker.mcdu
npm install

# Add USB HID support
npm install node-hid --save

# Add additional dependencies
npm install js-yaml joi --save
```

---

## Step 3: Add Hardware Code

Copy the USB HID communication code from `RESEARCH.md` into your adapter:

1. Create `src/lib/mcdu-device.ts` (USB communication)
2. Create `src/lib/display-renderer.ts` (display rendering)
3. Create `src/lib/page-manager.ts` (page system)

Reference implementation details in:
- `RESEARCH.md` - Hardware protocol details
- `ARCHITECTURE.md` - Component design
- `ADAPTER-PLAN.md` - Adapter-specific structure

---

## Step 4: Configure io-package.json

Update `io-package.json` with the configuration schema:

```json
{
  "native": {
    "usbVendorId": "0x4098",
    "usbProductId": "0xbe62",
    "brightness": 50,
    "pages": [],
    "buttonMappings": []
  }
}
```

See `ADAPTER-PLAN.md` for full schema example.

---

## Step 5: Build Admin UI

The create-adapter tool creates a React-based admin UI template in `admin/`.

**Add components:**
- `admin/src/components/PageEditor.tsx` - Visual page configuration
- `admin/src/components/ButtonMapper.tsx` - Button mapping UI
- `admin/src/components/StateSelector.tsx` - Dropdown to select ioBroker states

**Admin UI features:**
1. USB device selection and status
2. Display brightness slider
3. Page configuration (add/edit/remove pages)
4. Button mapping (visual button layout)
5. Live preview in custom tab (optional)

---

## Step 6: Implement Main Adapter Logic

Edit `src/main.ts`:

```typescript
import { MCDUDevice } from './lib/mcdu-device';
import { PageManager } from './lib/page-manager';

class MCDU extends utils.Adapter {
  private mcduDevice: MCDUDevice | null = null;
  private pageManager: PageManager | null = null;

  async onReady(): Promise<void> {
    // Connect to MCDU hardware
    this.mcduDevice = new MCDUDevice({
      vendorId: this.config.usbVendorId,
      productId: this.config.usbProductId
    });
    
    await this.mcduDevice.connect();
    
    // Initialize page system
    this.pageManager = new PageManager({
      pages: this.config.pages,
      device: this.mcduDevice,
      adapter: this
    });
    
    // Subscribe to all states (we'll filter in page manager)
    this.subscribeStates('*');
    
    // Handle button presses
    this.mcduDevice.on('button', this.handleButton.bind(this));
    
    // Render initial page
    await this.pageManager.renderCurrentPage();
  }
  
  async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
    if (state && this.pageManager) {
      await this.pageManager.updateState(id, state);
    }
  }
  
  private handleButton(button: { id: string; pressed: boolean }): void {
    if (!button.pressed) return; // Only handle press, not release
    
    // Check for custom button mappings first
    const mapping = this.config.buttonMappings.find(m => m.button === button.id);
    
    if (mapping) {
      this.executeButtonAction(mapping);
    } else {
      // Default page navigation
      this.pageManager?.handleButton(button);
    }
  }
}
```

---

## Step 7: Test Locally

```bash
# Build the adapter
npm run build

# Link adapter for local testing
npm link

# In your ioBroker installation
cd /opt/iobroker
iobroker add mcdu

# Start adapter
iobroker start mcdu

# View logs
iobroker logs mcdu
```

---

## Step 8: Debug & Iterate

**Useful commands:**

```bash
# Rebuild after changes
npm run build

# Restart adapter
iobroker restart mcdu

# View real-time logs
iobroker logs mcdu --watch

# Check adapter status
iobroker status mcdu
```

**Admin UI development:**
The React admin UI hot-reloads during development. Just save your changes and refresh the ioBroker admin page.

---

## Step 9: Prepare for Publication

Once working:

1. **Update README.md** with:
   - Installation instructions
   - Configuration examples
   - Supported hardware
   - Screenshots

2. **Add screenshots** to `admin/` folder

3. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial adapter implementation"
   git remote add origin https://github.com/Flixhummel/ioBroker.mcdu.git
   git push -u origin main
   ```

4. **Publish to npm:**
   ```bash
   npm publish
   ```

5. **Submit to ioBroker repository:**
   - Create PR to [ioBroker/ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories)
   - Add your adapter to `sources-dist-stable.json`

---

## Next Steps

- Read `ADAPTER-PLAN.md` for detailed implementation phases
- Review `RESEARCH.md` for hardware protocol details
- Check `ARCHITECTURE.md` for component design
- Start with Phase 0 (scaffolding) using the steps above

---

**Questions?** Check the [ioBroker adapter development docs](https://github.com/ioBroker/ioBroker.docs/blob/master/docs/en/dev/adapterdev.md)
