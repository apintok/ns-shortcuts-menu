const HOST_ID = 'ns-shortcuts-menu-root';

const NAV_ANCHOR_SELECTORS = [
  '[data-automation-id="NavigationMenu"]',
  '[data-automation-id*="NavigationMenu"]',
  '[data-automation-id*="navigation-menu"]',
  '#div__nav',
  '[id^="div__nav"]',
  '.ns-nav',
  '#uir-header-menu',
  '[id^="uir-header-menu"]',
  '.uir-header-buttons',
];

const HEADER_SELECTORS = [
  '#div__header',
  '[data-automation-id="Header"]',
  '[data-automation-id*="Header"]',
  'header',
];

export function isNetSuitePage(): boolean {
  return /(^|\.)netsuite\.com$/i.test(window.location.hostname);
}

export function findNavigationAnchor(): HTMLElement | null {
  for (const selector of NAV_ANCHOR_SELECTORS) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      return element;
    }
  }

  for (const selector of HEADER_SELECTORS) {
    const header = document.querySelector(selector);
    if (!(header instanceof HTMLElement)) {
      continue;
    }

    const nav = header.querySelector(
      '[role="navigation"], .ns-nav, [class*="nav-menu"], [class*="NavMenu"]',
    );
    if (nav instanceof HTMLElement) {
      return nav;
    }

    return header;
  }

  return null;
}

export function getOrCreateHost(anchor: HTMLElement): HTMLElement {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    return existing;
  }

  const rowLike = anchor.closest(
    'tr, [data-automation-id="HeaderRow"], [class*="header-row"], [class*="HeaderRow"]',
  );

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-ns-shortcuts-menu', 'true');

  const insertionTarget =
    rowLike instanceof HTMLElement ? rowLike : anchor;
  insertionTarget.insertAdjacentElement('afterend', host);

  return host;
}

export function waitForNavigationAnchor(
  timeoutMs = 30_000,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = findNavigationAnchor();
    if (existing) {
      resolve(existing);
      return;
    }

    const deadline = Date.now() + timeoutMs;
    const observer = new MutationObserver(() => {
      const anchor = findNavigationAnchor();
      if (anchor) {
        observer.disconnect();
        resolve(anchor);
      } else if (Date.now() >= deadline) {
        observer.disconnect();
        resolve(null);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.setTimeout(() => {
      observer.disconnect();
      resolve(findNavigationAnchor());
    }, timeoutMs);
  });
}
