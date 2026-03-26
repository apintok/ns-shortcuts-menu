# Cross-Browser Extension Support

## Browser API Differences

| Feature | Chrome | Firefox | Edge | Safari |
|---------|--------|---------|------|--------|
| Namespace | `chrome.*` | `browser.*` (promise) | `chrome.*` | `browser.*` |
| Manifest | V3 only | V2 + V3 | V3 only | V2 + V3 |
| Service worker | Required | Optional (event pages OK) | Required | Required |
| Sidebar | `sidePanel` API | `sidebar_action` | `sidePanel` API | N/A |
| Payments | None built-in | None built-in | None built-in | None built-in |

## Polyfill: webextension-polyfill

```bash
npm install webextension-polyfill
npm install -D @types/webextension-polyfill
```

```typescript
import browser from 'webextension-polyfill';

// Works in all browsers - returns promises
const tabs = await browser.tabs.query({ active: true });
await browser.storage.local.set({ key: 'value' });
```

**When to use**: Building for multiple browsers.
**When to skip**: Chrome-only extension.

## Manifest Differences

### Chrome/Edge (MV3)
```json
{
  "manifest_version": 3,
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html" }
}
```

### Firefox (MV3)
```json
{
  "manifest_version": 3,
  "background": { "scripts": ["background.js"] },
  "action": { "default_popup": "popup.html" },
  "browser_specific_settings": {
    "gecko": { "id": "addon@example.com" }
  }
}
```

### Safari (Xcode wrapper)
Safari extensions require Xcode project wrapping. Use `xcrun safari-web-extension-converter` to convert.

## Build Strategy for Multi-Browser

```
src/              # Shared source
├── manifest/
│   ├── base.json     # Shared manifest fields
│   ├── chrome.json   # Chrome-specific overrides
│   └── firefox.json  # Firefox-specific overrides
```

WXT handles this automatically with `--browser chrome|firefox|edge|safari` flag.

## Key Gotchas

1. **Firefox requires addon ID** in `browser_specific_settings.gecko.id`
2. **Safari has stricter CSP** - test separately
3. **Edge is Chrome-compatible** - usually works without changes
4. **Firefox supports `browser.*`** natively with promises; Chrome needs polyfill or callbacks
5. **declarativeNetRequest** syntax differs slightly between Chrome and Firefox
6. **Side panel API** not available in Firefox (use `sidebar_action` instead)
