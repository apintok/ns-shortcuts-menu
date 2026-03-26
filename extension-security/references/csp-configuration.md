# CSP Configuration — MV3

## MV3 Enforced Baseline

MV3 applies a non-negotiable baseline CSP to all extension pages:

```
script-src 'self' 'wasm-unsafe-eval'
object-src 'self'
```

- `'self'` — scripts bundled in the extension package only
- `'wasm-unsafe-eval'` — allows WebAssembly (required for some libraries)
- Cannot be relaxed further for `extension_pages`

## What's Banned

| Directive | Status | Reason |
|---|---|---|
| `unsafe-inline` | Banned | Enables XSS via injected inline scripts |
| `unsafe-eval` | Banned | Enables code injection via eval() |
| `https://cdn.example.com` | Banned | Remote script execution |
| `data:` in script-src | Banned | Inline script via data URIs |

## Manifest CSP Configuration

```json
// manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'",
  "sandbox": "sandbox allow-scripts allow-forms; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
}
```

- `extension_pages` — applies to popup, options, background service worker, sidepanel
- `sandbox` — separate relaxed policy for sandboxed pages only
- Omitting `content_security_policy` uses default baseline

## Extension Pages vs Sandbox Pages

| Feature | Extension Pages | Sandbox Pages |
|---|---|---|
| Access chrome.* APIs | Yes | No |
| Can use eval | No | Yes (if sandbox CSP allows) |
| Can use unsafe-inline | No | Yes (if sandbox CSP allows) |
| Communicate via | Direct | postMessage only |
| URL scheme | chrome-extension:// | chrome-extension:// |

## Sandbox Page Setup

Use sandbox pages for libraries that require eval (e.g., template engines, older JS libs).

```json
// manifest.json
"sandbox": {
  "pages": ["sandbox.html"]
}
```

```html
<!-- sandbox.html -->
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy"
    content="script-src 'self' 'unsafe-eval'; object-src 'none'">
</head>
<body>
  <script src="sandbox-runner.js"></script>
</body>
</html>
```

```js
// background.js — open and communicate with sandbox
const sandboxTab = await chrome.tabs.create({ url: 'sandbox.html' });

// sandbox-runner.js — receive work via postMessage
window.addEventListener('message', (event) => {
  // MUST validate origin
  if (event.origin !== `chrome-extension://${chrome.runtime.id}`) return;
  const result = eval(event.data.code); // safe — sandboxed
  event.source.postMessage({ result }, event.origin);
});
```

## Handling Third-Party Libraries

**Problem:** Library uses eval, Function(), or inline event handlers.

**Solutions (in order of preference):**

1. Replace with CSP-compatible alternative
2. Build/bundle the library (webpack/rollup strips eval in many cases)
3. Move library to sandbox page, communicate via postMessage
4. Fork library and remove eval usage

```js
// Problematic: template engine using eval
// Solution: use sandbox page
async function renderTemplate(template, data) {
  return new Promise((resolve) => {
    const sandbox = document.getElementById('sandbox-frame');
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data.html);
    sandbox.contentWindow.postMessage({ template, data }, '*', [channel.port2]);
  });
}
```

## Workarounds for Common Restrictions

**Inline styles from JS:** Use CSSStyleSheet API or classList instead of style attribute injection.

```js
// Instead of element.setAttribute('style', userValue) — risky
element.style.color = sanitizedColor; // direct property — safe
```

**Dynamic script loading:** Bundle everything; no dynamic `import()` from remote URLs.

**Trusted Types (optional hardening):**

```js
// Add to manifest extension_pages CSP
"require-trusted-types-for 'script'"
// Then implement TrustedTypePolicy for DOM sinks
```
