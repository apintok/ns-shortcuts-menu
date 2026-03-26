# Architecture Patterns

## Message Passing Pattern

Three execution contexts communicate via chrome.runtime messaging:

```
Content Script ←→ Service Worker ←→ Popup/Sidepanel
                        ↕
                  chrome.storage
```

### Typed Message Protocol

```typescript
// types/messages.ts
type MessageType = 'GET_DATA' | 'SET_CONFIG' | 'PAGE_ACTION';

interface ExtMessage<T = unknown> {
  type: MessageType;
  payload: T;
}

interface ExtResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Service Worker Message Handler

```typescript
// background/service-worker.ts
chrome.runtime.onMessage.addListener(
  (msg: ExtMessage, sender, sendResponse): boolean => {
    if (sender.id !== chrome.runtime.id) return false;

    switch (msg.type) {
      case 'GET_DATA':
        handleGetData(msg.payload).then(sendResponse);
        return true; // Keep channel open for async
      case 'SET_CONFIG':
        handleSetConfig(msg.payload).then(sendResponse);
        return true;
    }
    return false;
  }
);
```

### Content Script Sender

```typescript
// services/messaging-service.ts
async function sendMessage<T>(msg: ExtMessage): Promise<ExtResponse<T>> {
  return chrome.runtime.sendMessage(msg);
}
```

## Storage Abstraction Layer

```typescript
// services/storage-service.ts
class StorageService {
  async get<T>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key);
    return result[key] as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  onChange(key: string, cb: (newVal: unknown) => void): void {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[key]) {
        cb(changes[key].newValue);
      }
    });
  }
}
export const storage = new StorageService();
```

**Storage limits**: local=10MB, sync=100KB total (8KB/item), session=10MB

## Event-Driven Service Worker

Service workers terminate when idle. Never rely on in-memory state.

```typescript
// background/service-worker.ts - GOOD
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') initDefaults();
  if (reason === 'update') runMigrations();
});

chrome.action.onClicked.addListener((tab) => { /* handle */ });
chrome.alarms.onAlarm.addListener((alarm) => { /* handle */ });

// BAD: Global mutable state (lost on termination)
// let cache = {}; // DON'T DO THIS
```

**Persist state**: Use chrome.storage.session for temporary data that survives restarts within a session.

## Content Script Lazy Loading

Inject minimal bootstrap, load heavy logic on demand:

```typescript
// content/bootstrap.ts (< 5 KB) - loaded on every page
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ACTIVATE') {
    import('./feature-heavy.js'); // Dynamic import
  }
});
```

Declare in manifest with `"run_at": "document_idle"` for minimal impact.
