# Performance Profiling

## Memory Profiling

**Heap Snapshot — find leaks:**
1. Open context DevTools (service worker or popup)
2. Memory tab → "Heap snapshot" → Take snapshot (baseline)
3. Perform suspected action → take second snapshot
4. Select "Comparison" view → sort by `#Delta` or `Size Delta`
5. Look for retained objects that should have been GC'd

**Key metrics:** Total JS heap size, Detached DOM nodes, EventListener count growth

## CPU Profiling

1. DevTools → Performance tab → Record
2. Perform action → Stop
3. Flame chart — wide/tall bars = hotspots
4. Bottom-up view → sort by "Self Time" to find top offenders

**Key areas:** `onMessage` handler time, storage ops, content script DOM manipulation

## Content Script Impact

```js
// Measure own init time
const start = performance.now();
// ... init code ...
console.log(`[EXT] init: ${performance.now() - start}ms`);
```
Compare page load: F12 → Performance → record page load → look for "Extension" entries.

## Service Worker Startup Time

```js
// BAD — imports all at top level (slow cold start)
import { featureB } from './feature-b.js';

// GOOD — dynamic import for non-critical paths
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'FEATURE_B') {
    import('./feature-b.js').then(({ featureB }) => featureB(msg));
    return true;
  }
});

// Measure SW startup
const swStart = Date.now();
self.addEventListener('activate', () => console.log(`SW up: ${Date.now() - swStart}ms`));
```

## Bundle Size Analysis

```bash
# webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
# add BundleAnalyzerPlugin() to webpack plugins, then:
npm run build -- --analyze

# source-map-explorer
npx source-map-explorer dist/background.js dist/content.js
```

**Target sizes:** Content script < 50KB, Service worker < 200KB, Popup < 500KB

## Storage Performance

```js
// Batch reads — single round-trip
const { keyA, keyB } = await chrome.storage.local.get(['keyA', 'keyB']);

// Batch writes — single write op
await chrome.storage.local.set({ count: 1, lastSeen: Date.now() });

// Debounce frequent writes
let t; const debouncedWrite = (d) => { clearTimeout(t); t = setTimeout(() => chrome.storage.local.set(d), 500); };
```

## Sentry Setup Per Context

```js
// service-worker.js
Sentry.init({ dsn: "DSN", tracesSampleRate: 0.1, integrations: [] });
Sentry.setTag("context", "service_worker");

// content-script.js
Sentry.init({ dsn: "DSN", tracesSampleRate: 0.05, integrations: [] });
Sentry.setTag("context", "content_script");

// popup.js
Sentry.init({ dsn: "DSN", tracesSampleRate: 1.0 });
Sentry.setTag("context", "popup");
```

Each context runs in isolation — must init Sentry separately.

## Custom Performance Logger

```js
const perf = {
  marks: {},
  start: (l) => { perf.marks[l] = performance.now(); },
  end: (l) => {
    const ms = (performance.now() - perf.marks[l]).toFixed(2);
    console.log(`[PERF] ${l}: ${ms}ms`);
    delete perf.marks[l];
  }
};

perf.start('fetchData');
await fetch(url);
perf.end('fetchData'); // [PERF] fetchData: 124.50ms
```

## Chrome Task Manager

Chrome menu → More Tools → Task Manager
- Find "Extension: [name]" rows
- Right-click header → add "JavaScript memory"
- Steady growth = memory leak
