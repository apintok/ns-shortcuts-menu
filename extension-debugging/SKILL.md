---
name: extension-debugging
description: Debug multi-context Chrome extensions and optimize performance across service worker, content scripts, popup, and devtools contexts.
---

# Extension Debugging Skill

## Contexts Overview

| Context | Lifecycle | DevTools Access |
|---|---|---|
| Service Worker | Event-driven, terminates when idle | chrome://extensions → "Inspect views: service worker" |
| Content Script | Page lifetime | F12 on page → Console → select extension context |
| Popup | Opens/closes with UI | Right-click popup → Inspect |
| Options Page | Tab lifetime | Navigate to chrome-extension://ID/options.html → F12 |
| Side Panel | Panel lifetime | chrome://extensions → Details → "Inspect views" |
| DevTools Panel | DevTools lifetime | DevTools → Console (already in context) |

## Quick Access DevTools

```
# Service Worker
chrome://extensions → Find extension → "Inspect views: service worker"

# Content Script
F12 on page → Console dropdown → select "top" → change to extension context
# OR: Sources tab → Content scripts → find extension

# Popup (must be open)
Right-click popup UI → "Inspect"
# Keep popup open: hold Ctrl/Cmd while clicking elsewhere

# Background (MV2)
chrome://extensions → "Inspect views: background page"
```

## Common Error Quick Fixes

| Error | Cause | Fix |
|---|---|---|
| "Extension context invalidated" | Extension updated, old content script running | Reload page or handle gracefully |
| "Could not establish connection" | Service worker terminated | Retry connection, use persistent port |
| "The message port closed" | Missing `return true` in onMessage | Add `return true` for async response |
| "Refused to execute inline script" | CSP violation | Move inline JS to external files |
| Service worker stops randomly | Idle termination (~30s) | Use `chrome.alarms` to keep alive |
| Content script not injecting | Wrong match pattern | Test pattern at chrome://extensions |

See [Common Errors & Fixes](references/common-errors-fixes.md) for full list (12 errors).

## Performance Profiling Workflow

1. **Memory** - DevTools → Memory → Take heap snapshot → compare before/after action
2. **CPU** - DevTools → Performance → Record → perform action → Stop → analyze flame chart
3. **Bundle** - Run `webpack-bundle-analyzer` or `source-map-explorer dist/*.js`
4. **Storage** - Use `chrome.storage.local.getBytesInUse()` to check quota usage
5. **Task Manager** - Chrome menu → More Tools → Task Manager → find extension memory

See [Performance Profiling](references/performance-profiling.md) for detailed steps.

## Error Tracking (Sentry Setup)

Initialize Sentry separately in each context — they run in isolated environments.

```js
// service-worker.js
import * as Sentry from "@sentry/browser";
Sentry.init({ dsn: "YOUR_DSN", release: chrome.runtime.getManifest().version });

// content-script.js
import * as Sentry from "@sentry/browser";
Sentry.init({ dsn: "YOUR_DSN", integrations: [] }); // no browser integrations

// popup.js / options.js
import * as Sentry from "@sentry/browser";
Sentry.init({ dsn: "YOUR_DSN" }); // full browser integrations OK
```

Tag context for filtering:
```js
Sentry.setTag("extension_context", "service_worker"); // or "content_script", "popup"
```

## Message Debugging Pattern

```js
// Wrap sendMessage to log all messages
const debugSend = (msg) => {
  console.log("[EXT] send:", msg);
  return chrome.runtime.sendMessage(msg)
    .then(r => { console.log("[EXT] response:", r); return r; })
    .catch(e => console.error("[EXT] error:", e));
};

// In onMessage handler — always return true for async
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  console.log("[EXT] received:", msg, "from:", sender.tab?.url);
  handleMessage(msg).then(reply);
  return true; // REQUIRED for async
});
```

## Storage Debugging

```js
// Inspect all storage
chrome.storage.local.get(null, console.log);
chrome.storage.sync.get(null, console.log);

// Check quota
chrome.storage.local.getBytesInUse(null, (bytes) => {
  console.log(`Storage used: ${bytes} / ${chrome.storage.local.QUOTA_BYTES}`);
});
```

## DevTools Access Guide

See [DevTools Access Guide](references/devtools-access-guide.md) for full context-by-context instructions, network inspection, and Application tab storage inspector.

## Related Skills

- `extension-testing` - Automated test setup
- `extension-security` - Security audit checklist
