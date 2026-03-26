# Security Audit Checklist — Chrome Extensions

Use before publishing or on each major release.

## 1. Permission Audit

- [ ] List all permissions in manifest — justify each one
- [ ] Replace `tabs` with `activeTab` where full tab access not needed
- [ ] Remove `<all_urls>` host permission if not required — use specific origins
- [ ] Replace `history`, `bookmarks`, `downloads` with narrower alternatives if possible
- [ ] Verify `optional_permissions` are declared for runtime-requested permissions
- [ ] Remove unused permissions from previous iterations
- [ ] Check `host_permissions` — are all domains still needed?

## 2. CSP Audit

- [ ] No `unsafe-inline` in `extension_pages` CSP
- [ ] No `unsafe-eval` in `extension_pages` CSP
- [ ] No remote URLs in `script-src` (e.g., CDN links)
- [ ] Verify all third-party scripts are bundled locally
- [ ] Sandbox page used for any eval-requiring code
- [ ] `object-src` set to `'self'` or `'none'`
- [ ] Test CSP violations in DevTools > Console during QA

## 3. Message Handler Audit

- [ ] All `onMessage` handlers validate `sender.id === chrome.runtime.id`
- [ ] All `onMessageExternal` handlers validate `sender.origin`
- [ ] Message types validated against explicit allowlist — no wildcard handling
- [ ] `window.postMessage` listeners check `event.origin`
- [ ] No sensitive data (tokens, keys) sent in messages in plaintext
- [ ] Error responses don't leak internal stack traces

## 4. Storage Audit

- [ ] No API keys or tokens stored in `chrome.storage.sync` (syncs to cloud)
- [ ] Sensitive data in `chrome.storage.local` is encrypted (Web Crypto API)
- [ ] `chrome.storage.session` used for ephemeral secrets where applicable
- [ ] Content scripts don't write sensitive data to `localStorage` (page-accessible)
- [ ] Storage keys don't expose business logic or structure unnecessarily
- [ ] Old/deprecated storage keys cleaned up on extension update

## 5. Content Script Audit

- [ ] No `innerHTML` assignment with data from page DOM or external sources
- [ ] `textContent` used for user-visible string injection
- [ ] DOMPurify or equivalent used if HTML rendering required (local copy, not CDN)
- [ ] No `eval()` or `new Function()` usage
- [ ] Data scraped from page is sanitized before sending to background
- [ ] Content scripts don't expose extension internals to page via DOM
- [ ] Injected UI elements styled to avoid clickjacking (pointer-events, z-index)

## 6. External API Audit

- [ ] All external requests use HTTPS — no HTTP endpoints
- [ ] API keys not hardcoded in source (use build-time env injection or remote fetch with auth)
- [ ] API keys not exposed in client-side bundle (use background service worker as proxy)
- [ ] Responses from external APIs validated before use
- [ ] Timeouts set on all fetch calls — no hanging requests
- [ ] CORS policy verified for all endpoints used

## 7. Dependencies Audit

- [ ] `npm audit` run — no high/critical vulnerabilities unaddressed
- [ ] `npx snyk test` run for deeper analysis
- [ ] `package-lock.json` or `yarn.lock` committed and up to date
- [ ] Third-party scripts copied locally (not loaded from CDN at runtime)
- [ ] Vendored dependencies reviewed for their own security posture
- [ ] Unused dependencies removed from `package.json`

## 8. Web Accessible Resources Audit

- [ ] `web_accessible_resources` lists only files that must be accessible to web pages
- [ ] Sensitive files (config, internal scripts) not in `web_accessible_resources`
- [ ] `matches` in web_accessible_resources is as restrictive as possible (not `<all_urls>`)
- [ ] No internal-only HTML pages exposed as web accessible

```json
// Restrictive example
"web_accessible_resources": [{
  "resources": ["images/icon.png"],
  "matches": ["https://yourdomain.com/*"]
}]
```

## 9. User Input Sanitization

- [ ] All form inputs in extension UI validated before processing
- [ ] URL inputs validated (startsWith https://, URL constructor check)
- [ ] Numeric inputs parsed and bounds-checked
- [ ] Free-text inputs length-limited and stripped of control characters
- [ ] No user input passed directly to `chrome.tabs.create({ url })` without validation

```js
function validateUrl(input) {
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
    return url.href;
  } catch {
    return null; // reject invalid URLs
  }
}
```

## 10. Chrome Web Store Requirements

- [ ] No obfuscated code in submission
- [ ] Single-purpose policy — extension does one clearly defined thing
- [ ] Privacy policy linked if any personal data collected
- [ ] Permissions justified in store listing description
- [ ] Remote code execution not present (no fetching and running JS at runtime)
- [ ] No deceptive functionality or hidden behavior
- [ ] Manifest `version` incremented before each submission

## Automated Checks

```bash
# Dependency vulnerability scan
npm audit --audit-level=high

# Snyk deep scan
npx snyk test

# Search for common dangerous patterns in source
grep -rn "innerHTML\s*=" src/
grep -rn "eval(" src/
grep -rn "unsafe-eval\|unsafe-inline" src/

# Verify no remote script URLs in manifest
grep -n "https://" manifest.json
```
