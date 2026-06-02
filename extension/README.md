# NetSuite Shortcuts Menu

Chrome extension that injects a customizable shortcuts bar on all NetSuite pages, positioned just below the Navigation Centre menu.

## Features

- Shortcuts bar on every NetSuite page (production, sandbox, and system domains)
- Add, remove, and reorder shortcuts from the options page
- Enable or disable the menu from the popup or options page
- Supports relative NetSuite paths (`/app/...`) and full URLs
- Optional "open in new tab" per shortcut

## Development

```bash
cd extension
npm install
npm run dev
```

Load the unpacked extension from `.output/chrome-mv3-dev` in `chrome://extensions`.

## Build

```bash
npm run build
```

Production output: `.output/chrome-mv3`

## Configure shortcuts

1. Click the extension icon in Chrome
2. Choose **Manage shortcuts**, or right-click the extension → **Options**
3. Add your links (saved searches, records, SuiteScripts, etc.)
4. Save changes — open NetSuite tabs update automatically

## NetSuite DOM notes

NetSuite updates its UI frequently (Classic and Redwood). The extension uses multiple navigation selectors and waits for the page to render before injecting the bar. If the bar does not appear after a NetSuite release, the anchor selectors in `utils/netsuite-dom.ts` may need updating.

## Project structure

```
extension/
├── entrypoints/
│   ├── background.ts      # Default settings on install
│   ├── content.ts           # Injects shortcuts bar on NetSuite pages
│   ├── options/             # Full settings UI
│   └── popup/               # Quick enable/disable + link to options
├── utils/
│   ├── netsuite-dom.ts      # Navigation anchor detection
│   ├── shortcuts-bar.ts     # Shadow DOM shortcuts bar
│   ├── storage.ts           # chrome.storage.sync helpers
│   └── types.ts             # Shared types
└── wxt.config.ts
```
