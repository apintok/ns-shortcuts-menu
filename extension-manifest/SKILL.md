---
name: extension-manifest
description: Generate, validate, and fix manifest.json files for Chrome Manifest V3 extensions
---

# extension-manifest

Generate, validate, and fix `manifest.json` for Chrome MV3 extensions.

## Quick Reference

### Required Fields
| Field | Type | Notes |
|-------|------|-------|
| `manifest_version` | number | Always `3` |
| `name` | string | Max 45 chars |
| `version` | string | Semver: `"1.0.0"` |

### Recommended Fields
`description`, `icons`, `action`, `permissions`, `host_permissions`

## Minimal Complete Template

```json
{
  "manifest_version": 3,
  "name": "Extension Name",
  "version": "1.0.0",
  "description": "What this extension does. Max 132 chars for Chrome Web Store.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Open Extension",
    "default_icon": { "16": "icons/icon16.png", "48": "icons/icon48.png" }
  },
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://*.example.com/*"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["https://*.example.com/*"],
    "js": ["content.js"],
    "css": ["content.css"],
    "run_at": "document_idle"
  }],
  "options_page": "options.html",
  "web_accessible_resources": [{
    "resources": ["images/*", "fonts/*"],
    "matches": ["https://*.example.com/*"]
  }],
  "minimum_chrome_version": "116"
}
```

## Common Mistakes & Fixes

| Error | Fix |
|-------|-----|
| `background.scripts` used | Replace with `background.service_worker` |
| `browser_action` / `page_action` | Replace with `action` |
| `manifest_version: 2` | Change to `3`; update permissions model |
| `host_permissions` inside `permissions` | Move URLs to `host_permissions` array |
| Blocking `XMLHttpRequest` in service worker | Use `fetch()` instead |
| `content_security_policy` as string | Must be object: `{ "extension_pages": "..." }` |
| Inline scripts without hash/nonce | Move scripts to `.js` files |
| `web_accessible_resources` as string array | Wrap in object with `resources` + `matches` |
| Missing `activeTab` for tab URL access | Add `"activeTab"` to `permissions` |

## Permission Quick Pick

```
activeTab        - current tab URL/content on user gesture (preferred over tabs)
storage          - chrome.storage.local/sync/session
tabs             - tab URLs, titles (requires justification)
scripting        - chrome.scripting.executeScript()
declarativeNetRequest - block/redirect requests
contextMenus     - right-click menu items
notifications    - desktop notifications
identity         - OAuth2 / chrome.identity
alarms           - scheduled tasks in service worker
offscreen        - DOM operations from service worker
sidePanel        - chrome.sidePanel API
```

## Validation Checklist (pre-submission)
See `references/manifest-validation-checklist.md`

## All Fields Reference
See `references/manifest-fields-reference.md`

## Extension Templates
See `references/manifest-templates.md`

## Key MV3 Rules

1. Service workers replace background pages — no persistent background
2. `host_permissions` is separate from `permissions`
3. `content_security_policy` is now an object, not a string
4. `web_accessible_resources` requires `matches` array
5. Remote code execution is blocked — no `eval`, no remote scripts
6. Use `chrome.scripting.executeScript()` instead of `tabs.executeScript()`

## Related Skills

- `extension-permissions` - Permission analysis and warning preview
- `extension-architect` - Full project scaffolding with manifest
