---
name: extension-permissions
description: Analyze, generate, and minimize Chrome extension permissions. Maps features to minimum required permissions, reduces user-facing warnings, implements optional permission patterns.
---

# Extension Permissions Skill

## Permission Analysis Workflow

Given a set of features, determine minimum permissions:

1. List all browser APIs the extension calls
2. Map each API to required permission (see [api-permission-map.md](references/api-permission-map.md))
3. Check if `activeTab` covers the use case (avoids host_permissions)
4. Identify permissions that trigger scary warnings (see [permission-warnings.md](references/permission-warnings.md))
5. Move non-essential permissions to `optional_permissions`
6. Validate final manifest against Chrome's permission model

## Quick API → Permission Lookup

| API / Feature | Permission |
|---|---|
| Read tab URL/title | `"tabs"` |
| Inject scripts on click | `"activeTab"` (no host perm needed) |
| Inject scripts always | `"scripting"` + host_permissions |
| Read/write storage | `"storage"` |
| Show notifications | `"notifications"` |
| Block/redirect requests | `"declarativeNetRequest"` |
| Intercept requests (read) | `"webRequest"` + host_permissions |
| Read browser history | `"history"` |
| Manage bookmarks | `"bookmarks"` |
| Read/write cookies | `"cookies"` + host_permissions |
| OAuth / identity | `"identity"` |
| Schedule tasks | `"alarms"` |
| Track navigation | `"webNavigation"` |
| Side panel UI | `"sidePanel"` |
| Clipboard write | `"clipboardWrite"` |
| Clipboard read | `"clipboardRead"` |
| Context menus | `"contextMenus"` |
| Download files | `"downloads"` |

Full mapping: [api-permission-map.md](references/api-permission-map.md)

## activeTab vs host_permissions Decision

Use `activeTab` when:
- Action triggered by user click (toolbar button, context menu)
- Only need access to the currently active tab
- One-time access per user interaction

Use `host_permissions` when:
- Need access without user interaction (background scripts)
- Need to access multiple tabs simultaneously
- Need persistent access across page navigations

```json
// Prefer this (activeTab - no warning shown):
{ "permissions": ["activeTab", "scripting"] }

// Over this (triggers "read all data on all sites" warning):
{ "host_permissions": ["<all_urls>"], "permissions": ["scripting"] }
```

## Optional Permissions Pattern

Request permissions at runtime instead of install time to reduce friction:

```js
// Request when user enables a feature
async function enableFeature() {
  const granted = await chrome.permissions.request({
    permissions: ["bookmarks"],
    origins: ["https://example.com/*"]
  });
  if (!granted) return;
  // proceed
}

// Check before using
const has = await chrome.permissions.contains({ permissions: ["bookmarks"] });
```

Manifest declaration:
```json
{
  "permissions": ["storage"],
  "optional_permissions": ["bookmarks", "history", "notifications"],
  "optional_host_permissions": ["https://*/*"]
}
```

## Minimal manifest.json Template

```json
{
  "manifest_version": 3,
  "permissions": [],
  "optional_permissions": [],
  "host_permissions": [],
  "optional_host_permissions": []
}
```

## References

- [api-permission-map.md](references/api-permission-map.md) - Complete API → permission mapping
- [permission-warnings.md](references/permission-warnings.md) - Warning text users see, high-risk permissions
- [permission-strategies.md](references/permission-strategies.md) - Least privilege patterns, code examples
