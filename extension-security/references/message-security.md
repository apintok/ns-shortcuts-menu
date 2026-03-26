# Message Security — Chrome Extensions

## Validate Sender Identity

Always verify `sender.id` equals your own extension ID in internal message handlers.

```js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false; // block unknown senders
  // optionally verify tab origin
  if (sender.tab && !TRUSTED_ORIGINS.includes(new URL(sender.tab.url).origin)) return false;
  processMessage(message, sendResponse);
  return true;
});
```

## Typed Message Protocol

Define an explicit allowlist of valid message types — reject anything else.

```js
// shared/message-types.js
export const MSG = {
  GET_DATA: 'GET_DATA',
  SET_PREF: 'SET_PREF',
  PING:     'PING',
};

// background.js
const HANDLERS = {
  [MSG.GET_DATA]: handleGetData,
  [MSG.SET_PREF]: handleSetPref,
  [MSG.PING]:     handlePing,
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  const handler = HANDLERS[msg?.type];
  if (!handler) {
    console.warn('Unknown message type rejected:', msg?.type);
    return;
  }
  handler(msg.payload, sendResponse);
  return true;
});
```

## External Messaging Security

Limit which external websites can send messages via `externally_connectable`.

```json
// manifest.json
"externally_connectable": {
  "matches": ["https://yourdomain.com/*"],
  "ids": ["other-trusted-extension-id"]
}
```

Handle external messages separately with stricter validation:

```js
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  const ALLOWED_ORIGINS = ['https://yourdomain.com'];
  if (!ALLOWED_ORIGINS.includes(sender.origin)) return;
  // Validate and sanitize all data — treat as untrusted
  const safePayload = sanitizeExternalPayload(msg);
  processExternalMessage(safePayload, sendResponse);
  return true;
});
```

## Cross-Origin Messaging Risks

| Scenario | Risk | Mitigation |
|---|---|---|
| Content script → background | Low (sender.id verified) | Always verify sender.id |
| Web page → extension | High (any page can try) | externally_connectable + origin check |
| Extension → extension | Medium | Verify sender.id of trusted IDs |
| postMessage between frames | High (origin spoofable) | Always check event.origin |

## window.postMessage Risks in Content Scripts

Content scripts share the DOM with the web page. `window.postMessage` is visible to both.

```js
// UNSAFE — web page can send fake messages
window.addEventListener('message', (event) => {
  processData(event.data); // XSS risk
});

// SAFE — validate origin strictly
window.addEventListener('message', (event) => {
  // Only accept from known extension page
  if (event.origin !== `chrome-extension://${chrome.runtime.id}`) return;
  if (typeof event.data !== 'object' || !event.data?.type) return;
  processData(event.data);
});
```

**Prefer `chrome.runtime.sendMessage`** over `window.postMessage` for extension-to-content-script communication.

## Sanitize Data from Web Pages

Data from DOM or postMessage is untrusted — sanitize before forwarding to background.

```js
// content-script.js
const sanitize = (str) => typeof str !== 'string' ? '' :
  str.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 1000);

chrome.runtime.sendMessage({
  type: 'PAGE_DATA',
  payload: sanitize(document.querySelector('#user-data')?.textContent),
});
```

## Secure Message Handler Template

```js
// Full pattern: typed, validated, sanitized
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 1. Verify sender
  if (sender.id !== chrome.runtime.id) return false;

  // 2. Validate structure
  if (!msg || typeof msg.type !== 'string') return false;

  // 3. Route to handler
  const handler = MESSAGE_HANDLERS[msg.type];
  if (!handler) return false;

  // 4. Execute with error boundary
  try {
    const result = handler(msg.payload);
    if (result instanceof Promise) {
      result.then(sendResponse).catch((err) => {
        console.error('Handler error:', err);
        sendResponse({ error: 'Internal error' });
      });
      return true; // async response
    }
    sendResponse(result);
  } catch (err) {
    console.error('Sync handler error:', err);
    sendResponse({ error: 'Internal error' });
  }
  return false;
});
```
