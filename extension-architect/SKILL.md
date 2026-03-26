---
name: extension-architect
description: "Scaffold Chrome/browser extensions with MV3. Framework selection, project structure, TypeScript setup. Use when: new extension, extension architecture, scaffold."
---

# Chrome Extension Architect

**Role**: Extension Architecture Expert

Scaffold production-ready browser extensions with Manifest V3. Make framework decisions, generate project structure, configure TypeScript and build tools.

## Decision Tree: Framework Selection

```
New extension project?
├─ Want fastest DX + smallest bundles → WXT (recommended)
├─ React-only team, existing codebase → Plasmo (maintenance concerns)
├─ Need full bundler control → CRXJS Vite Plugin
└─ Highly specialized / minimal deps → Custom Rollup/Webpack
```

See `references/framework-comparison.md` for detailed comparison.

## Quick Scaffold (WXT - Recommended)

```bash
npx wxt@latest init <project-name>
# Select: TypeScript, React/Vue/Svelte
cd <project-name> && npm install
npm run dev  # Hot reload dev server
```

## Project Structure Pattern

```
src/
├── entrypoints/
│   ├── background.ts          # Service worker (vanilla TS)
│   ├── content.ts             # Content script (vanilla TS)
│   ├── popup/                 # Popup UI (React/Vue/Svelte)
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── sidepanel/             # Side panel UI
│   └── options/               # Options page
├── components/                # Shared UI components
├── hooks/                     # use-chrome-storage, use-messaging
├── services/                  # storage-service, messaging-service, api-service
├── utils/                     # constants, validators, logger
└── types/                     # TypeScript type definitions
```

**Key rules:**
- Service worker + content scripts = vanilla TS only (no UI framework overhead)
- UI pages (popup, sidepanel, options) = framework allowed
- Shared hooks for cross-page chrome API access
- Services layer abstracts chrome.* APIs

## Architecture Patterns

See `references/architecture-patterns.md` for:
- Message passing (content ↔ service worker ↔ popup)
- Storage abstraction layer
- Event-driven service worker pattern
- Content script lazy-loading strategy

## Bundle Size Targets

| Component | Target |
|-----------|--------|
| Service worker | < 100 KB |
| Content script | < 50 KB |
| UI pages | < 200 KB each |

## TypeScript Setup

```json
// tsconfig.json essentials
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "types": ["chrome-types"]
  }
}
```

Use `chrome-types` npm package (auto-published from Chromium source) over `@types/chrome`.

## Cross-Browser Support

See `references/cross-browser-support.md` for Firefox/Edge/Safari compatibility patterns.

## References

- `references/framework-comparison.md` - WXT vs Plasmo vs CRXJS vs Custom
- `references/architecture-patterns.md` - Messaging, storage, event patterns
- `references/cross-browser-support.md` - Multi-browser compatibility
