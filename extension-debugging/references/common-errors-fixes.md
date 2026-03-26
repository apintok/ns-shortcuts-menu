# Common Extension Errors & Fixes

## 1. "Extension context invalidated"

**Cause:** Extension updated/reloaded while content script still running in page.
**Fix:**
```js
// Wrap all chrome API calls
function safeChromeSend(msg) {
  try {
    return chrome.runtime.sendMessage(msg);
  } catch (e) {
    if (e.message.includes("Extension context invalidated")) {
      console.warn("Extension reloaded, refresh page");
      return Promise.resolve(null);
    }
    throw e;
  }
}
```

## 2. "Could not establish connection. Receiving end does not exist"

**Cause:** Service worker not running when content script sends message.
**Fix:** Retry with backoff, or wake service worker first:
```js
async function sendWithRetry(msg, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.runtime.sendMessage(msg);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
}
```

## 3. "Uncaught (in promise)" / No response from onMessage

**Cause:** Async `onMessage` handler missing `return true`.
**Fix:**
```js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleAsync(msg).then(sendResponse);
  return true; // REQUIRED — tells Chrome to keep channel open
});
```

## 4. "Refused to execute inline script" (CSP Violation)

**Cause:** Inline JS in HTML (`onclick`, `<script>` tags) blocked by default CSP.
**Fix:**
- Move all JS to external `.js` files
- Use `addEventListener` instead of inline handlers
- Do NOT add `unsafe-inline` to manifest CSP — use nonces if needed

## 5. "Cannot access chrome://" or "Cannot access a chrome:// URL"

**Cause:** Content scripts cannot run on `chrome://` pages (blocked by design).
**Fix:** Check in manifest that match patterns exclude chrome:// URLs. Filter in code:
```js
chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  if (!tab.url?.startsWith("http")) return; // skip chrome:// and file://
});
```

## 6. "The message port closed before a response was received"

**Cause:** Same as #3 — `onMessage` handler returns without `return true` for async.
**Additional cause:** Service worker terminated before sending response.
**Fix:** Use `return true` + ensure service worker stays alive during async ops.

## 7. Service Worker Stops Randomly

**Cause:** Chrome terminates idle service workers after ~30s (MV3).
**Fix — use alarms for periodic wake:**
```js
// In service worker
chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") console.log("SW alive");
});
```
**Fix — use ports for long-lived connections:**
```js
// Content script keeps port open → SW stays alive
const port = chrome.runtime.connect({ name: "keepAlive" });
port.onDisconnect.addListener(() => { /* reconnect logic */ });
```

## 8. Content Script Not Injecting

**Cause:** Wrong `matches` pattern in manifest or page load timing.
**Debug:** `chrome://extensions` → extension → "Inspect views" → check errors.
**Fix patterns:**
```json
"matches": ["https://*/*"]           // all HTTPS
"matches": ["*://*.example.com/*"]  // specific domain
"matches": ["<all_urls>"]            // everything (requires broad permissions)
```
**Timing fix:**
```json
"run_at": "document_idle"   // default, after DOM ready
"run_at": "document_start"  // before DOM built
"run_at": "document_end"    // after DOM, before subresources
```

## 9. Popup Closes When Clicking Outside

**Cause:** Expected Chrome behavior — popups are transient.
**Fix:** Use side panel or options page for persistent UI. If debugging, open as tab:
```
chrome-extension://EXTENSION_ID/popup.html
```

## 10. Storage Quota Exceeded

**Cause:** `chrome.storage.sync` limit: 100KB total, 8KB per item. Local: 10MB default.
**Debug:**
```js
chrome.storage.sync.getBytesInUse(null, b => console.log("sync:", b, "/ 102400"));
chrome.storage.local.getBytesInUse(null, b => console.log("local:", b));
```
**Fix:** Compress data, paginate, or use `chrome.storage.local` + `unlimitedStorage` permission.

## 11. "Extension manifest must request permission"

**Cause:** Calling API without declaring permission in manifest.json.
**Fix:** Add to manifest:
```json
"permissions": ["storage", "tabs", "activeTab", "scripting"],
"host_permissions": ["https://api.example.com/*"]
```

## 12. Cross-Origin Request Blocked

**Cause:** Content script fetch subject to page CSP + CORS. Service worker fetch uses extension origin.
**Fix:** Move fetch to service worker + declare `host_permissions`:
```js
// content script
chrome.runtime.sendMessage({ type: "FETCH", url: "https://api.example.com/data" });
// service worker
chrome.runtime.onMessage.addListener((msg, _, reply) => {
  if (msg.type === "FETCH") { fetch(msg.url).then(r => r.json()).then(reply); return true; }
});
```
