# DevTools Access Guide

## Service Worker

1. Navigate to `chrome://extensions`
2. Enable Developer mode (top-right toggle)
3. Find extension → click "Inspect views: service worker"
4. New DevTools window opens — fully functional console, network, sources

**Tip:** Service worker terminates after ~30s idle. To keep alive during debugging:
- Keep DevTools open (prevents termination while attached)
- Or use `chrome.alarms` to ping periodically

## Content Script

**Method 1 — Console context switcher:**
1. F12 on target page
2. Console tab → click context dropdown (shows "top")
3. Select extension name from dropdown list

**Method 2 — Sources tab:**
1. F12 → Sources tab
2. Left panel → "Content scripts" section
3. Find extension folder → set breakpoints directly

**Method 3 — console.log visibility:**
Content script `console.log` appears in page DevTools (not extension DevTools) with extension origin label.

## Popup

1. Open popup (click extension icon)
2. Right-click anywhere in popup UI → "Inspect"
3. DevTools opens attached to popup window

**Keep popup open during inspection:**
- After opening DevTools, do NOT click outside popup
- Popup stays open while DevTools is attached
- Alternatively: `chrome.windows.create` to open popup as a normal tab for easier debugging

```js
// Open popup as tab for debugging
chrome://extensions → Details → Extension options → open URL directly
// chrome-extension://EXTENSION_ID/popup.html
```

## Options Page

1. Navigate directly: `chrome-extension://EXTENSION_ID/options.html`
2. Press F12 — full DevTools for the options page
3. Find Extension ID at `chrome://extensions`

## Side Panel

1. Open side panel (click extension icon or via API)
2. `chrome://extensions` → extension Details
3. Under "Inspect views" → click "side_panel.html"

## Background Page (MV2 only)

1. `chrome://extensions` → "Inspect views: background page"
2. Persistent background: DevTools stays connected
3. Event page: reconnects on next event

## Network Tab — Extension API Calls

- Service worker network requests visible in service worker DevTools → Network tab
- Content script XHR/fetch visible in **page** DevTools → Network tab
- Filter by `Fetch/XHR` to isolate API calls
- For `chrome.runtime` message passing, use console logging (not visible in Network)

## Application Tab — Storage Inspector

1. Open DevTools for any extension context
2. Application tab → Storage section (left sidebar)
3. **Extension Storage** → Local Storage, Sync Storage, Session Storage
4. Click storage type → view key/value pairs
5. Right-click entries to delete individual keys
6. "Clear site data" button clears all extension storage

**Direct inspection via console:**
```js
// In any extension context DevTools console
chrome.storage.local.get(null, console.log)
chrome.storage.sync.get(null, console.log)
chrome.storage.session.get(null, console.log) // MV3 only
```

## Inspecting Extension Pages by URL

Any extension page can be opened as a tab and inspected normally:
```
chrome-extension://EXTENSION_ID/popup.html
chrome-extension://EXTENSION_ID/options.html
chrome-extension://EXTENSION_ID/devtools.html
chrome-extension://EXTENSION_ID/sidepanel.html
```

Get extension ID from `chrome://extensions` or via:
```js
chrome.runtime.id // in any extension context
```

## Remote Debugging (Android Chrome)

1. Enable USB debugging on Android device
2. `chrome://inspect/#devices` on desktop
3. Find extension under "Extensions" section if available
4. Service workers listed under page inspect targets
