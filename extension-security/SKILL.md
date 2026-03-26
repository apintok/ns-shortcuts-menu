---
name: extension-security
description: Audit Chrome extension security, configure CSP for MV3, validate messages, prevent XSS and common vulnerabilities
---

# Extension Security

Audit, harden, and secure Chrome extensions (MV3).

## Security Audit Workflow

1. Run permission audit — remove unnecessary permissions
2. Check CSP in manifest — no unsafe directives
3. Review all `chrome.runtime.onMessage` handlers — validate sender + type
4. Audit storage usage — no plaintext secrets
5. Review content scripts — sanitize DOM reads, no `innerHTML` with external data
6. Check external API calls — HTTPS only, no exposed keys
7. Run `npm audit` or `npx snyk test`
8. Verify `web_accessible_resources` — minimal exposure
9. Test with Chrome DevTools > Security panel
10. Review against [security-audit-checklist.md](references/security-audit-checklist.md)

## CSP Configuration (MV3)

MV3 enforces strict CSP by default. See [csp-configuration.md](references/csp-configuration.md).

```json
// manifest.json — extension pages CSP
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'",
  "sandbox": "sandbox allow-scripts; script-src 'self' 'unsafe-inline'"
}
```

**Banned in MV3:** `unsafe-inline`, `unsafe-eval`, remote script URLs.

**Sandbox page** — only way to run eval/unsafe-inline:
```json
"sandbox": { "pages": ["sandbox.html"] }
```

## Message Validation Pattern

Always validate sender and message type. See [message-security.md](references/message-security.md).

```js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Validate internal sender
  if (sender.id !== chrome.runtime.id) return;
  // Validate known message type
  const VALID_TYPES = ['ACTION_A', 'ACTION_B'];
  if (!VALID_TYPES.includes(msg.type)) return;
  // Process
  handleMessage(msg, sendResponse);
  return true; // keep channel open for async
});
```

## Storage Security Rules

- Never store API keys, tokens, or passwords in `chrome.storage.sync` (synced to cloud)
- Use `chrome.storage.local` for sensitive data; consider encrypting with Web Crypto API
- Use `chrome.storage.session` (MV3) for ephemeral secrets — cleared on browser restart
- Never store data in `localStorage` from content scripts (accessible by page JS)

```js
// Encrypt before storing
async function secureStore(key, value) {
  const encrypted = await encrypt(value); // Web Crypto API
  await chrome.storage.local.set({ [key]: encrypted });
}
```

## XSS Prevention in Extensions

- Never use `innerHTML`, `outerHTML`, `document.write` with untrusted data
- Use `textContent` or DOM APIs to insert user/page data
- Sanitize before rendering: use DOMPurify (loaded as local resource, not CDN)
- Avoid `eval()`, `Function()`, `setTimeout(string)` — blocked by CSP anyway

```js
// Safe DOM insertion
element.textContent = userInput;          // safe
element.innerHTML = userInput;            // NEVER with external data

// If HTML rendering needed
import DOMPurify from './vendor/purify.js'; // local copy only
element.innerHTML = DOMPurify.sanitize(userInput);
```

## Key References

| Topic | File |
|---|---|
| CSP rules, sandbox, workarounds | [references/csp-configuration.md](references/csp-configuration.md) |
| Message validation, postMessage risks | [references/message-security.md](references/message-security.md) |
| Full audit checklist | [references/security-audit-checklist.md](references/security-audit-checklist.md) |

## Quick Threat Model

| Threat | Mitigation |
|---|---|
| Malicious web page injecting scripts | CSP + no remote scripts |
| XSS via content script DOM writes | textContent, DOMPurify |
| Message spoofing from web page | Validate sender.id |
| Stolen API keys | storage.session, encryption |
| Supply chain attack | npm audit, lock files, local vendor |
| Overprivileged extension | Minimum permissions, activeTab over tabs |

## Related Skills

- `extension-permissions` - Permission audit and minimization
- `extension-debugging` - Error tracking and profiling
